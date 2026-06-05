/**
 * Next.js Instrumentation
 * This file is called once when the Next.js server starts.
 * Used to initialize the cron scheduler for scheduled email jobs.
 */

export async function register() {
  // Only run on the server (not during build or edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCron } = await import('./lib/cron')
    initCron()
  }
}
