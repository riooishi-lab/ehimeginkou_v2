'use client'

import type { VideoCategory } from '@monorepo/database'
import type { ReactNode } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { VIDEO_CATEGORY_LABELS } from '../../videos/constants'
import { BarChart } from './BarChart'
import styles from './PersonTab.module.css'
import { StatCard } from './StatCard'
import { formatDate, formatTime } from './utils'

type StudentStat = {
  id: number
  name: string
  university: string | null
  videosWatched: number
  totalViews: number
  completionCount: number
  watchTimeSec: number
  lastWatch: Date | null
}

type UniversityStat = {
  university: string
  studentCount: number
  viewers: number
  totalViews: number
  watchTimeSec: number
}

type StudentVideoStat = {
  studentId: number
  videoTitle: string
  videoCategory: VideoCategory
  views: number
  completions: number
  watchTimeSec: number
}

type StudentVideoRow = StudentVideoStat & { studentName: string; rowKey: string }

type Props = {
  students: StudentStat[]
  universities: UniversityStat[]
  studentVideos: StudentVideoStat[]
  totalStudents: number
}

function StudentNameCell({ row }: { row: StudentStat }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm' weight='semibold'>
        {row.name}
      </Typography>
      {row.university && (
        <Typography size='xs' color='var(--text-secondary, #606060)'>
          {row.university}
        </Typography>
      )}
    </FlexBox>
  )
}

function StudentVideosCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{row.videosWatched}本</Typography>
}

function StudentViewsCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{row.totalViews}回</Typography>
}

function StudentCompletionsCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{row.completionCount}回</Typography>
}

function StudentWatchTimeCell({ row }: { row: StudentStat }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

function StudentLastWatchCell({ row }: { row: StudentStat }): ReactNode {
  return (
    <Typography size='sm' color='var(--text-secondary, #606060)'>
      {formatDate(row.lastWatch)}
    </Typography>
  )
}

const studentColumns: CellProps<StudentStat>[] = [
  { label: '学生', Component: StudentNameCell },
  { label: '視聴動画数', Component: StudentVideosCell },
  { label: '再生回数', Component: StudentViewsCell },
  { label: '完走数', Component: StudentCompletionsCell },
  { label: '視聴時間', Component: StudentWatchTimeCell },
  { label: '最終視聴', Component: StudentLastWatchCell },
]

function SvStudentNameCell({ row }: { row: StudentVideoRow }): ReactNode {
  return (
    <Typography size='sm' weight='semibold'>
      {row.studentName}
    </Typography>
  )
}

function SvVideoCell({ row }: { row: StudentVideoRow }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm'>{row.videoTitle}</Typography>
      <Typography size='xs' color='var(--text-secondary, #606060)'>
        {VIDEO_CATEGORY_LABELS[row.videoCategory]}
      </Typography>
    </FlexBox>
  )
}

function SvViewsCell({ row }: { row: StudentVideoRow }): ReactNode {
  return <Typography size='sm'>{row.views}回</Typography>
}

function SvCompletionsCell({ row }: { row: StudentVideoRow }): ReactNode {
  return <Typography size='sm'>{row.completions}回</Typography>
}

function SvWatchTimeCell({ row }: { row: StudentVideoRow }): ReactNode {
  return <Typography size='sm'>{formatTime(row.watchTimeSec)}</Typography>
}

const studentVideoColumns: CellProps<StudentVideoRow>[] = [
  { label: '学生名', Component: SvStudentNameCell },
  { label: '動画', Component: SvVideoCell },
  { label: '再生回数', Component: SvViewsCell },
  { label: '完走数', Component: SvCompletionsCell },
  { label: '視聴時間', Component: SvWatchTimeCell },
]

export function PersonTab({ students, universities, studentVideos, totalStudents }: Props) {
  const viewerCount = students.filter((s) => s.totalViews > 0).length
  const nonViewerCount = totalStudents - viewerCount
  const avgVideos =
    viewerCount > 0 ? (students.reduce((sum, s) => sum + s.videosWatched, 0) / viewerCount).toFixed(1) : '0'
  const avgTimeSec =
    viewerCount > 0 ? Math.round(students.reduce((sum, s) => sum + s.watchTimeSec, 0) / viewerCount) : 0

  const studentNameMap = new Map(students.map((s) => [s.id, s.name]))

  const studentVideoRows: StudentVideoRow[] = studentVideos.map((sv) => ({
    ...sv,
    studentName: studentNameMap.get(sv.studentId) ?? `ID:${sv.studentId}`,
    rowKey: `${sv.studentId}-${sv.videoTitle}`,
  }))

  const universityBarItems = [...universities]
    .sort((a, b) => b.watchTimeSec - a.watchTimeSec)
    .map((u) => ({
      label: u.university,
      sublabel: `${u.viewers}人視聴`,
      value: u.watchTimeSec,
      formattedValue: formatTime(u.watchTimeSec),
    }))

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <div className={styles.statsGrid}>
        <StatCard label='視聴者数' value={viewerCount} />
        <StatCard label='未視聴者数' value={nonViewerCount} />
        <StatCard label='平均視聴動画数' value={avgVideos} />
        <StatCard label='平均視聴時間' value={formatTime(avgTimeSec)} />
      </div>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          大学別内訳
        </Typography>
        <BarChart items={universityBarItems} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          学生別アクティビティ
        </Typography>
        <Table rows={students} uniqueKey='id' columns={studentColumns} noRowsMessage='データがありません' />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          学生別 視聴動画内訳
        </Typography>
        <Table
          rows={studentVideoRows}
          uniqueKey='rowKey'
          columns={studentVideoColumns}
          noRowsMessage='データがありません'
        />
      </FlexBox>
    </FlexBox>
  )
}
