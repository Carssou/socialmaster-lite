--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

-- Started on 2025-08-06 07:31:17 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 16396)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4409 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 16385)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4410 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1018 (class 1247 OID 25010)
-- Name: account_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_status AS ENUM (
    'active',
    'inactive',
    'error',
    'rate_limited',
    'private',
    'suspended'
);


ALTER TYPE public.account_status OWNER TO postgres;

--
-- TOC entry 961 (class 1247 OID 16466)
-- Name: content_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_status AS ENUM (
    'draft',
    'scheduled',
    'published',
    'failed',
    'archived'
);


ALTER TYPE public.content_status OWNER TO postgres;

--
-- TOC entry 958 (class 1247 OID 16456)
-- Name: content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_type AS ENUM (
    'text',
    'image',
    'video',
    'mixed'
);


ALTER TYPE public.content_type OWNER TO postgres;

--
-- TOC entry 1012 (class 1247 OID 24978)
-- Name: data_collection_frequency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.data_collection_frequency AS ENUM (
    'hourly',
    'daily',
    'weekly',
    'monthly'
);


ALTER TYPE public.data_collection_frequency OWNER TO postgres;

--
-- TOC entry 1036 (class 1247 OID 25126)
-- Name: data_quality_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.data_quality_status AS ENUM (
    'valid',
    'invalid',
    'partial',
    'duplicate',
    'stale'
);


ALTER TYPE public.data_quality_status OWNER TO postgres;

--
-- TOC entry 1033 (class 1247 OID 25118)
-- Name: data_source_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.data_source_type AS ENUM (
    'scraping',
    'api',
    'manual'
);


ALTER TYPE public.data_source_type OWNER TO postgres;

--
-- TOC entry 1117 (class 1247 OID 25714)
-- Name: effort_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.effort_level AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.effort_level OWNER TO postgres;

--
-- TOC entry 1108 (class 1247 OID 25684)
-- Name: impact_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.impact_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.impact_level OWNER TO postgres;

--
-- TOC entry 1105 (class 1247 OID 25666)
-- Name: insight_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.insight_category AS ENUM (
    'engagement',
    'growth',
    'content',
    'timing',
    'audience',
    'competitive',
    'strategy',
    'quality'
);


ALTER TYPE public.insight_category OWNER TO postgres;

--
-- TOC entry 1102 (class 1247 OID 25645)
-- Name: insight_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.insight_type AS ENUM (
    'performance_trend',
    'content_optimization',
    'timing_optimization',
    'audience_engagement',
    'competitive_gap',
    'growth_opportunity',
    'risk_alert',
    'pattern_discovery',
    'performance_anomaly',
    'optimization_suggestion'
);


ALTER TYPE public.insight_type OWNER TO postgres;

--
-- TOC entry 1015 (class 1247 OID 24988)
-- Name: metric_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metric_type AS ENUM (
    'followers',
    'following',
    'posts',
    'likes',
    'shares',
    'comments',
    'views',
    'reach',
    'impressions',
    'engagement_rate'
);


ALTER TYPE public.metric_type OWNER TO postgres;

--
-- TOC entry 1039 (class 1247 OID 25138)
-- Name: normalization_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.normalization_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped'
);


ALTER TYPE public.normalization_status OWNER TO postgres;

--
-- TOC entry 1120 (class 1247 OID 25722)
-- Name: pattern_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pattern_type AS ENUM (
    'content_format',
    'posting_time',
    'hashtag_usage',
    'content_length',
    'media_type',
    'engagement_style',
    'topic_theme'
);


ALTER TYPE public.pattern_type OWNER TO postgres;

--
-- TOC entry 994 (class 1247 OID 24832)
-- Name: permission_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permission_type AS ENUM (
    'read',
    'write',
    'admin'
);


ALTER TYPE public.permission_type OWNER TO postgres;

--
-- TOC entry 1114 (class 1247 OID 25704)
-- Name: priority_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.priority_level OWNER TO postgres;

--
-- TOC entry 997 (class 1247 OID 24840)
-- Name: resource_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.resource_type AS ENUM (
    'account',
    'content',
    'analytics',
    'reports',
    'team'
);


ALTER TYPE public.resource_type OWNER TO postgres;

--
-- TOC entry 955 (class 1247 OID 16444)
-- Name: social_platform; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.social_platform AS ENUM (
    'twitter',
    'instagram',
    'facebook',
    'linkedin',
    'tiktok',
    'youtube'
);


ALTER TYPE public.social_platform OWNER TO postgres;

--
-- TOC entry 964 (class 1247 OID 16478)
-- Name: strategy_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.strategy_status AS ENUM (
    'active',
    'testing',
    'paused',
    'archived'
);


ALTER TYPE public.strategy_status OWNER TO postgres;

--
-- TOC entry 1111 (class 1247 OID 25694)
-- Name: urgency_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.urgency_level AS ENUM (
    'low',
    'medium',
    'high',
    'immediate'
);


ALTER TYPE public.urgency_level OWNER TO postgres;

--
-- TOC entry 991 (class 1247 OID 24824)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'viewer',
    'analyst',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 952 (class 1247 OID 16434)
-- Name: user_subscription_tier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_subscription_tier AS ENUM (
    'free',
    'basic',
    'premium',
    'enterprise'
);


ALTER TYPE public.user_subscription_tier OWNER TO postgres;

--
-- TOC entry 331 (class 1255 OID 25458)
-- Name: calculate_competitor_engagement_rate(uuid, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_competitor_engagement_rate(p_competitor_account_id uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    avg_engagement DECIMAL(5,4);
BEGIN
    SELECT AVG(engagement_rate)
    INTO avg_engagement
    FROM competitor_post_metrics
    WHERE competitor_account_id = p_competitor_account_id
    AND (p_start_date IS NULL OR published_at::date >= p_start_date)
    AND (p_end_date IS NULL OR published_at::date <= p_end_date);
    
    RETURN COALESCE(avg_engagement, 0);
END;
$$;


ALTER FUNCTION public.calculate_competitor_engagement_rate(p_competitor_account_id uuid, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 314 (class 1255 OID 25264)
-- Name: calculate_data_hash(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_data_hash(data jsonb) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN encode(digest(data::text, 'sha256'), 'hex');
END;
$$;


ALTER FUNCTION public.calculate_data_hash(data jsonb) OWNER TO postgres;

--
-- TOC entry 334 (class 1255 OID 25925)
-- Name: calculate_insight_score(public.impact_level, integer, public.urgency_level); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_insight_score(p_impact public.impact_level, p_confidence integer, p_urgency public.urgency_level) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    impact_weight INTEGER;
    urgency_weight INTEGER;
    score INTEGER;
BEGIN
    -- Map impact levels to weights
    impact_weight := CASE p_impact
        WHEN 'critical' THEN 4
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
    END;
    
    -- Map urgency levels to weights
    urgency_weight := CASE p_urgency
        WHEN 'immediate' THEN 4
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
    END;
    
    -- Calculate weighted score (0-100)
    score := ROUND(
        (impact_weight * 0.4 + (p_confidence / 100.0) * 0.3 + urgency_weight * 0.3) * 25
    );
    
    -- Ensure score is within bounds
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$;


ALTER FUNCTION public.calculate_insight_score(p_impact public.impact_level, p_confidence integer, p_urgency public.urgency_level) OWNER TO postgres;

--
-- TOC entry 4411 (class 0 OID 0)
-- Dependencies: 334
-- Name: FUNCTION calculate_insight_score(p_impact public.impact_level, p_confidence integer, p_urgency public.urgency_level); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.calculate_insight_score(p_impact public.impact_level, p_confidence integer, p_urgency public.urgency_level) IS 'Calculates weighted priority score for insights';


--
-- TOC entry 329 (class 1255 OID 25267)
-- Name: check_duplicate_data(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_duplicate_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    existing_id UUID;
    similarity DECIMAL(3,2);
BEGIN
    -- Check for exact hash match
    SELECT id INTO existing_id
    FROM raw_scraped_data
    WHERE data_hash = NEW.data_hash
      AND social_account_id = NEW.social_account_id
      AND platform = NEW.platform
      AND data_type = NEW.data_type
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    LIMIT 1;

    IF existing_id IS NOT NULL THEN
        -- Log the duplication
        INSERT INTO data_deduplication_log (
            original_data_id,
            duplicate_data_id,
            similarity_score,
            deduplication_method,
            resolution_action
        ) VALUES (
            existing_id,
            COALESCE(NEW.id, uuid_generate_v4()),
            1.00,
            'hash',
            'keep_original'
        );

        -- Mark as duplicate
        NEW.quality_status = 'duplicate';
        NEW.normalization_status = 'skipped';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_duplicate_data() OWNER TO postgres;

--
-- TOC entry 337 (class 1255 OID 25929)
-- Name: cleanup_expired_insights(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_insights() RETURNS TABLE(insights_expired integer, patterns_cleaned integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    insights_count INTEGER;
    patterns_count INTEGER;
BEGIN
    -- Expire old insights
    SELECT expire_old_insights() INTO insights_count;
    
    -- Clean up patterns older than 6 months that are not referenced by active insights
    DELETE FROM content_patterns cp
    WHERE cp.created_at < CURRENT_DATE - INTERVAL '6 months'
      AND NOT EXISTS (
          SELECT 1 FROM insight_patterns ip
          JOIN ai_analysis pi ON ip.insight_id = pi.id
          WHERE ip.pattern_id = cp.id AND pi.is_active = true
      );
    
    GET DIAGNOSTICS patterns_count = ROW_COUNT;
    
    RETURN QUERY SELECT insights_count, patterns_count;
END;
$$;


ALTER FUNCTION public.cleanup_expired_insights() OWNER TO postgres;

--
-- TOC entry 4412 (class 0 OID 0)
-- Dependencies: 337
-- Name: FUNCTION cleanup_expired_insights(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.cleanup_expired_insights() IS 'Cleans up expired insights and unused patterns';


--
-- TOC entry 311 (class 1255 OID 25113)
-- Name: create_default_monitoring_config(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_default_monitoring_config() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO account_monitoring_configs (
        social_account_id,
        data_collection_frequency,
        metrics_to_collect,
        next_collection_at
    ) VALUES (
        NEW.id,
        'daily',
        ARRAY['followers', 'following', 'posts', 'engagement_rate']::metric_type[],
        CURRENT_TIMESTAMP + INTERVAL '1 day'
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_default_monitoring_config() OWNER TO postgres;

--
-- TOC entry 327 (class 1255 OID 24971)
-- Name: create_default_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_default_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Create default permissions based on role
    IF NEW.role = 'admin' THEN
        -- Admin gets all permissions
        INSERT INTO permissions (team_id, user_id, resource_type, permission_type, granted_by)
        VALUES 
            (NEW.team_id, NEW.user_id, 'account', 'admin', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'content', 'admin', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'analytics', 'admin', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'reports', 'admin', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'team', 'admin', NEW.user_id)
        ON CONFLICT DO NOTHING;
    ELSIF NEW.role = 'analyst' THEN
        -- Analyst gets read/write on most resources
        INSERT INTO permissions (team_id, user_id, resource_type, permission_type, granted_by)
        VALUES 
            (NEW.team_id, NEW.user_id, 'account', 'read', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'content', 'write', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'analytics', 'write', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'reports', 'write', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'team', 'read', NEW.user_id)
        ON CONFLICT DO NOTHING;
    ELSE -- viewer
        -- Viewer gets read-only access
        INSERT INTO permissions (team_id, user_id, resource_type, permission_type, granted_by)
        VALUES 
            (NEW.team_id, NEW.user_id, 'account', 'read', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'content', 'read', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'analytics', 'read', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'reports', 'read', NEW.user_id),
            (NEW.team_id, NEW.user_id, 'team', 'read', NEW.user_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_default_permissions() OWNER TO postgres;

--
-- TOC entry 330 (class 1255 OID 25269)
-- Name: create_default_retention_policies(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_default_retention_policies() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Create default retention policies for different data types
    INSERT INTO data_retention_policies (team_id, data_type, retention_days, policy_name) VALUES
        (NEW.id, 'profile', 365, 'Profile Data - 1 Year'),
        (NEW.id, 'posts', 180, 'Posts Data - 6 Months'),
        (NEW.id, 'metrics', 730, 'Metrics Data - 2 Years'),
        (NEW.id, 'raw_scraped', 90, 'Raw Scraped Data - 3 Months');
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_default_retention_policies() OWNER TO postgres;

--
-- TOC entry 312 (class 1255 OID 25924)
-- Name: expire_old_insights(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.expire_old_insights() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE ai_analysis 
    SET is_active = false 
    WHERE valid_until IS NOT NULL 
      AND valid_until < CURRENT_TIMESTAMP 
      AND is_active = true;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;


ALTER FUNCTION public.expire_old_insights() OWNER TO postgres;

--
-- TOC entry 332 (class 1255 OID 25459)
-- Name: get_competitor_ranking_by_engagement(uuid, public.social_platform, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_competitor_ranking_by_engagement(p_user_id uuid, p_platform public.social_platform, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS TABLE(competitor_id uuid, username character varying, avg_engagement_rate numeric, ranking integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH competitor_engagement AS (
        SELECT 
            ca.id,
            ca.username,
            calculate_competitor_engagement_rate(ca.id, p_start_date, p_end_date) as avg_engagement
        FROM competitor_accounts ca
        WHERE ca.user_id = p_user_id
        AND ca.platform = p_platform
        AND ca.is_active = true
    )
    SELECT 
        ce.id,
        ce.username,
        ce.avg_engagement,
        ROW_NUMBER() OVER (ORDER BY ce.avg_engagement DESC)::INTEGER as ranking
    FROM competitor_engagement ce
    ORDER BY ce.avg_engagement DESC;
END;
$$;


ALTER FUNCTION public.get_competitor_ranking_by_engagement(p_user_id uuid, p_platform public.social_platform, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 336 (class 1255 OID 25928)
-- Name: get_insights_summary(uuid, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_insights_summary(p_social_account_id uuid, p_timeframe character varying DEFAULT 'month'::character varying) RETURNS TABLE(total_insights integer, critical_insights integer, high_impact_insights integer, acknowledged_insights integer, avg_confidence numeric, top_categories text[])
    LANGUAGE plpgsql
    AS $$
DECLARE
    start_date DATE;
BEGIN
    -- Calculate start date based on timeframe
    start_date := CASE p_timeframe
        WHEN 'week' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN 'month' THEN CURRENT_DATE - INTERVAL '30 days'
        WHEN 'quarter' THEN CURRENT_DATE - INTERVAL '90 days'
        WHEN 'year' THEN CURRENT_DATE - INTERVAL '365 days'
        ELSE CURRENT_DATE - INTERVAL '30 days'
    END;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_insights,
        COUNT(*) FILTER (WHERE pi.impact = 'critical')::INTEGER as critical_insights,
        COUNT(*) FILTER (WHERE pi.impact = 'high')::INTEGER as high_impact_insights,
        COUNT(*) FILTER (WHERE pi.is_acknowledged = true)::INTEGER as acknowledged_insights,
        ROUND(AVG(pi.confidence), 2) as avg_confidence,
        ARRAY_AGG(DISTINCT pi.category::TEXT ORDER BY pi.category::TEXT) as top_categories
    FROM ai_analysis pi
    WHERE pi.social_account_id = p_social_account_id
      AND pi.is_active = true
      AND pi.created_at >= start_date;
END;
$$;


ALTER FUNCTION public.get_insights_summary(p_social_account_id uuid, p_timeframe character varying) OWNER TO postgres;

--
-- TOC entry 4413 (class 0 OID 0)
-- Dependencies: 336
-- Name: FUNCTION get_insights_summary(p_social_account_id uuid, p_timeframe character varying); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_insights_summary(p_social_account_id uuid, p_timeframe character varying) IS 'Returns summary statistics for account insights';


--
-- TOC entry 339 (class 1255 OID 26053)
-- Name: get_user_monthly_usage(uuid, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_monthly_usage(user_id_param uuid, month_param date DEFAULT date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)) RETURNS TABLE(api_requests_count integer, reports_generated integer, exports_generated integer, data_storage_mb numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(su.api_requests_count, 0),
        COALESCE(su.reports_generated, 0),
        COALESCE(su.exports_generated, 0),
        COALESCE(su.data_storage_mb, 0)
    FROM subscription_usage su
    WHERE su.user_id = user_id_param 
    AND su.month = month_param
    UNION ALL
    SELECT 0, 0, 0, 0.0
    WHERE NOT EXISTS (
        SELECT 1 FROM subscription_usage su 
        WHERE su.user_id = user_id_param 
        AND su.month = month_param
    )
    LIMIT 1;
END;
$$;


ALTER FUNCTION public.get_user_monthly_usage(user_id_param uuid, month_param date) OWNER TO postgres;

--
-- TOC entry 338 (class 1255 OID 26052)
-- Name: get_user_subscription_limits(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_subscription_limits(user_id_param uuid) RETURNS TABLE(tier public.user_subscription_tier, max_social_accounts integer, max_team_members integer, max_data_retention_days integer, max_api_requests_per_month integer, max_reports_per_month integer, max_exports_per_month integer, competitive_analysis_enabled boolean, advanced_analytics_enabled boolean, ai_insights_enabled boolean, custom_reports_enabled boolean, api_access_enabled boolean, webhook_enabled boolean, priority_support boolean, white_label_enabled boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT sl.*
    FROM subscription_limits sl
    JOIN users u ON u.subscription_tier = sl.tier
    WHERE u.id = user_id_param;
END;
$$;


ALTER FUNCTION public.get_user_subscription_limits(user_id_param uuid) OWNER TO postgres;

--
-- TOC entry 340 (class 1255 OID 26054)
-- Name: increment_usage_counter(uuid, character varying, integer, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_usage_counter(user_id_param uuid, counter_type character varying, increment_amount integer DEFAULT 1, month_param date DEFAULT date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO subscription_usage (user_id, month, api_requests_count, reports_generated, exports_generated)
    VALUES (
        user_id_param, 
        month_param,
        CASE WHEN counter_type = 'api_requests' THEN increment_amount ELSE 0 END,
        CASE WHEN counter_type = 'reports' THEN increment_amount ELSE 0 END,
        CASE WHEN counter_type = 'exports' THEN increment_amount ELSE 0 END
    )
    ON CONFLICT (user_id, month)
    DO UPDATE SET
        api_requests_count = subscription_usage.api_requests_count + 
            CASE WHEN counter_type = 'api_requests' THEN increment_amount ELSE 0 END,
        reports_generated = subscription_usage.reports_generated + 
            CASE WHEN counter_type = 'reports' THEN increment_amount ELSE 0 END,
        exports_generated = subscription_usage.exports_generated + 
            CASE WHEN counter_type = 'exports' THEN increment_amount ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;


ALTER FUNCTION public.increment_usage_counter(user_id_param uuid, counter_type character varying, increment_amount integer, month_param date) OWNER TO postgres;

--
-- TOC entry 328 (class 1255 OID 24973)
-- Name: log_audit_event(uuid, uuid, character varying, public.resource_type, uuid, jsonb, jsonb, inet, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_audit_event(p_team_id uuid, p_user_id uuid, p_action character varying, p_resource_type public.resource_type DEFAULT NULL::public.resource_type, p_resource_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        team_id, user_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    )
    VALUES (
        p_team_id, p_user_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    )
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;


ALTER FUNCTION public.log_audit_event(p_team_id uuid, p_user_id uuid, p_action character varying, p_resource_type public.resource_type, p_resource_id uuid, p_old_values jsonb, p_new_values jsonb, p_ip_address inet, p_user_agent text) OWNER TO postgres;

--
-- TOC entry 315 (class 1255 OID 25265)
-- Name: set_data_hash(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_data_hash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.data_hash = calculate_data_hash(NEW.raw_data);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_data_hash() OWNER TO postgres;

--
-- TOC entry 335 (class 1255 OID 25926)
-- Name: set_insight_score(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_insight_score() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.score := calculate_insight_score(NEW.impact, NEW.confidence, NEW.urgency);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_insight_score() OWNER TO postgres;

--
-- TOC entry 333 (class 1255 OID 25460)
-- Name: update_competitor_daily_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_competitor_daily_metrics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update or insert daily metrics for the competitor
    INSERT INTO competitor_metrics (
        competitor_account_id,
        date,
        avg_engagement_rate,
        avg_likes_per_post,
        avg_shares_per_post,
        avg_comments_per_post,
        posts_per_day
    )
    SELECT 
        NEW.competitor_account_id,
        NEW.published_at::date,
        AVG(engagement_rate),
        AVG(likes),
        AVG(shares),
        AVG(comments),
        COUNT(*)
    FROM competitor_post_metrics
    WHERE competitor_account_id = NEW.competitor_account_id
    AND published_at::date = NEW.published_at::date
    GROUP BY competitor_account_id, published_at::date
    ON CONFLICT (competitor_account_id, date)
    DO UPDATE SET
        avg_engagement_rate = EXCLUDED.avg_engagement_rate,
        avg_likes_per_post = EXCLUDED.avg_likes_per_post,
        avg_shares_per_post = EXCLUDED.avg_shares_per_post,
        avg_comments_per_post = EXCLUDED.avg_comments_per_post,
        posts_per_day = EXCLUDED.posts_per_day,
        collected_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_competitor_daily_metrics() OWNER TO postgres;

--
-- TOC entry 313 (class 1255 OID 25115)
-- Name: update_next_collection_time(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_next_collection_time() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    CASE NEW.data_collection_frequency
        WHEN 'hourly' THEN
            NEW.next_collection_at = CURRENT_TIMESTAMP + INTERVAL '1 hour';
        WHEN 'daily' THEN
            NEW.next_collection_at = CURRENT_TIMESTAMP + INTERVAL '1 day';
        WHEN 'weekly' THEN
            NEW.next_collection_at = CURRENT_TIMESTAMP + INTERVAL '1 week';
        WHEN 'monthly' THEN
            NEW.next_collection_at = CURRENT_TIMESTAMP + INTERVAL '1 month';
    END CASE;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_next_collection_time() OWNER TO postgres;

--
-- TOC entry 310 (class 1255 OID 16625)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 25080)
-- Name: account_group_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_group_memberships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_group_id uuid NOT NULL,
    social_account_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.account_group_memberships OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25023)
-- Name: account_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    name character varying(255) NOT NULL,
    description text,
    color character varying(7),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.account_groups OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16582)
-- Name: account_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    date date NOT NULL,
    followers integer DEFAULT 0,
    following integer DEFAULT 0,
    total_posts integer DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    reach_growth numeric(5,4) DEFAULT 0,
    follower_growth numeric(5,4) DEFAULT 0,
    collected_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.account_metrics OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 25044)
-- Name: account_monitoring_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_monitoring_configs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    data_collection_frequency public.data_collection_frequency DEFAULT 'daily'::public.data_collection_frequency,
    metrics_to_collect public.metric_type[] DEFAULT ARRAY['followers'::public.metric_type, 'following'::public.metric_type, 'posts'::public.metric_type, 'engagement_rate'::public.metric_type],
    include_competitors boolean DEFAULT false,
    max_history_days integer DEFAULT 365,
    alert_on_significant_changes boolean DEFAULT true,
    alert_threshold_percentage numeric(5,2) DEFAULT 10.0,
    is_active boolean DEFAULT true,
    last_collection_at timestamp with time zone,
    next_collection_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.account_monitoring_configs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25066)
-- Name: account_status_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_status_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    status public.account_status NOT NULL,
    error_message text,
    response_time_ms integer,
    data_quality_score numeric(3,2),
    checked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    metadata jsonb
);


ALTER TABLE public.account_status_logs OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 25737)
-- Name: ai_analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_analysis (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    team_id uuid,
    user_id uuid NOT NULL,
    type public.insight_type NOT NULL,
    category public.insight_category NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    explanation text NOT NULL,
    confidence integer NOT NULL,
    impact public.impact_level NOT NULL,
    urgency public.urgency_level NOT NULL,
    score integer NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    supporting_data jsonb DEFAULT '{}'::jsonb,
    is_acknowledged boolean DEFAULT false,
    acknowledged_at timestamp with time zone,
    acknowledged_by uuid,
    acknowledgment_notes text,
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true,
    generation_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ai_analysis_confidence_check CHECK (((confidence >= 0) AND (confidence <= 100))),
    CONSTRAINT ai_analysis_score_check CHECK (((score >= 0) AND (score <= 100)))
);


ALTER TABLE public.ai_analysis OWNER TO postgres;

--
-- TOC entry 4414 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE ai_analysis; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ai_analysis IS 'AI-generated insights about social media performance';


--
-- TOC entry 4415 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN ai_analysis.confidence; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ai_analysis.confidence IS 'AI confidence score (0-100) in the insight accuracy';


--
-- TOC entry 4416 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN ai_analysis.score; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ai_analysis.score IS 'Overall insight priority score calculated from impact, confidence, and urgency';


--
-- TOC entry 4417 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN ai_analysis.supporting_data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ai_analysis.supporting_data IS 'JSON data supporting the insight (metrics, trends, correlations)';


--
-- TOC entry 4418 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN ai_analysis.generation_metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ai_analysis.generation_metadata IS 'Metadata about how the insight was generated (AI model, parameters, etc.)';


--
-- TOC entry 255 (class 1259 OID 25805)
-- Name: insight_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insight_recommendations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    insight_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    priority public.priority_level NOT NULL,
    effort public.effort_level NOT NULL,
    expected_impact text NOT NULL,
    timeframe character varying(100) NOT NULL,
    action_steps text[] DEFAULT '{}'::text[] NOT NULL,
    success_metrics text[] DEFAULT '{}'::text[] NOT NULL,
    score integer NOT NULL,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    completed_by uuid,
    completion_results text,
    completion_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT insight_recommendations_score_check CHECK (((score >= 0) AND (score <= 100)))
);


ALTER TABLE public.insight_recommendations OWNER TO postgres;

--
-- TOC entry 4419 (class 0 OID 0)
-- Dependencies: 255
-- Name: TABLE insight_recommendations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.insight_recommendations IS 'Actionable recommendations generated from insights';


--
-- TOC entry 258 (class 1259 OID 25914)
-- Name: active_insights_with_recommendations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_insights_with_recommendations AS
 SELECT pi.id,
    pi.social_account_id,
    pi.team_id,
    pi.user_id,
    pi.type,
    pi.category,
    pi.title,
    pi.description,
    pi.explanation,
    pi.confidence,
    pi.impact,
    pi.urgency,
    pi.score,
    pi.tags,
    pi.is_acknowledged,
    pi.acknowledged_at,
    pi.created_at,
    pi.updated_at,
    count(ir.id) AS recommendation_count,
    count(ir.id) FILTER (WHERE (ir.is_completed = true)) AS completed_recommendations,
    array_agg(
        CASE
            WHEN (ir.id IS NOT NULL) THEN json_build_object('id', ir.id, 'title', ir.title, 'priority', ir.priority, 'is_completed', ir.is_completed)
            ELSE NULL::json
        END) FILTER (WHERE (ir.id IS NOT NULL)) AS recommendations
   FROM (public.ai_analysis pi
     LEFT JOIN public.insight_recommendations ir ON ((pi.id = ir.insight_id)))
  WHERE (pi.is_active = true)
  GROUP BY pi.id, pi.social_account_id, pi.team_id, pi.user_id, pi.type, pi.category, pi.title, pi.description, pi.explanation, pi.confidence, pi.impact, pi.urgency, pi.score, pi.tags, pi.is_acknowledged, pi.acknowledged_at, pi.created_at, pi.updated_at;


ALTER TABLE public.active_insights_with_recommendations OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 25584)
-- Name: api_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_access_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    name character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    rate_limit integer DEFAULT 1000 NOT NULL,
    rate_limit_window integer DEFAULT 3600000 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.api_access_tokens OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 25610)
-- Name: api_rate_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_id uuid NOT NULL,
    window_start timestamp with time zone NOT NULL,
    request_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.api_rate_limits OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24916)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    team_id uuid,
    user_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    resource_type public.resource_type,
    resource_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16502)
-- Name: brand_guidelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brand_guidelines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    brand_voice text,
    tone_of_voice text[],
    content_restrictions text[],
    target_audience text,
    key_messages text[],
    visual_style jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_id uuid
);


ALTER TABLE public.brand_guidelines OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25382)
-- Name: competitive_analysis_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitive_analysis_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    social_account_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    analysis_date date NOT NULL,
    competitor_count integer NOT NULL,
    user_ranking integer,
    user_percentile numeric(5,2),
    performance_score numeric(5,2),
    engagement_gap_vs_competitors numeric(5,4),
    engagement_gap_vs_industry numeric(5,4),
    follower_growth_gap numeric(5,4),
    post_frequency_gap numeric(4,2),
    strong_areas text[],
    weak_areas text[],
    competitive_advantages text[],
    threats_and_opportunities text[],
    top_insights text[],
    recommendations text[],
    analysis_metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.competitive_analysis_results OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25293)
-- Name: competitor_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitor_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    platform public.social_platform NOT NULL,
    platform_account_id character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    display_name character varying(255),
    follower_count integer DEFAULT 0,
    following_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    added_by uuid NOT NULL,
    notes text,
    tags text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.competitor_accounts OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25323)
-- Name: competitor_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitor_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    competitor_account_id uuid NOT NULL,
    date date NOT NULL,
    followers integer DEFAULT 0,
    following integer DEFAULT 0,
    total_posts integer DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    avg_likes_per_post numeric(10,2) DEFAULT 0,
    avg_shares_per_post numeric(10,2) DEFAULT 0,
    avg_comments_per_post numeric(10,2) DEFAULT 0,
    reach_growth numeric(5,4) DEFAULT 0,
    follower_growth numeric(5,4) DEFAULT 0,
    posts_per_day numeric(4,2) DEFAULT 0,
    collected_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.competitor_metrics OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25347)
-- Name: competitor_post_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competitor_post_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    competitor_account_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    platform_post_id character varying(255) NOT NULL,
    post_type character varying(50),
    published_at timestamp with time zone NOT NULL,
    likes integer DEFAULT 0,
    shares integer DEFAULT 0,
    comments integer DEFAULT 0,
    views integer DEFAULT 0,
    reach integer DEFAULT 0,
    impressions integer DEFAULT 0,
    engagement_rate numeric(5,4) DEFAULT 0,
    click_through_rate numeric(5,4),
    content_preview text,
    hashtags text[],
    mentions text[],
    collected_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.competitor_post_metrics OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16535)
-- Name: content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type public.content_type NOT NULL,
    title character varying(500),
    text_content text,
    image_urls text[],
    video_url text,
    hashtags text[],
    platforms public.social_platform[],
    status public.content_status DEFAULT 'draft'::public.content_status,
    scheduled_at timestamp with time zone,
    published_at timestamp with time zone,
    generation_metadata jsonb,
    brand_guidelines_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_id uuid
);


ALTER TABLE public.content OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 25774)
-- Name: content_patterns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_patterns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    team_id uuid,
    user_id uuid NOT NULL,
    type public.pattern_type NOT NULL,
    description text NOT NULL,
    frequency integer DEFAULT 0 NOT NULL,
    confidence integer NOT NULL,
    score integer,
    examples text[] DEFAULT '{}'::text[],
    metrics jsonb DEFAULT '{}'::jsonb NOT NULL,
    detected_for_period character varying(50) NOT NULL,
    detection_start_date date NOT NULL,
    detection_end_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT content_patterns_confidence_check CHECK (((confidence >= 0) AND (confidence <= 100))),
    CONSTRAINT content_patterns_score_check CHECK (((score >= 0) AND (score <= 100)))
);


ALTER TABLE public.content_patterns OWNER TO postgres;

--
-- TOC entry 4420 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE content_patterns; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.content_patterns IS 'Detected patterns in content performance and engagement';


--
-- TOC entry 4421 (class 0 OID 0)
-- Dependencies: 254
-- Name: COLUMN content_patterns.frequency; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_patterns.frequency IS 'Number of times this pattern was observed';


--
-- TOC entry 4422 (class 0 OID 0)
-- Dependencies: 254
-- Name: COLUMN content_patterns.metrics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_patterns.metrics IS 'Pattern performance metrics (avg_engagement, avg_reach, success_rate)';


--
-- TOC entry 237 (class 1259 OID 25225)
-- Name: data_cleanup_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_cleanup_jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    team_id uuid,
    platform public.social_platform,
    data_type character varying(50),
    records_processed integer DEFAULT 0,
    records_deleted integer DEFAULT 0,
    records_archived integer DEFAULT 0,
    error_message text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.data_cleanup_jobs OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25191)
-- Name: data_deduplication_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_deduplication_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    original_data_id uuid NOT NULL,
    duplicate_data_id uuid NOT NULL,
    similarity_score numeric(3,2) NOT NULL,
    deduplication_method character varying(50) NOT NULL,
    resolution_action character varying(50) NOT NULL,
    resolved_by character varying(50) DEFAULT 'system'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.data_deduplication_log OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25209)
-- Name: data_retention_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_retention_policies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    team_id uuid,
    data_type character varying(50) NOT NULL,
    platform public.social_platform,
    retention_days integer NOT NULL,
    archive_before_delete boolean DEFAULT true,
    compression_enabled boolean DEFAULT true,
    policy_name character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.data_retention_policies OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25370)
-- Name: industry_benchmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industry_benchmarks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    platform public.social_platform NOT NULL,
    industry character varying(100),
    region character varying(50) DEFAULT 'global'::character varying,
    avg_engagement_rate numeric(5,4) NOT NULL,
    median_engagement_rate numeric(5,4) NOT NULL,
    top_percentile_engagement_rate numeric(5,4) NOT NULL,
    avg_follower_growth_rate numeric(5,4) NOT NULL,
    avg_post_frequency numeric(4,2) NOT NULL,
    avg_reach_rate numeric(5,4) NOT NULL,
    avg_likes_rate numeric(5,4) NOT NULL,
    avg_shares_rate numeric(5,4) NOT NULL,
    avg_comments_rate numeric(5,4) NOT NULL,
    sample_size integer NOT NULL,
    data_source character varying(100),
    confidence_score numeric(3,2) DEFAULT 0.8,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.industry_benchmarks OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 25829)
-- Name: insight_analysis_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insight_analysis_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    team_id uuid,
    user_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    timeframe character varying(50) NOT NULL,
    analysis_period_start date NOT NULL,
    analysis_period_end date NOT NULL,
    total_insights integer DEFAULT 0 NOT NULL,
    critical_insights integer DEFAULT 0 NOT NULL,
    high_impact_insights integer DEFAULT 0 NOT NULL,
    patterns_detected integer DEFAULT 0 NOT NULL,
    overall_score integer NOT NULL,
    generation_parameters jsonb DEFAULT '{}'::jsonb,
    processing_time_ms integer,
    ai_model_used character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT insight_analysis_results_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 100)))
);


