'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function deleteStudent(_prevState: ActionState, formData: FormData) {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const id = parsePositiveInt(formData.get('id'))

  if (!id) {
    return errorResult('学生IDが不正です')
  }

  try {
    await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('学生の削除に失敗しました')
  }

  revalidatePath('/admin/students')
  return successResult()
}
