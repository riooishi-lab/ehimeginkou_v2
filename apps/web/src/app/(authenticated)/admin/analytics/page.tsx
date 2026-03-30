import type { VideoCategory } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { FiBarChart2 } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { searchParamsCache } from '../../../../utils/searchParams'
import { AnalyticsView } from './components/AnalyticsView'

type SummaryRow = {
  unique_viewers: bigint
  total_views: bigint
  heartbeats: bigint
}

type StudentStatRow = {
  student_id: number
  name: string
  university: string | null
  videos_watched: bigint
  total_views: bigint
  completion_count: bigint
  heartbeats: bigint
  last_watch: Date | null
}

type UniversityStatRow = {
  university: string
  student_count: bigint
  viewers: bigint
  total_views: bigint
  heartbeats: bigint
}

type DailyStatRow = {
  day: Date
  unique_viewers: bigint
  total_views: bigint
  heartbeats: bigint
}

type HourlyStatRow = {
  hour: number
  total_views: bigint
  heartbeats: bigint
}

type DayOfWeekStatRow = {
  dow: number
  total_views: bigint
  heartbeats: bigint
}

type VideoStatRow = {
  video_id: number
  title: string
  category: VideoCategory
  viewers: bigint
  views: bigint
  completions: bigint
  heartbeats: bigint
}

