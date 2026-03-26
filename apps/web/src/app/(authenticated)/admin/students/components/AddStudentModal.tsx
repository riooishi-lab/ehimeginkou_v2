'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import { InputLabel } from '../../../../../components/common/InputLabel'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import type { ActionState } from '../../utils/actionResult'
import { createStudent } from '../actions/createStudent'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddStudentModal({ open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createStudent, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='学生を追加' width='large' padding='xl'>
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

          <FlexBox flexDirection='column' gap='1rem'>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='name' label='氏名' required />
              <Input id='name' name='name' required />
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='email' label='メールアドレス' required />
              <Input id='email' name='email' type='email' required />
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='phone' label='電話番号' />
              <Input id='phone' name='phone' />
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='university' label='大学' />
              <Input id='university' name='university' />
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='department' label='学部' />
              <Input id='department' name='department' />
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem'>
              <InputLabel htmlFor='atsId' label='ATS ID' />
              <Input id='atsId' name='atsId' />
            </FlexBox>
          </FlexBox>

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
