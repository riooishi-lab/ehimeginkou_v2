'use client'

import type { VisibleVideo } from '@monorepo/database'
import { useCallback, useMemo, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { AddVideoModal } from './AddVideoModal'
import { DeleteVideoModal } from './DeleteVideoModal'
import { EditVideoModal } from './EditVideoModal'
import { CategoryCell, createActionCell, DurationCell, StatusCell, TitleCell } from './VideoCells'

type Props = {
  videos: VisibleVideo[]
}

export function VideoList({ videos }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VisibleVideo | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<VisibleVideo | null>(null)
  const { showToast, toastProps } = useToast()

  const handleEdit = useCallback((video: VisibleVideo) => setEditingVideo(video), [])
  const handleDelete = useCallback((video: VisibleVideo) => setDeletingVideo(video), [])

  const columns: CellProps<VisibleVideo>[] = useMemo(
    () => [
      { label: 'タイトル', Component: TitleCell },
      { label: 'カテゴリ', Component: CategoryCell },
      { label: '再生時間', Component: DurationCell },
      { label: 'ステータス', Component: StatusCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete) },
    ],
    [handleEdit, handleDelete],
  )

  return (
    <>
      <FlexBox flexDirection='column' gap='1rem' padding='1.5rem'>
        <FlexBox justifyContent='space-between' alignItems='center'>
          <Typography size='lg' weight='semibold'>
            動画一覧（{videos.length}件）
          </Typography>
          <Button size='md' onClick={() => setShowAddModal(true)}>
            <FiPlus size={16} style={{ marginRight: '4px' }} />
            動画を追加
          </Button>
        </FlexBox>

        <Table rows={videos} uniqueKey='id' noRowsMessage='動画はまだありません' columns={columns} />
      </FlexBox>

      {showAddModal && (
        <AddVideoModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            showToast('動画を追加しました', 'success')
          }}
        />
      )}

      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          open={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          onSuccess={() => {
            setEditingVideo(null)
            showToast('動画を更新しました', 'success')
          }}
        />
      )}

      {deletingVideo && (
        <DeleteVideoModal
          video={deletingVideo}
          open={!!deletingVideo}
          onClose={() => setDeletingVideo(null)}
          onSuccess={() => {
            setDeletingVideo(null)
            showToast('動画を削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </>
  )
}
