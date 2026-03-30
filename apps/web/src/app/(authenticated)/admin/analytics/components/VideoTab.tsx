'use client'

import type { VideoCategory } from '@monorepo/database'
import type { ReactNode } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { VIDEO_CATEGORY_LABELS } from '../../videos/constants'
import { BarChart } from './BarChart'
import { StatCard } from './StatCard'
import { formatDate, formatPercent, formatTime } from './utils'
import styles from './VideoTab.module.css'

type VideoStat = {
  id: number
  title: string
  category: VideoCategory
  viewers: number
  views: number
  completions: number
  watchTimeSec: number
}

type CategoryStat = {
  category: VideoCategory
  videoCount: number
  viewers: number
  views: number
  watchTimeSec: number
}

type VideoViewerStat = {
  videoId: number
  videoTitle: string
  studentName: string
  views: number
  watchTimeSec: number
  lastWatch: Date | null
}

type VideoViewerRow = VideoViewerStat & { rowKey: string }

type Props = {
  videos: VideoStat[]
  categories: CategoryStat[]
  videoViewers: VideoViewerStat[]
}

function VideoTitleCell({ row }: { row: VideoStat }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm' weight='semibold'>
        {row.title}
      </Typography>
      <Typography size='xs' color='var(--text-secondary, #606060)'>
        {VIDEO_CATEGORY_LABELS[row.category]}
      </Typography>
    </FlexBox>
  )
}

function VideoViewersCell({ row }: { row: VideoStat }): ReactNode {
  return <Typography size='sm'>{row.viewers}人</Typography>
}

function VideoViewsCell({ row }: { row: VideoStat }): ReactNode {
  return <Typography size='sm'>{row.views}回</Typography>
}

function VideoCompletionsCell({ row }: { row: VideoStat }): ReactNode {
  return <Typography size='sm'>{row.completions}回</Typography>
}

function VideoCompletionRateCell({ row }: { row: VideoStat }): ReactNode {
  return (
    <Typography size='sm' color='var(--text-secondary, #606060)'>
      {formatPercent(row.views, row.completions)}
    </Typography>
  )
}

function VideoWatchTimeCell({ row }: { row: VideoStat }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

const videoColumns: CellProps<VideoStat>[] = [
  { label: '動画', Component: VideoTitleCell },
  { label: '視聴者数', Component: VideoViewersCell },
  { label: '再生回数', Component: VideoViewsCell },
  { label: '完走数', Component: VideoCompletionsCell },
  { label: '完走率', Component: VideoCompletionRateCell },
  { label: '視聴時間', Component: VideoWatchTimeCell },
]

function VvVideoTitleCell({ row }: { row: VideoViewerRow }): ReactNode {
  return (
    <Typography size='sm' weight='semibold' truncate>
      {row.videoTitle}
    </Typography>
  )
}

function VvStudentCell({ row }: { row: VideoViewerRow }): ReactNode {
  return <Typography size='sm'>{row.studentName}</Typography>
}

function VvViewsCell({ row }: { row: VideoViewerRow }): ReactNode {
  return <Typography size='sm'>{row.views}回</Typography>
}

function VvWatchTimeCell({ row }: { row: VideoViewerRow }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

function VvLastWatchCell({ row }: { row: VideoViewerRow }): ReactNode {
  return (
    <Typography size='sm' color='var(--text-secondary, #606060)'>
      {formatDate(row.lastWatch)}
    </Typography>
  )
}

const videoViewerColumns: CellProps<VideoViewerRow>[] = [
  { label: '動画', Component: VvVideoTitleCell },
  { label: '学生', Component: VvStudentCell },
  { label: '再生回数', Component: VvViewsCell },
  { label: '視聴時間', Component: VvWatchTimeCell },
  { label: '最終視聴', Component: VvLastWatchCell },
]

export function VideoTab({ videos, categories, videoViewers }: Props) {
  const sortedByViews = [...videos].sort((a, b) => b.views - a.views)
  const sortedByTime = [...videos].sort((a, b) => b.watchTimeSec - a.watchTimeSec)
  const mostViewed = sortedByViews[0]?.title ?? '-'
  const mostWatched = sortedByTime[0]?.title ?? '-'

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalCompletions = videos.reduce((sum, v) => sum + v.completions, 0)
  const avgCompletionRate = formatPercent(totalViews, totalCompletions)

  const viewerRows: VideoViewerRow[] = videoViewers.map((vv) => ({
    ...vv,
    rowKey: `${vv.videoId}-${vv.studentName}`,
  }))

  const categoryBarItems = [...categories]
    .sort((a, b) => b.views - a.views)
    .map((c) => ({
      label: VIDEO_CATEGORY_LABELS[c.category],
      sublabel: `${c.videoCount}本`,
      value: c.views,
      formattedValue: `${c.views}回`,
    }))

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <div className={styles.statsGrid}>
        <StatCard label='最も再生された動画' value={mostViewed} />
        <StatCard label='最も視聴時間の長い動画' value={mostWatched} />
        <StatCard label='平均完走率' value={avgCompletionRate} />
        <StatCard label='カテゴリ数' value={categories.length} />
      </div>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          カテゴリ別内訳
        </Typography>
        <BarChart items={categoryBarItems} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          動画別パフォーマンス
        </Typography>
        <Table rows={sortedByViews} uniqueKey='id' columns={videoColumns} noRowsMessage='データがありません' />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          動画別 視聴者詳細
        </Typography>
        <Table rows={viewerRows} uniqueKey='rowKey' columns={videoViewerColumns} noRowsMessage='データがありません' />
      </FlexBox>
    </FlexBox>
  )
}
