'use client'

import type { VisibleVideo } from '@monorepo/database'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import { InputLabel } from '../../../../../components/common/InputLabel'
import { Select } from '../../../../../components/common/Select'
import Textarea from '../../../../../components/common/Textarea/Textarea'
import { VIDEO_CATEGORIES, VIDEO_CATEGORY_LABELS } from '../constants'

type Props = {
  initialValue?: VisibleVideo
}

const categoryOptions = VIDEO_CATEGORIES.map((cat) => ({
  value: cat,
  label: VIDEO_CATEGORY_LABELS[cat],
}))

export function VideoFormFields({ initialValue }: Props) {
  return (
    <FlexBox flexDirection='column' gap='1rem'>
      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='title' label='タイトル' required />
        <Input id='title' name='title' defaultValue={initialValue?.title} required />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='description' label='説明' />
        <Textarea id='description' name='description' defaultValue={initialValue?.description ?? ''} rows={3} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='category' label='カテゴリ' required />
        <Select id='category' name='category' defaultValue={initialValue?.category} options={categoryOptions} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='subcategory' label='サブカテゴリ' />
        <Input id='subcategory' name='subcategory' defaultValue={initialValue?.subcategory ?? ''} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='videoUrl' label='動画URL' required />
        <Input
          id='videoUrl'
          name='videoUrl'
          defaultValue={initialValue?.videoUrl}
          required
          placeholder='YouTube URLまたはGoogle DriveリンクURL'
        />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='thumbnailUrl' label='サムネイルURL' />
        <Input id='thumbnailUrl' name='thumbnailUrl' defaultValue={initialValue?.thumbnailUrl ?? ''} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.25rem'>
        <InputLabel htmlFor='durationSec' label='再生時間（秒）' />
        <Input id='durationSec' name='durationSec' type='number' defaultValue={initialValue?.durationSec ?? ''} />
      </FlexBox>
    </FlexBox>
  )
}
