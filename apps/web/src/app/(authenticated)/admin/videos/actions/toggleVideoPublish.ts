'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function toggleVideoPublish(_prevState: ActionState, formData: FormData) {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const id = parsePositiveInt(formData.get('id'))
  const isPublished = formData.get('isPublished') === 'true'

  if (!id) {
    return errorResult('動画IDが不正です')
  }

  try {
    await prisma.video.update({
      where: { id },
      data: { isPublished },
    })
  } catch {
    return errorResult('公開状態の変更に失敗しました')
  }

  revalidatePath('/admin/videos')
  return successResult()
}
