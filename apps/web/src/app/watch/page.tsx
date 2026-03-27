import { prisma } from '@monorepo/database/client'
import { StudentPortal } from './components/StudentPortal'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
        }}
      >
        <p>アクセストークンが必要です。</p>
      </div>
    )
  }

  const student = await prisma.visibleStudent.findFirst({
    where: { token },
  })

  if (!student) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
        }}
      >
        <p>無効なトークンです。</p>
      </div>
    )
  }

  if (new Date(student.tokenExpiresAt) < new Date()) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
        }}
      >
        <p>トークンの有効期限が切れています。担当者にお問い合わせください。</p>
      </div>
    )
  }

  const videos = await prisma.visibleVideo.findMany({
    where: { isPublished: true },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })

  const watchEvents = await prisma.watchEvent.findMany({
    where: { studentId: student.id, eventType: 'PLAY' },
    select: { videoId: true },
    distinct: ['videoId'],
  })

  const watchedVideoIds = watchEvents.map((e) => e.videoId)

  return <StudentPortal studentName={student.name} token={token} videos={videos} watchedVideoIds={watchedVideoIds} />
}
