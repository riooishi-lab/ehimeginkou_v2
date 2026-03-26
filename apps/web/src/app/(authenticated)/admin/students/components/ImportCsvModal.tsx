'use client'

import { useActionState, useRef } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { importStudentsCsv } from '../actions/importStudentsCsv'

type ImportResult = {
  status: 'success' | 'error'
  imported: number
  skipped: number
  errors: string[]
}

type Props = {
  open: boolean
  onClose: () => void
}

export function ImportCsvModal({ open, onClose }: Props) {
  const [state, formAction, pending] = useActionState<ImportResult | null, FormData>(importStudentsCsv, null)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='CSV一括取り込み' width='medium' padding='xl'>
      <form action={formAction}>
        <FlexBox flexDirection='column' gap='1.5rem'>
          {state?.status === 'success' && (
            <MessageBox theme='success'>
              <Typography size='sm'>
                {state.imported}件を取り込みました{state.skipped > 0 ? `（${state.skipped}件スキップ）` : ''}
              </Typography>
            </MessageBox>
          )}

          {state?.status === 'error' && (
            <MessageBox theme='error'>
              <FlexBox flexDirection='column' gap='0.5rem'>
                {state.errors.map((msg) => (
                  <Typography key={msg} size='sm'>
                    • {msg}
                  </Typography>
                ))}
              </FlexBox>
            </MessageBox>
          )}

          {state?.status === 'success' && state.errors.length > 0 && (
            <MessageBox theme='primary'>
              <FlexBox flexDirection='column' gap='0.5rem'>
                <Typography size='sm' weight='semibold'>
                  スキップされた行:
                </Typography>
                {state.errors.map((msg) => (
                  <Typography key={msg} size='xs'>
                    • {msg}
                  </Typography>
                ))}
              </FlexBox>
            </MessageBox>
          )}

          <FlexBox flexDirection='column' gap='0.5rem'>
            <Typography size='sm' weight='semibold'>
              CSVファイルを選択
            </Typography>
            <Typography size='xs' color='var(--color-secondary)'>
              必須列: name(氏名), email(メール) / 任意列: phone(電話), university(大学), department(学部), ats_id
            </Typography>
            <input ref={fileRef} type='file' name='file' accept='.csv' required />
          </FlexBox>

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              閉じる
            </Button>
            <Button type='submit' size='lg' isLoading={pending}>
              {pending ? '取り込み中...' : '取り込み'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}