type CategoryStatRow = {
  category: VideoCategory
  video_count: bigint
  viewers: bigint
  views: bigint
  heartbeats: bigint
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function fetchPersonData() {
  const [studentRows, universityRows] = await Promise.all([
    prisma.$queryRaw<StudentStatRow[]>`
      SELECT
        s.id AS student_id,
        s.name,
        s.university,
        COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.video_id END) AS videos_watched,
        COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN we.event_type = 'ENDED' THEN 1 END) AS completion_count,
        COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats,
        MAX(CASE WHEN we.event_type = 'PLAY' THEN we.created_at END) AS last_watch
      FROM sub.visible_students s
      LEFT JOIN sub.watch_events we ON we.student_id = s.id
      GROUP BY s.id, s.name, s.university
      ORDER BY heartbeats DESC
    `,
    prisma.$queryRaw<UniversityStatRow[]>`
      SELECT
        COALESCE(s.university, '未設定') AS university,
        COUNT(DISTINCT s.id) AS student_count,
        COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN s.id END) AS viewers,
        COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.visible_students s
      LEFT JOIN sub.watch_events we ON we.student_id = s.id
      GROUP BY COALESCE(s.university, '未設定')
      ORDER BY heartbeats DESC
    `,
  ])

  return {
    students: studentRows.map((r) => ({
      id: Number(r.student_id),
      name: r.name,
      university: r.university,
      videosWatched: Number(r.videos_watched),
      totalViews: Number(r.total_views),
      completionCount: Number(r.completion_count),
      watchTimeSec: Number(r.heartbeats) * 30,
      lastWatch: r.last_watch,
    })),
    universities: universityRows.map((r) => ({
      university: r.university,
      studentCount: Number(r.student_count),
      viewers: Number(r.viewers),
      totalViews: Number(r.total_views),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
  }
}

async function fetchTimeData() {
  const [dailyRows, hourlyRows, dowRows] = await Promise.all([
    prisma.$queryRaw<DailyStatRow[]>`
      SELECT
        d.day::date AS day,
        COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.student_id END) AS unique_viewers,
        COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '13 days',
          CURRENT_DATE,
          '1 day'
        )::date AS day
      ) d
      LEFT JOIN sub.watch_events we ON we.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
    `,
    prisma.$queryRaw<HourlyStatRow[]>`
      SELECT
        EXTRACT(HOUR FROM created_at)::int AS hour,
        COUNT(CASE WHEN event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.watch_events
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `,
    prisma.$queryRaw<DayOfWeekStatRow[]>`
      SELECT
        EXTRACT(DOW FROM created_at)::int AS dow,
        COUNT(CASE WHEN event_type = 'PLAY' THEN 1 END) AS total_views,
        COUNT(CASE WHEN event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.watch_events
      GROUP BY EXTRACT(DOW FROM created_at)
      ORDER BY dow ASC
    `,
  ])

  return {
    daily: dailyRows.map((r) => ({
      day: r.day,
      uniqueViewers: Number(r.unique_viewers),
      totalViews: Number(r.total_views),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
    hourly: hourlyRows.map((r) => ({
      hour: r.hour,
      totalViews: Number(r.total_views),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
    dayOfWeek: dowRows.map((r) => ({
      dow: r.dow,
      totalViews: Number(r.total_views),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
  }
}

async function fetchVideoData() {
  const [videoRows, categoryRows] = await Promise.all([
    prisma.$queryRaw<VideoStatRow[]>`
      SELECT
        v.id AS video_id,
        v.title,
        v.category,
        COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.student_id END) AS viewers,
        COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS views,
        COUNT(CASE WHEN we.event_type = 'ENDED' THEN 1 END) AS completions,
        COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.visible_videos v
      LEFT JOIN sub.watch_events we ON we.video_id = v.id
      GROUP BY v.id, v.title, v.category
      ORDER BY views DESC
    `,
    prisma.$queryRaw<CategoryStatRow[]>`
      SELECT
        v.category,
        COUNT(DISTINCT v.id) AS video_count,
        COUNT(DISTINCT CASE WHEN we.event_type = 'PLAY' THEN we.student_id END) AS viewers,
        COUNT(CASE WHEN we.event_type = 'PLAY' THEN 1 END) AS views,
        COUNT(CASE WHEN we.event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
      FROM sub.visible_videos v
      LEFT JOIN sub.watch_events we ON we.video_id = v.id
      GROUP BY v.category
      ORDER BY views DESC
    `,
  ])

  return {
    videos: videoRows.map((r) => ({
      id: Number(r.video_id),
      title: r.title,
      category: r.category,
      viewers: Number(r.viewers),
      views: Number(r.views),
      completions: Number(r.completions),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
    categories: categoryRows.map((r) => ({
      category: r.category,
      videoCount: Number(r.video_count),
      viewers: Number(r.viewers),
      views: Number(r.views),
      watchTimeSec: Number(r.heartbeats) * 30,
    })),
  }
}

export default async function Page({ searchParams }: Props) {
  try {
    const { tabIndex } = await searchParamsCache.parse(searchParams)

    const [totalStudents, totalVideos, summaryRows, personData, timeData, videoData] = await Promise.all([
      prisma.visibleStudent.count(),
      prisma.visibleVideo.count(),
      prisma.$queryRaw<SummaryRow[]>`
        SELECT
          COUNT(DISTINCT CASE WHEN event_type = 'PLAY' THEN student_id END) AS unique_viewers,
          COUNT(CASE WHEN event_type = 'PLAY' THEN 1 END) AS total_views,
          COUNT(CASE WHEN event_type = 'HEARTBEAT' THEN 1 END) AS heartbeats
        FROM sub.watch_events
      `,
      tabIndex === 0 ? fetchPersonData() : Promise.resolve(null),
      tabIndex === 1 ? fetchTimeData() : Promise.resolve(null),
      tabIndex === 2 ? fetchVideoData() : Promise.resolve(null),
    ])

    const summary = summaryRows[0] ?? { unique_viewers: 0n, total_views: 0n, heartbeats: 0n }

    return (
      <div>
        <PageHeader icon={<FiBarChart2 size={24} />} title='分析' subtitle='視聴データの分析・概要' />
        <AnalyticsView
          totalStudents={totalStudents}
          totalVideos={totalVideos}
          uniqueViewers={Number(summary.unique_viewers)}
          totalViews={Number(summary.total_views)}
          estimatedWatchTimeSec={Number(summary.heartbeats) * 30}
          tabIndex={tabIndex}
          personData={personData}
          timeData={timeData}
          videoData={videoData}
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
