'use client'

import type { ReactNode } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { DailyChart } from './DailyChart'
import { HourHeatmap } from './HourHeatmap'
import { StatCard } from './StatCard'
import styles from './TimeTab.module.css'
import { formatShortDate, formatTime } from './utils'

type DailyStat = {
  day: Date
  uniqueViewers: number
  totalViews: number
  watchTimeSec: number
}

type HourlyStat = {
  hour: number
  totalViews: number
  watchTimeSec: number
}

type DayOfWeekStat = {
  dow: number
  totalViews: number
  watchTimeSec: number
}

type ActivityLog = {
  createdAt: Date
  studentName: string
  videoTitle: string
  eventType: string
}

type ActivityLogRow = ActivityLog & { rowKey: string }

type Props = {
  daily: DailyStat[]
  hourly: HourlyStat[]
  dayOfWeek: DayOfWeekStat[]
  recentActivity: ActivityLog[]
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

const EVENT_TYPE_LABELS: Record<string, string> = {
  PLAY: '再生',
  ENDED: '完走',
}

function formatDateTime(date: Date): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function ActivityDateCell({ row }: { row: ActivityLogRow }): ReactNode {
  return (
    <Typography size='sm' color='var(--text-secondary, #606060)'>
      {formatDateTime(row.createdAt)}
    </Typography>
  )
}

function ActivityStudentCell({ row }: { row: ActivityLogRow }): ReactNode {
  return <Typography size='sm'>{row.studentName}</Typography>
}

function ActivityVideoCell({ row }: { row: ActivityLogRow }): ReactNode {
  return (
    <Typography size='sm' truncate>
      {row.videoTitle}
    </Typography>
  )
}

function ActivityActionCell({ row }: { row: ActivityLogRow }): ReactNode {
  return <Typography size='sm'>{EVENT_TYPE_LABELS[row.eventType] ?? row.eventType}</Typography>
}

const activityColumns: CellProps<ActivityLogRow>[] = [
  { label: '日時', Component: ActivityDateCell },
  { label: '学生', Component: ActivityStudentCell },
  { label: '動画', Component: ActivityVideoCell },
  { label: 'アクション', Component: ActivityActionCell },
]

export function TimeTab({ daily, hourly, dayOfWeek, recentActivity }: Props) {
  const todayStr = new Date().toDateString()
  const todayStat = daily.find((d) => new Date(d.day).toDateString() === todayStr)
  const todayViews = todayStat?.totalViews ?? 0
  const todayViewers = todayStat?.uniqueViewers ?? 0

  const daysWithData = daily.filter((d) => d.totalViews > 0)
  const avgDailyViews =
    daysWithData.length > 0
      ? Math.round(daysWithData.reduce((sum, d) => sum + d.totalViews, 0) / daysWithData.length)
      : 0

  const peakHour = [...hourly].sort((a, b) => b.totalViews - a.totalViews)[0]
  const peakHourLabel = peakHour && peakHour.totalViews > 0 ? `${peakHour.hour}時台` : '-'

  const dailyChartDays = daily.map((d) => ({
    label: formatShortDate(d.day),
    views: d.totalViews,
    viewers: d.uniqueViewers,
    isToday: new Date(d.day).toDateString() === todayStr,
  }))

  const heatmapHours = hourly.map((h) => ({
    hour: h.hour,
    views: h.totalViews,
  }))

  const allDow = Array.from({ length: 7 }, (_, i) => {
    const found = dayOfWeek.find((d) => d.dow === i)
    return { dow: i, totalViews: found?.totalViews ?? 0, watchTimeSec: found?.watchTimeSec ?? 0 }
  })

  const activityRows: ActivityLogRow[] = recentActivity.map((a, i) => ({
    ...a,
    rowKey: `${new Date(a.createdAt).getTime()}-${i}`,
  }))

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <div className={styles.statsGrid}>
        <StatCard label='本日の再生数' value={todayViews} />
        <StatCard label='本日の視聴者数' value={todayViewers} />
        <StatCard label='日平均再生数' value={avgDailyViews} />
        <StatCard label='ピーク時間帯' value={peakHourLabel} />
      </div>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          直近14日間の推移
        </Typography>
        <DailyChart days={dailyChartDays} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          時間帯別ヒートマップ
        </Typography>
        <HourHeatmap hours={heatmapHours} />
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          曜日別
        </Typography>
        <div className={styles.dowGrid}>
          {allDow.map((d) => (
            <div key={d.dow} className={styles.dowCell}>
              <Typography size='sm' weight='semibold'>
                {DOW_LABELS[d.dow]}
              </Typography>
              <Typography size='sm'>{d.totalViews}回</Typography>
              <Typography size='xs' color='var(--text-secondary, #606060)'>
                {formatTime(d.watchTimeSec)}
              </Typography>
            </div>
          ))}
        </div>
      </FlexBox>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='lg' weight='semibold'>
          最近のアクティビティ
        </Typography>
        <Table rows={activityRows} uniqueKey='rowKey' columns={activityColumns} noRowsMessage='データがありません' />
      </FlexBox>
    </FlexBox>
  )
}
