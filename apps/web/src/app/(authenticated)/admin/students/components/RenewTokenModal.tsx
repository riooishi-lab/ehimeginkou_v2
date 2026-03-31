'use client'

import type { VisibleStudent } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { renewStudentToken } from '../actions/renewToken'

type Props = {
  student: VisibleStudent
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RenewTokenModal({ student, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(renewStudentToken, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='トークン更新' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='studentId' value={student.id} />
        <FlexBox flexDirection='column' gap='2rem'>
          <FlexBox flexDirection='column' gap='1rem'>
            {state?.status === 'error' && state.error && (
              <MessageBox theme='error'>
                <FlexBox flexDirection='column' gap='0.5rem'>
                  {state.error.message.map((msg) => (
                    <Typography key={msg} size='sm'>
                      {msg}
                    </Typography>
                  ))}
                </FlexBox>
              </MessageBox>
            )}

            <Typography size='md'>
              <strong>{student.name}</strong>（{student.email}）のトークンを更新しますか？
            </Typography>
            <Typography size='sm' color='var(--color-secondary)'>
              新しいトークンが生成され、有効期限が30日間延長されます。以前のトークンは無効になります。
            </Typography>
          </FlexBox>

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' size='lg' isLoading={pending}>
              {pending ? '更新中...' : 'トークンを更新'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}
