'use client'

import type { VisibleStudent } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { deleteStudent } from '../actions/deleteStudent'

type Props = {
  student: VisibleStudent
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteStudentModal({ student, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(deleteStudent, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='学生を削除' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='id' value={student.id} />
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
              <strong>{student.name}</strong>（{student.email}）を削除しますか？
            </Typography>
            <Typography size='sm' color='var(--color-secondary)'>
              関連する視聴データも参照できなくなります。
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
