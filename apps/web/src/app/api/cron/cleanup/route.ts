import { prisma } from '@monorepo/database/client'
import { type NextRequest, NextResponse } from 'next/server'

const RETENTION_DAYS = 90
/* biome-ignore lint/style/noProcessEnv: CRON_SECRET is a Vercel-provided env var for cron authentication */
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)

  const deleted = await prisma.$queryRaw<[{ count: bigint }]>`
    DELETE FROM sub.watch_events
    WHERE event_type = 'HEARTBEAT'
    AND created_at < ${cutoffDate}
    RETURNING COUNT(*) OVER() AS count
  `

  const deletedCount = Number(deleted[0]?.count ?? 0)

  return NextResponse.json({
    deleted: deletedCount,
    cutoffDate: cutoffDate.toISOString(),
    retentionDays: RETENTION_DAYS,
  })
}
