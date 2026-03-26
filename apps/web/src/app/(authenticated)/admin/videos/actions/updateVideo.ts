'use server'

import type { VideoCategory } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function updateVideo(_prevState: ActionState, formData: FormData) {
  const id = parsePositiveInt(formData.get('id'))
  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const category = formData.get('category') as VideoCategory | null
  const subcategory = formData.get('subcategory') as string | null
  const videoUrl = formData.get('videoUrl') as string | null
  const thumbnailUrl = formData.get('thumbnailUrl') as string | null
  const durationSec = formData.get('durationSec') as string | null
  const isPublished = formData.get('isPublished') === 'true'
  const isPinned = formData.get('isPinned') === 'true'

  if (!id || !title || !category || !videoUrl) {
    return errorResult('必須項目が不足しています')
  }

  try {
    await prisma.video.update({
      where: { id },
      data: {
        title,
        description: description || null,
        category,
        subcategory: subcategory || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        durationSec: durationSec ? Number.parseInt(durationSec, 10) : null,
        isPublished,
        isPinned,
      },
    })
  } catch {
    return errorResult('動画の更新に失敗しました')
  }

  revalidatePath('/admin/videos')
  return successResult()
}
