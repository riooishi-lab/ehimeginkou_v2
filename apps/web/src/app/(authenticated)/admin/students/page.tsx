import { prisma } from '@monorepo/database/client'
import { FiUsers } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { searchParamsCache } from '../../../../utils/searchParams'
import { StudentList } from './components/StudentList'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: Props) {
  const { search, page, pageSize } = await searchParamsCache.parse(searchParams)

  const whereClause = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { university: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const students = await prisma.visibleStudent.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return (
    <div>
      <PageHeader icon={<FiUsers size={24} />} title='学生管理' subtitle='学生情報の管理・CSV取り込み・メール送信' />
      <StudentList students={students} />
    </div>
  )
}
