import { prisma } from '@monorepo/database/client'
import { FiVideo } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { VideoList } from './components/VideoList'

export default async function Page() {
  const videos = await prisma.visibleVideo.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <PageHeader icon={<FiVideo size={24} />} title='動画管理' subtitle='採用動画の追加・編集・公開管理' />
      <VideoList videos={videos} />
    </div>
  )
}
