'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'

type ImportResult = {
  status: 'success' | 'error'
  imported: number
  skipped: number
  errors: string[]
}

type ColumnIndices = {
  nameIdx: number
  emailIdx: number
  phoneIdx: number
  universityIdx: number
  departmentIdx: number
  atsIdIdx: number
}

const HEADER_ALIASES: Record<keyof ColumnIndices, string[]> = {
  nameIdx: ['name', '氏名'],
  emailIdx: ['email', 'メール', 'メールアドレス'],
  phoneIdx: ['phone', '電話', '電話番号'],
  universityIdx: ['university', '大学', '大学名'],
  departmentIdx: ['department', '学部', '学部名'],
  atsIdIdx: ['ats_id', 'atsid'],
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function resolveColumnIndices(headers: string[]): ColumnIndices {
  const normalized = headers.map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const findIdx = (aliases: string[]) => normalized.findIndex((h) => aliases.includes(h))

  return {
    nameIdx: findIdx(HEADER_ALIASES.nameIdx),
    emailIdx: findIdx(HEADER_ALIASES.emailIdx),
    phoneIdx: findIdx(HEADER_ALIASES.phoneIdx),
    universityIdx: findIdx(HEADER_ALIASES.universityIdx),
    departmentIdx: findIdx(HEADER_ALIASES.departmentIdx),
    atsIdIdx: findIdx(HEADER_ALIASES.atsIdIdx),
  }
}

function optionalField(fields: string[], idx: number): string | null {
  if (idx < 0) return null
  const value = fields[idx]?.trim()
  return value || null
}

function errorImportResult(errors: string[]): ImportResult {
  return { status: 'error', imported: 0, skipped: 0, errors }
}

async function upsertStudent(fields: string[], indices: ColumnIndices) {
  const name = indices.nameIdx >= 0 ? fields[indices.nameIdx]?.trim() : undefined
  const email = indices.emailIdx >= 0 ? fields[indices.emailIdx]?.trim() : undefined
  if (!name || !email) throw new Error('名前またはメールアドレスが空です')
  const optionalData = {
    phone: optionalField(fields, indices.phoneIdx),
    university: optionalField(fields, indices.universityIdx),
    department: optionalField(fields, indices.departmentIdx),
    atsId: optionalField(fields, indices.atsIdIdx),
  }

  const token = randomBytes(32).toString('hex')
  const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.student.upsert({
    where: { email },
    update: { name, ...optionalData },
    create: { name, email, ...optionalData, token, tokenExpiresAt },
  })
}

export async function importStudentsCsv(_prevState: ImportResult | null, formData: FormData): Promise<ImportResult> {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorImportResult(['この操作を実行する権限がありません'])
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return errorImportResult(['ファイルが選択されていません'])
  }

  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) {
    return errorImportResult(['CSVにデータがありません'])
  }

  const indices = resolveColumnIndices(parseCsvLine(lines[0]))
  if (indices.nameIdx === -1 || indices.emailIdx === -1) {
    return errorImportResult(['CSVに「name/氏名」と「email/メール」列が必要です'])
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  const dataLines = lines.slice(1)
  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCsvLine(dataLines[i])
    const rowNum = i + 2

    if (!fields[indices.nameIdx] || !fields[indices.emailIdx]) {
      errors.push(`${rowNum}行目: 氏名またはメールが空です`)
      skipped++
      continue
    }

    try {
      await upsertStudent(fields, indices)
      imported++
    } catch {
      errors.push(`${rowNum}行目: ${fields[indices.emailIdx]}の登録に失敗しました`)
      skipped++
    }
  }

  revalidatePath('/admin/students')
  return { status: 'success', imported, skipped, errors }
}
