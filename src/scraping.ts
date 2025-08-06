import { ScrapingConfig, ProxyConfig } from '../services/scraping/types';

export const defaultScrapingConfig: ScrapingConfig = {
  headless: process.env.NODE_ENV === 'production',
  timeout: parseInt(process.env.SCRAPING_TIMEOUT || '30000'),
  rateLimit: {
    requestsPerMinute: parseInt(
      process.env.SCRAPING_REQUESTS_PER_MINUTE || '10'
    ),
    requestsPerHour: parseInt(process.env.SCRAPING_REQUESTS_PER_HOUR || '100'),
    delayBetweenRequests: parseInt(
      process.env.SCRAPING_DELAY_BETWEEN_REQUESTS || '2000'
    ),
  },
  retryConfig: {
    maxRetries: parseInt(process.env.SCRAPING_MAX_RETRIES || '3'),
    baseDelay: parseInt(process.env.SCRAPING_BASE_DELAY || '1000'),
    maxDelay: parseInt(process.env.SCRAPING_MAX_DELAY || '30000'),
    backoffMultiplier: parseFloat(
      process.env.SCRAPING_BACKOFF_MULTIPLIER || '2'
    ),
  },
};

// Platform-specific configurations
export const platformConfigs: Record<string, Partial<ScrapingConfig>> = {
  twitter: {
    rateLimit: {
      requestsPerMinute: 5,
      requestsPerHour: 50,
      delayBetweenRequests: 3000,
    },
    timeout: 45000,
  },
  instagram: {
    rateLimit: {
      requestsPerMinute: 3,
      requestsPerHour: 30,
      delayBetweenRequests: 5000,
    },
    timeout: 60000,
  },
  linkedin: {
    rateLimit: {
      requestsPerMinute: 2,
      requestsPerHour: 20,
      delayBetweenRequests: 10000,
    },
    timeout: 45000,
  },
  tiktok: {
    rateLimit: {
      requestsPerMinute: 4,
      requestsPerHour: 40,
      delayBetweenRequests: 4000,
    },
    timeout: 50000,
  },
  youtube: {
    rateLimit: {
      requestsPerMinute: 8,
      requestsPerHour: 80,
      delayBetweenRequests: 2000,
    },
    timeout: 30000,
  },
};

// Load proxy configuration from environment
export function loadProxyConfig(): ProxyConfig[] {
  const proxies: ProxyConfig[] = [];

  // Support multiple proxy configurations
  let i = 1;
  while (process.env[`PROXY_${i}_HOST`]) {
    const proxy: ProxyConfig = {
      host: process.env[`PROXY_${i}_HOST`]!,
      port: parseInt(process.env[`PROXY_${i}_PORT`] || '8080'),
      protocol: (process.env[`PROXY_${i}_PROTOCOL`] as any) || 'http',
      username: process.env[`PROXY_${i}_USERNAME`],
      password: process.env[`PROXY_${i}_PASSWORD`],
    };

    proxies.push(proxy);
    i++;
  }

  return proxies;
}

// User agent rotation
export const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

export function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}
