'use client'

import { Button } from '../../../../components/common/Button'
import { FlexBox } from '../../../../components/common/FlexBox'
import { Typography } from '../../../../components/common/Typography'

export default function VideosErrorPage({ reset }: { reset: () => void }) {
  return (
    <FlexBox flexDirection='column' gap='1rem' padding='3rem' alignItems='center' justifyContent='center'>
      <Typography size='lg' weight='semibold'>
        動画データの読み込みに失敗しました
      </Typography>
      <Typography size='sm' color='var(--text-secondary, #606060)'>
        ページを再読み込みするか、しばらく待ってから再試行してください。
      </Typography>
      <Button onClick={reset}>再試行</Button>
    </FlexBox>
  )
}
