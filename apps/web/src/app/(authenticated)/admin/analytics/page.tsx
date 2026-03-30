import type { VideoCategory } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { FiBarChart2 } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'

type VideoStatRow = {
  video_id: number
  title: string
  category: VideoCategory
  viewers: bigint
  views: bigint
  heartbeats: bigint
}

type StudentStatRow = {
  student_id: number
  name: string
  videos_watched: bigint
  total_views: bigint
  heartbeats: bigint
}

type SummaryRow = {
  unique_viewers: bigint
  total_views: bigint
  heartbeats: bigint
}

export default async function Page() {
  try {
    const [totalStudents, totalVideos, summaryRows, videoStatRows, studentStatRows] = await Promise.all([
      prisma.visibleStudent.count(),
      prisma.visibleVideo.count(),
      prisma.$queryRaw<SummaryRow[]>`
        SELECT
          COUNT(DISTINCT CASE WHEN event_type = 'PLAY' THEN student_id END) AS unique_viewers,
          COUNT(CASE WHEN event_type = 'PLAY' THEN 1 END) AS total_views,
          COUNT(CASE WHEN event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
        FROM sub.watch_events
      `,
      prisma.$queryRaw<VideoStatRow[]>`
        SELECT
          v.id AS video_id, v.title, v.category,
          COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.student_id END) AS viewers,
          COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS views,
          COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
        FROM sub.visible_videos v
        LEFT JOIN sub.watch_events we ON we.video_id = v.id
        GROUP BY v.id, v.title, v.category
        ORDER BY views DESC
      `,
      prisma.$queryRaw<StudentStatRow[]>`
        SELECT
          s.id AS student_id, s.name,
          COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.video_id END) AS videos_watched,
          COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS total_views,
          COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
        FROM sub.visible_students s
        LEFT JOIN sub.watch_events we ON we.student_id = s.id
        GROUP BY s.id, s.name
        ORDER BY heartbeats DESC
      `,
    ])

    const summary = summaryRows[0] ?? { unique_viewers: 0n, total_views: 0n, heartbeats: 0n }

    const videoStats = videoStatRows.map((r) => ({
      id: Number(r.video_id),
      title: r.title,
      category: r.category,
      viewers: Number(r.viewers),
      views: Number(r.views),
      watchTimeSec: Number(r.heartbeats) * 30,
    }))

    const studentStats = studentStatRows.map((r) => ({
      id: Number(r.student_id),
      name: r.name,
      videosWatched: Number(r.videos_watched),
      totalViews: Number(r.total_views),
      watchTimeSec: Number(r.heartbeats) * 30,
    }))

    return (
      <div>
        <PageHeader icon={<FiBarChart2 size={24} />} title='分析' subtitle='視聴データの分析・概要' />
        <AnalyticsDashboard
          totalStudents={totalStudents}
          totalVideos={totalVideos}
          uniqueViewers={Number(summary.unique_viewers)}
          totalViews={Number(summary.total_views)}
          estimatedWatchTimeSec={Number(summary.heartbeats) * 30}
          videoStats={videoStats}
          studentStats={studentStats}
        />
      </div>
    )
  } catch {
    return (
      <div>
        <PageHeader icon={<FiBarChart2 size={24} />} title='分析' subtitle='視聴データの分析・概要' />
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>データの読み込みに失敗しました。ページを再読み込みしてください。</p>
        </div>
      </div>
    )
  }
}