ALTER TABLE public.insight_analysis_results OWNER TO postgres;

--
-- TOC entry 4423 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE insight_analysis_results; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.insight_analysis_results IS 'Complete analysis session results and metadata';


--
-- TOC entry 257 (class 1259 OID 25861)
-- Name: insight_patterns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insight_patterns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    insight_id uuid NOT NULL,
    pattern_id uuid NOT NULL,
    relevance_score numeric(3,2) DEFAULT 1.0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.insight_patterns OWNER TO postgres;

--
-- TOC entry 4424 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE insight_patterns; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.insight_patterns IS 'Junction table linking insights to the patterns they are based on';


--
-- TOC entry 244 (class 1259 OID 25423)
-- Name: market_position_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_position_snapshots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    competitive_analysis_id uuid NOT NULL,
    overall_ranking integer NOT NULL,
    total_competitors integer NOT NULL,
    percentile_ranking numeric(5,2) NOT NULL,
    market_share numeric(5,4),
    position_change integer,
    trend character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.market_position_snapshots OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25169)
-- Name: normalized_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.normalized_data (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    raw_data_id uuid NOT NULL,
    social_account_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    data_type character varying(50) NOT NULL,
    normalized_data jsonb NOT NULL,
    schema_version character varying(10) DEFAULT '1.0'::character varying,
    processing_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.normalized_data OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 25919)
-- Name: pattern_performance_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.pattern_performance_summary AS
 SELECT cp.id,
    cp.social_account_id,
    cp.team_id,
    cp.type,
    cp.description,
    cp.confidence,
    cp.score,
    cp.frequency,
    cp.detected_for_period,
    cp.detection_start_date,
    cp.detection_end_date,
    cp.metrics,
    count(ip.insight_id) AS related_insights_count,
    cp.created_at,
    cp.updated_at
   FROM (public.content_patterns cp
     LEFT JOIN public.insight_patterns ip ON ((cp.id = ip.pattern_id)))
  WHERE (cp.is_active = true)
  GROUP BY cp.id, cp.social_account_id, cp.team_id, cp.type, cp.description, cp.confidence, cp.score, cp.frequency, cp.detected_for_period, cp.detection_start_date, cp.detection_end_date, cp.metrics, cp.created_at, cp.updated_at;


ALTER TABLE public.pattern_performance_summary OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 25408)
-- Name: performance_gaps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_gaps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    competitive_analysis_id uuid NOT NULL,
    metric_name character varying(100) NOT NULL,
    user_value numeric(10,4) NOT NULL,
    competitor_average numeric(10,4) NOT NULL,
    industry_benchmark numeric(10,4) NOT NULL,
    gap_vs_competitors numeric(10,4) NOT NULL,
    gap_vs_industry numeric(10,4) NOT NULL,
    gap_percentage numeric(6,2) NOT NULL,
    priority character varying(10) NOT NULL,
    recommendation text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT performance_gaps_priority_check CHECK (((priority)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying])::text[])))
);


ALTER TABLE public.performance_gaps OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24892)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    resource_type public.resource_type NOT NULL,
    resource_id uuid,
    permission_type public.permission_type NOT NULL,
    granted_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16636)
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.pgmigrations OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16635)
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pgmigrations_id_seq OWNER TO postgres;

--
-- TOC entry 4425 (class 0 OID 0)
-- Dependencies: 223
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- TOC entry 248 (class 1259 OID 25523)
-- Name: platform_algorithm_factors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_algorithm_factors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform character varying(50) NOT NULL,
    factor_name character varying(100) NOT NULL,
    importance character varying(20) NOT NULL,
    description text NOT NULL,
    optimization_tip text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.platform_algorithm_factors OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25462)
-- Name: platform_best_practices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_best_practices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform character varying(50) NOT NULL,
    category character varying(100) NOT NULL,
    subcategory character varying(100),
    data jsonb NOT NULL,
    is_active boolean DEFAULT true,
    version integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.platform_best_practices OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25488)
-- Name: platform_content_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_content_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform character varying(50) NOT NULL,
    content_type character varying(50) NOT NULL,
    recommendations text[] NOT NULL,
    examples text[] NOT NULL,
    performance_rating character varying(20) DEFAULT 'medium'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.platform_content_recommendations OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 25511)
-- Name: platform_hashtag_strategies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_hashtag_strategies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform character varying(50) NOT NULL,
    hashtag_type character varying(50) NOT NULL,
    percentage integer NOT NULL,
    description text NOT NULL,
    examples text[] NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.platform_hashtag_strategies OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16556)
-- Name: post_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content_id uuid NOT NULL,
    social_account_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    platform_post_id character varying(255) NOT NULL,
    published_at timestamp with time zone NOT NULL,
    likes integer DEFAULT 0,
    shares integer DEFAULT 0,
    comments integer DEFAULT 0,
    views integer DEFAULT 0,
    reach integer DEFAULT 0,
    impressions integer DEFAULT 0,
    engagement_rate numeric(5,4) DEFAULT 0,
    click_through_rate numeric(5,4),
    collected_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.post_metrics OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25149)
-- Name: raw_scraped_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_scraped_data (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_account_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    data_type character varying(50) NOT NULL,
    source_type public.data_source_type DEFAULT 'scraping'::public.data_source_type,
    raw_data jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    data_hash character varying(64) NOT NULL,
    quality_status public.data_quality_status DEFAULT 'valid'::public.data_quality_status,
    quality_score numeric(3,2) DEFAULT 1.00,
    quality_issues text[],
    normalization_status public.normalization_status DEFAULT 'pending'::public.normalization_status,
    normalized_at timestamp with time zone,
    collected_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.raw_scraped_data OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16517)
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    platform public.social_platform NOT NULL,
    platform_account_id character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    display_name character varying(255),
    access_token text NOT NULL,
    refresh_token text,
    token_expires_at timestamp with time zone,
    permissions text[],
    is_active boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_id uuid,
    primary_group_id uuid
);


ALTER TABLE public.social_accounts OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16602)
-- Name: strategy_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strategy_configs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    parameters jsonb NOT NULL,
    status public.strategy_status DEFAULT 'active'::public.strategy_status,
    effectiveness_score numeric(3,2),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_id uuid
);


ALTER TABLE public.strategy_configs OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 26020)
-- Name: subscription_billing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_billing (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    tier public.user_subscription_tier NOT NULL,
    billing_cycle character varying(20) DEFAULT 'monthly'::character varying,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    billing_date date NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    transaction_id character varying(255),
    invoice_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_billing OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 25997)
-- Name: subscription_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    old_tier public.user_subscription_tier,
    new_tier public.user_subscription_tier NOT NULL,
    change_reason character varying(255),
    changed_by uuid,
    effective_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_history OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 25947)
-- Name: subscription_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_limits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tier public.user_subscription_tier NOT NULL,
    max_social_accounts integer DEFAULT 1 NOT NULL,
    max_team_members integer DEFAULT 1 NOT NULL,
    max_data_retention_days integer DEFAULT 30 NOT NULL,
    max_api_requests_per_month integer DEFAULT 1000 NOT NULL,
    max_reports_per_month integer DEFAULT 5 NOT NULL,
    max_exports_per_month integer DEFAULT 10 NOT NULL,
    competitive_analysis_enabled boolean DEFAULT false,
    advanced_analytics_enabled boolean DEFAULT false,
    ai_insights_enabled boolean DEFAULT false,
    custom_reports_enabled boolean DEFAULT false,
    api_access_enabled boolean DEFAULT false,
    webhook_enabled boolean DEFAULT false,
    priority_support boolean DEFAULT false,
    white_label_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_limits OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 25971)
-- Name: subscription_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_usage (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    month date NOT NULL,
    api_requests_count integer DEFAULT 0,
    reports_generated integer DEFAULT 0,
    exports_generated integer DEFAULT 0,
    data_storage_mb numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_usage OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24864)
-- Name: team_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_memberships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role DEFAULT 'viewer'::public.user_role NOT NULL,
    is_active boolean DEFAULT true,
    invited_by uuid,
    invited_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    joined_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_memberships OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24851)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    subscription_tier public.user_subscription_tier DEFAULT 'free'::public.user_subscription_tier,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16487)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    subscription_tier public.user_subscription_tier DEFAULT 'free'::public.user_subscription_tier,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_id uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 25566)
-- Name: webhook_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_id uuid NOT NULL,
    event character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(20) NOT NULL,
    attempts integer DEFAULT 1 NOT NULL,
    last_attempt_at timestamp with time zone DEFAULT now() NOT NULL,
    next_retry_at timestamp with time zone,
    response_status integer,
    response_body text,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT webhook_deliveries_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'success'::character varying, 'failed'::character varying, 'retrying'::character varying])::text[])))
);


ALTER TABLE public.webhook_deliveries OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 25540)
-- Name: webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    name character varying(255) NOT NULL,
    url text NOT NULL,
    events jsonb DEFAULT '[]'::jsonb NOT NULL,
    secret character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    retry_count integer DEFAULT 0 NOT NULL,
    max_retries integer DEFAULT 3 NOT NULL,
    timeout integer DEFAULT 30000 NOT NULL,
    headers jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_triggered_at timestamp with time zone,
    last_success_at timestamp with time zone,
    last_failure_at timestamp with time zone
);


ALTER TABLE public.webhooks OWNER TO postgres;

--
-- TOC entry 3613 (class 2604 OID 16639)
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- TOC entry 4374 (class 0 OID 25080)
-- Dependencies: 232
-- Data for Name: account_group_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_group_memberships (id, account_group_id, social_account_id, added_at) FROM stdin;
\.


