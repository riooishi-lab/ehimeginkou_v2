import { prisma } from '@monorepo/database/client'
import { FiUsers } from 'react-icons/fi'
import { PageHeader } from '../../../../components/common/PageHeader'
import { StudentList } from './components/StudentList'

export default async function Page() {
  const students = await prisma.visibleStudent.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <PageHeader icon={<FiUsers size={24} />} title='学生管理' subtitle='学生情報の管理・CSV取り込み・メール送信' />
      <StudentList students={students} />
    </div>
  )
}
