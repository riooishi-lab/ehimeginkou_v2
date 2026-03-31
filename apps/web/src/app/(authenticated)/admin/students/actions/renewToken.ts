'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function renewStudentToken(_prevState: ActionState, formData: FormData) {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const id = parsePositiveInt(formData.get('studentId'))
  if (!id) {
    return errorResult('学生IDが不正です')
  }

  const token = randomBytes(32).toString('hex')
  const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  try {
    await prisma.student.update({
      where: { id },
      data: { token, tokenExpiresAt },
    })
  } catch {
    return errorResult('トークンの更新に失敗しました')
  }

  revalidatePath('/admin/students')
  return successResult()
}
