import { prisma } from '@monorepo/database/client'
import { FiHome } from 'react-icons/fi'
import { PageHeader } from '../../components/common/PageHeader'
import { Dashboard } from './components/Dashboard'

export default async function Page() {
  const [publishedVideos, totalStudents, watchEvents, recentVideos, recentStudents] = await Promise.all([
    prisma.visibleVideo.count({ where: { isPublished: true } }),
    prisma.visibleStudent.count(),
    prisma.watchEvent.findMany({
      select: { studentId: true, videoId: true, eventType: true, createdAt: true },
    }),
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

  const playEvents = watchEvents.filter((e) => e.eventType === 'PLAY')
  const heartbeatEvents = watchEvents.filter((e) => e.eventType === 'HEARTBEAT')

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayViews = playEvents.filter((e) => e.createdAt >= todayStart).length

  return (
    <div>
      <PageHeader icon={<FiHome size={24} />} title='ダッシュボード' subtitle='採用動画管理の概要' />
      <Dashboard
        publishedVideos={publishedVideos}
        totalStudents={totalStudents}
        uniqueViewers={new Set(playEvents.map((e) => e.studentId)).size}
        totalViews={playEvents.length}
        todayViews={todayViews}
        estimatedWatchTimeSec={heartbeatEvents.length * 30}
        recentVideos={recentVideos}
        recentStudents={recentStudents}
      />
    </div>
  )
}
