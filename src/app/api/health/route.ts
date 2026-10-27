import { NextRequest, NextResponse } from 'next/server';
import { DB_ID, TABLE_ID, BUCKET_ID } from '@/lib/appwrite';

const targetRepo = 'appifya-android-engine';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const token = process.env.GITHUB_PAT || '';
  const owner = process.env.GITHUB_OWNER || 'mkharbouc';

  const checks: Record<string, { status: 'healthy' | 'degraded' | 'failed'; message: string; latencyMs?: number }> = {};

  // 1. Check Cloud Runner & GitHub Token
  if (!token) {
    checks.cloud_runner = {
      status: 'failed',
      message: 'GITHUB_PAT environment variable is not configured on the hosting server.',
    };
  } else {
    try {
      const runnerStart = Date.now();
      const res = await fetch(`https://api.github.com/repos/${owner}/${targetRepo}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Appifya-Health-Probe',
        },
        cache: 'no-store',
      });

      const runnerLatency = Date.now() - runnerStart;

      if (res.ok) {
        checks.cloud_runner = {
          status: 'healthy',
          message: `Connected to ${owner}/${targetRepo} successfully. Ready for customer APK builds.`,
          latencyMs: runnerLatency,
        };
      } else if (res.status === 401 || res.status === 403) {
        checks.cloud_runner = {
          status: 'failed',
          message: `GitHub PAT authentication failed (HTTP ${res.status}). Token may be expired or lack repo permissions.`,
          latencyMs: runnerLatency,
        };
      } else {
        checks.cloud_runner = {
          status: 'degraded',
          message: `Repository check returned HTTP ${res.status}`,
          latencyMs: runnerLatency,
        };
      }
    } catch (err) {
      checks.cloud_runner = {
        status: 'failed',
        message: err instanceof Error ? err.message : 'Failed to reach GitHub API',
      };
    }
  }

  // 2. Check Appwrite Database & Storage Config
  const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

  if (appwriteEndpoint && appwriteProjectId && DB_ID && TABLE_ID && BUCKET_ID) {
    checks.database_storage = {
      status: 'healthy',
      message: 'Appwrite database, table & storage bucket variables are configured.',
    };
  } else {
    checks.database_storage = {
      status: 'degraded',
      message: 'Some Appwrite configuration variables are missing or undefined.',
    };
  }

  // 3. Overall Platform Status
  const isHealthy = Object.values(checks).every((c) => c.status === 'healthy');
  const hasFailures = Object.values(checks).some((c) => c.status === 'failed');
  const overallStatus = isHealthy ? 'healthy' : hasFailures ? 'action_required' : 'degraded';

  const responsePayload = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    executionTimeMs: Date.now() - startTime,
    platform: 'Appifya Cloud Engine',
    checks,
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : hasFailures ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
