'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function deleteVideo(_prevState: ActionState, formData: FormData) {
  const id = parsePositiveInt(formData.get('id'))

  if (!id) {
    return errorResult('動画IDが不正です')
  }

  try {
    await prisma.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('動画の削除に失敗しました')
  }

  revalidatePath('/admin/videos')
  return successResult()
}
