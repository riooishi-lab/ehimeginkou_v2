'use server'

import type { VideoCategory } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { type ActionState, errorResult, successResult } from '../../utils/actionResult'

export async function createVideo(_prevState: ActionState, formData: FormData) {
  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const category = formData.get('category') as VideoCategory | null
  const subcategory = formData.get('subcategory') as string | null
  const videoUrl = formData.get('videoUrl') as string | null
  const thumbnailUrl = formData.get('thumbnailUrl') as string | null
  const durationSec = formData.get('durationSec') as string | null

  if (!title || !category || !videoUrl) {
    return errorResult('タイトル、カテゴリ、動画URLは必須です')
  }

  try {
    await prisma.video.create({
      data: {
        title,
        description: description || null,
        category,
        subcategory: subcategory || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        durationSec: durationSec ? Number.parseInt(durationSec, 10) : null,
      },
    })
  } catch {
    return errorResult('動画の作成に失敗しました')
  }

  revalidatePath('/admin/videos')
  return successResult()
}
