import { prisma } from '@monorepo/database/client'
import { FiHome } from 'react-icons/fi'
import { PageHeader } from '../../components/common/PageHeader'
import { Dashboard } from './components/Dashboard'

type SummaryRow = {
  unique_viewers: bigint
  total_views: bigint
  today_views: bigint
  heartbeats: bigint
}

export default async function Page() {
  const [publishedVideos, totalStudents, summaryRows, recentVideos, recentStudents] = await Promise.all([
    prisma.visibleVideo.count({ where: { isPublished: true } }),
    prisma.visibleStudent.count(),
    prisma.$queryRaw<SummaryRow[]>`
      SELECT
        COUNT(DISTINCT CASE WHEN event_type = 'PLAY' THEN student_id END) AS unique_viewers,
        COUNT(CASE WHEN event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN event_type = 'PLAY' AND created_at >= CURRENT_DATE THEN 1 END) AS today_views,
        COUNT(CASE WHEN event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.watch_events
    `,
    prisma.visibleVideo.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, category: true, isPublished: true, createdAt: true },
    }),
    prisma.visibleStudent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, university: true, createdAt: true },
    }),
  ])

  const summary = summaryRows[0] ?? { unique_viewers: 0n, total_views: 0n, today_views: 0n, heartbeats: 0n }

  return (
    <div>
      <PageHeader icon={<FiHome size={24} />} title='ダッシュボード' subtitle='採用動画管理の概要' />
      <Dashboard
        publishedVideos={publishedVideos}
        totalStudents={totalStudents}
        uniqueViewers={Number(summary.unique_viewers)}
        totalViews={Number(summary.total_views)}
        todayViews={Number(summary.today_views)}
        estimatedWatchTimeSec={Number(summary.heartbeats) * 30}
        recentVideos={recentVideos}
        recentStudents={recentStudents}
      />
    </div>
  )
}
