'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, successResult } from '../../utils/actionResult'

export async function createStudent(_prevState: ActionState, formData: FormData) {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const name = formData.get('name') as string | null
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const university = formData.get('university') as string | null
  const department = formData.get('department') as string | null
  const atsId = formData.get('atsId') as string | null

  if (!name || !email) {
    return errorResult('氏名とメールアドレスは必須です')
  }

  const token = randomBytes(32).toString('hex')
  const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  try {
    await prisma.student.create({
      data: {
        name,
        email,
        phone: phone || null,
        university: university || null,
        department: department || null,
        atsId: atsId || null,
        token,
        tokenExpiresAt,
      },
    })
  } catch {
    return errorResult('学生の作成に失敗しました。メールアドレスが重複している可能性があります')
  }

  revalidatePath('/admin/students')
  return successResult()
}
