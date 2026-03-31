'use server'

import { prisma } from '@monorepo/database/client'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'

type ExportResult = {
  status: 'success' | 'error'
  csv?: string
  errorMessage?: string
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDateJp(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ja-JP')
}

export async function exportStudentsCsv(): Promise<ExportResult> {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return { status: 'error', errorMessage: 'この操作を実行する権限がありません' }
  }

  try {
    const students = await prisma.visibleStudent.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const studentIds = students.map((s) => s.id)

    const watchStats = await prisma.watchEvent.groupBy({
      by: ['studentId'],
      where: { studentId: { in: studentIds } },
      _count: { id: true },
      _max: { createdAt: true },
    })

    const videoCountByStudent = await prisma.watchEvent.groupBy({
      by: ['studentId', 'videoId'],
      where: {
        studentId: { in: studentIds },
        eventType: 'PLAY',
      },
    })

    const heartbeatCounts = await prisma.watchEvent.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        eventType: 'HEARTBEAT',
      },
      _count: { id: true },
    })

    const statsMap = new Map(watchStats.map((s) => [s.studentId, s]))
    const heartbeatMap = new Map(heartbeatCounts.map((h) => [h.studentId, h._count.id]))

    const videoCountMap = new Map<number, number>()
    videoCountByStudent.forEach((row) => {
      const current = videoCountMap.get(row.studentId) ?? 0
      videoCountMap.set(row.studentId, current + 1)
    })

    const headers = [
      '名前',
      'メール',
      '大学',
      '学部',
      '視聴動画数',
      '総再生回数',
      '総視聴時間(分)',
      '最終視聴日',
      'トークン有効期限',
    ]

    const rows = students.map((student) => {
      const stats = statsMap.get(student.id)
      const heartbeats = heartbeatMap.get(student.id) ?? 0
      const watchMinutes = Math.round((heartbeats * 5) / 60)

      return [
        escapeCsvField(student.name),
        escapeCsvField(student.email),
        escapeCsvField(student.university ?? ''),
        escapeCsvField(student.department ?? ''),
        String(videoCountMap.get(student.id) ?? 0),
        String(stats?._count.id ?? 0),
        String(watchMinutes),
        formatDateJp(stats?._max.createdAt ?? null),
        formatDateJp(student.tokenExpiresAt),
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    return { status: 'success', csv }
  } catch {
    return { status: 'error', errorMessage: 'エクスポートに失敗しました' }
  }
}
