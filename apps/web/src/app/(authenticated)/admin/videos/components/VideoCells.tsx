'use client'

import type { VisibleVideo } from '@monorepo/database'
import type { ReactNode } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { StatusLabel } from '../../../../../components/common/StatusLabel'
import { Typography } from '../../../../../components/common/Typography'
import { VIDEO_CATEGORY_LABELS } from '../constants'

export function TitleCell({ row }: { row: VisibleVideo }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.25rem'>
      <Typography size='sm' weight='semibold'>
        {row.title}
      </Typography>
      {row.description && (
        <Typography
          size='xs'
          color='var(--color-secondary)'
          style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {row.description}
        </Typography>
      )}
    </FlexBox>
  )
}

export function CategoryCell({ row }: { row: VisibleVideo }): ReactNode {
  return <Typography size='sm'>{VIDEO_CATEGORY_LABELS[row.category]}</Typography>
}

export function StatusCell({ row }: { row: VisibleVideo }): ReactNode {
  return (
    <FlexBox gap='0.5rem'>
      <StatusLabel theme={row.isPublished ? 'success' : 'disabled'} text={row.isPublished ? '公開中' : '下書き'} />
      {row.isPinned && <StatusLabel theme='warn' text='おすすめ' />}
    </FlexBox>
  )
}

export function DurationCell({ row }: { row: VisibleVideo }): ReactNode {
  if (!row.durationSec) return <Typography size='sm'>-</Typography>
  const min = Math.floor(row.durationSec / 60)
  const sec = row.durationSec % 60
  return <Typography size='sm'>{`${min}:${String(sec).padStart(2, '0')}`}</Typography>
}

export function createActionCell(onEdit: (video: VisibleVideo) => void, onDelete: (video: VisibleVideo) => void) {
  return function ActionCell({ row }: { row: VisibleVideo }): ReactNode {
    return (
      <FlexBox gap='0.5rem'>
        <button
          type='button'
          onClick={() => onEdit(row)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <FiEdit2 size={16} />
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
        >
          <FiTrash2 size={16} />
        </button>
      </FlexBox>
    )
  }
}
