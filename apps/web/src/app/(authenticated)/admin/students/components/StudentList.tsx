'use client'

import type { VisibleStudent } from '@monorepo/database'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { FiPlus, FiRefreshCw, FiTrash2, FiUpload } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { AddStudentModal } from './AddStudentModal'
import { DeleteStudentModal } from './DeleteStudentModal'
import { ExportCsvButton } from './ExportCsvButton'
import { ImportCsvModal } from './ImportCsvModal'
import { RenewTokenModal } from './RenewTokenModal'
import { StudentSearchFilter } from './StudentSearchFilter'

type Props = {
  students: VisibleStudent[]
}

function NameCell({ row }: { row: VisibleStudent }): ReactNode {
  return (
    <Typography size='sm' weight='semibold'>
      {row.name}
    </Typography>
  )
}

function EmailCell({ row }: { row: VisibleStudent }): ReactNode {
  return <Typography size='sm'>{row.email}</Typography>
}

function UniversityCell({ row }: { row: VisibleStudent }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm'>{row.university ?? '-'}</Typography>
      {row.department && (
        <Typography size='xs' color='var(--color-secondary)'>
          {row.department}
        </Typography>
      )}
    </FlexBox>
  )
}

function TokenCell({ row }: { row: VisibleStudent }): ReactNode {
  const isExpired = new Date(row.tokenExpiresAt) < new Date()
  return (
    <Typography size='xs' color={isExpired ? 'var(--color-danger, #dc2626)' : 'var(--color-secondary)'}>
      {isExpired ? '期限切れ' : `${new Date(row.tokenExpiresAt).toLocaleDateString('ja-JP')}まで`}
    </Typography>
  )
}

type ActionHandlers = {
  onRenew: (student: VisibleStudent) => void
  onDelete: (student: VisibleStudent) => void
}

function createActionCell({ onRenew, onDelete }: ActionHandlers) {
  return function ActionCell({ row }: { row: VisibleStudent }): ReactNode {
    return (
      <FlexBox gap='0.25rem' justifyContent='flex-start'>
        <button
          type='button'
          onClick={() => onRenew(row)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--color-primary, #2563eb)',
          }}
          title='トークン更新'
        >
          <FiRefreshCw size={16} />
        </button>
        <button
          type='button'
          onClick={() => onDelete(row)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--color-danger, #dc2626)',
          }}
          title='削除'
        >
          <FiTrash2 size={16} />
        </button>
      </FlexBox>
    )
  }
}

export function StudentList({ students }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<VisibleStudent | null>(null)
  const [renewingStudent, setRenewingStudent] = useState<VisibleStudent | null>(null)
  const [search, setSearch] = useState('')
  const { showToast, toastProps } = useToast()

  const handleDelete = useCallback((student: VisibleStudent) => setDeletingStudent(student), [])
  const handleRenew = useCallback((student: VisibleStudent) => setRenewingStudent(student), [])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.university ?? '').toLowerCase().includes(q),
    )
  }, [students, search])

  const columns: CellProps<VisibleStudent>[] = useMemo(
    () => [
      { label: '氏名', Component: NameCell },
      { label: 'メール', Component: EmailCell },
      { label: '大学・学部', Component: UniversityCell },
      { label: 'トークン有効期限', Component: TokenCell },
      { label: '', Component: createActionCell({ onRenew: handleRenew, onDelete: handleDelete }) },
    ],
    [handleDelete, handleRenew],
  )

  return (
    <>
      <FlexBox flexDirection='column' gap='1rem' padding='1.5rem'>
        <FlexBox justifyContent='space-between' alignItems='center'>
          <Typography size='lg' weight='semibold'>
            学生一覧（{filteredStudents.length}件）
          </Typography>
          <FlexBox gap='0.5rem'>
            <ExportCsvButton onError={(msg) => showToast(msg, 'error')} />
            <Button size='md' theme='secondary' variant='outline' onClick={() => setShowImportModal(true)}>
              <FiUpload size={16} style={{ marginRight: '4px' }} />
              CSV取り込み
            </Button>
            <Button size='md' onClick={() => setShowAddModal(true)}>
              <FiPlus size={16} style={{ marginRight: '4px' }} />
              学生を追加
            </Button>
          </FlexBox>
        </FlexBox>

        <StudentSearchFilter search={search} onSearchChange={setSearch} />

        <Table rows={filteredStudents} uniqueKey='id' noRowsMessage='学生はまだ登録されていません' columns={columns} />
      </FlexBox>

      {showAddModal && (
        <AddStudentModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            showToast('学生を追加しました', 'success')
          }}
        />
      )}

      {showImportModal && <ImportCsvModal open={showImportModal} onClose={() => setShowImportModal(false)} />}

      {deletingStudent && (
        <DeleteStudentModal
          student={deletingStudent}
          open={!!deletingStudent}
          onClose={() => setDeletingStudent(null)}
          onSuccess={() => {
            setDeletingStudent(null)
            showToast('学生を削除しました', 'success')
          }}
        />
      )}

      {renewingStudent && (
        <RenewTokenModal
          student={renewingStudent}
          open={!!renewingStudent}
          onClose={() => setRenewingStudent(null)}
          onSuccess={() => {
            setRenewingStudent(null)
            showToast('トークンを更新しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </>
  )
}