--
-- TOC entry 4371 (class 0 OID 25023)
-- Dependencies: 229
-- Data for Name: account_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_groups (id, user_id, team_id, name, description, color, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4363 (class 0 OID 16582)
-- Dependencies: 221
-- Data for Name: account_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_metrics (id, social_account_id, date, followers, following, total_posts, avg_engagement_rate, reach_growth, follower_growth, collected_at) FROM stdin;
35d1c59b-6e57-4af1-ab24-4dc85b49ebb9	76a86d50-18b3-47db-a52f-21d8710f770e	2024-01-01	1000	500	100	0.0500	0.1000	0.5000	2025-07-31 08:41:15.705175+00
c4c1f568-aacc-47e9-9605-2288d2b409c6	76a86d50-18b3-47db-a52f-21d8710f770e	2024-01-02	1050	505	102	0.0520	0.1200	0.5500	2025-07-31 08:41:15.705175+00
779a52f9-e195-4c1d-a965-b7f4a8bef230	76a86d50-18b3-47db-a52f-21d8710f770e	2024-01-03	1100	510	105	0.0480	0.0800	0.4500	2025-07-31 08:41:15.705175+00
932132f2-a611-49f5-b8c0-048715c4ac71	e47828ff-363d-4988-b4c7-9d385b70d1a5	2024-01-01	1000	500	100	0.0500	0.1000	0.5000	2025-07-31 08:41:45.335603+00
0fb7a2bd-83ca-46e5-b2d8-e5e4595ca5e3	e47828ff-363d-4988-b4c7-9d385b70d1a5	2024-01-02	1050	505	102	0.0520	0.1200	0.5500	2025-07-31 08:41:45.335603+00
f73408e6-7c22-478f-b049-b74a114cc371	e47828ff-363d-4988-b4c7-9d385b70d1a5	2024-01-03	1100	510	105	0.0480	0.0800	0.4500	2025-07-31 08:41:45.335603+00
25adb8c7-87f2-4826-b3e3-3aeb94969257	54322980-0b73-41bb-a202-9b68313ef9a7	2024-01-01	1000	500	100	0.0500	0.1000	0.5000	2025-07-31 08:42:25.959803+00
75a0f50d-1ef8-4144-be5c-726a6bc2d681	54322980-0b73-41bb-a202-9b68313ef9a7	2024-01-02	1050	505	102	0.0520	0.1200	0.5500	2025-07-31 08:42:25.959803+00
4fca5c81-27ac-48df-9479-b5ef48499df6	54322980-0b73-41bb-a202-9b68313ef9a7	2024-01-03	1100	510	105	0.0480	0.0800	0.4500	2025-07-31 08:42:25.959803+00
983c5cdb-00f6-4a07-b503-6891b1cb27f7	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2024-01-01	1000	500	100	0.0500	0.1000	0.5000	2025-07-31 08:42:52.956332+00
5e9c5fe1-63db-4466-ab80-3c20c00b937d	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2024-01-02	1050	505	102	0.0520	0.1200	0.5500	2025-07-31 08:42:52.956332+00
05fbd219-230a-4e18-9ce4-7aa3840380fd	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2024-01-03	1100	510	105	0.0480	0.0800	0.4500	2025-07-31 08:42:52.956332+00
874fe93c-9d4d-40d4-82fd-f74bac341860	50388d4c-90bb-4374-9fec-cab8288f97e1	2024-01-01	1000	500	100	0.0500	0.1000	0.5000	2025-08-01 07:11:39.733394+00
668eb951-b41c-4c8a-85dc-3780a28c1ec3	50388d4c-90bb-4374-9fec-cab8288f97e1	2024-01-02	1050	505	102	0.0520	0.1200	0.5500	2025-08-01 07:11:39.733394+00
0629b94c-07c7-4d0a-bf87-fe1af7560ea5	50388d4c-90bb-4374-9fec-cab8288f97e1	2024-01-03	1100	510	105	0.0480	0.0800	0.4500	2025-08-01 07:11:39.733394+00
b82f2b01-edbc-4a39-815f-e193907491df	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-08-02	1036	516	28	0.0405	0.0959	0.0669	2025-08-02 10:25:04.943888+00
3abede46-520c-48d0-800d-691352110f19	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-08-01	1004	506	30	0.0511	0.0656	0.0660	2025-08-02 10:25:04.943888+00
0951c2d0-9895-4ab6-94e1-7d3f363de092	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-31	1011	525	28	0.0427	0.0877	0.0277	2025-08-02 10:25:04.943888+00
63d46c7a-9912-4b03-bb35-cefb330028d8	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-30	1020	519	26	0.0467	0.1213	0.0366	2025-08-02 10:25:04.943888+00
c00bb36a-6935-49d6-ab3a-bb5f0947d441	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-29	1025	506	25	0.0485	0.1091	0.0421	2025-08-02 10:25:04.943888+00
1b359b1c-688d-4024-9a55-9b4c413b57f3	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-28	1030	510	27	0.0541	0.1420	0.0628	2025-08-02 10:25:04.943888+00
180e93fe-f6d4-47c5-b776-1a1cda9f687a	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-27	1026	522	27	0.0453	0.0541	0.0334	2025-08-02 10:25:04.943888+00
43885667-12e4-41d3-802e-3a3c91cb47ca	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-26	1015	518	28	0.0548	0.0850	0.0638	2025-08-02 10:25:04.943888+00
7137d343-6a8e-432a-8482-cd3758295cfd	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-25	1015	517	28	0.0525	0.1473	0.0285	2025-08-02 10:25:04.943888+00
7d11fda8-184d-4549-9ce2-3752cb37bfeb	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-24	1010	524	29	0.0458	0.1009	0.0329	2025-08-02 10:25:04.943888+00
19bfb62c-7d9e-43b3-94cb-308fd2b6c75d	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-23	1034	505	29	0.0519	0.0700	0.0573	2025-08-02 10:25:04.943888+00
85897be7-3d2a-4d45-af18-35928aae1baa	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-22	1023	518	29	0.0439	0.0858	0.0420	2025-08-02 10:25:04.943888+00
66fbd9ec-78d4-4baa-bf51-8f33c74e047e	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-21	1030	512	30	0.0475	0.1163	0.0673	2025-08-02 10:25:04.943888+00
67d2c91b-dc4f-4602-9272-87fa19b86907	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-20	1041	509	28	0.0470	0.1474	0.0602	2025-08-02 10:25:04.943888+00
2a3f561c-2fcb-4e85-95a2-02f992611821	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-19	1023	511	29	0.0402	0.1451	0.0388	2025-08-02 10:25:04.943888+00
2bee7878-bcf1-416d-8976-6f9696b933c2	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-18	1049	504	27	0.0398	0.0935	0.0204	2025-08-02 10:25:04.943888+00
01d16c25-6979-4633-a0ec-88110ad353b4	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-17	1039	511	26	0.0503	0.1275	0.0439	2025-08-02 10:25:04.943888+00
dc672b89-1f7c-414b-9477-00d17318ee1a	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-16	1017	502	29	0.0444	0.1336	0.0202	2025-08-02 10:25:04.943888+00
7b676491-e128-4ee8-be0c-ecebe386f945	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-15	1009	502	30	0.0497	0.1431	0.0246	2025-08-02 10:25:04.943888+00
b1cb2ce8-b2f1-48f1-bda6-af89b6b85bb6	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-14	1008	524	26	0.0383	0.0546	0.0387	2025-08-02 10:25:04.943888+00
71db233a-b82e-4e05-9a04-431421449b6a	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-13	1011	519	29	0.0410	0.0764	0.0698	2025-08-02 10:25:04.943888+00
302e00ae-9fb8-43d8-b7e7-a6c10c619dd6	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-12	1025	514	30	0.0357	0.1133	0.0376	2025-08-02 10:25:04.943888+00
5845d790-6a19-4209-bddc-c9826c0822a6	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-11	1002	513	27	0.0472	0.0641	0.0609	2025-08-02 10:25:04.943888+00
2c695b2f-26ee-46a3-9a6e-9d3c6d44be4a	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-10	1003	518	30	0.0473	0.0852	0.0228	2025-08-02 10:25:04.943888+00
e1905697-97b6-4b73-be1e-2d83f4ab5a2a	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-09	1007	522	26	0.0522	0.0723	0.0416	2025-08-02 10:25:04.943888+00
26b1c63c-eb58-4de1-8c7a-6082cb84c795	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-08	1039	506	27	0.0449	0.0961	0.0636	2025-08-02 10:25:04.943888+00
0af973ae-aac8-4029-a3db-794eed634bf4	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-07	1015	504	29	0.0411	0.1329	0.0301	2025-08-02 10:25:04.943888+00
0123af6d-f1e8-44f1-b9cc-03a681703445	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-06	1020	520	28	0.0447	0.1310	0.0541	2025-08-02 10:25:04.943888+00
0fd574a1-81e5-4812-a976-6160b0052ce5	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-05	1013	508	26	0.0415	0.0511	0.0280	2025-08-02 10:25:04.943888+00
d71cd070-baa5-4ae1-91f5-90109e43ce19	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-04	1016	523	26	0.0399	0.0814	0.0318	2025-08-02 10:25:04.943888+00
7168d468-3398-45e9-bd59-e45bfaf74a1c	1b30b702-3474-4b06-98a2-b743dbf2773c	2025-07-03	1019	522	26	0.0531	0.1497	0.0685	2025-08-02 10:25:04.943888+00
36d41245-1106-4adb-93f2-759ed6b34032	69df8258-9655-4bfa-8e08-979302483758	2025-08-02	1006	513	29	0.0519	0.0814	0.0323	2025-08-02 10:25:04.943888+00
ebb64682-b530-447f-817d-30cde9dffb82	69df8258-9655-4bfa-8e08-979302483758	2025-08-01	1030	516	26	0.0398	0.0918	0.0511	2025-08-02 10:25:04.943888+00
5494b9c9-a4fc-4adf-9da1-30d7e2013793	69df8258-9655-4bfa-8e08-979302483758	2025-07-31	1030	517	27	0.0549	0.1278	0.0642	2025-08-02 10:25:04.943888+00
dd10f845-42ac-4b8a-8045-56336cfd485c	69df8258-9655-4bfa-8e08-979302483758	2025-07-30	1026	515	26	0.0508	0.0715	0.0617	2025-08-02 10:25:04.943888+00
c750c89b-e6ba-4aaf-b311-312a9afa3cb0	69df8258-9655-4bfa-8e08-979302483758	2025-07-29	1003	506	27	0.0391	0.0725	0.0498	2025-08-02 10:25:04.943888+00
d574633b-f8fd-42e7-8a3e-c9566d6787b0	69df8258-9655-4bfa-8e08-979302483758	2025-07-28	1020	518	29	0.0479	0.1059	0.0427	2025-08-02 10:25:04.943888+00
891efa91-a3db-4b43-9612-3c421570edfc	69df8258-9655-4bfa-8e08-979302483758	2025-07-27	1020	502	29	0.0524	0.1169	0.0208	2025-08-02 10:25:04.943888+00
92d181c5-5c55-48df-8f83-d33007a3092e	69df8258-9655-4bfa-8e08-979302483758	2025-07-26	1020	523	28	0.0376	0.1002	0.0361	2025-08-02 10:25:04.943888+00
684e4f45-47b8-43ad-ad4d-1eeb5ecd32b9	69df8258-9655-4bfa-8e08-979302483758	2025-07-25	1016	517	26	0.0539	0.0990	0.0511	2025-08-02 10:25:04.943888+00
a440bf67-4c5b-43cc-ab8a-1c1801e5e1f2	69df8258-9655-4bfa-8e08-979302483758	2025-07-24	1033	510	30	0.0436	0.1341	0.0626	2025-08-02 10:25:04.943888+00
1fb5bed7-3c0d-4a71-a2f0-9255885129ce	69df8258-9655-4bfa-8e08-979302483758	2025-07-23	1033	525	26	0.0546	0.0502	0.0440	2025-08-02 10:25:04.943888+00
74f80e58-fc37-42ef-9f0b-5c06adb62ded	69df8258-9655-4bfa-8e08-979302483758	2025-07-22	1021	505	26	0.0375	0.1077	0.0210	2025-08-02 10:25:04.943888+00
2276ca21-8536-46a5-8bcc-87ecd79e44b5	69df8258-9655-4bfa-8e08-979302483758	2025-07-21	1019	517	26	0.0494	0.1010	0.0358	2025-08-02 10:25:04.943888+00
85f6fdf1-673b-40e8-a16d-3f28c037b2b1	69df8258-9655-4bfa-8e08-979302483758	2025-07-20	1002	512	28	0.0421	0.0811	0.0266	2025-08-02 10:25:04.943888+00
be9b8186-d237-4f5d-a19d-e44d0eb56b8d	69df8258-9655-4bfa-8e08-979302483758	2025-07-19	1036	500	30	0.0427	0.0773	0.0438	2025-08-02 10:25:04.943888+00
4a5b49c7-d613-4491-8f50-ddba828720f1	69df8258-9655-4bfa-8e08-979302483758	2025-07-18	1042	505	28	0.0459	0.0796	0.0669	2025-08-02 10:25:04.943888+00
584f4427-59f4-4505-a646-48b63d9e9a26	69df8258-9655-4bfa-8e08-979302483758	2025-07-17	1045	504	30	0.0492	0.1376	0.0380	2025-08-02 10:25:04.943888+00
b75b392d-88b3-40a4-ae43-30d8ec512bf8	69df8258-9655-4bfa-8e08-979302483758	2025-07-16	1017	503	30	0.0522	0.0916	0.0445	2025-08-02 10:25:04.943888+00
19b6b1d0-dc09-4bf6-8bcf-59dcb8960914	69df8258-9655-4bfa-8e08-979302483758	2025-07-15	1023	521	25	0.0384	0.1269	0.0596	2025-08-02 10:25:04.943888+00
056ecce7-cf59-4932-90a1-cbb7a82abc5d	69df8258-9655-4bfa-8e08-979302483758	2025-07-14	1014	519	25	0.0463	0.0768	0.0422	2025-08-02 10:25:04.943888+00
05ac08d3-e30b-445b-b8d9-9382492157c7	69df8258-9655-4bfa-8e08-979302483758	2025-07-13	1038	519	29	0.0503	0.0633	0.0570	2025-08-02 10:25:04.943888+00
85bd38c8-ec88-45cf-aafa-8b444b591ea3	69df8258-9655-4bfa-8e08-979302483758	2025-07-12	1014	507	29	0.0507	0.1187	0.0304	2025-08-02 10:25:04.943888+00
4d6de899-fd2d-49c3-bf6b-46c7d8c01022	69df8258-9655-4bfa-8e08-979302483758	2025-07-11	1010	514	25	0.0424	0.1346	0.0363	2025-08-02 10:25:04.943888+00
b11f6e21-4d94-4235-9066-c64e28302771	69df8258-9655-4bfa-8e08-979302483758	2025-07-10	1008	523	25	0.0386	0.1458	0.0315	2025-08-02 10:25:04.943888+00
65e8469b-2686-43f5-ab8b-5e086bdd1a51	69df8258-9655-4bfa-8e08-979302483758	2025-07-09	1030	512	25	0.0535	0.1074	0.0678	2025-08-02 10:25:04.943888+00
db808641-91be-4865-84ef-9cb88ea32cc0	69df8258-9655-4bfa-8e08-979302483758	2025-07-08	1008	507	27	0.0462	0.0666	0.0664	2025-08-02 10:25:04.943888+00
142ce5d2-ed4a-4c7b-94c1-278ec5049a83	69df8258-9655-4bfa-8e08-979302483758	2025-07-07	1028	525	28	0.0503	0.0941	0.0411	2025-08-02 10:25:04.943888+00
ef692949-cc20-47f1-bc1e-48414424ef01	69df8258-9655-4bfa-8e08-979302483758	2025-07-06	1027	521	28	0.0364	0.0536	0.0637	2025-08-02 10:25:04.943888+00
b5fb224a-f675-410d-9023-3c51d5f3081c	69df8258-9655-4bfa-8e08-979302483758	2025-07-05	1041	502	30	0.0405	0.1095	0.0538	2025-08-02 10:25:04.943888+00
e08dd749-f02e-482e-ab8a-da79cd921706	69df8258-9655-4bfa-8e08-979302483758	2025-07-04	1008	520	27	0.0491	0.1149	0.0266	2025-08-02 10:25:04.943888+00
702f37a6-bfd4-446c-86c4-7b22a96ead7f	69df8258-9655-4bfa-8e08-979302483758	2025-07-03	1036	508	26	0.0546	0.1325	0.0285	2025-08-02 10:25:04.943888+00
a6cacb7c-f807-43e8-be28-bd5ba43e2e99	76a86d50-18b3-47db-a52f-21d8710f770e	2025-08-02	1044	525	26	0.0391	0.1101	0.0382	2025-08-02 10:25:04.943888+00
8fe530b9-ba0c-4e39-9337-c2d010a5c4f6	76a86d50-18b3-47db-a52f-21d8710f770e	2025-08-01	1041	523	26	0.0422	0.0542	0.0571	2025-08-02 10:25:04.943888+00
bf46d0bf-be47-49e8-b50d-51ae10e3ab46	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-31	1020	514	28	0.0380	0.0506	0.0576	2025-08-02 10:25:04.943888+00
01abe522-21a0-4df7-bd7e-9d52958dfcad	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-30	1037	513	27	0.0508	0.1412	0.0606	2025-08-02 10:25:04.943888+00
9f51d6dc-561a-401d-8106-2865fb0f8c45	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-29	1021	509	25	0.0534	0.1238	0.0328	2025-08-02 10:25:04.943888+00
ec42542d-5bec-4ad7-b513-eaca52510fc3	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-28	1009	505	27	0.0398	0.1068	0.0249	2025-08-02 10:25:04.943888+00
f47224fa-4a53-402d-b977-90a067a2e33a	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-27	1027	502	26	0.0509	0.0553	0.0374	2025-08-02 10:25:04.943888+00
e1341c6f-c4d2-407e-8be0-0cfb534f8db4	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-26	1012	521	27	0.0545	0.0551	0.0370	2025-08-02 10:25:04.943888+00
43b90839-5968-4c31-9663-3f7e10a78f0e	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-25	1037	510	29	0.0475	0.1247	0.0533	2025-08-02 10:25:04.943888+00
1e6a581a-8310-41cc-9483-bc9b25aa215b	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-24	1016	503	29	0.0543	0.1466	0.0226	2025-08-02 10:25:04.943888+00
5939d70b-0fbe-4962-a1c2-c501241018be	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-23	1025	508	25	0.0430	0.1161	0.0227	2025-08-02 10:25:04.943888+00
99bf2c2e-22e6-4a5f-b527-d33dd943078c	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-22	1016	520	26	0.0525	0.1393	0.0685	2025-08-02 10:25:04.943888+00
af076943-1e3a-4239-a5d1-380779d5b823	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-21	1004	512	28	0.0468	0.0720	0.0411	2025-08-02 10:25:04.943888+00
b019c0b3-04f8-4ecc-8804-438b79f0c512	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-20	1022	522	29	0.0455	0.1243	0.0634	2025-08-02 10:25:04.943888+00
f454f84d-2f61-4440-9936-d318f76944f9	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-19	1048	513	30	0.0375	0.0848	0.0420	2025-08-02 10:25:04.943888+00
7271ad5b-e422-45cc-9c93-becf8c8ac3d5	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-18	1024	503	28	0.0392	0.0813	0.0647	2025-08-02 10:25:04.943888+00
e9ab80de-1ba1-4426-8ddc-72612b009893	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-17	1009	513	26	0.0404	0.1211	0.0258	2025-08-02 10:25:04.943888+00
f96dc8cc-fe8a-405a-88c6-d2c9d7b4eb8b	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-16	1043	521	26	0.0400	0.0752	0.0293	2025-08-02 10:25:04.943888+00
ab100aae-5264-4885-afe5-6056f67059b1	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-15	1049	520	27	0.0469	0.0646	0.0272	2025-08-02 10:25:04.943888+00
c8fe5041-0cf4-4133-ac47-8dc8bb21dbad	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-14	1001	521	28	0.0545	0.1312	0.0504	2025-08-02 10:25:04.943888+00
04411ea2-a76a-45de-af65-b47fb22f569d	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-13	1039	512	28	0.0393	0.1365	0.0205	2025-08-02 10:25:04.943888+00
3056355d-a540-492d-9181-24574b14c28d	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-12	1002	516	30	0.0422	0.0851	0.0440	2025-08-02 10:25:04.943888+00
0a672d4a-50f9-40f9-94b7-b6d5f70836b4	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-11	1019	509	30	0.0404	0.0870	0.0324	2025-08-02 10:25:04.943888+00
27792165-4dfe-4578-b4c8-2b39a462a176	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-10	1000	507	30	0.0423	0.1282	0.0233	2025-08-02 10:25:04.943888+00
357806ab-6f75-404e-9801-d9f99bfbf551	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-09	1025	513	28	0.0425	0.0757	0.0386	2025-08-02 10:25:04.943888+00
b9e05e93-bd66-48e4-9585-2b7c764a7354	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-08	1021	505	25	0.0491	0.0941	0.0246	2025-08-02 10:25:04.943888+00
645654c9-6e47-425c-8fcf-dac26ddd9eb0	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-07	1042	509	28	0.0451	0.1304	0.0460	2025-08-02 10:25:04.943888+00
cd9833f5-2adc-4cc0-9074-fa4ed9b3b2eb	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-06	1030	506	29	0.0399	0.0914	0.0264	2025-08-02 10:25:04.943888+00
dde4a6d9-d666-4bc3-8bbb-d2b496a8849a	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-05	1034	525	25	0.0410	0.1061	0.0234	2025-08-02 10:25:04.943888+00
ca238ea1-cfe3-45a0-a94a-ecd26c43a5c4	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-04	1042	510	28	0.0493	0.0770	0.0277	2025-08-02 10:25:04.943888+00
1d0efba0-50fd-4a29-809c-9b638a69cbfb	76a86d50-18b3-47db-a52f-21d8710f770e	2025-07-03	1023	523	25	0.0387	0.0974	0.0220	2025-08-02 10:25:04.943888+00
29b5a364-8aaf-4b3f-82db-c8b59e6409c9	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-08-02	1011	522	28	0.0384	0.0680	0.0623	2025-08-02 10:25:04.943888+00
0134d47b-3eec-45f3-a4cc-a832e2d4330a	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-08-01	1003	512	28	0.0477	0.1365	0.0638	2025-08-02 10:25:04.943888+00
a9481e7b-6d27-4013-93a0-48717d685c65	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-31	1021	510	29	0.0527	0.1242	0.0328	2025-08-02 10:25:04.943888+00
17193625-63df-4bae-bfd1-a27d147d2b53	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-30	1003	512	27	0.0414	0.0747	0.0412	2025-08-02 10:25:04.943888+00
2e80f8b6-b0c1-4c53-86af-6966b03af93c	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-29	1001	510	29	0.0415	0.0942	0.0487	2025-08-02 10:25:04.943888+00
040ff54d-b3c8-4c21-bb97-a61dc8f0dfd5	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-28	1003	511	26	0.0506	0.0650	0.0372	2025-08-02 10:25:04.943888+00
789006b4-0c41-406a-8cce-cfc008cb6e19	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-27	1013	511	29	0.0482	0.1307	0.0249	2025-08-02 10:25:04.943888+00
caa7cd4e-50dc-44ad-98f1-45538391a78c	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-26	1033	524	30	0.0351	0.0847	0.0286	2025-08-02 10:25:04.943888+00
9205c0dd-8d54-471d-984c-1a1927f41ed6	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-25	1000	511	27	0.0359	0.0734	0.0561	2025-08-02 10:25:04.943888+00
10eb0984-dd3e-44e6-82e4-c1d0f1293f62	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-24	1001	523	28	0.0424	0.0555	0.0508	2025-08-02 10:25:04.943888+00
0beed7fa-710c-4ea5-a842-1010907350f8	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-23	1044	504	26	0.0401	0.1135	0.0648	2025-08-02 10:25:04.943888+00
5f9669eb-3041-4ecf-b020-5b1736b1bcc9	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-22	1005	518	29	0.0381	0.1455	0.0307	2025-08-02 10:25:04.943888+00
3aa0a878-751f-4800-acaa-8ed4a6066a49	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-21	1001	518	26	0.0380	0.1325	0.0367	2025-08-02 10:25:04.943888+00
5829fe8d-9507-4124-8a19-b7880d0a3a83	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-20	1022	512	25	0.0435	0.1440	0.0662	2025-08-02 10:25:04.943888+00
c55b8e22-0da0-4a65-992b-e2ea21fd723e	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-19	1032	518	29	0.0411	0.1087	0.0246	2025-08-02 10:25:04.943888+00
b91dee95-71eb-4b2e-8bd6-cdce866444bb	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-18	1025	508	30	0.0515	0.0871	0.0375	2025-08-02 10:25:04.943888+00
ab6d9863-b136-45c3-bd09-7a683d2002ad	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-17	1013	511	28	0.0511	0.1272	0.0593	2025-08-02 10:25:04.943888+00
4dc8f3d9-ba61-4e8d-9f80-c87aaf1c7680	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-16	1025	505	29	0.0358	0.1215	0.0659	2025-08-02 10:25:04.943888+00
06deed9e-cc55-43ed-b5bb-0ca8d6da4c5a	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-15	1050	517	27	0.0398	0.0904	0.0230	2025-08-02 10:25:04.943888+00
d7fe6f1b-4600-494c-bc82-aefdaedbdb45	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-14	1032	519	28	0.0501	0.0520	0.0573	2025-08-02 10:25:04.943888+00
ee0b1947-08f6-4fdd-b977-941c137f0298	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-13	1037	507	29	0.0513	0.1304	0.0342	2025-08-02 10:25:04.943888+00
9ffbeb5a-bc37-4053-a31b-f0e9baaf703e	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-12	1025	518	27	0.0442	0.1452	0.0658	2025-08-02 10:25:04.943888+00
24c4c89a-5487-4489-a165-1da95b047274	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-11	1031	520	30	0.0490	0.0874	0.0475	2025-08-02 10:25:04.943888+00
b49cf494-53ea-47fc-a18b-40f689670e33	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-10	1046	513	27	0.0422	0.1029	0.0466	2025-08-02 10:25:04.943888+00
a452173e-ecef-46eb-a408-9b56211fcf51	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-09	1011	506	28	0.0427	0.1316	0.0685	2025-08-02 10:25:04.943888+00
093774f3-b535-4825-9286-fdc49d1db00a	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-08	1028	516	30	0.0441	0.1496	0.0685	2025-08-02 10:25:04.943888+00
6f6e725f-6895-4965-ad9a-a664afe4409f	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-07	1027	517	27	0.0399	0.1398	0.0405	2025-08-02 10:25:04.943888+00
d82e028b-548c-44d3-a63a-582f968cbc21	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-06	1014	517	28	0.0483	0.0760	0.0363	2025-08-02 10:25:04.943888+00
f9714c40-9ca3-479c-8a4c-7195c7dfc4cb	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-05	1019	511	28	0.0526	0.0710	0.0650	2025-08-02 10:25:04.943888+00
7ef8df6b-1374-48eb-a518-61e45f18a3b3	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-04	1035	511	29	0.0426	0.1036	0.0452	2025-08-02 10:25:04.943888+00
1d91fe93-e8c7-427e-a3e1-a1aeaaecdc39	e47828ff-363d-4988-b4c7-9d385b70d1a5	2025-07-03	1045	501	29	0.0385	0.0656	0.0549	2025-08-02 10:25:04.943888+00
eb60521a-8852-4427-a502-7e8203f82c62	54322980-0b73-41bb-a202-9b68313ef9a7	2025-08-02	1044	513	25	0.0528	0.0866	0.0337	2025-08-02 10:25:04.943888+00
f2da9324-c917-4b1a-b64a-a66e6db0f3f9	54322980-0b73-41bb-a202-9b68313ef9a7	2025-08-01	1039	518	29	0.0466	0.0747	0.0283	2025-08-02 10:25:04.943888+00
d4d05390-74bd-4981-a560-f8b80b7fd9da	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-31	1011	506	27	0.0360	0.1146	0.0408	2025-08-02 10:25:04.943888+00
eab298ed-6e61-4e72-9a3f-c6d22d1ef8d3	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-30	1011	522	29	0.0403	0.1041	0.0347	2025-08-02 10:25:04.943888+00
8f17f18e-6a7a-415b-b912-2679ac433e42	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-29	1023	520	28	0.0439	0.1238	0.0250	2025-08-02 10:25:04.943888+00
4b2d8d73-c2c8-476c-bc14-a950a364b14c	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-28	1030	512	29	0.0351	0.0510	0.0343	2025-08-02 10:25:04.943888+00
e570d57c-7269-47cc-b6c4-1077b44f4be4	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-27	1006	504	26	0.0504	0.1473	0.0440	2025-08-02 10:25:04.943888+00
b21c9311-00f3-4f4e-9d37-10364eb05a10	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-26	1014	521	27	0.0421	0.0815	0.0570	2025-08-02 10:25:04.943888+00
001813ba-4109-443f-85e4-3ce1c5a86e64	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-25	1019	516	30	0.0409	0.0535	0.0423	2025-08-02 10:25:04.943888+00
2e7c78bb-e9b0-432f-9527-6e0ff15b0c1e	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-24	1012	522	27	0.0438	0.0793	0.0234	2025-08-02 10:25:04.943888+00
a3dd6b59-6798-4367-abad-905f5a92d1d2	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-23	1008	508	28	0.0431	0.0528	0.0422	2025-08-02 10:25:04.943888+00
0dd96cf3-d8d6-4851-9145-00bf25d75d28	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-22	1016	508	25	0.0382	0.0545	0.0407	2025-08-02 10:25:04.943888+00
2c9202cc-847c-4473-9fbc-86f822e10835	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-21	1007	503	28	0.0522	0.0988	0.0527	2025-08-02 10:25:04.943888+00
fdf4a279-d7ab-4a0d-a777-c026b356da39	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-20	1022	504	27	0.0371	0.0741	0.0568	2025-08-02 10:25:04.943888+00
6b7cfea2-7378-43f4-900a-505d92275ff8	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-19	1008	522	30	0.0387	0.1335	0.0295	2025-08-02 10:25:04.943888+00
75d00d40-10ad-4f9e-b65e-711c0c9416d7	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-18	1040	508	26	0.0500	0.0713	0.0351	2025-08-02 10:25:04.943888+00
99faa979-02fd-42e4-b349-0d3186f63f0d	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-17	1049	500	26	0.0394	0.1080	0.0548	2025-08-02 10:25:04.943888+00
dfcf1910-9633-4434-b8dc-dcf0f2713eb5	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-16	1027	519	29	0.0426	0.0583	0.0457	2025-08-02 10:25:04.943888+00
f6f0b874-1e77-4353-81c8-c5f6ada918b4	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-15	1002	513	30	0.0455	0.1143	0.0379	2025-08-02 10:25:04.943888+00
7a5a9e77-16d0-47b5-84b4-622eb62ec0a8	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-14	1005	511	29	0.0372	0.0837	0.0440	2025-08-02 10:25:04.943888+00
e65cab51-45e4-41db-897e-1a842597ab27	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-13	1033	514	29	0.0405	0.1073	0.0625	2025-08-02 10:25:04.943888+00
9ba9920d-6214-4aff-b2ee-639d3f7e14b4	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-12	1035	506	30	0.0431	0.1046	0.0304	2025-08-02 10:25:04.943888+00
aad0468e-cdfd-4b49-8aa8-6796864ace39	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-11	1028	519	30	0.0416	0.0926	0.0464	2025-08-02 10:25:04.943888+00
ee51bead-b93e-436a-bd7a-c87a30013830	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-10	1002	506	28	0.0524	0.0666	0.0229	2025-08-02 10:25:04.943888+00
d66e4543-e57e-4cf4-b8f4-8d3167e349df	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-09	1046	519	26	0.0479	0.0708	0.0359	2025-08-02 10:25:04.943888+00
3696c7ae-289e-45bb-a4d9-f9d4c16291e1	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-08	1001	512	27	0.0518	0.0998	0.0553	2025-08-02 10:25:04.943888+00
ea0e41eb-423d-486f-9b15-32e398d31e0e	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-07	1037	521	26	0.0529	0.1280	0.0353	2025-08-02 10:25:04.943888+00
7d94aae7-3995-4aeb-ae15-e59f582f7dba	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-06	1017	500	29	0.0396	0.0785	0.0395	2025-08-02 10:25:04.943888+00
b6845f48-7331-4c2a-9338-d1841e2947a0	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-05	1032	507	29	0.0518	0.1168	0.0227	2025-08-02 10:25:04.943888+00
dd7c25cd-3741-437f-a47a-ebb54421d584	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-04	1011	515	26	0.0497	0.0695	0.0362	2025-08-02 10:25:04.943888+00
df0baf30-2d3f-4892-bd6e-d7a4211970fa	54322980-0b73-41bb-a202-9b68313ef9a7	2025-07-03	1032	501	26	0.0522	0.1213	0.0470	2025-08-02 10:25:04.943888+00
6d37c3e3-df7c-462d-a4b7-9d99724677c8	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-08-02	1027	507	30	0.0472	0.1192	0.0339	2025-08-02 10:25:04.943888+00
6751f909-d8ac-4429-ad5c-dff1124fd9d9	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-08-01	1016	519	30	0.0530	0.0561	0.0538	2025-08-02 10:25:04.943888+00
9a7a9c87-aa82-47de-a15a-00912788291b	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-31	1037	514	25	0.0400	0.1319	0.0683	2025-08-02 10:25:04.943888+00
e94f5ca7-256f-4b46-a417-6b69a7a73ca3	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-30	1030	506	29	0.0530	0.1395	0.0400	2025-08-02 10:25:04.943888+00
bc4625da-65e9-41d5-aced-535c5787a4a5	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-29	1048	502	27	0.0465	0.1391	0.0553	2025-08-02 10:25:04.943888+00
74bd8e68-4af3-4483-96f3-8ab427da1bce	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-28	1040	505	30	0.0372	0.1128	0.0501	2025-08-02 10:25:04.943888+00
71895194-e7f7-4085-925d-ac54dd6a98b0	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-27	1009	516	28	0.0500	0.1242	0.0628	2025-08-02 10:25:04.943888+00
835d7634-cb3a-42a7-b76c-6423544b0126	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-26	1022	516	26	0.0473	0.0889	0.0211	2025-08-02 10:25:04.943888+00
f94f9dee-d48a-4b78-bdbc-24fb5c07fe2e	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-25	1049	520	26	0.0419	0.0979	0.0365	2025-08-02 10:25:04.943888+00
0e278f46-51cd-43a4-bff0-2a09a3e9b261	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-24	1002	523	27	0.0481	0.1295	0.0274	2025-08-02 10:25:04.943888+00
cb0ea8a2-55c2-415c-ae2d-218cc9279c11	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-23	1013	516	26	0.0507	0.1003	0.0445	2025-08-02 10:25:04.943888+00
6b1e133e-7b3c-414d-8b64-a075662a4099	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-22	1002	508	27	0.0397	0.0874	0.0694	2025-08-02 10:25:04.943888+00
0c80d905-9927-4d1b-b5c4-cbc2538c9a00	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-21	1030	523	29	0.0360	0.0949	0.0643	2025-08-02 10:25:04.943888+00
737473ee-c30a-40f7-a6bf-d08fdf525f2b	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-20	1009	505	28	0.0457	0.1395	0.0388	2025-08-02 10:25:04.943888+00
ad33a78b-270e-41d0-b906-de073c73ff2e	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-19	1026	501	26	0.0510	0.1385	0.0576	2025-08-02 10:25:04.943888+00
224758ef-62f0-42aa-8815-f3ea231cf1af	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-18	1005	521	25	0.0474	0.1092	0.0398	2025-08-02 10:25:04.943888+00
b81293a4-6c63-45a8-9448-1afb34be5cd4	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-17	1014	516	27	0.0368	0.1249	0.0636	2025-08-02 10:25:04.943888+00
291bc960-0fb3-4a1f-89e5-1776dbfd4595	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-16	1037	501	26	0.0425	0.1096	0.0503	2025-08-02 10:25:04.943888+00
354e9a86-a568-4aa3-95d2-32af647368a8	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-15	1003	501	29	0.0547	0.1358	0.0334	2025-08-02 10:25:04.943888+00
c649dfe3-34be-4ac4-b861-652997440ebb	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-14	1030	512	28	0.0545	0.0519	0.0468	2025-08-02 10:25:04.943888+00
3d9c7464-0b1b-485e-96a7-974eba236db5	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-13	1041	520	28	0.0375	0.1484	0.0558	2025-08-02 10:25:04.943888+00
501c9411-b3d2-47c2-88ea-e188992ca2d1	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-12	1004	501	26	0.0512	0.0880	0.0446	2025-08-02 10:25:04.943888+00
85f75c55-32aa-41bd-b609-99af676a9050	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-11	1047	505	30	0.0524	0.0930	0.0678	2025-08-02 10:25:04.943888+00
f8341d1f-b35c-4725-892e-c9d8ed4f7b24	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-10	1031	518	26	0.0383	0.1397	0.0422	2025-08-02 10:25:04.943888+00
2cfb56fc-06e6-46bb-ab7e-f54762d79aad	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-09	1038	511	25	0.0477	0.1397	0.0492	2025-08-02 10:25:04.943888+00
0ad7f729-9c79-4506-bc2e-63bb8daccf02	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-08	1045	504	28	0.0483	0.1318	0.0235	2025-08-02 10:25:04.943888+00
94b33970-8d18-473c-b13a-c246afbe45ea	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-07	1029	517	27	0.0445	0.1326	0.0650	2025-08-02 10:25:04.943888+00
85de293f-75b8-48d4-9ad2-eaf828c249e1	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-06	1028	517	28	0.0412	0.0636	0.0207	2025-08-02 10:25:04.943888+00
19b553c6-9cf1-4cd8-8a68-70a4b2e9cfea	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-05	1021	523	28	0.0415	0.1373	0.0667	2025-08-02 10:25:04.943888+00
91c9bb50-80aa-438f-836c-af2e32451754	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-04	1023	505	26	0.0513	0.1477	0.0327	2025-08-02 10:25:04.943888+00
5a042275-738c-4598-a0c0-7c760380534e	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	2025-07-03	1012	515	30	0.0371	0.0628	0.0622	2025-08-02 10:25:04.943888+00
9822f138-4ba0-4fa6-8e12-b2ad71ca3b49	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-08-02	1046	521	25	0.0440	0.0830	0.0575	2025-08-02 10:25:04.943888+00
ae72fdaf-94ed-40dc-8f11-622a8b98d3df	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-08-01	1029	521	28	0.0479	0.1437	0.0599	2025-08-02 10:25:04.943888+00
725dfa47-d786-4124-8e2c-c7a663cb3787	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-31	1020	512	25	0.0452	0.1103	0.0646	2025-08-02 10:25:04.943888+00
ffadf9cc-cced-4dee-99b1-b8a3f60557ee	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-30	1028	514	30	0.0537	0.1483	0.0679	2025-08-02 10:25:04.943888+00
35f7e49a-bb25-4491-a91a-3ac0c8e71763	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-29	1038	511	29	0.0538	0.0748	0.0344	2025-08-02 10:25:04.943888+00
d7cce460-6f18-4279-8a68-764d88ef1b65	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-28	1031	503	26	0.0371	0.0797	0.0462	2025-08-02 10:25:04.943888+00
5d25bfdd-1b64-41e5-a483-5a0eec4e17f1	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-27	1046	513	28	0.0482	0.0577	0.0544	2025-08-02 10:25:04.943888+00
2ffa9192-cec3-4c0c-9dd1-b5cdc187b15a	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-26	1036	508	29	0.0545	0.0540	0.0221	2025-08-02 10:25:04.943888+00
e0c4bcb1-47c8-4bf1-870e-5d65958626ce	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-25	1001	525	26	0.0363	0.0904	0.0255	2025-08-02 10:25:04.943888+00
16eccd7d-9cf8-4231-8402-6ae329aec652	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-24	1042	517	28	0.0460	0.1222	0.0226	2025-08-02 10:25:04.943888+00
6110fe1e-afdf-4eac-a8a5-e6ec0b539f76	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-23	1006	501	30	0.0486	0.0957	0.0552	2025-08-02 10:25:04.943888+00
7439075a-bf8a-4c75-8dda-079cc9bca87d	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-22	1031	510	28	0.0359	0.1376	0.0592	2025-08-02 10:25:04.943888+00
13ad2e2f-4921-4cf0-ae71-f2671636218d	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-21	1002	508	29	0.0426	0.0684	0.0547	2025-08-02 10:25:04.943888+00
b44ffde4-0ed4-458e-bab5-25e67541b86c	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-20	1028	517	25	0.0497	0.1217	0.0205	2025-08-02 10:25:04.943888+00
c570ea9d-217e-4571-a2c6-f97fc329e749	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-19	1043	525	27	0.0485	0.0985	0.0328	2025-08-02 10:25:04.943888+00
e76389ee-0e4b-4885-8fff-6ebff5e64c4c	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-18	1044	508	28	0.0410	0.0958	0.0390	2025-08-02 10:25:04.943888+00
255faa67-a5eb-46ef-a7eb-6d97ea4fad97	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-17	1048	502	28	0.0549	0.0975	0.0661	2025-08-02 10:25:04.943888+00
ec0d2f13-9732-40b3-bfd0-713b35cd1849	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-16	1004	522	30	0.0384	0.0636	0.0548	2025-08-02 10:25:04.943888+00
5a724f3a-e6fe-4341-9716-18cb8596b077	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-15	1011	524	25	0.0359	0.0969	0.0537	2025-08-02 10:25:04.943888+00
8433765f-2f7f-467b-bde9-265c1b60d342	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-14	1003	500	27	0.0352	0.0713	0.0566	2025-08-02 10:25:04.943888+00
6e2a1601-4a93-445c-802f-a4af1edea8cf	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-13	1030	508	29	0.0485	0.0722	0.0316	2025-08-02 10:25:04.943888+00
7022a25a-ea7d-4527-b2b2-592083be39b1	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-12	1013	507	26	0.0519	0.1414	0.0263	2025-08-02 10:25:04.943888+00
87598965-b080-41db-a684-c412f99be17e	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-11	1028	506	29	0.0366	0.1252	0.0321	2025-08-02 10:25:04.943888+00
350bc361-f9e0-4a16-995b-0ee46a9748c5	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-10	1006	521	27	0.0537	0.0592	0.0301	2025-08-02 10:25:04.943888+00
9908aaf0-97f7-45a7-84cc-36b23fb8c647	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-09	1016	510	28	0.0537	0.1133	0.0403	2025-08-02 10:25:04.943888+00
ec50d6e2-d441-4927-a911-b4e4a0837c11	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-08	1027	517	29	0.0352	0.1125	0.0503	2025-08-02 10:25:04.943888+00
c8bf3fe6-5d62-4545-a15e-6fc7efd4c728	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-07	1016	504	26	0.0370	0.0562	0.0287	2025-08-02 10:25:04.943888+00
bc540625-4f3d-4928-9faa-0fd15aa49dfd	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-06	1036	519	27	0.0446	0.0939	0.0250	2025-08-02 10:25:04.943888+00
c4b74ed2-bb9a-40cc-8aa1-0dd727d5f97d	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-05	1019	520	29	0.0381	0.1113	0.0285	2025-08-02 10:25:04.943888+00
fe2daf14-1643-427d-98a3-3016310e52b3	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-04	1038	511	27	0.0383	0.0917	0.0655	2025-08-02 10:25:04.943888+00
e0b27ed2-8507-451a-a931-2ac3ba2365f7	50388d4c-90bb-4374-9fec-cab8288f97e1	2025-07-03	1038	518	27	0.0458	0.1112	0.0530	2025-08-02 10:25:04.943888+00
4a92c77c-3418-45d4-9fe9-b73a92bc20b0	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-08-02	1560	751	31	0.0725	0.1563	0.1048	2025-08-02 10:25:04.943888+00
a774cc65-6a1b-4504-9719-ccf931dc22f3	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-08-01	1556	784	39	0.0506	0.1356	0.0970	2025-08-02 10:25:04.943888+00
33431da3-7cd5-4d0d-84eb-55957f744183	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-31	1570	761	39	0.0666	0.1413	0.0921	2025-08-02 10:25:04.943888+00
596c63a4-24e2-4973-a268-25a481418d51	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-30	1521	797	34	0.0632	0.1612	0.0470	2025-08-02 10:25:04.943888+00
ed5a1f2c-4ce5-49da-a225-a8fc2c149d34	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-29	1590	782	30	0.0489	0.1768	0.0935	2025-08-02 10:25:04.943888+00
807fcb52-45ef-49e5-97a2-30165678fb6a	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-28	1529	799	36	0.0459	0.1337	0.0888	2025-08-02 10:25:04.943888+00
eb0b5389-8dd0-473c-859f-406b24160270	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-27	1552	762	39	0.0578	0.2017	0.0975	2025-08-02 10:25:04.943888+00
54e50876-6907-473f-b9e6-790a636bd094	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-26	1547	777	33	0.0583	0.0940	0.0973	2025-08-02 10:25:04.943888+00
6b6f8fd3-b254-4785-ad7a-2079a26ecce1	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-25	1566	775	37	0.0525	0.0896	0.0633	2025-08-02 10:25:04.943888+00
40c38e91-5e15-4e9f-af9d-093ff87d192a	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-24	1536	769	34	0.0542	0.0993	0.0663	2025-08-02 10:25:04.943888+00
1db63e65-91fd-4844-9e7e-dec78936c2ac	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-23	1568	792	31	0.0499	0.2266	0.0829	2025-08-02 10:25:04.943888+00
4ac6da23-afdd-4c99-bf98-39407fac8d40	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-22	1566	795	33	0.0637	0.1207	0.0366	2025-08-02 10:25:04.943888+00
0170b84c-9c6c-4ac9-bf55-a5350f704c45	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-21	1564	772	31	0.0701	0.1100	0.1050	2025-08-02 10:25:04.943888+00
64c3aec1-719d-4364-9e05-2cda2c88df50	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-20	1568	774	37	0.0547	0.2142	0.0944	2025-08-02 10:25:04.943888+00
83cdd992-c1d5-4b40-bc44-78c1e27917a4	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-19	1529	766	37	0.0652	0.1355	0.0679	2025-08-02 10:25:04.943888+00
9a0df7ea-c3aa-412b-bcf1-3830ebc9adac	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-18	1593	797	34	0.0474	0.1853	0.0988	2025-08-02 10:25:04.943888+00
31ab0586-688f-4dc7-b627-e2063c03da78	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-17	1508	760	37	0.0590	0.1308	0.0507	2025-08-02 10:25:04.943888+00
26e1e6b1-5a8f-4bbe-bc68-c1914085f075	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-16	1576	795	36	0.0538	0.1927	0.0300	2025-08-02 10:25:04.943888+00
271efc52-6266-4ea5-bbe3-6f074012ccec	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-15	1564	760	40	0.0729	0.1835	0.0870	2025-08-02 10:25:04.943888+00
657068e4-1d68-4009-8c61-250e0a6abbf9	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-14	1536	754	30	0.0605	0.1249	0.0896	2025-08-02 10:25:04.943888+00
b071e975-1bb9-40fd-b737-a49f23c88e06	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-13	1529	791	33	0.0593	0.1626	0.1072	2025-08-02 10:25:04.943888+00
773dcd09-2e56-4eae-8c08-25cee20ea3ae	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-12	1507	792	34	0.0541	0.2027	0.0919	2025-08-02 10:25:04.943888+00
b49d7b31-a237-482f-8958-c3bcf95d8ba8	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-11	1547	770	30	0.0695	0.1548	0.0743	2025-08-02 10:25:04.943888+00
b6dd514c-3440-49db-8755-191e909627a3	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-10	1549	784	38	0.0554	0.0915	0.0530	2025-08-02 10:25:04.943888+00
9a2f8c78-0cac-44ad-ad50-a9b7557dcee5	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-09	1542	763	34	0.0583	0.1169	0.1059	2025-08-02 10:25:04.943888+00
8f67bb59-9617-4255-bd33-706b0edf3116	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-08	1538	752	40	0.0460	0.2137	0.0893	2025-08-02 10:25:04.943888+00
de42f31c-ba2f-466d-8eb3-ff7bc28f9bc1	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-07	1533	782	30	0.0744	0.1327	0.0414	2025-08-02 10:25:04.943888+00
50a41f4a-2984-4b45-8ee8-98c60fbdc47f	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-06	1554	764	40	0.0470	0.2019	0.0963	2025-08-02 10:25:04.943888+00
8ecef937-facd-450b-a203-762c722c8914	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-05	1560	760	35	0.0515	0.1185	0.0926	2025-08-02 10:25:04.943888+00
ef733196-da14-4a22-8afb-ea9ad99dc13a	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-04	1579	796	39	0.0601	0.2031	0.0901	2025-08-02 10:25:04.943888+00
270ef5d7-7ca7-4f29-a0c0-bf9e6fb0ebd1	d8b70fe4-66d5-489a-a988-6cadc78ab150	2025-07-03	1519	798	40	0.0673	0.2130	0.0413	2025-08-02 10:25:04.943888+00
\.


--
-- TOC entry 4372 (class 0 OID 25044)
-- Dependencies: 230
-- Data for Name: account_monitoring_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_monitoring_configs (id, social_account_id, data_collection_frequency, metrics_to_collect, include_competitors, max_history_days, alert_on_significant_changes, alert_threshold_percentage, is_active, last_collection_at, next_collection_at, created_at, updated_at) FROM stdin;
831f0aea-dd83-4999-a918-64001a8d4d11	1b30b702-3474-4b06-98a2-b743dbf2773c	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:40:06.768579+00	2025-07-31 08:40:06.768579+00	2025-07-31 08:40:06.768579+00
0a1d78dd-6050-4b8d-b320-a4fedf03efd7	69df8258-9655-4bfa-8e08-979302483758	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:40:23.530222+00	2025-07-31 08:40:23.530222+00	2025-07-31 08:40:23.530222+00
835385d1-1883-49c9-a30f-0deadd4a6f73	76a86d50-18b3-47db-a52f-21d8710f770e	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:41:15.699453+00	2025-07-31 08:41:15.699453+00	2025-07-31 08:41:15.699453+00
92978190-7df9-431e-8718-71387a9e2535	e47828ff-363d-4988-b4c7-9d385b70d1a5	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:41:45.330522+00	2025-07-31 08:41:45.330522+00	2025-07-31 08:41:45.330522+00
406c4a7c-e34a-4ea2-96b4-347720138c7e	54322980-0b73-41bb-a202-9b68313ef9a7	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:42:25.952938+00	2025-07-31 08:42:25.952938+00	2025-07-31 08:42:25.952938+00
c33fb6b4-9a12-43a1-8929-042dcf42426a	7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-01 08:42:52.953537+00	2025-07-31 08:42:52.953537+00	2025-07-31 08:42:52.953537+00
2d19c69b-042f-4f7e-8f4a-754460126fdc	50388d4c-90bb-4374-9fec-cab8288f97e1	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-02 07:11:39.728991+00	2025-08-01 07:11:39.728991+00	2025-08-01 07:11:39.728991+00
750c43a0-637a-4024-9617-a03a2d8b5698	d8b70fe4-66d5-489a-a988-6cadc78ab150	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-03 10:24:54.475751+00	2025-08-02 10:24:54.475751+00	2025-08-02 10:24:54.475751+00
f280bdd4-ee88-4deb-8857-4a13c7c1a8de	1c12c06e-37a2-4d7e-a8e4-ca086ba2c4b5	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.28857+00	2025-08-04 06:52:12.28857+00	2025-08-04 06:52:12.28857+00
796f1785-7f27-474a-b6ae-6794f9c30164	6747187e-f27d-403e-b589-4385b5a812bc	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.518097+00	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00
e99ffee8-8542-41a0-b576-d5657301f185	a3a413df-f93f-4b3f-b7b7-f4139732ae4c	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.518097+00	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00
e0005e62-0419-42bb-aa61-2deddf577d0d	7c281ce2-7e6b-4d93-a9b6-9b28348b8f77	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
04c62313-4545-4224-b8de-57e427cf7aa9	3a6d9c0d-b609-43a8-9e2f-4558e509abed	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
4e6fc515-c6e3-464d-ba88-1c4c91db8c20	f5b2e50f-a2ec-493a-9754-8cd861217ba2	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
c04386a5-4820-4b66-9b60-0f9094d84444	91743709-6099-4e44-8cc7-3953f50db3c1	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
cd8668ea-6876-4582-bf92-760b91ff09b2	7506224b-e9d5-4823-b16e-7985c06fffdd	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
cee6bd2d-252d-4012-8cfe-f0e0c08d0497	5412f075-a30a-44f8-92bf-b9e580af7510	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
da80c18e-1a53-44ec-b721-00a74de23ab2	fb001d7c-3291-48d3-9b00-09f66700c7d9	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
1e6258fc-429f-4fdc-a45b-f0fcd4614701	110b9604-1df9-4dfc-9a6d-213774fabbc0	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
698ef034-aa3b-4e4e-9218-0f11e75e430e	708fad89-558c-453f-b505-7c47fe920d8c	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
a890c5fb-94af-462f-8d8e-1797603ea499	229d8fca-0c6d-45d6-b764-dd0d29508aae	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
00314510-3f32-4023-b727-2c2d2c70f25e	2ea551d9-3cf9-4d08-b205-1c88a39399f0	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
40787238-e692-4803-a8b3-c2b670069139	676d10f9-94f0-492d-97cd-c84ca6ba5cf3	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
90cec941-a3e7-4807-acc0-1c41a623d1b7	c174c73f-3ce2-4184-b35f-e18b9ef55d3a	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
5f4317a3-63ef-49f4-82fd-d7ae2cdb58b1	5e778fc6-c9d3-42a5-a58a-6f9c52ac538c	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
97f86ff2-bc18-4655-9ccf-7a3bb8502079	3ae15d25-1092-4950-9cae-08ff4ac6ee41	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
4b7d33eb-decf-49d2-a3c7-a6b1ab06214e	0a493b9d-6dad-4659-95f4-3e145208ba49	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
390fcb9a-5133-4249-9598-dce9852d82f7	2a7ac467-0630-484b-befb-0bb43556b04a	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
836c8149-f83c-4a43-94c1-af5da9db2b48	6719faf5-3bd3-42d9-b7c4-6430c0f85d2f	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
6fd3a69a-fe13-48b8-868e-692bb5230b97	a853dbd1-df81-421d-8468-c8a9955e8603	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
b3baa3e4-c52c-4d23-a7c0-de68aec70f1b	f25d0460-b6b8-4e62-b525-7d2b82a90fab	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-05 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
13c18457-ac84-476c-ad9d-ef8da816156f	f9d141d2-b1ea-40ba-b9b4-98ed2f13cc44	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-06 18:36:22.887946+00	2025-08-05 18:36:22.887946+00	2025-08-05 18:36:22.887946+00
5d452944-cc0b-4e5d-bacd-9e6a0426559b	f9d141d2-b1ea-40ba-b9b4-98ed2f13cc44	daily	{followers,engagement_rate,reach}	f	90	f	20.00	t	\N	2025-08-06 18:36:22.895+00	2025-08-05 18:36:22.894079+00	2025-08-05 18:36:22.894079+00
3a88fe9f-8838-4cbd-bc49-d96106248077	4dbc7355-76ba-454b-80da-d241c12778cd	daily	{followers,following,posts,engagement_rate}	f	365	t	10.00	t	\N	2025-08-06 19:38:16.808623+00	2025-08-05 19:38:16.808623+00	2025-08-05 19:38:16.808623+00
b253217a-02bf-4f55-8309-624614e6006b	4dbc7355-76ba-454b-80da-d241c12778cd	daily	{followers,engagement_rate,reach}	f	90	f	20.00	t	\N	2025-08-06 19:38:16.817+00	2025-08-05 19:38:16.818256+00	2025-08-05 19:38:16.818256+00
\.


--
-- TOC entry 4373 (class 0 OID 25066)
-- Dependencies: 231
-- Data for Name: account_status_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_status_logs (id, social_account_id, status, error_message, response_time_ms, data_quality_score, checked_at, metadata) FROM stdin;
\.


--
-- TOC entry 4395 (class 0 OID 25737)
-- Dependencies: 253
-- Data for Name: ai_analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_analysis (id, social_account_id, team_id, user_id, type, category, title, description, explanation, confidence, impact, urgency, score, tags, supporting_data, is_acknowledged, acknowledged_at, acknowledged_by, acknowledgment_notes, valid_until, is_active, generation_metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4393 (class 0 OID 25584)
-- Dependencies: 251
-- Data for Name: api_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_access_tokens (id, user_id, team_id, name, token, permissions, rate_limit, rate_limit_window, is_active, expires_at, last_used_at, created_at, updated_at) FROM stdin;
11588b27-ce39-4822-98d1-56da69076c54	fcc80f85-e22d-402d-b480-9b299479be5f	\N	Demo API Token	asm_a672145dc43c8018ba6aed7257719aae3db9b137a9b3b1515d79764c83217960	["export:read", "webhooks:read"]	1000	3600000	t	\N	\N	2025-07-31 08:41:15.714+00	2025-07-31 08:41:15.714+00
e92a4836-6278-4802-bd27-cb509d6f75eb	9b27ea41-d48a-42c2-84f6-8da36e7ce80e	\N	Demo API Token	asm_73734226bcbad929ad6c7b1040fe3a44abe0e5fb61a3d1cff24cf1ddbd7d4c27	["export:read", "webhooks:read"]	1000	3600000	t	\N	\N	2025-07-31 08:42:25.966+00	2025-07-31 08:42:25.966+00
016360af-4576-4c79-bdfa-a6999f08a0b8	9ccae0be-a97f-4ccf-a116-878a1860b60e	\N	Demo API Token	asm_1643cc313f2e2376cca0936dc60ef09922bae1b6a9f1ee50974497e9308e3954	["export:read", "webhooks:read"]	1000	3600000	t	\N	\N	2025-07-31 08:42:52.963+00	2025-07-31 08:42:52.963+00
5ba3b107-6b19-4f69-bbce-cd2f48bde4e4	50dc9602-0da5-4a97-b69a-fe1b21376958	\N	Demo API Token	asm_e8aa0228526d2154795fced38966dc2227c55a336ab5dbe64f076dbc4fbca132	["export:read", "webhooks:read"]	1000	3600000	t	\N	\N	2025-08-01 07:11:39.739+00	2025-08-01 07:11:39.739+00
\.


--
-- TOC entry 4394 (class 0 OID 25610)
-- Dependencies: 252
-- Data for Name: api_rate_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_rate_limits (id, token_id, window_start, request_count, created_at, updated_at) FROM stdin;
f9dc52ed-81b9-4759-affa-9a476e8c3079	e92a4836-6278-4802-bd27-cb509d6f75eb	2025-07-31 08:00:00+00	1	2025-07-31 08:42:25.966494+00	2025-07-31 08:42:25.966494+00
8be28dd7-5fa6-4a71-aeba-4f169e79d66a	016360af-4576-4c79-bdfa-a6999f08a0b8	2025-07-31 08:00:00+00	1	2025-07-31 08:42:52.963511+00	2025-07-31 08:42:52.963511+00
bc0873c1-b7f3-41d5-bb70-ee6be103f25f	5ba3b107-6b19-4f69-bbce-cd2f48bde4e4	2025-08-01 07:00:00+00	1	2025-08-01 07:11:39.740951+00	2025-08-01 07:11:39.740951+00
\.


--
-- TOC entry 4370 (class 0 OID 24916)
-- Dependencies: 228
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, team_id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 4359 (class 0 OID 16502)
-- Dependencies: 217
-- Data for Name: brand_guidelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brand_guidelines (id, user_id, brand_voice, tone_of_voice, content_restrictions, target_audience, key_messages, visual_style, created_at, updated_at, team_id) FROM stdin;
\.


--
-- TOC entry 4384 (class 0 OID 25382)
-- Dependencies: 242
-- Data for Name: competitive_analysis_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competitive_analysis_results (id, user_id, team_id, social_account_id, platform, analysis_date, competitor_count, user_ranking, user_percentile, performance_score, engagement_gap_vs_competitors, engagement_gap_vs_industry, follower_growth_gap, post_frequency_gap, strong_areas, weak_areas, competitive_advantages, threats_and_opportunities, top_insights, recommendations, analysis_metadata, created_at) FROM stdin;
\.


--
-- TOC entry 4380 (class 0 OID 25293)
-- Dependencies: 238
-- Data for Name: competitor_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competitor_accounts (id, user_id, team_id, platform, platform_account_id, username, display_name, follower_count, following_count, is_active, added_by, notes, tags, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4381 (class 0 OID 25323)
-- Dependencies: 239
-- Data for Name: competitor_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competitor_metrics (id, competitor_account_id, date, followers, following, total_posts, avg_engagement_rate, avg_likes_per_post, avg_shares_per_post, avg_comments_per_post, reach_growth, follower_growth, posts_per_day, collected_at) FROM stdin;
\.


--
-- TOC entry 4382 (class 0 OID 25347)
-- Dependencies: 240
-- Data for Name: competitor_post_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competitor_post_metrics (id, competitor_account_id, platform, platform_post_id, post_type, published_at, likes, shares, comments, views, reach, impressions, engagement_rate, click_through_rate, content_preview, hashtags, mentions, collected_at) FROM stdin;
\.


--
-- TOC entry 4361 (class 0 OID 16535)
-- Dependencies: 219
-- Data for Name: content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content (id, user_id, type, title, text_content, image_urls, video_url, hashtags, platforms, status, scheduled_at, published_at, generation_metadata, brand_guidelines_id, created_at, updated_at, team_id) FROM stdin;
20ad850d-1577-4889-bbfb-99d7c0e031c2	da2de67c-1187-4ab8-a1ce-5be5591bb27b	text	Welcome to our community\\!	Excited to share our latest insights on social media marketing trends. What's your favorite platform for engaging with customers? 🚀 #SocialMedia #Marketing #Community	\N	\N	{#SocialMedia,#Marketing,#Community}	{twitter}	published	\N	2025-07-31 14:28:40.393778+00	\N	\N	2025-07-30 14:28:40.393778+00	2025-07-31 14:28:40.393778+00	f89012b1-b964-4a25-8788-f959efb01812
403733d5-97e8-4806-b997-bd32a4b4d15e	da2de67c-1187-4ab8-a1ce-5be5591bb27b	text	Monday Motivation	Starting the week strong\\! Remember: Success is not final, failure is not fatal. It's the courage to continue that counts. 💪 #MondayMotivation #Success #Inspiration	\N	\N	{#MondayMotivation,#Success,#Inspiration}	{twitter}	published	\N	2025-08-01 14:28:40.393778+00	\N	\N	2025-07-31 14:28:40.393778+00	2025-08-01 14:28:40.393778+00	f89012b1-b964-4a25-8788-f959efb01812
dbbfe82b-dd48-49fa-802e-ce9e0e336123	da2de67c-1187-4ab8-a1ce-5be5591bb27b	mixed	Product Update	Just rolled out our new analytics dashboard\\! 📊 Now you can track engagement across all platforms in real-time. Check it out and let us know what you think\\! #ProductUpdate #Analytics #Dashboard	\N	\N	{#ProductUpdate,#Analytics,#Dashboard}	{twitter}	published	\N	2025-08-02 02:28:40.393778+00	\N	\N	2025-08-01 14:28:40.393778+00	2025-08-02 02:28:40.393778+00	f89012b1-b964-4a25-8788-f959efb01812
87f572a9-65ce-422e-9c2a-8acbc75200fc	da2de67c-1187-4ab8-a1ce-5be5591bb27b	text	Industry Insights	Did you know? 73% of marketers believe that social media marketing has been effective for their business. The key is consistency and authentic engagement\\! 🎯 #MarketingTips #SocialMediaMarketing #BusinessGrowth	\N	\N	{#MarketingTips,#SocialMediaMarketing,#BusinessGrowth}	{twitter}	published	\N	2025-08-02 08:28:40.393778+00	\N	\N	2025-08-02 06:28:40.393778+00	2025-08-02 08:28:40.393778+00	f89012b1-b964-4a25-8788-f959efb01812
1cd07fed-7713-49d6-862f-650145664d78	da2de67c-1187-4ab8-a1ce-5be5591bb27b	image	Weekend Vibes	Team collaboration makes the dream work\\! 🤝 Grateful for our amazing team pushing boundaries and creating something special. #TeamWork #Weekend #Grateful	\N	\N	{#TeamWork,#Weekend,#Grateful}	{twitter}	scheduled	\N	2025-08-02 16:28:40.393778+00	\N	\N	2025-08-02 08:28:40.393778+00	2025-08-02 08:28:40.393778+00	f89012b1-b964-4a25-8788-f959efb01812
\.


--
-- TOC entry 4396 (class 0 OID 25774)
-- Dependencies: 254
-- Data for Name: content_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_patterns (id, social_account_id, team_id, user_id, type, description, frequency, confidence, score, examples, metrics, detected_for_period, detection_start_date, detection_end_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4379 (class 0 OID 25225)
-- Dependencies: 237
-- Data for Name: data_cleanup_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_cleanup_jobs (id, job_type, status, team_id, platform, data_type, records_processed, records_deleted, records_archived, error_message, started_at, completed_at, created_at) FROM stdin;
\.


--
-- TOC entry 4377 (class 0 OID 25191)
-- Dependencies: 235
-- Data for Name: data_deduplication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_deduplication_log (id, original_data_id, duplicate_data_id, similarity_score, deduplication_method, resolution_action, resolved_by, created_at) FROM stdin;
\.


--
-- TOC entry 4378 (class 0 OID 25209)
-- Dependencies: 236
-- Data for Name: data_retention_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_retention_policies (id, team_id, data_type, platform, retention_days, archive_before_delete, compression_enabled, policy_name, is_active, created_at, updated_at) FROM stdin;
6b53d98b-f1ff-41e0-b525-e409124424a5	f89012b1-b964-4a25-8788-f959efb01812	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-02 10:24:03.53425+00	2025-08-02 10:24:03.53425+00
0b85d720-874e-4c9d-b106-08b2f3dc1429	f89012b1-b964-4a25-8788-f959efb01812	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-02 10:24:03.53425+00	2025-08-02 10:24:03.53425+00
9d2a3ec0-8495-44d0-b3b9-5893a442a5c1	f89012b1-b964-4a25-8788-f959efb01812	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-02 10:24:03.53425+00	2025-08-02 10:24:03.53425+00
b6a2118c-bad7-433f-8355-3b96776abae9	f89012b1-b964-4a25-8788-f959efb01812	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-02 10:24:03.53425+00	2025-08-02 10:24:03.53425+00
3ab2a5be-64e3-4b9f-90a6-d4f79291a819	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
00dd276b-b14d-4e24-844e-f7417027d76e	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
c68c658c-f509-4bf2-bf5e-d9f97eef72e4	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
6ba2b4a2-53ee-42e0-b5cc-74ac48307037	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
8e7046db-e839-4e8c-965f-60b88a27ab9f	80fef9c3-7bee-4936-af53-5cad7ff22187	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
a1abb9e1-bfd7-4094-88ca-c3a4b555ce88	80fef9c3-7bee-4936-af53-5cad7ff22187	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
eda1b3c9-7aca-490d-a1f9-777ace8a7985	80fef9c3-7bee-4936-af53-5cad7ff22187	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
2b7146d1-68da-48bb-8909-7615a7114d18	80fef9c3-7bee-4936-af53-5cad7ff22187	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
66261c1d-532f-4f34-add9-2710d4b6e31b	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
6c9fdf2f-5e28-407b-adee-e6e2d1a68590	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
b18d8526-4f66-442f-a030-155f2867cf37	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
4d4b1071-f1f7-4549-85d9-721667d43d48	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
a5207a2f-7503-4898-92cc-af1ddf1bf74d	2798e0be-1144-470c-b597-06e7cf5766b8	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
01c2326c-b4f2-4f6f-9a23-a40f969008e0	2798e0be-1144-470c-b597-06e7cf5766b8	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
674b934b-c692-4461-9cde-ee6ed9b1390a	2798e0be-1144-470c-b597-06e7cf5766b8	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
c87fc295-81a0-4421-8866-25112c776890	2798e0be-1144-470c-b597-06e7cf5766b8	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
837834aa-5eb9-487f-9702-c01925065124	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-05 18:02:12.839835+00	2025-08-05 18:02:12.839835+00
b3ca4706-455a-40e6-b36d-527011f809bb	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-05 18:02:12.839835+00	2025-08-05 18:02:12.839835+00
56d7693b-2f79-47b7-ba33-b3282489b26e	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-05 18:02:12.839835+00	2025-08-05 18:02:12.839835+00
19e28faa-28f4-4e8b-bc97-57d1c050e39b	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-05 18:02:12.839835+00	2025-08-05 18:02:12.839835+00
3fa761a6-89d9-439e-920d-22f4ad6e5d45	3d76b8a0-77e5-466a-ae44-e0b418640544	profile	\N	365	t	t	Profile Data - 1 Year	t	2025-08-05 18:04:01.850595+00	2025-08-05 18:04:01.850595+00
5adfdf8b-b950-47a6-8663-fbc6074c03ad	3d76b8a0-77e5-466a-ae44-e0b418640544	posts	\N	180	t	t	Posts Data - 6 Months	t	2025-08-05 18:04:01.850595+00	2025-08-05 18:04:01.850595+00
904a9fda-aa0f-43f1-b4e5-eb418fbcabda	3d76b8a0-77e5-466a-ae44-e0b418640544	metrics	\N	730	t	t	Metrics Data - 2 Years	t	2025-08-05 18:04:01.850595+00	2025-08-05 18:04:01.850595+00
23ad0962-d3a6-411b-9e90-a4076051dd22	3d76b8a0-77e5-466a-ae44-e0b418640544	raw_scraped	\N	90	t	t	Raw Scraped Data - 3 Months	t	2025-08-05 18:04:01.850595+00	2025-08-05 18:04:01.850595+00
\.


--
-- TOC entry 4383 (class 0 OID 25370)
-- Dependencies: 241
-- Data for Name: industry_benchmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.industry_benchmarks (id, platform, industry, region, avg_engagement_rate, median_engagement_rate, top_percentile_engagement_rate, avg_follower_growth_rate, avg_post_frequency, avg_reach_rate, avg_likes_rate, avg_shares_rate, avg_comments_rate, sample_size, data_source, confidence_score, created_at, updated_at) FROM stdin;
69a3c056-895d-49f0-9ea6-7cf8c2f68c7e	instagram	general	global	1.2200	1.0800	3.5000	2.5000	1.00	1.2000	0.9500	0.1500	0.1200	10000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
1bb6403e-36be-435d-8f6d-63c555edd254	twitter	general	global	0.0450	0.0350	0.1500	1.8000	3.50	0.8500	0.0350	0.0080	0.0020	15000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
c9d95d4d-495c-49df-93b2-345cbb5aa8aa	facebook	general	global	0.2700	0.2000	1.0000	1.2000	0.80	1.5000	0.2200	0.0300	0.0200	8000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
974fec1e-7ea7-4835-9c9e-119c47fc714f	linkedin	general	global	0.5400	0.4500	2.0000	3.0000	0.50	0.6000	0.4000	0.0800	0.0600	5000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
7f06bbab-3dd1-4e21-a440-f333b1dbbe23	tiktok	general	global	5.3000	4.8000	9.9999	8.5000	2.00	2.5000	4.5000	0.6000	0.2000	12000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
fa9d749a-502a-48ab-b207-5619e7ed8586	youtube	general	global	1.6300	1.4000	5.0000	2.2000	0.30	1.8000	1.2000	0.2500	0.1800	6000	external_api	0.80	2025-07-28 06:50:43.85397+00	2025-07-28 06:50:43.85397+00
f7f7be19-e178-42bd-9a08-11129183d49f	instagram	fashion	global	1.8500	1.6000	4.2000	3.2000	1.50	1.4000	1.4500	0.2500	0.1500	2500	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
a3f8a597-1e4d-4362-8e7d-18fe639bc8a3	instagram	food	global	2.1000	1.8000	5.0000	2.8000	1.20	1.6000	1.7000	0.2000	0.2000	3000	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
3309f1bf-c84d-4169-a54f-ce168a88e868	instagram	fitness	global	1.9500	1.7000	4.5000	3.5000	1.30	1.5000	1.5500	0.2200	0.1800	2200	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
98e4969e-5862-40ac-a2b8-9b1b464b43f6	linkedin	technology	global	0.7500	0.6500	2.5000	4.0000	0.70	0.8000	0.5500	0.1200	0.0800	1800	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
bc81105a-a396-4693-9b93-c1a6bca9c61e	linkedin	finance	global	0.4500	0.3800	1.8000	2.5000	0.40	0.5500	0.3500	0.0600	0.0400	1500	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
810bdbbb-d980-4665-bfc8-0604f9ff6914	twitter	news	global	0.0650	0.0500	0.2000	2.2000	8.00	1.2000	0.0500	0.0120	0.0030	3500	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
ee4114f6-ee57-4afb-8e5f-24c501eceaa0	twitter	entertainment	global	0.0800	0.0650	0.2500	3.0000	4.00	1.0000	0.0650	0.0100	0.0050	4000	external_api	0.80	2025-07-28 06:50:43.85769+00	2025-07-28 06:50:43.85769+00
\.


--
-- TOC entry 4398 (class 0 OID 25829)
-- Dependencies: 256
-- Data for Name: insight_analysis_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insight_analysis_results (id, social_account_id, team_id, user_id, platform, timeframe, analysis_period_start, analysis_period_end, total_insights, critical_insights, high_impact_insights, patterns_detected, overall_score, generation_parameters, processing_time_ms, ai_model_used, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4399 (class 0 OID 25861)
-- Dependencies: 257
-- Data for Name: insight_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insight_patterns (id, insight_id, pattern_id, relevance_score, created_at) FROM stdin;
\.


--
-- TOC entry 4397 (class 0 OID 25805)
-- Dependencies: 255
-- Data for Name: insight_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insight_recommendations (id, insight_id, title, description, priority, effort, expected_impact, timeframe, action_steps, success_metrics, score, is_completed, completed_at, completed_by, completion_results, completion_notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4386 (class 0 OID 25423)
-- Dependencies: 244
-- Data for Name: market_position_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_position_snapshots (id, competitive_analysis_id, overall_ranking, total_competitors, percentile_ranking, market_share, position_change, trend, created_at) FROM stdin;
\.


--
-- TOC entry 4376 (class 0 OID 25169)
-- Dependencies: 234
-- Data for Name: normalized_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.normalized_data (id, raw_data_id, social_account_id, platform, data_type, normalized_data, schema_version, processing_metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4385 (class 0 OID 25408)
-- Dependencies: 243
-- Data for Name: performance_gaps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_gaps (id, competitive_analysis_id, metric_name, user_value, competitor_average, industry_benchmark, gap_vs_competitors, gap_vs_industry, gap_percentage, priority, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 4369 (class 0 OID 24892)
-- Dependencies: 227
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, team_id, user_id, resource_type, resource_id, permission_type, granted_by, created_at) FROM stdin;
c3c19d2c-a89f-4d30-9e04-a0b54a55bb6c	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	account	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00
5e6f1c4b-0612-45cd-b150-7f07ea8cfad7	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	content	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00
a9e90db2-7bb7-4e7d-af7c-35b8c794c3ad	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	analytics	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00
e2723dff-dc56-4e0c-86f0-9d41a649020f	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	reports	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00
1a051bc0-5557-479a-8e10-55e39d47e869	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	team	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00
48acb45c-1f67-4d13-aa04-ebdfc669391e	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	account	\N	read	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
ef6dd40c-70f9-48a8-8268-c91972c17653	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	account	\N	write	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
b3916e46-d29d-41aa-9493-1c92059fd58f	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	account	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
318265a1-5dd8-4db2-b6d9-46a542006a70	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	team	\N	read	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
ba5420b5-3687-435d-b20b-790d8ec3a313	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	team	\N	write	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
6fe3e62b-1e52-4840-b785-4390b94206e4	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	team	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
c4cc036e-239b-4a3e-b8fa-e9211e20dfcb	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	content	\N	read	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
e9a2c446-892a-48bd-af19-82d4f841b7fb	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	content	\N	write	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
078fe503-8801-40a3-9fea-4640441e2f32	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	content	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
2f4fb435-26d0-4845-bd33-790b0725f3cb	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	analytics	\N	read	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
d6b9ff65-1fa8-4ba0-919f-d20d539ac4cf	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	analytics	\N	write	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
6bc9ed0a-2652-40ba-99dc-f95af5d72576	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	analytics	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
c3014791-a905-4356-a778-9d9a747c61ff	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	reports	\N	read	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
062dd6e0-46d1-4c30-bd80-ed026e543b36	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	reports	\N	write	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
a02a4e47-f0fd-4cdc-b206-efaed3f144ac	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	reports	\N	admin	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:27:43.548309+00
61a111f8-1627-4ea0-a89f-b5b5f30e7af3	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	account	\N	admin	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 07:11:16.046311+00
1643be7c-5017-4d37-94d3-2769119ff976	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	content	\N	admin	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 07:11:16.046311+00
28d654aa-baf7-4276-96be-2b5b9eee6a10	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	analytics	\N	admin	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 07:11:16.046311+00
00a35c4c-a65f-44cd-b015-b85aacbe19e1	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	reports	\N	admin	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 07:11:16.046311+00
0b1c4af0-4dd1-409f-b30b-b18ca53a7cae	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	team	\N	admin	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 07:11:16.046311+00
af381399-1a2d-454d-8e67-3dd14b3d29ba	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	account	\N	admin	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 07:11:16.05571+00
f4455d8c-4d90-410c-8471-6c2b7243a1bb	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	content	\N	admin	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 07:11:16.05571+00
4ccb14b5-eddc-4e3c-8c50-45dd4461f4d5	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	analytics	\N	admin	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 07:11:16.05571+00
88d1edb4-1fb9-4438-814d-4e8736685b06	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	reports	\N	admin	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 07:11:16.05571+00
e45563d6-74b4-4b7f-8588-0a3724fa546f	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	team	\N	admin	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 07:11:16.05571+00
e1e376a9-386e-4114-b6c6-eaf3e2308fb9	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	account	\N	admin	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 07:11:16.057813+00
bb2ed248-df46-4227-8787-f267b8566b98	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	content	\N	admin	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 07:11:16.057813+00
44720391-5e3b-460f-b403-6ffcb5ad75ed	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	analytics	\N	admin	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 07:11:16.057813+00
b0ff8b53-c591-4fe4-869e-04bb4c78543f	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	reports	\N	admin	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 07:11:16.057813+00
3e44cca5-9cc4-4854-b5de-72f9c11847aa	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	team	\N	admin	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 07:11:16.057813+00
7b5f729e-4d1e-4335-81e4-656f9f8e9f96	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	account	\N	admin	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 07:11:16.059915+00
306d832b-e147-40be-a6c5-d39e6ba21ba2	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	content	\N	admin	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 07:11:16.059915+00
dd4a2c93-870e-4a10-a97b-b13239dd1670	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	analytics	\N	admin	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 07:11:16.059915+00
694ed650-5916-4cef-90fe-603315e4d85d	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	reports	\N	admin	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 07:11:16.059915+00
2a2eef92-d6a8-4812-90a0-1a0cc3a91224	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	team	\N	admin	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 07:11:16.059915+00
0b67ca43-2919-42a8-9bd5-9f0386e5ae24	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	account	\N	admin	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.853861+00
33908dac-5cdf-4c21-9c06-78820024da3a	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	content	\N	admin	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.853861+00
379efd7d-2899-4f60-894c-f9ae0775ee0f	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	analytics	\N	admin	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.853861+00
98a06335-7ec5-4140-8319-6cd1a0dad9d2	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	reports	\N	admin	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.853861+00
1f8a00de-e92e-4214-abee-20ca07541c55	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	team	\N	admin	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.853861+00
08da8f7e-41ef-4668-9c08-15deafcacdbf	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	account	\N	admin	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858502+00
e3c34a9b-fd0e-4101-9ba1-0b0ca195b082	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	content	\N	admin	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858502+00
40b0f905-4217-4ee5-b903-dd082862fd51	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	analytics	\N	admin	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858502+00
2f679fef-89e8-4cff-a98b-e1d8eb39b3a2	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	reports	\N	admin	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858502+00
870fcecd-afc3-46bd-befa-2d821df1a381	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	team	\N	admin	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858502+00
\.


--
-- TOC entry 4366 (class 0 OID 16636)
-- Dependencies: 224
-- Data for Name: pgmigrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pgmigrations (id, name, run_on) FROM stdin;
1	001_initial_schema	2025-07-27 08:17:50.083244
2	002_teams_and_permissions	2025-07-27 08:17:50.083244
3	003_add_youtube_platform	2025-07-27 08:17:50.083244
4	004_account_monitoring_config	2025-07-27 08:18:26.860732
5	005_raw_data_storage	2025-07-27 09:58:01.301429
6	006_competitive_analysis	2025-08-03 16:03:07.834152
7	007_platform_best_practices	2025-08-03 16:03:07.834152
8	008_export_and_webhooks	2025-08-03 16:03:07.834152
9	009_performance_insights	2025-08-03 16:03:07.834152
10	010_add_performance_indexes	2025-08-03 16:03:07.834152
11	011_subscription_management	2025-08-03 16:03:07.834152
\.


--
-- TOC entry 4390 (class 0 OID 25523)
-- Dependencies: 248
-- Data for Name: platform_algorithm_factors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_algorithm_factors (id, platform, factor_name, importance, description, optimization_tip, is_active, created_at, updated_at) FROM stdin;
126b049a-8bfe-4d3e-b211-531920d9234d	twitter	Engagement rate	high	Likes, retweets, replies	Create engaging content	t	2025-07-29 08:09:30.637193+00	2025-07-29 08:09:30.637193+00
e5f0cbbd-b740-4694-a6d5-658f8b718f7f	twitter	Recency	high	How recent the tweet is	Tweet at optimal times	t	2025-07-29 08:09:30.637193+00	2025-07-29 08:09:30.637193+00
abd5974d-4b21-4a7e-946c-082767994c79	twitter	Relevance	medium	Match to user interests	Use relevant hashtags	t	2025-07-29 08:09:30.637193+00	2025-07-29 08:09:30.637193+00
9b51c37b-736b-4308-ac02-1e7dd9f1923d	twitter	Relationship	medium	User interaction history	Build follower relationships	t	2025-07-29 08:09:30.637193+00	2025-07-29 08:09:30.637193+00
f2142cdc-926c-4fe1-ad6e-0b7378fbbe2a	instagram	Interest	high	User engagement history	Create content your audience loves	t	2025-07-29 08:09:30.638785+00	2025-07-29 08:09:30.638785+00
50830f61-5be1-4130-a0d9-243b1c2400ef	instagram	Recency	high	When content was posted	Post when audience is active	t	2025-07-29 08:09:30.638785+00	2025-07-29 08:09:30.638785+00
de57577c-a464-4ce8-8274-347e6aa1a307	instagram	Relationship	medium	Connection with creator	Build strong follower relationships	t	2025-07-29 08:09:30.638785+00	2025-07-29 08:09:30.638785+00
\.


--
-- TOC entry 4387 (class 0 OID 25462)
-- Dependencies: 245
-- Data for Name: platform_best_practices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_best_practices (id, platform, category, subcategory, data, is_active, version, created_at, updated_at, created_by, updated_by) FROM stdin;
fb6e44ab-5138-4a3c-a210-8421c0255573	twitter	content_guidelines	optimal_length	{"max": 100, "min": 71}	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
bf71f1e7-6c86-44cc-9086-ae4ffed70704	twitter	content_guidelines	tone_recommendations	["conversational", "timely", "authentic", "witty"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
83831070-266d-4a15-93d2-00ade2610e65	twitter	content_guidelines	prohibited_content	["Spam", "Hate speech", "Misleading information", "Copyright violations"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
3fe8d002-7963-4127-a478-fae286806104	twitter	content_guidelines	best_practices	["Tweet consistently throughout the day", "Engage with replies quickly", "Use trending hashtags when relevant", "Share valuable, timely content", "Maintain authentic voice"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
630e5ec3-4b5b-4e47-ae0c-5762078a5129	twitter	hashtag_strategy	optimal_count	{"max": 3, "min": 1}	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
84b11099-b58a-4f87-a2fc-7e5012427574	twitter	hashtag_strategy	placement	"inline"	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
89755c2f-7ec7-4163-83e3-d9fdb3ea1f58	twitter	hashtag_strategy	research_tips	["Use Twitter Trends", "Monitor competitor hashtags", "Check hashtag performance"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
f5617f63-4195-4a04-ae74-31b40b5c1792	twitter	hashtag_strategy	avoidance_list	["Overused generic tags", "Irrelevant trending tags", "Too many hashtags"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
5e788f93-e582-421e-9c85-bbe7b5705011	twitter	timing	best_days	["Tuesday", "Wednesday", "Thursday"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
d9f692a6-b08c-4d60-a713-63bdbfaacda9	twitter	timing	best_hours	["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
3cfdcfae-5ebc-4ced-9148-00ac5e22a700	twitter	timing	timezone_considerations	["Target audience primary timezone", "Consider global audience for brands"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
ae13ba39-aeff-409e-b13f-16db64bcd596	twitter	timing	seasonal_trends	["Holiday-themed content", "Back-to-school period", "Year-end summaries"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
dbf5593b-054e-4d1a-bf48-10759c6777b9	twitter	engagement	call_to_actions	["Retweet if you agree", "What do you think?", "Share your experience", "Tag a friend"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
575308d5-440a-47db-a0eb-6697a8662787	twitter	engagement	question_strategies	["Ask for opinions", "Create polls", "Request feedback", "Start discussions"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
fac02ae2-5117-48d2-8b8a-9d576643e0db	twitter	engagement	community_building	["Reply to mentions", "Join Twitter chats", "Share user content", "Host Twitter Spaces"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
015a6f9b-7cff-4b0d-8f5d-ba2f8abce793	twitter	engagement	response_strategies	["Respond within 1 hour", "Use humor appropriately", "Provide helpful information"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
daa19c43-0e22-4f4e-adf5-e3bca74a5f9b	twitter	format	character_limits	{"bio": 160, "name": 50, "tweet": 280}	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
abb40494-d921-4a39-9f7a-e7962a4564c9	twitter	format	image_specs	[{"type": "single", "formats": ["JPG", "PNG", "GIF"], "fileSize": "5MB", "dimensions": "1200x675", "aspectRatio": "16:9"}, {"type": "multiple", "formats": ["JPG", "PNG"], "fileSize": "5MB", "dimensions": "1200x1200", "aspectRatio": "1:1"}]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
47763138-b7a3-42d9-a619-59210774dcb9	twitter	format	video_specs	[{"type": "standard", "formats": ["MP4", "MOV"], "fileSize": "512MB", "dimensions": "1280x720", "aspectRatio": "16:9", "maxDuration": "2:20"}]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
f762f6f7-99c9-45b3-bc3c-8e1d8adf21f8	twitter	format	special_features	["Twitter Threads", "Twitter Polls", "Twitter Spaces"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
61e7bdfd-ffb0-4564-930a-9a1584e2e091	twitter	algorithm	engagement_signals	["Likes", "Retweets", "Replies", "Quote tweets", "Profile clicks", "Link clicks"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
2a319b53-5215-4601-941f-e9b096801883	twitter	algorithm	penalty_triggers	["Spam behavior", "Fake engagement", "Misleading content", "Excessive hashtags"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
9adb1e06-091f-41e5-a5c5-62b9cbcaa4f3	twitter	algorithm	optimization_tips	["Post consistently", "Engage authentically", "Use relevant hashtags", "Share valuable content"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
9e01444b-60e0-4b60-9f90-e351f72c1037	twitter	algorithm	recent_changes	["Algorithm prioritizes conversations", "Reduced reach for external links", "Emphasis on original content"]	t	1	2025-07-29 08:09:30.635215+00	2025-07-29 08:09:30.635215+00	\N	\N
038e3834-0546-4014-ad7c-3fd0431ad0ea	instagram	content_guidelines	optimal_length	{"max": 150, "min": 138}	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
61975187-acd2-4aa0-908a-eac47a9b4f30	instagram	content_guidelines	tone_recommendations	["visual-first", "authentic", "inspirational", "lifestyle-focused"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
9b2f5dfb-7bc0-44cf-80c6-e660b4aedbf9	instagram	content_guidelines	prohibited_content	["Nudity", "Violence", "Spam", "Copyright violations", "Misleading information"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
b64f364b-5836-4186-97f9-c335efd14988	instagram	content_guidelines	best_practices	["Post consistently (1-2 times daily)", "Use Instagram Stories daily", "Engage with comments within 1 hour", "Collaborate with other accounts", "Use location tags when relevant"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
506e2d24-b02f-4556-91d7-8a0955d3123a	instagram	hashtag_strategy	optimal_count	{"max": 30, "min": 5}	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
aa963304-6bd9-4019-a9b9-9a09be0b20c8	instagram	hashtag_strategy	placement	"end"	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
1cac1664-c2a5-423e-91c2-0cde421f84c5	instagram	hashtag_strategy	research_tips	["Use Instagram hashtag suggestions", "Analyze competitor hashtags", "Mix popular and niche tags"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
3d7a520c-723c-4ee6-aff0-cf458bc71c7a	instagram	hashtag_strategy	avoidance_list	["Banned hashtags", "Overly generic tags", "Irrelevant hashtags"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
69761f1b-d83e-4fd7-93ce-26782cd7fe8f	instagram	timing	best_days	["Tuesday", "Wednesday", "Thursday", "Friday"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
61b4ed7f-f6fd-46d4-abdb-edcce037dbf6	instagram	timing	best_hours	["11:00 AM", "1:00 PM", "5:00 PM", "7:00 PM"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
5ae852af-623d-43bf-a60c-cb7d207c5dbc	instagram	timing	timezone_considerations	["Target audience location", "Global vs local focus"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
06ff33bb-261f-4466-8bb7-6078186abcef	instagram	timing	seasonal_trends	["Summer vacation content", "Holiday themes", "New Year resolutions"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
0c0a8486-320c-4c43-a02c-31ce548130ea	instagram	engagement	call_to_actions	["Double tap if you agree", "Save this post", "Share in your stories", "Tag a friend"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
ce407ab2-c8b6-4fbb-a3ce-ba43b7a6c2f5	instagram	engagement	question_strategies	["Ask in captions", "Use question stickers in Stories", "Create polls"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
71f183b4-99f3-4d3f-b834-0e45b7c2cd4f	instagram	engagement	community_building	["Respond to all comments", "Like comments on your posts", "Engage with followers content"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
e9b15945-0214-48f0-8d2f-afd88da29ba0	instagram	engagement	response_strategies	["Use emojis in responses", "Ask follow-up questions", "Share user-generated content"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
2382b732-a8ed-4d3f-aff1-cece871537a2	instagram	format	character_limits	{"bio": 150, "name": 30, "caption": 2200}	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
e84f9028-747c-4097-85d3-14694a6ced08	instagram	format	image_specs	[{"type": "square", "formats": ["JPG", "PNG"], "fileSize": "30MB", "dimensions": "1080x1080", "aspectRatio": "1:1"}, {"type": "portrait", "formats": ["JPG", "PNG"], "fileSize": "30MB", "dimensions": "1080x1350", "aspectRatio": "4:5"}]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
ebca91a8-bf43-475f-b1fc-ca9566ae7eec	instagram	format	video_specs	[{"type": "feed", "formats": ["MP4", "MOV"], "fileSize": "4GB", "dimensions": "1080x1080", "aspectRatio": "1:1", "maxDuration": "60s"}, {"type": "reels", "formats": ["MP4", "MOV"], "fileSize": "4GB", "dimensions": "1080x1920", "aspectRatio": "9:16", "maxDuration": "90s"}]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
ea20f0dd-322a-455f-a115-28b2e0920f64	instagram	format	special_features	["Instagram Stories", "Instagram Reels", "IGTV", "Instagram Shopping", "Instagram Live"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
5c5410a5-8b51-4b7d-85cc-e8e91b46bdc9	instagram	algorithm	engagement_signals	["Likes", "Comments", "Shares", "Saves", "Profile visits", "Story interactions"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
caea45fa-ab48-4e5a-b2be-56426892a4da	instagram	algorithm	penalty_triggers	["Shadowbanning for hashtag abuse", "Low-quality content", "Spam behavior"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
7b175f83-2fe9-4ea9-b488-6c66b5ad2907	instagram	algorithm	optimization_tips	["Focus on Reels", "Use trending audio", "Post consistently", "Engage authentically"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
a7b985cb-991d-49a7-adf5-6c2415515d0c	instagram	algorithm	recent_changes	["Reels prioritized in algorithm", "Stories reach decreased", "Focus on original content"]	t	1	2025-07-29 08:09:30.637679+00	2025-07-29 08:09:30.637679+00	\N	\N
\.


--
-- TOC entry 4388 (class 0 OID 25488)
-- Dependencies: 246
-- Data for Name: platform_content_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_content_recommendations (id, platform, content_type, recommendations, examples, performance_rating, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
3a592c8d-3047-4f56-aed5-23ec5a6d9da6	twitter	text	{"Use threads for longer content","Include relevant hashtags","Ask questions"}	{"Breaking news updates","Quick tips","Industry insights"}	high	t	2025-07-29 08:09:30.636292+00	2025-07-29 08:09:30.636292+00	\N	\N
306a0f40-d59b-49b2-a4c1-c1cfdce1b735	twitter	image	{"Use high-quality visuals","Include alt text","Add context in tweet"}	{Infographics,"Behind-the-scenes photos","Product shots"}	high	t	2025-07-29 08:09:30.636292+00	2025-07-29 08:09:30.636292+00	\N	\N
fd765888-e28e-46f3-9525-da8b909ee980	twitter	video	{"Keep under 2:20","Add captions","Start with hook"}	{"Quick tutorials","Product demos","Event highlights"}	medium	t	2025-07-29 08:09:30.636292+00	2025-07-29 08:09:30.636292+00	\N	\N
2859632d-4ae2-4834-af4f-10040ab5d6c0	instagram	image	{"High-quality visuals","Consistent aesthetic","Use all 10 slides in carousel"}	{"Lifestyle photos","Product shots",Behind-the-scenes}	high	t	2025-07-29 08:09:30.638268+00	2025-07-29 08:09:30.638268+00	\N	\N
e08f0fb4-5c6b-447e-94e0-97675b1299cc	instagram	video	{"Create Reels for discovery","Use trending audio","Keep videos under 60s"}	{Tutorials,Before/after,Day-in-the-life}	high	t	2025-07-29 08:09:30.638268+00	2025-07-29 08:09:30.638268+00	\N	\N
2b3f39e6-bf34-454b-b3a0-c93f3ba55f20	instagram	text	{"Pair with strong visuals","Use line breaks","Include call-to-action"}	{"Motivational quotes","Tips and advice",Storytelling}	medium	t	2025-07-29 08:09:30.638268+00	2025-07-29 08:09:30.638268+00	\N	\N
\.


--
-- TOC entry 4389 (class 0 OID 25511)
-- Dependencies: 247
-- Data for Name: platform_hashtag_strategies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_hashtag_strategies (id, platform, hashtag_type, percentage, description, examples, is_active, created_at, updated_at) FROM stdin;
cb546e54-22aa-43f0-97e5-33c9f31a7c93	twitter	trending	40	Current trending topics	{#MondayMotivation,#TechNews}	t	2025-07-29 08:09:30.636717+00	2025-07-29 08:09:30.636717+00
c68bfcf2-ba36-4997-9eea-ae2701c75f83	twitter	branded	30	Brand-specific hashtags	{#YourBrand,#CompanyName}	t	2025-07-29 08:09:30.636717+00	2025-07-29 08:09:30.636717+00
0ba0e31b-75f6-414a-9dfa-43c1d0bb80d3	twitter	niche	30	Industry-specific tags	{#MarketingTips,#StartupLife}	t	2025-07-29 08:09:30.636717+00	2025-07-29 08:09:30.636717+00
ef819d4b-e8ae-48ff-9e8e-10a8c0263066	instagram	niche	40	Specific to your industry	{#smallbusiness,#handmade}	t	2025-07-29 08:09:30.638539+00	2025-07-29 08:09:30.638539+00
ad487bf3-5f44-460d-aae2-84c7436bd19a	instagram	community	30	Community-based hashtags	{#instafood,#photooftheday}	t	2025-07-29 08:09:30.638539+00	2025-07-29 08:09:30.638539+00
2454f1a9-58b0-4b15-bd76-922fdcf96557	instagram	branded	20	Your brand hashtags	{#yourbrand,#brandname}	t	2025-07-29 08:09:30.638539+00	2025-07-29 08:09:30.638539+00
5d3291f7-4335-4ee0-a179-695b4086b97d	instagram	location	10	Location-based tags	{#nyc,#london}	t	2025-07-29 08:09:30.638539+00	2025-07-29 08:09:30.638539+00
\.


--
-- TOC entry 4362 (class 0 OID 16556)
-- Dependencies: 220
-- Data for Name: post_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_metrics (id, content_id, social_account_id, platform, platform_post_id, published_at, likes, shares, comments, views, reach, impressions, engagement_rate, click_through_rate, collected_at) FROM stdin;
a6f60a6a-8a83-4bf4-b20f-38173d5b191e	87f572a9-65ce-422e-9c2a-8acbc75200fc	d8b70fe4-66d5-489a-a988-6cadc78ab150	twitter	tweet_1754123320	2025-08-02 08:28:40.393778+00	53	13	5	2438	1855	3595	2.8467	\N	2025-08-02 08:58:40.393778+00
5e449ee8-784f-4814-850e-bd1bbbd084c3	dbbfe82b-dd48-49fa-802e-ce9e0e336123	d8b70fe4-66d5-489a-a988-6cadc78ab150	twitter	tweet_1754101720	2025-08-02 02:28:40.393778+00	79	19	9	3789	2958	4640	2.5441	\N	2025-08-02 02:58:40.393778+00
66a1df8b-1983-440b-81de-8b6874e9df18	403733d5-97e8-4806-b997-bd32a4b4d15e	d8b70fe4-66d5-489a-a988-6cadc78ab150	twitter	tweet_1754058520	2025-08-01 14:28:40.393778+00	160	26	15	6121	4134	5847	3.6929	\N	2025-08-01 14:58:40.393778+00
1cc69501-c9cb-4d4d-8d84-1e5c0060048f	20ad850d-1577-4889-bbfb-99d7c0e031c2	d8b70fe4-66d5-489a-a988-6cadc78ab150	twitter	tweet_1753972120	2025-07-31 14:28:40.393778+00	102	15	12	4465	3248	4574	3.3093	\N	2025-07-31 14:58:40.393778+00
\.


--
-- TOC entry 4375 (class 0 OID 25149)
-- Dependencies: 233
-- Data for Name: raw_scraped_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raw_scraped_data (id, social_account_id, platform, data_type, source_type, raw_data, metadata, data_hash, quality_status, quality_score, quality_issues, normalization_status, normalized_at, collected_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4360 (class 0 OID 16517)
-- Dependencies: 218
-- Data for Name: social_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_accounts (id, user_id, platform, platform_account_id, username, display_name, access_token, refresh_token, token_expires_at, permissions, is_active, last_sync_at, created_at, updated_at, team_id, primary_group_id) FROM stdin;
1b30b702-3474-4b06-98a2-b743dbf2773c	94f59b4e-2c48-4289-a771-7f11f641933e	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:40:06.768579+00	2025-07-31 08:40:06.768579+00	\N	\N
69df8258-9655-4bfa-8e08-979302483758	e27e7243-1984-478f-a23a-a757a86636f4	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:40:23.530222+00	2025-07-31 08:40:23.530222+00	\N	\N
76a86d50-18b3-47db-a52f-21d8710f770e	fcc80f85-e22d-402d-b480-9b299479be5f	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:41:15.699453+00	2025-07-31 08:41:15.699453+00	\N	\N
e47828ff-363d-4988-b4c7-9d385b70d1a5	a7b8fe80-d93e-4c03-b705-882222dc0cf4	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:41:45.330522+00	2025-07-31 08:41:45.330522+00	\N	\N
54322980-0b73-41bb-a202-9b68313ef9a7	9b27ea41-d48a-42c2-84f6-8da36e7ce80e	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:42:25.952938+00	2025-07-31 08:42:25.952938+00	\N	\N
7b6e0cf8-9df8-4686-8397-cfb27baf2f3a	9ccae0be-a97f-4ccf-a116-878a1860b60e	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-07-31 08:42:52.953537+00	2025-07-31 08:42:52.953537+00	\N	\N
50388d4c-90bb-4374-9fec-cab8288f97e1	50dc9602-0da5-4a97-b69a-fe1b21376958	twitter	demo123	demouser	Demo User	token	refresh	\N	{}	t	\N	2025-08-01 07:11:39.728991+00	2025-08-01 07:11:39.728991+00	\N	\N
d8b70fe4-66d5-489a-a988-6cadc78ab150	da2de67c-1187-4ab8-a1ce-5be5591bb27b	twitter	demo123	demouser	Demo User	DEMO_TOKEN_NOT_REAL	DEMO_REFRESH_NOT_REAL	\N	{read,write}	t	\N	2025-08-02 10:24:54.475751+00	2025-08-02 10:24:54.475751+00	f89012b1-b964-4a25-8788-f959efb01812	\N
1c12c06e-37a2-4d7e-a8e4-ca086ba2c4b5	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	twitter	twitter_e82948a3-c9f1-4d8b-b3f1-c0182650cc93_0	demo_free_twitter_1	Demo twitter Account 1	demo_token_e82948a3-c9f1-4d8b-b3f1-c0182650cc93_0	\N	\N	\N	t	\N	2025-08-04 06:52:12.28857+00	2025-08-04 06:52:12.28857+00	\N	\N
6747187e-f27d-403e-b589-4385b5a812bc	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	twitter	twitter_007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10_0	demo_basic_twitter_1	Demo twitter Account 1	demo_token_007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10_0	\N	\N	\N	t	\N	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00	\N	\N
a3a413df-f93f-4b3f-b7b7-f4139732ae4c	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	instagram	instagram_007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10_1	demo_basic_instagram_2	Demo instagram Account 2	demo_token_007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10_1	\N	\N	\N	t	\N	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00	\N	\N
7c281ce2-7e6b-4d93-a9b6-9b28348b8f77	617fdc01-75b8-434e-8f5e-241ea247b793	twitter	twitter_617fdc01-75b8-434e-8f5e-241ea247b793_0	demo_premium_twitter_1	Demo twitter Account 1	demo_token_617fdc01-75b8-434e-8f5e-241ea247b793_0	\N	\N	\N	t	\N	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	\N	\N
3a6d9c0d-b609-43a8-9e2f-4558e509abed	617fdc01-75b8-434e-8f5e-241ea247b793	instagram	instagram_617fdc01-75b8-434e-8f5e-241ea247b793_1	demo_premium_instagram_2	Demo instagram Account 2	demo_token_617fdc01-75b8-434e-8f5e-241ea247b793_1	\N	\N	\N	t	\N	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	\N	\N
f5b2e50f-a2ec-493a-9754-8cd861217ba2	617fdc01-75b8-434e-8f5e-241ea247b793	linkedin	linkedin_617fdc01-75b8-434e-8f5e-241ea247b793_2	demo_premium_linkedin_3	Demo linkedin Account 3	demo_token_617fdc01-75b8-434e-8f5e-241ea247b793_2	\N	\N	\N	t	\N	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	\N	\N
91743709-6099-4e44-8cc7-3953f50db3c1	617fdc01-75b8-434e-8f5e-241ea247b793	tiktok	tiktok_617fdc01-75b8-434e-8f5e-241ea247b793_3	demo_premium_tiktok_4	Demo tiktok Account 4	demo_token_617fdc01-75b8-434e-8f5e-241ea247b793_3	\N	\N	\N	t	\N	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	\N	\N
7506224b-e9d5-4823-b16e-7985c06fffdd	617fdc01-75b8-434e-8f5e-241ea247b793	youtube	youtube_617fdc01-75b8-434e-8f5e-241ea247b793_4	demo_premium_youtube_5	Demo youtube Account 5	demo_token_617fdc01-75b8-434e-8f5e-241ea247b793_4	\N	\N	\N	t	\N	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00	\N	\N
5412f075-a30a-44f8-92bf-b9e580af7510	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	twitter	twitter_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_0	demo_enterprise_twitter_1	Demo twitter Account 1	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_0	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
fb001d7c-3291-48d3-9b00-09f66700c7d9	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	instagram	instagram_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_1	demo_enterprise_instagram_2	Demo instagram Account 2	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_1	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
110b9604-1df9-4dfc-9a6d-213774fabbc0	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	linkedin	linkedin_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_2	demo_enterprise_linkedin_3	Demo linkedin Account 3	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_2	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
708fad89-558c-453f-b505-7c47fe920d8c	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	tiktok	tiktok_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_3	demo_enterprise_tiktok_4	Demo tiktok Account 4	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_3	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
229d8fca-0c6d-45d6-b764-dd0d29508aae	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	youtube	youtube_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_4	demo_enterprise_youtube_5	Demo youtube Account 5	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_4	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
2ea551d9-3cf9-4d08-b205-1c88a39399f0	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	twitter	twitter_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_5	demo_enterprise_twitter_6	Demo twitter Account 6	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_5	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
676d10f9-94f0-492d-97cd-c84ca6ba5cf3	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	instagram	instagram_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_6	demo_enterprise_instagram_7	Demo instagram Account 7	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_6	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
c174c73f-3ce2-4184-b35f-e18b9ef55d3a	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	linkedin	linkedin_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_7	demo_enterprise_linkedin_8	Demo linkedin Account 8	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_7	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
5e778fc6-c9d3-42a5-a58a-6f9c52ac538c	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	tiktok	tiktok_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_8	demo_enterprise_tiktok_9	Demo tiktok Account 9	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_8	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
3ae15d25-1092-4950-9cae-08ff4ac6ee41	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	youtube	youtube_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_9	demo_enterprise_youtube_10	Demo youtube Account 10	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_9	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
0a493b9d-6dad-4659-95f4-3e145208ba49	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	twitter	twitter_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_10	demo_enterprise_twitter_11	Demo twitter Account 11	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_10	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
2a7ac467-0630-484b-befb-0bb43556b04a	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	instagram	instagram_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_11	demo_enterprise_instagram_12	Demo instagram Account 12	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_11	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
6719faf5-3bd3-42d9-b7c4-6430c0f85d2f	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	linkedin	linkedin_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_12	demo_enterprise_linkedin_13	Demo linkedin Account 13	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_12	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
a853dbd1-df81-421d-8468-c8a9955e8603	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	tiktok	tiktok_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_13	demo_enterprise_tiktok_14	Demo tiktok Account 14	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_13	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
f25d0460-b6b8-4e62-b525-7d2b82a90fab	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	youtube	youtube_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_14	demo_enterprise_youtube_15	Demo youtube Account 15	demo_token_c10691d3-cf17-4ce7-ac54-9d3fd45b8673_14	\N	\N	\N	t	\N	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00	\N	\N
f9d141d2-b1ea-40ba-b9b4-98ed2f13cc44	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	twitter	123456789	freedemouser	freedemouser	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	\N	\N	{read}	t	\N	2025-08-05 18:36:22.887946+00	2025-08-05 18:36:22.887946+00	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	\N
4dbc7355-76ba-454b-80da-d241c12778cd	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	instagram	elisaintelli	elisaintelli	elisaintelli	3d76b8a0-77e5-466a-ae44-e0b418640544	\N	\N	{read}	t	\N	2025-08-05 19:38:16.808623+00	2025-08-05 19:38:16.808623+00	3d76b8a0-77e5-466a-ae44-e0b418640544	\N
\.


--
-- TOC entry 4364 (class 0 OID 16602)
-- Dependencies: 222
-- Data for Name: strategy_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strategy_configs (id, user_id, name, description, parameters, status, effectiveness_score, created_at, updated_at, team_id) FROM stdin;
\.


--
-- TOC entry 4403 (class 0 OID 26020)
-- Dependencies: 263
-- Data for Name: subscription_billing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_billing (id, user_id, team_id, tier, billing_cycle, amount, currency, billing_date, payment_status, payment_method, transaction_id, invoice_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4402 (class 0 OID 25997)
-- Dependencies: 262
-- Data for Name: subscription_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_history (id, user_id, team_id, old_tier, new_tier, change_reason, changed_by, effective_date, created_at) FROM stdin;
41a997ca-81cd-4f10-8fdc-1c6d18b4d3bb	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	\N	\N	free	Demo user creation	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	2025-08-04 06:52:12.28857+00	2025-08-04 06:52:12.28857+00
ff119890-f14e-4d91-8b2d-8e08e78e005b	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	\N	\N	basic	Demo user creation	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00
8c80410d-22a7-450e-90ae-ed2e236f162b	617fdc01-75b8-434e-8f5e-241ea247b793	\N	\N	premium	Demo user creation	617fdc01-75b8-434e-8f5e-241ea247b793	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
dad57642-e32a-4919-b5c0-70f26366c7a3	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	\N	\N	enterprise	Demo user creation	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
\.


--
-- TOC entry 4400 (class 0 OID 25947)
-- Dependencies: 260
-- Data for Name: subscription_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_limits (id, tier, max_social_accounts, max_team_members, max_data_retention_days, max_api_requests_per_month, max_reports_per_month, max_exports_per_month, competitive_analysis_enabled, advanced_analytics_enabled, ai_insights_enabled, custom_reports_enabled, api_access_enabled, webhook_enabled, priority_support, white_label_enabled, created_at, updated_at) FROM stdin;
e92f0126-8da7-4824-abff-23fa8dd00364	free	1	1	30	100	2	5	f	f	f	f	f	f	f	f	2025-08-03 10:25:09.078121+00	2025-08-03 10:25:09.078121+00
b2609ec6-09c9-42f4-b3d8-122e6900055c	basic	3	3	90	1000	10	25	f	t	t	f	t	f	f	f	2025-08-03 10:25:09.078121+00	2025-08-03 10:25:09.078121+00
8f7d35e8-9864-4cef-95f2-8baf918dac5a	premium	10	10	365	5000	50	100	t	t	t	t	t	t	t	f	2025-08-03 10:25:09.078121+00	2025-08-03 10:25:09.078121+00
2c5cb574-5d11-4b44-b397-b52608ed1572	enterprise	-1	-1	-1	-1	-1	-1	t	t	t	t	t	t	t	t	2025-08-03 10:25:09.078121+00	2025-08-03 10:25:09.078121+00
\.


--
-- TOC entry 4401 (class 0 OID 25971)
-- Dependencies: 261
-- Data for Name: subscription_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_usage (id, user_id, team_id, month, api_requests_count, reports_generated, exports_generated, data_storage_mb, created_at, updated_at) FROM stdin;
08985c58-42c6-41bd-8c8b-f3b49e2ec945	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	\N	2025-08-01	25	1	2	150.50	2025-08-04 06:52:12.28857+00	2025-08-04 06:52:12.28857+00
75a82157-174b-4fa6-9fef-16221c878931	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	\N	2025-08-01	450	4	10	150.50	2025-08-04 06:52:12.518097+00	2025-08-04 06:52:12.518097+00
6d1fad2b-8a9f-4daa-be5c-ffa896546c5b	617fdc01-75b8-434e-8f5e-241ea247b793	\N	2025-08-01	2250	20	40	150.50	2025-08-04 06:52:12.737326+00	2025-08-04 06:52:12.737326+00
db11e186-eec3-45bb-aea8-6f941d01643e	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	\N	2025-08-01	10000	100	500	150.50	2025-08-04 06:52:12.9613+00	2025-08-04 06:52:12.9613+00
\.


--
-- TOC entry 4368 (class 0 OID 24864)
-- Dependencies: 226
-- Data for Name: team_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_memberships (id, team_id, user_id, role, is_active, invited_by, invited_at, joined_at, created_at, updated_at) FROM stdin;
9ad57fa2-7b71-4a5b-ae20-b58927744a38	f89012b1-b964-4a25-8788-f959efb01812	da2de67c-1187-4ab8-a1ce-5be5591bb27b	admin	t	da2de67c-1187-4ab8-a1ce-5be5591bb27b	2025-08-02 10:25:58.276877+00	2025-08-02 10:25:58.276877+00	2025-08-02 10:25:58.276877+00	2025-08-02 10:25:58.276877+00
c1b306e0-604d-4e16-b4d4-61248005cd58	4ea3a004-b06d-4e8c-bcc2-81a4295953ab	e82948a3-c9f1-4d8b-b3f1-c0182650cc93	admin	t	\N	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
b5ec6650-03fa-400d-8bdf-755f3996e7bb	80fef9c3-7bee-4936-af53-5cad7ff22187	007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	admin	t	\N	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
c0d7e16a-e968-4859-ba09-3708e112fc1a	c655497b-c4ab-49bb-b5fa-82918eaa1ae2	617fdc01-75b8-434e-8f5e-241ea247b793	admin	t	\N	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
92411fed-d8bd-4e17-aa81-e8b800bfc946	2798e0be-1144-470c-b597-06e7cf5766b8	c10691d3-cf17-4ce7-ac54-9d3fd45b8673	admin	t	\N	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
22d7d7db-9247-4490-aeed-371bb22a3456	d2214ddd-6d1c-44ac-b30a-f194347ca9f8	99fabf7b-b099-4473-ac83-ea1246b06ce8	admin	t	99fabf7b-b099-4473-ac83-ea1246b06ce8	2025-08-05 18:02:12.854+00	2025-08-05 18:02:12.854+00	2025-08-05 18:02:12.853861+00	2025-08-05 18:02:12.853861+00
7e6d1e39-fcfa-4fd8-a7a2-55a5722654f5	3d76b8a0-77e5-466a-ae44-e0b418640544	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	admin	t	4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	2025-08-05 18:04:01.858+00	2025-08-05 18:04:01.858+00	2025-08-05 18:04:01.858502+00	2025-08-05 18:04:01.858502+00
\.


--
-- TOC entry 4367 (class 0 OID 24851)
-- Dependencies: 225
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, description, subscription_tier, settings, is_active, created_at, updated_at) FROM stdin;
f89012b1-b964-4a25-8788-f959efb01812	Demo Team	Demo team for testing	premium	{}	t	2025-08-02 10:24:03.53425+00	2025-08-02 10:24:03.53425+00
4ea3a004-b06d-4e8c-bcc2-81a4295953ab	FREE Demo Team	Demo team for free tier testing	free	{}	t	2025-08-04 07:11:16.046311+00	2025-08-04 07:11:16.046311+00
80fef9c3-7bee-4936-af53-5cad7ff22187	BASIC Demo Team	Demo team for basic tier testing	basic	{}	t	2025-08-04 07:11:16.05571+00	2025-08-04 07:11:16.05571+00
c655497b-c4ab-49bb-b5fa-82918eaa1ae2	PREMIUM Demo Team	Demo team for premium tier testing	premium	{}	t	2025-08-04 07:11:16.057813+00	2025-08-04 07:11:16.057813+00
2798e0be-1144-470c-b597-06e7cf5766b8	ENTERPRISE Demo Team	Demo team for enterprise tier testing	enterprise	{}	t	2025-08-04 07:11:16.059915+00	2025-08-04 07:11:16.059915+00
d2214ddd-6d1c-44ac-b30a-f194347ca9f8	Test Company	Team for Test User	free	{}	t	2025-08-05 18:02:12.839835+00	2025-08-05 18:02:12.839835+00
3d76b8a0-77e5-466a-ae44-e0b418640544	AIVibs	Team for Ludovic Carceles	free	{}	t	2025-08-05 18:04:01.850595+00	2025-08-05 18:04:01.850595+00
\.


--
-- TOC entry 4358 (class 0 OID 16487)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, subscription_tier, is_active, email_verified, created_at, updated_at, team_id) FROM stdin;
ffc2d789-efdd-41d7-a647-b4a83661a89d	test-1752867313@example.com	$2b$12$R8PHxPCIGcplIqW3AY6/GOhDHqVGAeXIFHqiIReNR2/6NmRhCC1me	Test User	free	t	f	2025-07-18 19:35:13.505575+00	2025-07-18 19:35:13.505575+00	\N
94f59b4e-2c48-4289-a771-7f11f641933e	demo-1753951206.760640@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:40:06.76064+00	2025-07-31 08:40:06.76064+00	\N
e27e7243-1984-478f-a23a-a757a86636f4	demo-1753951223.524228@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:40:23.524228+00	2025-07-31 08:40:23.524228+00	\N
fcc80f85-e22d-402d-b480-9b299479be5f	demo-1753951275.694082@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:41:15.694082+00	2025-07-31 08:41:15.694082+00	\N
a7b8fe80-d93e-4c03-b705-882222dc0cf4	demo-1753951305.325170@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:41:45.32517+00	2025-07-31 08:41:45.32517+00	\N
9b27ea41-d48a-42c2-84f6-8da36e7ce80e	demo-1753951345.948037@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:42:25.948037+00	2025-07-31 08:42:25.948037+00	\N
9ccae0be-a97f-4ccf-a116-878a1860b60e	demo-1753951372.943769@example.com	hashedpassword	Demo User	premium	t	t	2025-07-31 08:42:52.943769+00	2025-07-31 08:42:52.943769+00	\N
50dc9602-0da5-4a97-b69a-fe1b21376958	demo-1754032299.722174@example.com	hashedpassword	Demo User	premium	t	t	2025-08-01 07:11:39.722174+00	2025-08-01 07:11:39.722174+00	\N
da2de67c-1187-4ab8-a1ce-5be5591bb27b	demo@example.com	$2b$12$AuyH7ipyCJMfnhu4w0eOdOIeQ1T8XpzOwTRqYXfU92902QS1boHK6	Demo User	premium	t	t	2025-08-02 10:20:46.130154+00	2025-08-03 10:34:19.575021+00	f89012b1-b964-4a25-8788-f959efb01812
e82948a3-c9f1-4d8b-b3f1-c0182650cc93	demo.free@example.com	$2b$12$.1zwN1tlyaz3LF8aggA50.h4omSmPbia42n4555MZKSAKS.F.QWLa	Free Tier Demo User	free	t	t	2025-08-04 06:52:12.28857+00	2025-08-04 07:11:16.046311+00	4ea3a004-b06d-4e8c-bcc2-81a4295953ab
007d1a6c-09a0-4ae4-a6f9-4db5e18b6f10	demo.basic@example.com	$2b$12$Bp5w5EqUQAA1qMZ3HZH68.kuNtHyMC54vfkxv/THDxS2vHuFWiMY2	Basic Tier Demo User	basic	t	t	2025-08-04 06:52:12.518097+00	2025-08-04 07:11:16.05571+00	80fef9c3-7bee-4936-af53-5cad7ff22187
617fdc01-75b8-434e-8f5e-241ea247b793	demo.premium@example.com	$2b$12$KJUxXxgRkcNhhdks.RSa6.XQd0Wq0Z7ROAjTr/r2V5FHjTlpZ4L2.	Premium Tier Demo User	premium	t	t	2025-08-04 06:52:12.737326+00	2025-08-04 07:11:16.057813+00	c655497b-c4ab-49bb-b5fa-82918eaa1ae2
c10691d3-cf17-4ce7-ac54-9d3fd45b8673	demo.enterprise@example.com	$2b$12$FTff0FZuUhzDpPYiL6Gcl.yYUCPGWg5iyE0DPoknv12/QoZZc7JUe	Enterprise Tier Demo User	enterprise	t	t	2025-08-04 06:52:12.9613+00	2025-08-04 07:11:16.059915+00	2798e0be-1144-470c-b597-06e7cf5766b8
da360051-9f04-474a-b1a7-b34b216b4628	realuser@example.com	$2b$12$3DFkacMgDh7nOTa0Pf.yBOrHNClYSiP3aiYCyasztjdZ10/LhysOm	Real User	free	t	f	2025-08-05 17:36:56.171641+00	2025-08-05 17:36:56.171641+00	\N
99fabf7b-b099-4473-ac83-ea1246b06ce8	test@example.com	$2b$12$uySW7dQdYyzgQVNvZKSEPe4XHRHb5QZXRtm3nvTsrqHx0jHSd4b6W	Test User	free	t	f	2025-08-05 18:02:12.85261+00	2025-08-05 18:02:52.249135+00	d2214ddd-6d1c-44ac-b30a-f194347ca9f8
4ce6ad3d-de6c-45b3-991b-888b6a0c50a5	ludo@lemanager.net	$2b$12$IZO.VNHNY.DON/4MndI6Ie/u0iOAiVnMA8dBEgnjny9dMG3Eo5YcW	Ludovic Carceles	free	t	f	2025-08-05 18:04:01.855914+00	2025-08-05 18:05:05.647211+00	3d76b8a0-77e5-466a-ae44-e0b418640544
\.


--
-- TOC entry 4392 (class 0 OID 25566)
-- Dependencies: 250
-- Data for Name: webhook_deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhook_deliveries (id, webhook_id, event, payload, status, attempts, last_attempt_at, next_retry_at, response_status, response_body, error_message, created_at, updated_at) FROM stdin;
3b7ba03f-8adc-485f-952a-39f4f0b9f118	bebd184f-2551-413c-9ed9-763a33a78947	metrics.updated	{"data": {"metrics": {"followers": 1150, "engagement_rate": 0.055}, "accountId": "7b6e0cf8-9df8-4686-8397-cfb27baf2f3a", "timestamp": "2025-07-31T08:42:53.842Z"}, "event": "metrics.updated", "userId": "9ccae0be-a97f-4ccf-a116-878a1860b60e", "accountId": "7b6e0cf8-9df8-4686-8397-cfb27baf2f3a", "timestamp": "2025-07-31T08:42:53.843Z"}	success	1	2025-07-31 08:42:54.679+00	\N	200	{"status":200,"statusText":"OK","data":{"args":{},"data":"{\\"event\\":\\"metrics.updated\\",\\"timestamp\\":\\"2025-07-31T08:42:53.843Z\\",\\"data\\":{\\"accountId\\":\\"7b6e0cf8-9df8-4686-8397-cfb27baf2f3a\\",\\"metrics\\":{\\"followers\\":1150,\\"engagement_rate\\":0.055},\\"timestamp\\":\\"2025-07-31T08:42:53.842Z\\"},\\"accountId\\":\\"7b6e0cf8-9df8-4686-8397-cfb27baf2f3a\\",\\"userId\\":\\"9ccae0be-a97f-4ccf-a116-878a1860b60e\\"}","files":{},"form":{},"headers":{"Accept":"application/json, text/plain, */*","Accept-Encoding":"gzip, compress, deflate, br","Content-Length":"317","Content-Type":"application/json","Host":"httpbin.org","User-Agent":"AI-Social-Media-Manager/1.0","X-Amzn-Trace-Id":"Root=1-688b2c8d-0d2d73140a61a01264f14650","X-Webhook-Signature":"sha256=47caec1552832a762129fe25736f066622b22f3caae3989d0418f651af6e0af0"},"json":{"accountId":"7b6e0cf8-9df8-4686-8397-cfb27baf2f3a","data":{"accountId":"7b6e0cf8-9df8-4686-8397-cfb27baf2f3a","metrics":{"engagement_rate":0.055,"followers":1150},"timestamp":"2025-07-31T08:42:53.842Z"},"event":"metrics.updated","timestamp":"2025-07-31T08:42:53.843Z","userId":"9ccae0be-a97f-4ccf-a116-878a1860b60e"},"origin":"45.151.16.47","url":"https://httpbin.org/post"}}	\N	2025-07-31 08:42:54.679+00	2025-07-31 08:42:54.679+00
f8764793-70e6-4bb8-acd4-88cabeec69c6	d5a22306-2fe3-4b26-9d86-eb5dc8dacef0	metrics.updated	{"data": {"metrics": {"followers": 1150, "engagement_rate": 0.055}, "accountId": "50388d4c-90bb-4374-9fec-cab8288f97e1", "timestamp": "2025-08-01T07:11:40.870Z"}, "event": "metrics.updated", "userId": "50dc9602-0da5-4a97-b69a-fe1b21376958", "accountId": "50388d4c-90bb-4374-9fec-cab8288f97e1", "timestamp": "2025-08-01T07:11:40.872Z"}	success	1	2025-08-01 07:11:40.982+00	\N	200	{"status":200,"statusText":"OK","data":{"args":{},"data":"{\\"event\\":\\"metrics.updated\\",\\"timestamp\\":\\"2025-08-01T07:11:40.872Z\\",\\"data\\":{\\"accountId\\":\\"50388d4c-90bb-4374-9fec-cab8288f97e1\\",\\"metrics\\":{\\"followers\\":1150,\\"engagement_rate\\":0.055},\\"timestamp\\":\\"2025-08-01T07:11:40.870Z\\"},\\"accountId\\":\\"50388d4c-90bb-4374-9fec-cab8288f97e1\\",\\"userId\\":\\"50dc9602-0da5-4a97-b69a-fe1b21376958\\"}","files":{},"form":{},"headers":{"Accept":"application/json, text/plain, */*","Accept-Encoding":"gzip, compress, deflate, br","Content-Length":"317","Content-Type":"application/json","Host":"httpbin.org","User-Agent":"AI-Social-Media-Manager/1.0","X-Amzn-Trace-Id":"Root=1-688c68ac-5ae584263a6f56a275f6ce21","X-Webhook-Signature":"sha256=abed20d9535ce6ebee9f4e45d82a41bdb6ce178d7227251fa78a2abb681967d9"},"json":{"accountId":"50388d4c-90bb-4374-9fec-cab8288f97e1","data":{"accountId":"50388d4c-90bb-4374-9fec-cab8288f97e1","metrics":{"engagement_rate":0.055,"followers":1150},"timestamp":"2025-08-01T07:11:40.870Z"},"event":"metrics.updated","timestamp":"2025-08-01T07:11:40.872Z","userId":"50dc9602-0da5-4a97-b69a-fe1b21376958"},"origin":"45.151.16.47","url":"https://httpbin.org/post"}}	\N	2025-08-01 07:11:40.982+00	2025-08-01 07:11:40.982+00
\.


--
-- TOC entry 4391 (class 0 OID 25540)
-- Dependencies: 249
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhooks (id, user_id, team_id, name, url, events, secret, is_active, retry_count, max_retries, timeout, headers, created_at, updated_at, last_triggered_at, last_success_at, last_failure_at) FROM stdin;
735d9319-d669-4576-a889-de73e29c569a	ffc2d789-efdd-41d7-a647-b4a83661a89d	\N	Test Webhook	https://example.com/webhook	["metrics.updated"]	\N	t	0	3	30000	{}	2025-07-31 08:36:40.24459+00	2025-07-31 08:36:40.24459+00	\N	\N	\N
86ad894e-e58a-4e24-b010-a9c4dfcc9172	9b27ea41-d48a-42c2-84f6-8da36e7ce80e	\N	Demo Webhook	https://httpbin.org/post	["metrics.updated", "insights.generated"]	demo-secret-123	t	0	3	30000	{}	2025-07-31 08:42:25.968+00	2025-07-31 08:42:25.968+00	\N	\N	\N
bebd184f-2551-413c-9ed9-763a33a78947	9ccae0be-a97f-4ccf-a116-878a1860b60e	\N	Demo Webhook	https://httpbin.org/post	["metrics.updated", "insights.generated"]	demo-secret-123	t	0	3	30000	{}	2025-07-31 08:42:52.965+00	2025-07-31 08:42:54.67627+00	2025-07-31 08:42:54.676+00	2025-07-31 08:42:54.676+00	\N
d5a22306-2fe3-4b26-9d86-eb5dc8dacef0	50dc9602-0da5-4a97-b69a-fe1b21376958	\N	Demo Webhook	https://httpbin.org/post	["metrics.updated", "insights.generated"]	demo-secret-123	t	0	3	30000	{}	2025-08-01 07:11:39.742+00	2025-08-01 07:11:40.977538+00	2025-08-01 07:11:40.976+00	2025-08-01 07:11:40.976+00	\N
\.


--
-- TOC entry 4426 (class 0 OID 0)
-- Dependencies: 223
-- Name: pgmigrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pgmigrations_id_seq', 5, true);


--
-- TOC entry 3922 (class 2606 OID 25088)
-- Name: account_group_memberships account_group_memberships_account_group_id_social_account_i_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_group_memberships
    ADD CONSTRAINT account_group_memberships_account_group_id_social_account_i_key UNIQUE (account_group_id, social_account_id);


--
-- TOC entry 3924 (class 2606 OID 25086)
-- Name: account_group_memberships account_group_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_group_memberships
    ADD CONSTRAINT account_group_memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 3911 (class 2606 OID 25033)
-- Name: account_groups account_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_groups
    ADD CONSTRAINT account_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3875 (class 2606 OID 16594)
-- Name: account_metrics account_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_metrics
    ADD CONSTRAINT account_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3877 (class 2606 OID 16596)
-- Name: account_metrics account_metrics_social_account_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_metrics
    ADD CONSTRAINT account_metrics_social_account_id_date_key UNIQUE (social_account_id, date);


--
-- TOC entry 3914 (class 2606 OID 25060)
-- Name: account_monitoring_configs account_monitoring_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_monitoring_configs
    ADD CONSTRAINT account_monitoring_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 3919 (class 2606 OID 25074)
-- Name: account_status_logs account_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_status_logs
    ADD CONSTRAINT account_status_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4041 (class 2606 OID 25753)
-- Name: ai_analysis ai_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_analysis
    ADD CONSTRAINT ai_analysis_pkey PRIMARY KEY (id);


--
-- TOC entry 4026 (class 2606 OID 25597)
-- Name: api_access_tokens api_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_access_tokens
    ADD CONSTRAINT api_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4028 (class 2606 OID 25599)
-- Name: api_access_tokens api_access_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_access_tokens
    ADD CONSTRAINT api_access_tokens_token_key UNIQUE (token);


--
-- TOC entry 4035 (class 2606 OID 25618)
-- Name: api_rate_limits api_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_rate_limits
    ADD CONSTRAINT api_rate_limits_pkey PRIMARY KEY (id);


--
-- TOC entry 4037 (class 2606 OID 25620)
-- Name: api_rate_limits api_rate_limits_token_id_window_start_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_rate_limits
    ADD CONSTRAINT api_rate_limits_token_id_window_start_key UNIQUE (token_id, window_start);


--
-- TOC entry 3906 (class 2606 OID 24924)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3842 (class 2606 OID 16511)
-- Name: brand_guidelines brand_guidelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_guidelines
    ADD CONSTRAINT brand_guidelines_pkey PRIMARY KEY (id);


--
-- TOC entry 3985 (class 2606 OID 25390)
-- Name: competitive_analysis_results competitive_analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitive_analysis_results
    ADD CONSTRAINT competitive_analysis_results_pkey PRIMARY KEY (id);


--
-- TOC entry 3987 (class 2606 OID 25392)
-- Name: competitive_analysis_results competitive_analysis_results_social_account_id_analysis_dat_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitive_analysis_results
    ADD CONSTRAINT competitive_analysis_results_social_account_id_analysis_dat_key UNIQUE (social_account_id, analysis_date);


--
-- TOC entry 3955 (class 2606 OID 25305)
-- Name: competitor_accounts competitor_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_accounts
    ADD CONSTRAINT competitor_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3957 (class 2606 OID 25307)
-- Name: competitor_accounts competitor_accounts_user_id_platform_platform_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_accounts
    ADD CONSTRAINT competitor_accounts_user_id_platform_platform_account_id_key UNIQUE (user_id, platform, platform_account_id);


--
-- TOC entry 3963 (class 2606 OID 25341)
-- Name: competitor_metrics competitor_metrics_competitor_account_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_metrics
    ADD CONSTRAINT competitor_metrics_competitor_account_id_date_key UNIQUE (competitor_account_id, date);


--
-- TOC entry 3965 (class 2606 OID 25339)
-- Name: competitor_metrics competitor_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_metrics
    ADD CONSTRAINT competitor_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3970 (class 2606 OID 25364)
-- Name: competitor_post_metrics competitor_post_metrics_competitor_account_id_platform_post_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_post_metrics
    ADD CONSTRAINT competitor_post_metrics_competitor_account_id_platform_post_key UNIQUE (competitor_account_id, platform_post_id);


--
-- TOC entry 3972 (class 2606 OID 25362)
-- Name: competitor_post_metrics competitor_post_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_post_metrics
    ADD CONSTRAINT competitor_post_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 4053 (class 2606 OID 25789)
-- Name: content_patterns content_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_patterns
    ADD CONSTRAINT content_patterns_pkey PRIMARY KEY (id);


--
-- TOC entry 3856 (class 2606 OID 16545)
-- Name: content content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_pkey PRIMARY KEY (id);


--
-- TOC entry 3951 (class 2606 OID 25237)
-- Name: data_cleanup_jobs data_cleanup_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_cleanup_jobs
    ADD CONSTRAINT data_cleanup_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 3941 (class 2606 OID 25198)
-- Name: data_deduplication_log data_deduplication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_deduplication_log
    ADD CONSTRAINT data_deduplication_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3946 (class 2606 OID 25219)
-- Name: data_retention_policies data_retention_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_retention_policies
    ADD CONSTRAINT data_retention_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 3981 (class 2606 OID 25379)
-- Name: industry_benchmarks industry_benchmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_benchmarks
    ADD CONSTRAINT industry_benchmarks_pkey PRIMARY KEY (id);


--
-- TOC entry 3983 (class 2606 OID 25381)
-- Name: industry_benchmarks industry_benchmarks_platform_industry_region_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_benchmarks
    ADD CONSTRAINT industry_benchmarks_platform_industry_region_key UNIQUE (platform, industry, region);


--
-- TOC entry 4074 (class 2606 OID 25845)
-- Name: insight_analysis_results insight_analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_analysis_results
    ADD CONSTRAINT insight_analysis_results_pkey PRIMARY KEY (id);


--
-- TOC entry 4078 (class 2606 OID 25870)
-- Name: insight_patterns insight_patterns_insight_id_pattern_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_patterns
    ADD CONSTRAINT insight_patterns_insight_id_pattern_id_key UNIQUE (insight_id, pattern_id);


--
-- TOC entry 4080 (class 2606 OID 25868)
-- Name: insight_patterns insight_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_patterns
    ADD CONSTRAINT insight_patterns_pkey PRIMARY KEY (id);


--
-- TOC entry 4066 (class 2606 OID 25818)
-- Name: insight_recommendations insight_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_recommendations
    ADD CONSTRAINT insight_recommendations_pkey PRIMARY KEY (id);


--
-- TOC entry 3998 (class 2606 OID 25429)
-- Name: market_position_snapshots market_position_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_position_snapshots
    ADD CONSTRAINT market_position_snapshots_pkey PRIMARY KEY (id);


--
-- TOC entry 3939 (class 2606 OID 25180)
-- Name: normalized_data normalized_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.normalized_data
    ADD CONSTRAINT normalized_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3995 (class 2606 OID 25417)
-- Name: performance_gaps performance_gaps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_gaps
    ADD CONSTRAINT performance_gaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3902 (class 2606 OID 24898)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3904 (class 2606 OID 24900)
-- Name: permissions permissions_team_id_user_id_resource_type_resource_id_permi_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_team_id_user_id_resource_type_resource_id_permi_key UNIQUE (team_id, user_id, resource_type, resource_id, permission_type);


--
-- TOC entry 3886 (class 2606 OID 16641)
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4013 (class 2606 OID 25533)
-- Name: platform_algorithm_factors platform_algorithm_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_algorithm_factors
    ADD CONSTRAINT platform_algorithm_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4004 (class 2606 OID 25473)
-- Name: platform_best_practices platform_best_practices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_best_practices
    ADD CONSTRAINT platform_best_practices_pkey PRIMARY KEY (id);


--
-- TOC entry 4007 (class 2606 OID 25499)
-- Name: platform_content_recommendations platform_content_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_content_recommendations
    ADD CONSTRAINT platform_content_recommendations_pkey PRIMARY KEY (id);


--
-- TOC entry 4010 (class 2606 OID 25521)
-- Name: platform_hashtag_strategies platform_hashtag_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_hashtag_strategies
    ADD CONSTRAINT platform_hashtag_strategies_pkey PRIMARY KEY (id);


--
-- TOC entry 3871 (class 2606 OID 16571)
-- Name: post_metrics post_metrics_content_id_social_account_id_platform_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_content_id_social_account_id_platform_post_id_key UNIQUE (content_id, social_account_id, platform_post_id);


--
-- TOC entry 3873 (class 2606 OID 16569)
-- Name: post_metrics post_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3934 (class 2606 OID 25163)
-- Name: raw_scraped_data raw_scraped_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_scraped_data
    ADD CONSTRAINT raw_scraped_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3852 (class 2606 OID 16527)
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3854 (class 2606 OID 16529)
-- Name: social_accounts social_accounts_user_id_platform_platform_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_user_id_platform_platform_account_id_key UNIQUE (user_id, platform, platform_account_id);


--
-- TOC entry 3884 (class 2606 OID 16612)
-- Name: strategy_configs strategy_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_configs
    ADD CONSTRAINT strategy_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4100 (class 2606 OID 26032)
-- Name: subscription_billing subscription_billing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_billing
    ADD CONSTRAINT subscription_billing_pkey PRIMARY KEY (id);


--
-- TOC entry 4096 (class 2606 OID 26004)
-- Name: subscription_history subscription_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4082 (class 2606 OID 25968)
-- Name: subscription_limits subscription_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_limits
    ADD CONSTRAINT subscription_limits_pkey PRIMARY KEY (id);


--
-- TOC entry 4084 (class 2606 OID 25970)
-- Name: subscription_limits subscription_limits_tier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_limits
    ADD CONSTRAINT subscription_limits_tier_key UNIQUE (tier);


--
-- TOC entry 4088 (class 2606 OID 25982)
-- Name: subscription_usage subscription_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_usage
    ADD CONSTRAINT subscription_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 4090 (class 2606 OID 25986)
-- Name: subscription_usage subscription_usage_team_id_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_usage
    ADD CONSTRAINT subscription_usage_team_id_month_key UNIQUE (team_id, month);


--
-- TOC entry 4092 (class 2606 OID 25984)
-- Name: subscription_usage subscription_usage_user_id_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_usage
    ADD CONSTRAINT subscription_usage_user_id_month_key UNIQUE (user_id, month);


--
-- TOC entry 3896 (class 2606 OID 24874)
-- Name: team_memberships team_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 3898 (class 2606 OID 24876)
-- Name: team_memberships team_memberships_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_team_id_user_id_key UNIQUE (team_id, user_id);


--
-- TOC entry 3890 (class 2606 OID 24863)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 3838 (class 2606 OID 16501)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3840 (class 2606 OID 16499)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4024 (class 2606 OID 25578)
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- TOC entry 4019 (class 2606 OID 25555)
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- TOC entry 3925 (class 1259 OID 25109)
-- Name: idx_account_group_memberships_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_group_memberships_account ON public.account_group_memberships USING btree (social_account_id);


--
-- TOC entry 3926 (class 1259 OID 25108)
-- Name: idx_account_group_memberships_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_group_memberships_group ON public.account_group_memberships USING btree (account_group_id);


--
-- TOC entry 3912 (class 1259 OID 25104)
-- Name: idx_account_groups_user_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_groups_user_team ON public.account_groups USING btree (user_id, team_id);


--
-- TOC entry 3878 (class 1259 OID 16624)
-- Name: idx_account_metrics_account_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_metrics_account_date ON public.account_metrics USING btree (social_account_id, date);


--
-- TOC entry 3879 (class 1259 OID 25933)
-- Name: idx_account_metrics_account_date_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_metrics_account_date_desc ON public.account_metrics USING btree (social_account_id, date DESC);


--
-- TOC entry 4427 (class 0 OID 0)
-- Dependencies: 3879
-- Name: INDEX idx_account_metrics_account_date_desc; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_account_metrics_account_date_desc IS 'Optimizes time-series metrics queries';


--
-- TOC entry 3880 (class 1259 OID 16651)
-- Name: idx_account_metrics_date_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_metrics_date_range ON public.account_metrics USING btree (social_account_id, date);


--
-- TOC entry 3881 (class 1259 OID 16652)
-- Name: idx_account_metrics_growth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_metrics_growth ON public.account_metrics USING btree (follower_growth DESC);


--
-- TOC entry 3915 (class 1259 OID 25105)
-- Name: idx_account_monitoring_configs_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_monitoring_configs_account ON public.account_monitoring_configs USING btree (social_account_id);


--
-- TOC entry 3916 (class 1259 OID 25106)
-- Name: idx_account_monitoring_configs_next_collection; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_monitoring_configs_next_collection ON public.account_monitoring_configs USING btree (next_collection_at) WHERE (is_active = true);


--
-- TOC entry 3920 (class 1259 OID 25107)
-- Name: idx_account_status_logs_account_checked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_status_logs_account_checked ON public.account_status_logs USING btree (social_account_id, checked_at);


--
-- TOC entry 4042 (class 1259 OID 25881)
-- Name: idx_ai_analysis_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_account ON public.ai_analysis USING btree (social_account_id);


--
-- TOC entry 4043 (class 1259 OID 25888)
-- Name: idx_ai_analysis_acknowledged; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_acknowledged ON public.ai_analysis USING btree (is_acknowledged);


--
-- TOC entry 4044 (class 1259 OID 25887)
-- Name: idx_ai_analysis_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_active ON public.ai_analysis USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 4045 (class 1259 OID 25890)
-- Name: idx_ai_analysis_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_created_at ON public.ai_analysis USING btree (created_at);


--
-- TOC entry 4046 (class 1259 OID 25885)
-- Name: idx_ai_analysis_impact_urgency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_impact_urgency ON public.ai_analysis USING btree (impact, urgency);


--
-- TOC entry 4047 (class 1259 OID 25886)
-- Name: idx_ai_analysis_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_score ON public.ai_analysis USING btree (score DESC);


--
-- TOC entry 4048 (class 1259 OID 25882)
-- Name: idx_ai_analysis_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_team ON public.ai_analysis USING btree (team_id);


--
-- TOC entry 4049 (class 1259 OID 25884)
-- Name: idx_ai_analysis_type_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_type_category ON public.ai_analysis USING btree (type, category);


--
-- TOC entry 4050 (class 1259 OID 25883)
-- Name: idx_ai_analysis_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_user ON public.ai_analysis USING btree (user_id);


--
-- TOC entry 4051 (class 1259 OID 25889)
-- Name: idx_ai_analysis_valid_until; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_analysis_valid_until ON public.ai_analysis USING btree (valid_until) WHERE (valid_until IS NOT NULL);


--
-- TOC entry 4029 (class 1259 OID 25636)
-- Name: idx_api_access_tokens_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_access_tokens_is_active ON public.api_access_tokens USING btree (is_active);


--
-- TOC entry 4030 (class 1259 OID 25634)
-- Name: idx_api_access_tokens_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_access_tokens_team_id ON public.api_access_tokens USING btree (team_id);


--
-- TOC entry 4031 (class 1259 OID 25635)
-- Name: idx_api_access_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_access_tokens_token ON public.api_access_tokens USING btree (token);


--
-- TOC entry 4032 (class 1259 OID 25633)
-- Name: idx_api_access_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_access_tokens_user_id ON public.api_access_tokens USING btree (user_id);


--
-- TOC entry 4038 (class 1259 OID 25637)
-- Name: idx_api_rate_limits_token_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_rate_limits_token_id ON public.api_rate_limits USING btree (token_id);


--
-- TOC entry 4039 (class 1259 OID 25638)
-- Name: idx_api_rate_limits_window_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_rate_limits_window_start ON public.api_rate_limits USING btree (window_start);


--
-- TOC entry 4033 (class 1259 OID 25946)
-- Name: idx_api_tokens_user_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_tokens_user_active ON public.api_access_tokens USING btree (user_id) WHERE (is_active = true);


--
-- TOC entry 3907 (class 1259 OID 24966)
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- TOC entry 3908 (class 1259 OID 24967)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 3909 (class 1259 OID 24965)
-- Name: idx_audit_logs_team_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_team_user ON public.audit_logs USING btree (team_id, user_id);


--
-- TOC entry 3843 (class 1259 OID 25937)
-- Name: idx_brand_guidelines_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brand_guidelines_user ON public.brand_guidelines USING btree (user_id);


--
-- TOC entry 3952 (class 1259 OID 25258)
-- Name: idx_cleanup_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cleanup_jobs_status ON public.data_cleanup_jobs USING btree (status);


--
-- TOC entry 3953 (class 1259 OID 25259)
-- Name: idx_cleanup_jobs_type_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cleanup_jobs_type_created ON public.data_cleanup_jobs USING btree (job_type, created_at);


--
-- TOC entry 3988 (class 1259 OID 25449)
-- Name: idx_competitive_analysis_results_account_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitive_analysis_results_account_date ON public.competitive_analysis_results USING btree (social_account_id, analysis_date);


--
-- TOC entry 3989 (class 1259 OID 25452)
-- Name: idx_competitive_analysis_results_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitive_analysis_results_created_at ON public.competitive_analysis_results USING btree (created_at);


--
-- TOC entry 3990 (class 1259 OID 25451)
-- Name: idx_competitive_analysis_results_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitive_analysis_results_team_id ON public.competitive_analysis_results USING btree (team_id);


--
-- TOC entry 3991 (class 1259 OID 25450)
-- Name: idx_competitive_analysis_results_user_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitive_analysis_results_user_platform ON public.competitive_analysis_results USING btree (user_id, platform);


--
-- TOC entry 3958 (class 1259 OID 25437)
-- Name: idx_competitor_accounts_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_accounts_is_active ON public.competitor_accounts USING btree (is_active);


--
-- TOC entry 3959 (class 1259 OID 25436)
-- Name: idx_competitor_accounts_platform_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_accounts_platform_username ON public.competitor_accounts USING btree (platform, username);


--
-- TOC entry 3960 (class 1259 OID 25438)
-- Name: idx_competitor_accounts_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_accounts_team_id ON public.competitor_accounts USING btree (team_id);


--
-- TOC entry 3961 (class 1259 OID 25435)
-- Name: idx_competitor_accounts_user_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_accounts_user_platform ON public.competitor_accounts USING btree (user_id, platform);


--
-- TOC entry 3966 (class 1259 OID 25439)
-- Name: idx_competitor_metrics_account_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_metrics_account_date ON public.competitor_metrics USING btree (competitor_account_id, date);


--
-- TOC entry 3967 (class 1259 OID 25441)
-- Name: idx_competitor_metrics_collected_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_metrics_collected_at ON public.competitor_metrics USING btree (collected_at);


--
-- TOC entry 3968 (class 1259 OID 25440)
-- Name: idx_competitor_metrics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_metrics_date ON public.competitor_metrics USING btree (date);


--
-- TOC entry 3973 (class 1259 OID 25442)
-- Name: idx_competitor_post_metrics_account_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_post_metrics_account_published ON public.competitor_post_metrics USING btree (competitor_account_id, published_at);


--
-- TOC entry 3974 (class 1259 OID 25444)
-- Name: idx_competitor_post_metrics_engagement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_post_metrics_engagement ON public.competitor_post_metrics USING btree (engagement_rate DESC);


--
-- TOC entry 3975 (class 1259 OID 25443)
-- Name: idx_competitor_post_metrics_platform_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_post_metrics_platform_post ON public.competitor_post_metrics USING btree (platform, platform_post_id);


--
-- TOC entry 3976 (class 1259 OID 25445)
-- Name: idx_competitor_post_metrics_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_competitor_post_metrics_published_at ON public.competitor_post_metrics USING btree (published_at);


--
-- TOC entry 4054 (class 1259 OID 25891)
-- Name: idx_content_patterns_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_account ON public.content_patterns USING btree (social_account_id);


--
-- TOC entry 4055 (class 1259 OID 25897)
-- Name: idx_content_patterns_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_active ON public.content_patterns USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 4056 (class 1259 OID 25894)
-- Name: idx_content_patterns_confidence; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_confidence ON public.content_patterns USING btree (confidence DESC);


--
-- TOC entry 4057 (class 1259 OID 25896)
-- Name: idx_content_patterns_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_period ON public.content_patterns USING btree (detected_for_period, detection_start_date, detection_end_date);


--
-- TOC entry 4058 (class 1259 OID 25895)
-- Name: idx_content_patterns_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_score ON public.content_patterns USING btree (score DESC);


--
-- TOC entry 4059 (class 1259 OID 25892)
-- Name: idx_content_patterns_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_team ON public.content_patterns USING btree (team_id);


--
-- TOC entry 4060 (class 1259 OID 25893)
-- Name: idx_content_patterns_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_patterns_type ON public.content_patterns USING btree (type);


--
-- TOC entry 3857 (class 1259 OID 16646)
-- Name: idx_content_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_published_at ON public.content USING btree (published_at);


--
-- TOC entry 3858 (class 1259 OID 16621)
-- Name: idx_content_scheduled_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_scheduled_at ON public.content USING btree (scheduled_at) WHERE (status = 'scheduled'::public.content_status);


--
-- TOC entry 3859 (class 1259 OID 16645)
-- Name: idx_content_status_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_status_scheduled ON public.content USING btree (status, scheduled_at) WHERE (status = 'scheduled'::public.content_status);


--
-- TOC entry 3860 (class 1259 OID 25942)
-- Name: idx_content_team_status_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_team_status_updated ON public.content USING btree (team_id, status, updated_at DESC);


--
-- TOC entry 4428 (class 0 OID 0)
-- Dependencies: 3860
-- Name: INDEX idx_content_team_status_updated; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_content_team_status_updated IS 'Optimizes team content status queries';


--
-- TOC entry 3861 (class 1259 OID 25941)
-- Name: idx_content_user_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_user_created_desc ON public.content USING btree (user_id, created_at DESC);


--
-- TOC entry 4429 (class 0 OID 0)
-- Dependencies: 3861
-- Name: INDEX idx_content_user_created_desc; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_content_user_created_desc IS 'Optimizes content queries by user and creation date';


--
-- TOC entry 3862 (class 1259 OID 16620)
-- Name: idx_content_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_user_status ON public.content USING btree (user_id, status);


--
-- TOC entry 3863 (class 1259 OID 16644)
-- Name: idx_content_user_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_user_type ON public.content USING btree (user_id, type);


--
-- TOC entry 3942 (class 1259 OID 25253)
-- Name: idx_deduplication_log_duplicate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deduplication_log_duplicate ON public.data_deduplication_log USING btree (duplicate_data_id);


--
-- TOC entry 3943 (class 1259 OID 25254)
-- Name: idx_deduplication_log_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deduplication_log_method ON public.data_deduplication_log USING btree (deduplication_method);


--
-- TOC entry 3944 (class 1259 OID 25252)
-- Name: idx_deduplication_log_original; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deduplication_log_original ON public.data_deduplication_log USING btree (original_data_id);


--
-- TOC entry 3977 (class 1259 OID 25446)
-- Name: idx_industry_benchmarks_platform_industry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industry_benchmarks_platform_industry ON public.industry_benchmarks USING btree (platform, industry);


--
-- TOC entry 3978 (class 1259 OID 25447)
-- Name: idx_industry_benchmarks_platform_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industry_benchmarks_platform_region ON public.industry_benchmarks USING btree (platform, region);


--
-- TOC entry 3979 (class 1259 OID 25448)
-- Name: idx_industry_benchmarks_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industry_benchmarks_updated_at ON public.industry_benchmarks USING btree (updated_at);


--
-- TOC entry 4067 (class 1259 OID 25902)
-- Name: idx_insight_analysis_results_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_account ON public.insight_analysis_results USING btree (social_account_id);


--
-- TOC entry 4068 (class 1259 OID 25907)
-- Name: idx_insight_analysis_results_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_created_at ON public.insight_analysis_results USING btree (created_at);


--
-- TOC entry 4069 (class 1259 OID 25905)
-- Name: idx_insight_analysis_results_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_period ON public.insight_analysis_results USING btree (analysis_period_start, analysis_period_end);


--
-- TOC entry 4070 (class 1259 OID 25904)
-- Name: idx_insight_analysis_results_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_platform ON public.insight_analysis_results USING btree (platform);


--
-- TOC entry 4071 (class 1259 OID 25906)
-- Name: idx_insight_analysis_results_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_score ON public.insight_analysis_results USING btree (overall_score DESC);


--
-- TOC entry 4072 (class 1259 OID 25903)
-- Name: idx_insight_analysis_results_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_analysis_results_team ON public.insight_analysis_results USING btree (team_id);


--
-- TOC entry 4075 (class 1259 OID 25908)
-- Name: idx_insight_patterns_insight; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_patterns_insight ON public.insight_patterns USING btree (insight_id);


--
-- TOC entry 4076 (class 1259 OID 25909)
-- Name: idx_insight_patterns_pattern; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_patterns_pattern ON public.insight_patterns USING btree (pattern_id);


--
-- TOC entry 4061 (class 1259 OID 25900)
-- Name: idx_insight_recommendations_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_recommendations_completed ON public.insight_recommendations USING btree (is_completed);


--
-- TOC entry 4062 (class 1259 OID 25898)
-- Name: idx_insight_recommendations_insight; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_recommendations_insight ON public.insight_recommendations USING btree (insight_id);


--
-- TOC entry 4063 (class 1259 OID 25899)
-- Name: idx_insight_recommendations_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_recommendations_priority ON public.insight_recommendations USING btree (priority);


--
-- TOC entry 4064 (class 1259 OID 25901)
-- Name: idx_insight_recommendations_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_insight_recommendations_score ON public.insight_recommendations USING btree (score DESC);


--
-- TOC entry 3996 (class 1259 OID 25455)
-- Name: idx_market_position_snapshots_analysis_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_market_position_snapshots_analysis_id ON public.market_position_snapshots USING btree (competitive_analysis_id);


--
-- TOC entry 3917 (class 1259 OID 25940)
-- Name: idx_monitoring_configs_account_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_monitoring_configs_account_active ON public.account_monitoring_configs USING btree (social_account_id) WHERE (is_active = true);


--
-- TOC entry 3935 (class 1259 OID 25249)
-- Name: idx_normalized_data_account_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normalized_data_account_platform ON public.normalized_data USING btree (social_account_id, platform);


--
-- TOC entry 3936 (class 1259 OID 25251)
-- Name: idx_normalized_data_raw_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normalized_data_raw_id ON public.normalized_data USING btree (raw_data_id);


--
-- TOC entry 3937 (class 1259 OID 25250)
-- Name: idx_normalized_data_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normalized_data_type ON public.normalized_data USING btree (data_type);


--
-- TOC entry 3992 (class 1259 OID 25453)
-- Name: idx_performance_gaps_analysis_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_performance_gaps_analysis_priority ON public.performance_gaps USING btree (competitive_analysis_id, priority);


--
-- TOC entry 3993 (class 1259 OID 25454)
-- Name: idx_performance_gaps_metric_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_performance_gaps_metric_name ON public.performance_gaps USING btree (metric_name);


--
-- TOC entry 3899 (class 1259 OID 24964)
-- Name: idx_permissions_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permissions_resource ON public.permissions USING btree (resource_type, resource_id);


--
-- TOC entry 3900 (class 1259 OID 24963)
-- Name: idx_permissions_team_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permissions_team_user ON public.permissions USING btree (team_id, user_id);


--
-- TOC entry 4011 (class 1259 OID 25534)
-- Name: idx_platform_algorithm_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_algorithm_platform ON public.platform_algorithm_factors USING btree (platform);


--
-- TOC entry 3999 (class 1259 OID 25486)
-- Name: idx_platform_best_practices_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_best_practices_active ON public.platform_best_practices USING btree (is_active);


--
-- TOC entry 4000 (class 1259 OID 25485)
-- Name: idx_platform_best_practices_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_best_practices_category ON public.platform_best_practices USING btree (category);


--
-- TOC entry 4001 (class 1259 OID 25484)
-- Name: idx_platform_best_practices_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_best_practices_platform ON public.platform_best_practices USING btree (platform);


--
-- TOC entry 4002 (class 1259 OID 25487)
-- Name: idx_platform_best_practices_platform_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_best_practices_platform_category ON public.platform_best_practices USING btree (platform, category);


--
-- TOC entry 4005 (class 1259 OID 25510)
-- Name: idx_platform_content_platform_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_content_platform_type ON public.platform_content_recommendations USING btree (platform, content_type);


--
-- TOC entry 4008 (class 1259 OID 25522)
-- Name: idx_platform_hashtag_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_hashtag_platform ON public.platform_hashtag_strategies USING btree (platform);


--
-- TOC entry 3864 (class 1259 OID 16622)
-- Name: idx_post_metrics_content_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_content_platform ON public.post_metrics USING btree (content_id, platform);


--
-- TOC entry 3865 (class 1259 OID 16649)
-- Name: idx_post_metrics_engagement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_engagement ON public.post_metrics USING btree (engagement_rate DESC);


--
-- TOC entry 3866 (class 1259 OID 25938)
-- Name: idx_post_metrics_high_engagement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_high_engagement ON public.post_metrics USING btree (content_id, likes, comments, shares, published_at DESC) WHERE (((likes + comments) + shares) > 100);


--
-- TOC entry 4430 (class 0 OID 0)
-- Dependencies: 3866
-- Name: INDEX idx_post_metrics_high_engagement; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_post_metrics_high_engagement IS 'Optimizes high-performing content analysis';


--
-- TOC entry 3867 (class 1259 OID 16650)
-- Name: idx_post_metrics_platform_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_platform_published ON public.post_metrics USING btree (platform, published_at);


--
-- TOC entry 3868 (class 1259 OID 16623)
-- Name: idx_post_metrics_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_published_at ON public.post_metrics USING btree (published_at);


--
-- TOC entry 3869 (class 1259 OID 25934)
-- Name: idx_post_metrics_published_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_metrics_published_desc ON public.post_metrics USING btree (published_at DESC);


--
-- TOC entry 3927 (class 1259 OID 25243)
-- Name: idx_raw_scraped_data_account_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_account_platform ON public.raw_scraped_data USING btree (social_account_id, platform);


--
-- TOC entry 3928 (class 1259 OID 25248)
-- Name: idx_raw_scraped_data_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_expires ON public.raw_scraped_data USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- TOC entry 3929 (class 1259 OID 25245)
-- Name: idx_raw_scraped_data_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_hash ON public.raw_scraped_data USING btree (data_hash);


--
-- TOC entry 3930 (class 1259 OID 25247)
-- Name: idx_raw_scraped_data_normalization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_normalization ON public.raw_scraped_data USING btree (normalization_status);


--
-- TOC entry 3931 (class 1259 OID 25246)
-- Name: idx_raw_scraped_data_quality; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_quality ON public.raw_scraped_data USING btree (quality_status, quality_score);


--
-- TOC entry 3932 (class 1259 OID 25244)
-- Name: idx_raw_scraped_data_type_collected; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_raw_scraped_data_type_collected ON public.raw_scraped_data USING btree (data_type, collected_at);


--
-- TOC entry 3947 (class 1259 OID 25257)
-- Name: idx_retention_policies_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retention_policies_active ON public.data_retention_policies USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 3948 (class 1259 OID 25256)
-- Name: idx_retention_policies_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retention_policies_platform ON public.data_retention_policies USING btree (platform);


--
-- TOC entry 3949 (class 1259 OID 25255)
-- Name: idx_retention_policies_team_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retention_policies_team_type ON public.data_retention_policies USING btree (team_id, data_type);


--
-- TOC entry 3844 (class 1259 OID 16648)
-- Name: idx_social_accounts_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_is_active ON public.social_accounts USING btree (is_active);


--
-- TOC entry 3845 (class 1259 OID 16647)
-- Name: idx_social_accounts_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_platform ON public.social_accounts USING btree (platform);


--
-- TOC entry 3846 (class 1259 OID 25931)
-- Name: idx_social_accounts_platform_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_platform_username ON public.social_accounts USING btree (platform, username);


--
-- TOC entry 3847 (class 1259 OID 25110)
-- Name: idx_social_accounts_primary_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_primary_group ON public.social_accounts USING btree (primary_group_id);


--
-- TOC entry 3848 (class 1259 OID 25932)
-- Name: idx_social_accounts_team_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_team_active ON public.social_accounts USING btree (team_id) WHERE (is_active = true);


--
-- TOC entry 3849 (class 1259 OID 16619)
-- Name: idx_social_accounts_user_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_user_platform ON public.social_accounts USING btree (user_id, platform);


--
-- TOC entry 3850 (class 1259 OID 25930)
-- Name: idx_social_accounts_user_team_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_accounts_user_team_active ON public.social_accounts USING btree (user_id, team_id) WHERE (is_active = true);


--
-- TOC entry 4431 (class 0 OID 0)
-- Dependencies: 3850
-- Name: INDEX idx_social_accounts_user_team_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_social_accounts_user_team_active IS 'Optimizes user/team account access queries';


--
-- TOC entry 3882 (class 1259 OID 25936)
-- Name: idx_strategy_configs_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_strategy_configs_user_status ON public.strategy_configs USING btree (user_id, status);


--
-- TOC entry 4097 (class 1259 OID 26048)
-- Name: idx_subscription_billing_team_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_billing_team_date ON public.subscription_billing USING btree (team_id, billing_date);


--
-- TOC entry 4098 (class 1259 OID 26047)
-- Name: idx_subscription_billing_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_billing_user_date ON public.subscription_billing USING btree (user_id, billing_date);


--
-- TOC entry 4093 (class 1259 OID 26046)
-- Name: idx_subscription_history_team_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_history_team_date ON public.subscription_history USING btree (team_id, effective_date);


--
-- TOC entry 4094 (class 1259 OID 26045)
-- Name: idx_subscription_history_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_history_user_date ON public.subscription_history USING btree (user_id, effective_date);


--
-- TOC entry 4085 (class 1259 OID 26044)
-- Name: idx_subscription_usage_team_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_usage_team_month ON public.subscription_usage USING btree (team_id, month);


--
-- TOC entry 4086 (class 1259 OID 26043)
-- Name: idx_subscription_usage_user_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_usage_user_month ON public.subscription_usage USING btree (user_id, month);


--
-- TOC entry 3891 (class 1259 OID 25945)
-- Name: idx_team_memberships_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_memberships_team ON public.team_memberships USING btree (team_id);


--
-- TOC entry 3892 (class 1259 OID 24961)
-- Name: idx_team_memberships_team_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_memberships_team_user ON public.team_memberships USING btree (team_id, user_id);


--
-- TOC entry 3893 (class 1259 OID 25944)
-- Name: idx_team_memberships_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_memberships_user ON public.team_memberships USING btree (user_id);


--
-- TOC entry 3894 (class 1259 OID 24962)
-- Name: idx_team_memberships_user_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_memberships_user_role ON public.team_memberships USING btree (user_id, role);


--
-- TOC entry 3887 (class 1259 OID 25943)
-- Name: idx_teams_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_active ON public.teams USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 4432 (class 0 OID 0)
-- Dependencies: 3887
-- Name: INDEX idx_teams_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_teams_active IS 'Optimizes active team queries';


--
-- TOC entry 3888 (class 1259 OID 24960)
-- Name: idx_teams_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_name ON public.teams USING btree (name);


--
-- TOC entry 3831 (class 1259 OID 25935)
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 3832 (class 1259 OID 25939)
-- Name: idx_users_active_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active_email ON public.users USING btree (email) WHERE (is_active = true);


--
-- TOC entry 4433 (class 0 OID 0)
-- Dependencies: 3832
-- Name: INDEX idx_users_active_email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_users_active_email IS 'Optimizes active user email lookups';


--
-- TOC entry 3833 (class 1259 OID 16618)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3834 (class 1259 OID 16642)
-- Name: idx_users_email_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_lower ON public.users USING btree (lower((email)::text));


--
-- TOC entry 3835 (class 1259 OID 16643)
-- Name: idx_users_subscription; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_subscription ON public.users USING btree (subscription_tier);


--
-- TOC entry 3836 (class 1259 OID 24968)
-- Name: idx_users_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_team_id ON public.users USING btree (team_id);


--
-- TOC entry 4020 (class 1259 OID 25632)
-- Name: idx_webhook_deliveries_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries USING btree (created_at);


--
-- TOC entry 4021 (class 1259 OID 25631)
-- Name: idx_webhook_deliveries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_deliveries_status ON public.webhook_deliveries USING btree (status);


--
-- TOC entry 4022 (class 1259 OID 25630)
-- Name: idx_webhook_deliveries_webhook_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries USING btree (webhook_id);


--
-- TOC entry 4014 (class 1259 OID 25629)
-- Name: idx_webhooks_events; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_events ON public.webhooks USING gin (events);


--
-- TOC entry 4015 (class 1259 OID 25628)
-- Name: idx_webhooks_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_is_active ON public.webhooks USING btree (is_active);


--
-- TOC entry 4016 (class 1259 OID 25627)
-- Name: idx_webhooks_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_team_id ON public.webhooks USING btree (team_id);


--
-- TOC entry 4017 (class 1259 OID 25626)
-- Name: idx_webhooks_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_user_id ON public.webhooks USING btree (user_id);


--
-- TOC entry 4190 (class 2620 OID 25268)
-- Name: raw_scraped_data check_duplicate_data_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER check_duplicate_data_trigger BEFORE INSERT ON public.raw_scraped_data FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_data();


--
-- TOC entry 4185 (class 2620 OID 24972)
-- Name: team_memberships create_default_permissions_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_default_permissions_trigger AFTER INSERT ON public.team_memberships FOR EACH ROW EXECUTE FUNCTION public.create_default_permissions();


--
-- TOC entry 4183 (class 2620 OID 25270)
-- Name: teams create_default_retention_policies_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_default_retention_policies_trigger AFTER INSERT ON public.teams FOR EACH ROW EXECUTE FUNCTION public.create_default_retention_policies();


--
-- TOC entry 4179 (class 2620 OID 25114)
-- Name: social_accounts create_monitoring_config_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_monitoring_config_trigger AFTER INSERT ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.create_default_monitoring_config();


--
-- TOC entry 4191 (class 2620 OID 25266)
-- Name: raw_scraped_data set_data_hash_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_data_hash_trigger BEFORE INSERT OR UPDATE OF raw_data ON public.raw_scraped_data FOR EACH ROW EXECUTE FUNCTION public.set_data_hash();


--
-- TOC entry 4206 (class 2620 OID 25927)
-- Name: ai_analysis set_insight_score_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_insight_score_trigger BEFORE INSERT OR UPDATE OF impact, confidence, urgency ON public.ai_analysis FOR EACH ROW EXECUTE FUNCTION public.set_insight_score();


--
-- TOC entry 4187 (class 2620 OID 25111)
-- Name: account_groups update_account_groups_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_account_groups_updated_at BEFORE UPDATE ON public.account_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4188 (class 2620 OID 25112)
-- Name: account_monitoring_configs update_account_monitoring_configs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_account_monitoring_configs_updated_at BEFORE UPDATE ON public.account_monitoring_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4207 (class 2620 OID 25910)
-- Name: ai_analysis update_ai_analysis_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ai_analysis_updated_at BEFORE UPDATE ON public.ai_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4204 (class 2620 OID 25641)
-- Name: api_access_tokens update_api_access_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_api_access_tokens_updated_at BEFORE UPDATE ON public.api_access_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4205 (class 2620 OID 25642)
-- Name: api_rate_limits update_api_rate_limits_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON public.api_rate_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4178 (class 2620 OID 16627)
-- Name: brand_guidelines update_brand_guidelines_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_brand_guidelines_updated_at BEFORE UPDATE ON public.brand_guidelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4195 (class 2620 OID 25456)
-- Name: competitor_accounts update_competitor_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_competitor_accounts_updated_at BEFORE UPDATE ON public.competitor_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4196 (class 2620 OID 25461)
-- Name: competitor_post_metrics update_competitor_daily_metrics_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_competitor_daily_metrics_trigger AFTER INSERT OR UPDATE ON public.competitor_post_metrics FOR EACH ROW EXECUTE FUNCTION public.update_competitor_daily_metrics();


--
-- TOC entry 4208 (class 2620 OID 25911)
-- Name: content_patterns update_content_patterns_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_patterns_updated_at BEFORE UPDATE ON public.content_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4181 (class 2620 OID 16629)
-- Name: content update_content_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4194 (class 2620 OID 25262)
-- Name: data_retention_policies update_data_retention_policies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON public.data_retention_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4197 (class 2620 OID 25457)
-- Name: industry_benchmarks update_industry_benchmarks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_industry_benchmarks_updated_at BEFORE UPDATE ON public.industry_benchmarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4210 (class 2620 OID 25913)
-- Name: insight_analysis_results update_insight_analysis_results_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_insight_analysis_results_updated_at BEFORE UPDATE ON public.insight_analysis_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4209 (class 2620 OID 25912)
-- Name: insight_recommendations update_insight_recommendations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_insight_recommendations_updated_at BEFORE UPDATE ON public.insight_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4189 (class 2620 OID 25116)
-- Name: account_monitoring_configs update_next_collection_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_next_collection_trigger BEFORE UPDATE OF data_collection_frequency ON public.account_monitoring_configs FOR EACH ROW EXECUTE FUNCTION public.update_next_collection_time();


--
-- TOC entry 4193 (class 2620 OID 25261)
-- Name: normalized_data update_normalized_data_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_normalized_data_updated_at BEFORE UPDATE ON public.normalized_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4201 (class 2620 OID 25538)
-- Name: platform_algorithm_factors update_platform_algorithm_factors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platform_algorithm_factors_updated_at BEFORE UPDATE ON public.platform_algorithm_factors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4198 (class 2620 OID 25535)
-- Name: platform_best_practices update_platform_best_practices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platform_best_practices_updated_at BEFORE UPDATE ON public.platform_best_practices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4199 (class 2620 OID 25536)
-- Name: platform_content_recommendations update_platform_content_recommendations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platform_content_recommendations_updated_at BEFORE UPDATE ON public.platform_content_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4200 (class 2620 OID 25537)
-- Name: platform_hashtag_strategies update_platform_hashtag_strategies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platform_hashtag_strategies_updated_at BEFORE UPDATE ON public.platform_hashtag_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4192 (class 2620 OID 25260)
-- Name: raw_scraped_data update_raw_scraped_data_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_raw_scraped_data_updated_at BEFORE UPDATE ON public.raw_scraped_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4180 (class 2620 OID 16628)
-- Name: social_accounts update_social_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4182 (class 2620 OID 16630)
-- Name: strategy_configs update_strategy_configs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_strategy_configs_updated_at BEFORE UPDATE ON public.strategy_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4213 (class 2620 OID 26051)
-- Name: subscription_billing update_subscription_billing_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscription_billing_updated_at BEFORE UPDATE ON public.subscription_billing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4211 (class 2620 OID 26049)
-- Name: subscription_limits update_subscription_limits_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscription_limits_updated_at BEFORE UPDATE ON public.subscription_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4212 (class 2620 OID 26050)
-- Name: subscription_usage update_subscription_usage_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4186 (class 2620 OID 24970)
-- Name: team_memberships update_team_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_team_memberships_updated_at BEFORE UPDATE ON public.team_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4184 (class 2620 OID 24969)
-- Name: teams update_teams_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4177 (class 2620 OID 16626)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4203 (class 2620 OID 25640)
-- Name: webhook_deliveries update_webhook_deliveries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_webhook_deliveries_updated_at BEFORE UPDATE ON public.webhook_deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4202 (class 2620 OID 25639)
-- Name: webhooks update_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4127 (class 2606 OID 25089)
-- Name: account_group_memberships account_group_memberships_account_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_group_memberships
    ADD CONSTRAINT account_group_memberships_account_group_id_fkey FOREIGN KEY (account_group_id) REFERENCES public.account_groups(id) ON DELETE CASCADE;


--
-- TOC entry 4128 (class 2606 OID 25094)
-- Name: account_group_memberships account_group_memberships_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_group_memberships
    ADD CONSTRAINT account_group_memberships_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4123 (class 2606 OID 25039)
-- Name: account_groups account_groups_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_groups
    ADD CONSTRAINT account_groups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4124 (class 2606 OID 25034)
-- Name: account_groups account_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_groups
    ADD CONSTRAINT account_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4112 (class 2606 OID 16597)
-- Name: account_metrics account_metrics_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_metrics
    ADD CONSTRAINT account_metrics_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4125 (class 2606 OID 25061)
-- Name: account_monitoring_configs account_monitoring_configs_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_monitoring_configs
    ADD CONSTRAINT account_monitoring_configs_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4126 (class 2606 OID 25075)
-- Name: account_status_logs account_status_logs_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_status_logs
    ADD CONSTRAINT account_status_logs_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4156 (class 2606 OID 25769)
-- Name: ai_analysis ai_analysis_acknowledged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_analysis
    ADD CONSTRAINT ai_analysis_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES public.users(id);


--
-- TOC entry 4157 (class 2606 OID 25754)
-- Name: ai_analysis ai_analysis_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_analysis
    ADD CONSTRAINT ai_analysis_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4158 (class 2606 OID 25759)
-- Name: ai_analysis ai_analysis_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_analysis
    ADD CONSTRAINT ai_analysis_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4159 (class 2606 OID 25764)
-- Name: ai_analysis ai_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_analysis
    ADD CONSTRAINT ai_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4153 (class 2606 OID 25605)
-- Name: api_access_tokens api_access_tokens_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_access_tokens
    ADD CONSTRAINT api_access_tokens_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4154 (class 2606 OID 25600)
-- Name: api_access_tokens api_access_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_access_tokens
    ADD CONSTRAINT api_access_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4155 (class 2606 OID 25621)
-- Name: api_rate_limits api_rate_limits_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_rate_limits
    ADD CONSTRAINT api_rate_limits_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.api_access_tokens(id) ON DELETE CASCADE;


--
-- TOC entry 4121 (class 2606 OID 24925)
-- Name: audit_logs audit_logs_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4122 (class 2606 OID 24930)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4102 (class 2606 OID 24950)
-- Name: brand_guidelines brand_guidelines_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_guidelines
    ADD CONSTRAINT brand_guidelines_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4103 (class 2606 OID 16512)
-- Name: brand_guidelines brand_guidelines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_guidelines
    ADD CONSTRAINT brand_guidelines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4141 (class 2606 OID 25403)
-- Name: competitive_analysis_results competitive_analysis_results_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitive_analysis_results
    ADD CONSTRAINT competitive_analysis_results_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4142 (class 2606 OID 25398)
-- Name: competitive_analysis_results competitive_analysis_results_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitive_analysis_results
    ADD CONSTRAINT competitive_analysis_results_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4143 (class 2606 OID 25393)
-- Name: competitive_analysis_results competitive_analysis_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitive_analysis_results
    ADD CONSTRAINT competitive_analysis_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4136 (class 2606 OID 25318)
-- Name: competitor_accounts competitor_accounts_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_accounts
    ADD CONSTRAINT competitor_accounts_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);


--
-- TOC entry 4137 (class 2606 OID 25313)
-- Name: competitor_accounts competitor_accounts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_accounts
    ADD CONSTRAINT competitor_accounts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4138 (class 2606 OID 25308)
-- Name: competitor_accounts competitor_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_accounts
    ADD CONSTRAINT competitor_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4139 (class 2606 OID 25342)
-- Name: competitor_metrics competitor_metrics_competitor_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_metrics
    ADD CONSTRAINT competitor_metrics_competitor_account_id_fkey FOREIGN KEY (competitor_account_id) REFERENCES public.competitor_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4140 (class 2606 OID 25365)
-- Name: competitor_post_metrics competitor_post_metrics_competitor_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competitor_post_metrics
    ADD CONSTRAINT competitor_post_metrics_competitor_account_id_fkey FOREIGN KEY (competitor_account_id) REFERENCES public.competitor_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4107 (class 2606 OID 16551)
-- Name: content content_brand_guidelines_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_brand_guidelines_id_fkey FOREIGN KEY (brand_guidelines_id) REFERENCES public.brand_guidelines(id);


--
-- TOC entry 4160 (class 2606 OID 25790)
-- Name: content_patterns content_patterns_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_patterns
    ADD CONSTRAINT content_patterns_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4161 (class 2606 OID 25795)
-- Name: content_patterns content_patterns_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_patterns
    ADD CONSTRAINT content_patterns_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4162 (class 2606 OID 25800)
-- Name: content_patterns content_patterns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_patterns
    ADD CONSTRAINT content_patterns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4108 (class 2606 OID 24945)
-- Name: content content_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4109 (class 2606 OID 16546)
-- Name: content content_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4135 (class 2606 OID 25238)
-- Name: data_cleanup_jobs data_cleanup_jobs_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_cleanup_jobs
    ADD CONSTRAINT data_cleanup_jobs_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4132 (class 2606 OID 25204)
-- Name: data_deduplication_log data_deduplication_log_duplicate_data_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_deduplication_log
    ADD CONSTRAINT data_deduplication_log_duplicate_data_id_fkey FOREIGN KEY (duplicate_data_id) REFERENCES public.raw_scraped_data(id) ON DELETE CASCADE;


--
-- TOC entry 4133 (class 2606 OID 25199)
-- Name: data_deduplication_log data_deduplication_log_original_data_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_deduplication_log
    ADD CONSTRAINT data_deduplication_log_original_data_id_fkey FOREIGN KEY (original_data_id) REFERENCES public.raw_scraped_data(id) ON DELETE CASCADE;


--
-- TOC entry 4134 (class 2606 OID 25220)
-- Name: data_retention_policies data_retention_policies_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_retention_policies
    ADD CONSTRAINT data_retention_policies_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4165 (class 2606 OID 25846)
-- Name: insight_analysis_results insight_analysis_results_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_analysis_results
    ADD CONSTRAINT insight_analysis_results_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4166 (class 2606 OID 25851)
-- Name: insight_analysis_results insight_analysis_results_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_analysis_results
    ADD CONSTRAINT insight_analysis_results_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4167 (class 2606 OID 25856)
-- Name: insight_analysis_results insight_analysis_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_analysis_results
    ADD CONSTRAINT insight_analysis_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4168 (class 2606 OID 25871)
-- Name: insight_patterns insight_patterns_insight_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_patterns
    ADD CONSTRAINT insight_patterns_insight_id_fkey FOREIGN KEY (insight_id) REFERENCES public.ai_analysis(id) ON DELETE CASCADE;


--
-- TOC entry 4169 (class 2606 OID 25876)
-- Name: insight_patterns insight_patterns_pattern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_patterns
    ADD CONSTRAINT insight_patterns_pattern_id_fkey FOREIGN KEY (pattern_id) REFERENCES public.content_patterns(id) ON DELETE CASCADE;


--
-- TOC entry 4163 (class 2606 OID 25824)
-- Name: insight_recommendations insight_recommendations_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_recommendations
    ADD CONSTRAINT insight_recommendations_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- TOC entry 4164 (class 2606 OID 25819)
-- Name: insight_recommendations insight_recommendations_insight_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insight_recommendations
    ADD CONSTRAINT insight_recommendations_insight_id_fkey FOREIGN KEY (insight_id) REFERENCES public.ai_analysis(id) ON DELETE CASCADE;


--
-- TOC entry 4145 (class 2606 OID 25430)
-- Name: market_position_snapshots market_position_snapshots_competitive_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_position_snapshots
    ADD CONSTRAINT market_position_snapshots_competitive_analysis_id_fkey FOREIGN KEY (competitive_analysis_id) REFERENCES public.competitive_analysis_results(id) ON DELETE CASCADE;


--
-- TOC entry 4130 (class 2606 OID 25181)
-- Name: normalized_data normalized_data_raw_data_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.normalized_data
    ADD CONSTRAINT normalized_data_raw_data_id_fkey FOREIGN KEY (raw_data_id) REFERENCES public.raw_scraped_data(id) ON DELETE CASCADE;


--
-- TOC entry 4131 (class 2606 OID 25186)
-- Name: normalized_data normalized_data_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.normalized_data
    ADD CONSTRAINT normalized_data_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4144 (class 2606 OID 25418)
-- Name: performance_gaps performance_gaps_competitive_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_gaps
    ADD CONSTRAINT performance_gaps_competitive_analysis_id_fkey FOREIGN KEY (competitive_analysis_id) REFERENCES public.competitive_analysis_results(id) ON DELETE CASCADE;


--
-- TOC entry 4118 (class 2606 OID 24911)
-- Name: permissions permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- TOC entry 4119 (class 2606 OID 24901)
-- Name: permissions permissions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4120 (class 2606 OID 24906)
-- Name: permissions permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4146 (class 2606 OID 25474)
-- Name: platform_best_practices platform_best_practices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_best_practices
    ADD CONSTRAINT platform_best_practices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4147 (class 2606 OID 25479)
-- Name: platform_best_practices platform_best_practices_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_best_practices
    ADD CONSTRAINT platform_best_practices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4148 (class 2606 OID 25500)
-- Name: platform_content_recommendations platform_content_recommendations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_content_recommendations
    ADD CONSTRAINT platform_content_recommendations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4149 (class 2606 OID 25505)
-- Name: platform_content_recommendations platform_content_recommendations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_content_recommendations
    ADD CONSTRAINT platform_content_recommendations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4110 (class 2606 OID 16572)
-- Name: post_metrics post_metrics_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content(id) ON DELETE CASCADE;


--
-- TOC entry 4111 (class 2606 OID 16577)
-- Name: post_metrics post_metrics_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_metrics
    ADD CONSTRAINT post_metrics_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4129 (class 2606 OID 25164)
-- Name: raw_scraped_data raw_scraped_data_social_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_scraped_data
    ADD CONSTRAINT raw_scraped_data_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 4104 (class 2606 OID 25099)
-- Name: social_accounts social_accounts_primary_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_primary_group_id_fkey FOREIGN KEY (primary_group_id) REFERENCES public.account_groups(id) ON DELETE SET NULL;


--
-- TOC entry 4105 (class 2606 OID 24940)
-- Name: social_accounts social_accounts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4106 (class 2606 OID 16530)
-- Name: social_accounts social_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4113 (class 2606 OID 24955)
-- Name: strategy_configs strategy_configs_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_configs
    ADD CONSTRAINT strategy_configs_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4114 (class 2606 OID 16613)
-- Name: strategy_configs strategy_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_configs
    ADD CONSTRAINT strategy_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4175 (class 2606 OID 26038)
-- Name: subscription_billing subscription_billing_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_billing
    ADD CONSTRAINT subscription_billing_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4176 (class 2606 OID 26033)
-- Name: subscription_billing subscription_billing_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_billing
    ADD CONSTRAINT subscription_billing_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4172 (class 2606 OID 26015)
-- Name: subscription_history subscription_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 4173 (class 2606 OID 26010)
-- Name: subscription_history subscription_history_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4174 (class 2606 OID 26005)
-- Name: subscription_history subscription_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4170 (class 2606 OID 25992)
-- Name: subscription_usage subscription_usage_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_usage
    ADD CONSTRAINT subscription_usage_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4171 (class 2606 OID 25987)
-- Name: subscription_usage subscription_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_usage
    ADD CONSTRAINT subscription_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4115 (class 2606 OID 24887)
-- Name: team_memberships team_memberships_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- TOC entry 4116 (class 2606 OID 24877)
-- Name: team_memberships team_memberships_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4117 (class 2606 OID 24882)
-- Name: team_memberships team_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4101 (class 2606 OID 24935)
-- Name: users users_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- TOC entry 4152 (class 2606 OID 25579)
-- Name: webhook_deliveries webhook_deliveries_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id) ON DELETE CASCADE;


--
-- TOC entry 4150 (class 2606 OID 25561)
-- Name: webhooks webhooks_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4151 (class 2606 OID 25556)
-- Name: webhooks webhooks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-08-06 07:31:17 UTC

--
-- PostgreSQL database dump complete
--

