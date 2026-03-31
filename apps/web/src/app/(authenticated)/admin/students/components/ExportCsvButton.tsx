'use client'

import { useCallback, useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { exportStudentsCsv } from '../actions/exportStudentsCsv'

type Props = {
  onError: (message: string) => void
}

export function ExportCsvButton({ onError }: Props) {
  const [loading, setLoading] = useState(false)

  const handleExport = useCallback(async () => {
    setLoading(true)
    try {
      const result = await exportStudentsCsv()
      if (result.status === 'error') {
        onError(result.errorMessage ?? 'エクスポートに失敗しました')
        return
      }

      if (!result.csv) {
        onError('データがありません')
        return
      }

      const bom = '\uFEFF'
      const blob = new Blob([`${bom}${result.csv}`], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `students_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }, [onError])

  return (
    <Button size='md' theme='secondary' variant='outline' onClick={handleExport} disabled={loading}>
      <FiDownload size={16} style={{ marginRight: '4px' }} />
      {loading ? 'エクスポート中...' : 'CSV出力'}
    </Button>
  )
}
