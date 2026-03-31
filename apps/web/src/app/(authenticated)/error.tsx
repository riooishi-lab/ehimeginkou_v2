'use client'

import { Button } from '../../components/common/Button'
import { FlexBox } from '../../components/common/FlexBox'
import { Typography } from '../../components/common/Typography'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <FlexBox flexDirection='column' gap='1rem' padding='3rem' alignItems='center' justifyContent='center'>
      <Typography size='lg' weight='semibold'>
        エラーが発生しました
      </Typography>
      <Typography size='sm' color='var(--text-secondary, #606060)'>
        ページの読み込み中に問題が発生しました。再試行してください。
      </Typography>
      <Button onClick={reset}>再試行</Button>
    </FlexBox>
  )
}
