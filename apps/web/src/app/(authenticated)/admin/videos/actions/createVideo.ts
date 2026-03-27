'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, successResult } from '../../utils/actionResult'
import { isVideoCategory } from '../constants'

export async function createVideo(_prevState: ActionState, formData: FormData) {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const rawCategory = formData.get('category')
  const subcategory = formData.get('subcategory') as string | null
  const videoUrl = formData.get('videoUrl') as string | null
  const thumbnailUrl = formData.get('thumbnailUrl') as string | null
  const durationSec = formData.get('durationSec') as string | null

  if (!title || !videoUrl) {
    return errorResult('タイトル、カテゴリ、動画URLは必須です')
  }

  if (!isVideoCategory(rawCategory)) {
    return errorResult('タイトル、カテゴリ、動画URLは必須です')
  }

  try {
    await prisma.video.create({
      data: {
        title,
        description: description || null,
        category: rawCategory,
        subcategory: subcategory || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        durationSec: durationSec ? (Number.isNaN(Number(durationSec)) ? null : Number.parseInt(durationSec, 10)) : null,
      },
    })
  } catch {
    return errorResult('動画の作成に失敗しました')
  }

  revalidatePath('/admin/videos')
  return successResult()
}
