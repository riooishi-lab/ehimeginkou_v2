'use client'

import type { VisibleVideo } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { deleteVideo } from '../actions/deleteVideo'

type Props = {
  video: VisibleVideo
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteVideoModal({ video, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deleteVideo, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='動画を削除' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='id' value={video.id} />
        <FlexBox flexDirection='column' gap='2rem'>
          <FlexBox flexDirection='column' gap='1rem'>
            {state?.status === 'error' && state.error && (
              <MessageBox theme='error'>
                <FlexBox flexDirection='column' gap='0.5rem'>
                  {state.error.message.map((msg) => (
                    <Typography key={msg} size='sm'>
                      • {msg}
                    </Typography>
                  ))}
                </FlexBox>
              </MessageBox>
            )}

            <Typography size='md'>
              <strong>{video.title}</strong> を削除しますか？
            </Typography>
            <Typography size='sm' color='var(--color-secondary)'>
              関連する視聴データも削除されます。この操作は取り消せません。
            </Typography>
          </FlexBox>

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' size='lg' isLoading={pending} theme='danger'>
              {pending ? '削除中...' : '削除'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}
