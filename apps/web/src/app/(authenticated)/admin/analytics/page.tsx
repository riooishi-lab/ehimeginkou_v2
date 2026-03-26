import { prisma } from '@monorepo/database/client'
import { FiBarChart2 } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'

export default async function Page() {
  const [totalStudents, totalVideos, watchEvents, videos, students] = await Promise.all([
    prisma.visibleStudent.count(),
    prisma.visibleVideo.count(),
    prisma.watchEvent.findMany({
      select: {
        id: true,
        studentId: true,
        videoId: true,
        eventType: true,
        createdAt: true,
      },
    }),
    prisma.visibleVideo.findMany({
      select: { id: true, title: true, category: true },
    }),
    prisma.visibleStudent.findMany({
      select: { id: true, name: true },
    }),
  ])

  const playEvents = watchEvents.filter((e) => e.eventType === 'PLAY')
  const heartbeatEvents = watchEvents.filter((e) => e.eventType === 'HEARTBEAT')

  const uniqueViewers = new Set(playEvents.map((e) => e.studentId)).size
  const totalViews = playEvents.length
  const estimatedWatchTimeSec = heartbeatEvents.length * 30

  const videoStats = videos.map((video) => {
    const videoPlays = playEvents.filter((e) => e.videoId === video.id)
    const videoHeartbeats = heartbeatEvents.filter((e) => e.videoId === video.id)
    const viewers = new Set(videoPlays.map((e) => e.studentId)).size
    return {
      id: video.id,
      title: video.title,
      category: video.category,
      viewers,
      views: videoPlays.length,
      watchTimeSec: videoHeartbeats.length * 30,
    }
  })

  const studentStats = students.map((student) => {
    const studentPlays = playEvents.filter((e) => e.studentId === student.id)
    const studentHeartbeats = heartbeatEvents.filter((e) => e.studentId === student.id)
    const videosWatched = new Set(studentPlays.map((e) => e.videoId)).size
    return {
      id: student.id,
      name: student.name,
      videosWatched,
      totalViews: studentPlays.length,
      watchTimeSec: studentHeartbeats.length * 30,
    }
  })

  return (
    <div>
      <PageHeader icon={<FiBarChart2 size={24} />} title='分析' subtitle='視聴データの分析・概要' />
      <AnalyticsDashboard
        totalStudents={totalStudents}
        totalVideos={totalVideos}
        uniqueViewers={uniqueViewers}
        totalViews={totalViews}
        estimatedWatchTimeSec={estimatedWatchTimeSec}
        videoStats={videoStats}
        studentStats={studentStats}
      />
    </div>
  )
}
