'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'

type ImportResult = {
  status: 'success' | 'error'
  imported: number
  skipped: number
  errors: string[]
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

export async function importStudentsCsv(_prevState: ImportResult | null, formData: FormData): Promise<ImportResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { status: 'error', imported: 0, skipped: 0, errors: ['ファイルが選択されていません'] }
  }

  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length < 2) {
    return { status: 'error', imported: 0, skipped: 0, errors: ['CSVにデータがありません'] }
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const nameIdx = headers.findIndex((h) => h === 'name' || h === '氏名')
  const emailIdx = headers.findIndex((h) => h === 'email' || h === 'メール' || h === 'メールアドレス')
  const phoneIdx = headers.findIndex((h) => h === 'phone' || h === '電話' || h === '電話番号')
  const universityIdx = headers.findIndex((h) => h === 'university' || h === '大学' || h === '大学名')
  const departmentIdx = headers.findIndex((h) => h === 'department' || h === '学部' || h === '学部名')
  const atsIdIdx = headers.findIndex((h) => h === 'ats_id' || h === 'atsid')

  if (nameIdx === -1 || emailIdx === -1) {
    return { status: 'error', imported: 0, skipped: 0, errors: ['CSVに「name/氏名」と「email/メール」列が必要です'] }
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  const dataLines = lines.slice(1)
  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCsvLine(dataLines[i])
    const name = fields[nameIdx]
    const email = fields[emailIdx]

    if (!name || !email) {
      errors.push(`${i + 2}行目: 氏名またはメールが空です`)
      skipped++
      continue
    }

    const token = randomBytes(32).toString('hex')
    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    try {
      await prisma.student.upsert({
        where: { email },
        update: {
          name,
          phone: phoneIdx >= 0 ? fields[phoneIdx] || null : null,
          university: universityIdx >= 0 ? fields[universityIdx] || null : null,
          department: departmentIdx >= 0 ? fields[departmentIdx] || null : null,
          atsId: atsIdIdx >= 0 ? fields[atsIdIdx] || null : null,
        },
        create: {
          name,
          email,
          phone: phoneIdx >= 0 ? fields[phoneIdx] || null : null,
          university: universityIdx >= 0 ? fields[universityIdx] || null : null,
          department: departmentIdx >= 0 ? fields[departmentIdx] || null : null,
          atsId: atsIdIdx >= 0 ? fields[atsIdIdx] || null : null,
          token,
          tokenExpiresAt,
        },
      })
      imported++
    } catch {
      errors.push(`${i + 2}行目: ${email}の登録に失敗しました`)
      skipped++
    }
  }

  revalidatePath('/admin/students')
  return { status: 'success', imported, skipped, errors }
}
