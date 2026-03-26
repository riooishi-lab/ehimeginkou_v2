'use client'

import type { VisibleVideo } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { updateVideo } from '../actions/updateVideo'
import { VideoFormFields } from './VideoFormFields'

type Props = {
  video: VisibleVideo
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditVideoModal({ video, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateVideo, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='動画を編集' width='large' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='id' value={video.id} />
        <input type='hidden' name='isPublished' value={String(video.isPublished)} />
        <input type='hidden' name='isPinned' value={String(video.isPinned)} />

        <FlexBox flexDirection='column' gap='1.5rem'>
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

          <VideoFormFields initialValue={video} />

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' size='lg' isLoading={pending}>
              {pending ? '更新中...' : '更新'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}
