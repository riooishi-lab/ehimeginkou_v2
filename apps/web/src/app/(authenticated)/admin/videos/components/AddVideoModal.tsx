'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { createVideo } from '../actions/createVideo'
import { VideoFormFields } from './VideoFormFields'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddVideoModal({ open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createVideo, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='動画を追加' width='large' padding='xl'>
      <form action={formAction}>
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

          <VideoFormFields />

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' size='lg' isLoading={pending}>
              {pending ? '追加中...' : '追加'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}
