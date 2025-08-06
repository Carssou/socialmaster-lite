// Fix demo users - create teams and proper associations
import { Pool } from 'pg';
import { pgPool } from '../src/config/database';

interface DemoUser {
  email: string;
  name: string;
  subscriptionTier: string;
  userId: string;
}

async function fixDemoUsers(): Promise<void> {
  const client = await pgPool.connect();

  try {
    console.log('Fixing demo users setup...');

    // Get all demo users
    const usersResult = await client.query(
      'SELECT id, email, name, subscription_tier FROM users WHERE email LIKE $1',
      ['demo.%']
    );

    const demoUsers: DemoUser[] = usersResult.rows.map(row => ({
      email: row.email,
      name: row.name,
      subscriptionTier: row.subscription_tier,
      userId: row.id,
    }));

    for (const user of demoUsers) {
      await client.query('BEGIN');

      try {
        // Create a team for this user
        const teamName = `${user.subscriptionTier.toUpperCase()} Demo Team`;
        const teamDescription = `Demo team for ${user.subscriptionTier} tier testing`;
        
        const teamResult = await client.query(
          `INSERT INTO teams (name, description, subscription_tier, is_active)
           VALUES ($1, $2, $3, true)
           RETURNING id`,
          [teamName, teamDescription, user.subscriptionTier]
        );

        const teamId = teamResult.rows[0].id;

        // Update user with team_id
        await client.query(
          'UPDATE users SET team_id = $1 WHERE id = $2',
          [teamId, user.userId]
        );

        // Create team membership for the user (as owner/admin)
        await client.query(
          `INSERT INTO team_memberships (user_id, team_id, role, is_active, joined_at)
           VALUES ($1, $2, 'admin', true, CURRENT_TIMESTAMP)`,
          [user.userId, teamId]
        );

        await client.query('COMMIT');
        console.log(`✓ Fixed demo user: ${user.email} -> Team: ${teamName} (${teamId})`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error fixing demo user ${user.email}:`, error);
        throw error;
      }
    }

    console.log('Demo users setup completed successfully!');

  } finally {
    client.release();
  }
}

// Run the fix
fixDemoUsers()
  .then(() => {
    console.log('Demo users fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Demo users fix failed:', error);
    process.exit(1);
  });