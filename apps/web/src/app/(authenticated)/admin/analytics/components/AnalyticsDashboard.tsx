'use client'

import type { VideoCategory } from '@monorepo/database'
import type { ReactNode } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { VIDEO_CATEGORY_LABELS } from '../../videos/constants'
import styles from './AnalyticsDashboard.module.css'

type VideoStat = {
  id: number
  title: string
  category: VideoCategory
  viewers: number
  views: number
  watchTimeSec: number
}

type StudentStat = {
  id: number
  name: string
  videosWatched: number
  totalViews: number
  watchTimeSec: number
}

type Props = {
  totalStudents: number
  totalVideos: number
  uniqueViewers: number
  totalViews: number
  estimatedWatchTimeSec: number
  videoStats: VideoStat[]
  studentStats: StudentStat[]
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec}秒`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分`
  const hours = Math.floor(min / 60)
  const remainMin = min % 60
  return `${hours}時間${remainMin}分`
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <Typography size='xs' color='var(--color-secondary)'>
        {label}
      </Typography>
      <Typography size='xxl' weight='bold'>
        {value}
      </Typography>
    </div>
  )
}

function VideoTitleCell({ row }: { row: VideoStat }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm' weight='semibold'>
        {row.title}
      </Typography>
      <Typography size='xs' color='var(--color-secondary)'>
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

function VideoWatchTimeCell({ row }: { row: VideoStat }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

function StudentNameCell({ row }: { row: StudentStat }): ReactNode {
  return (
    <Typography size='sm' weight='semibold'>
      {row.name}
    </Typography>
  )
}

function StudentVideosCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{row.videosWatched}本</Typography>
}

function StudentViewsCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{row.totalViews}回</Typography>
}

function StudentWatchTimeCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

const videoColumns: CellProps<VideoStat>[] = [
  { label: '動画', Component: VideoTitleCell },
  { label: '視聴者数', Component: VideoViewersCell },
  { label: '再生回数', Component: VideoViewsCell },
  { label: '総視聴時間', Component: VideoWatchTimeCell },
]

const studentColumns: CellProps<StudentStat>[] = [
  { label: '学生', Component: StudentNameCell },
  { label: '視聴動画数', Component: StudentVideosCell },
  { label: '再生回数', Component: StudentViewsCell },
  { label: '総視聴時間', Component: StudentWatchTimeCell },
]

export function AnalyticsDashboard({
  totalStudents,
  totalVideos,
  uniqueViewers,
  totalViews,
  estimatedWatchTimeSec,
  videoStats,
  studentStats,
}: Props) {
  const sortedVideoStats = [...videoStats].sort((a, b) => b.views - a.views)
  const sortedStudentStats = [...studentStats].sort((a, b) => b.watchTimeSec - a.watchTimeSec)

  return (
    <FlexBox flexDirection='column' gap='2rem' padding='1.5rem'>
      <div className={styles.statsGrid}>
        <StatCard label='登録学生数' value={totalStudents} />
        <StatCard label='公開動画数' value={totalVideos} />
        <StatCard label='ユニーク視聴者' value={uniqueViewers} />
        <StatCard label='総再生回数' value={totalViews} />
        <StatCard label='総視聴時間' value={formatTime(estimatedWatchTimeSec)} />
      </div>

      <FlexBox flexDirection='column' gap='1rem'>
        <Typography size='lg' weight='semibold'>
          動画別分析
        </Typography>
        <Table rows={sortedVideoStats} uniqueKey='id' columns={videoColumns} noRowsMessage='データがありません' />
      </FlexBox>

      <FlexBox flexDirection='column' gap='1rem'>
        <Typography size='lg' weight='semibold'>
          学生別分析
        </Typography>
        <Table rows={sortedStudentStats} uniqueKey='id' columns={studentColumns} noRowsMessage='データがありません' />
      </FlexBox>
    </FlexBox>
  )
}
