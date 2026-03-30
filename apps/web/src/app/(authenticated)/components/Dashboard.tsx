'use client'

import type { VideoCategory } from '@monorepo/database'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { FiBarChart2, FiFilm, FiUsers } from 'react-icons/fi'
import { FlexBox } from '../../../components/common/FlexBox'
import { Table } from '../../../components/common/Table'
import type { CellProps } from '../../../components/common/Table/Table.types'
import { Typography } from '../../../components/common/Typography'
import { PAGE_PATH } from '../../../constants/pagePath'
import { VIDEO_CATEGORY_LABELS } from '../admin/videos/constants'
import styles from './Dashboard.module.css'

type RecentVideo = {
  id: number
  title: string
  category: VideoCategory
  isPublished: boolean
  createdAt: Date
}

type RecentStudent = {
  id: number
  name: string
  email: string
  university: string | null
  createdAt: Date
}

type Props = {
  publishedVideos: number
  totalStudents: number
  uniqueViewers: number
  totalViews: number
  todayViews: number
  estimatedWatchTimeSec: number
  recentVideos: RecentVideo[]
  recentStudents: RecentStudent[]
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec}秒`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分`
  const hours = Math.floor(min / 60)
  const remainMin = min % 60
  return `${hours}時間${remainMin}分`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
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

function VideoTitleCell({ row }: { row: RecentVideo }): ReactNode {
  return (
    <FlexBox flexDirection='column' gap='0.125rem'>
      <Typography size='sm' weight='semibold' truncate>
        {row.title}
      </Typography>
      <Typography size='xs' color='var(--color-secondary)'>
        {VIDEO_CATEGORY_LABELS[row.category]}
      </Typography>
    </FlexBox>
  )
}

function VideoStatusCell({ row }: { row: RecentVideo }): ReactNode {
  return (
    <Typography size='xs' color={row.isPublished ? '#16a34a' : 'var(--color-secondary)'}>
      {row.isPublished ? '公開中' : '非公開'}
    </Typography>
  )
}

function VideoDateCell({ row }: { row: RecentVideo }): ReactNode {
  return (
    <Typography size='xs' color='var(--color-secondary)'>
      {formatDate(row.createdAt)}
    </Typography>
  )
}

function StudentNameCell({ row }: { row: RecentStudent }): ReactNode {
  return (
    <Typography size='sm' weight='semibold' truncate>
      {row.name}
    </Typography>
  )
}

function StudentUniversityCell({ row }: { row: RecentStudent }): ReactNode {
  return (
    <Typography size='xs' color='var(--color-secondary)' truncate>
      {row.university ?? '-'}
    </Typography>
  )
}

function StudentDateCell({ row }: { row: RecentStudent }): ReactNode {
  return (
    <Typography size='xs' color='var(--color-secondary)'>
      {formatDate(row.createdAt)}
    </Typography>
  )
}

const videoColumns: CellProps<RecentVideo>[] = [
  { label: '動画', Component: VideoTitleCell },
  { label: 'ステータス', Component: VideoStatusCell, width: 80 },
  { label: '登録日', Component: VideoDateCell, width: 80 },
]

const studentColumns: CellProps<RecentStudent>[] = [
  { label: '名前', Component: StudentNameCell },
  { label: '大学', Component: StudentUniversityCell },
  { label: '登録日', Component: StudentDateCell, width: 80 },
]

export function Dashboard({
  publishedVideos,
  totalStudents,
  uniqueViewers,
  totalViews,
  todayViews,
  estimatedWatchTimeSec,
  recentVideos,
  recentStudents,
}: Props) {
  return (
    <FlexBox flexDirection='column' gap='1.5rem' padding='1.5rem'>
      <div className={styles.statsGrid}>
        <StatCard label='公開動画数' value={publishedVideos} />
        <StatCard label='登録学生数' value={totalStudents} />
        <StatCard label='ユニーク視聴者' value={uniqueViewers} />
        <StatCard label='総再生回数' value={totalViews} />
        <StatCard label='本日の再生' value={todayViews} />
        <StatCard label='総視聴時間' value={formatTime(estimatedWatchTimeSec)} />
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography size='md' weight='semibold'>
              最近の動画
            </Typography>
            <Link href={PAGE_PATH.ADMIN_VIDEOS}>
              <Typography size='xs' color='var(--color-primary, #2563eb)'>
                すべて表示 →
              </Typography>
            </Link>
          </div>
          <Table
            rows={recentVideos}
            uniqueKey='id'
            columns={videoColumns}
            maxRows={5}
            noRowsMessage='動画がまだありません'
            size='small'
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography size='md' weight='semibold'>
              最近の学生
            </Typography>
            <Link href={PAGE_PATH.ADMIN_STUDENTS}>
              <Typography size='xs' color='var(--color-primary, #2563eb)'>
                すべて表示 →
              </Typography>
            </Link>
          </div>
          <Table
            rows={recentStudents}
            uniqueKey='id'
            columns={studentColumns}
            maxRows={5}
            noRowsMessage='学生がまだ登録されていません'
            size='small'
          />
        </div>
      </div>

      <FlexBox flexDirection='column' gap='0.75rem'>
        <Typography size='md' weight='semibold'>
          クイックアクセス
        </Typography>
        <div className={styles.navGrid}>
          <Link href={PAGE_PATH.ADMIN_VIDEOS} className={styles.navCard}>
            <div className={styles.navIcon}>
              <FiFilm size={20} />
            </div>
            <FlexBox flexDirection='column' gap='0.125rem'>
              <Typography size='sm' weight='semibold'>
                動画管理
              </Typography>
              <Typography size='xs' color='var(--color-secondary)'>
                動画の追加・編集・公開管理
              </Typography>
            </FlexBox>
          </Link>
          <Link href={PAGE_PATH.ADMIN_STUDENTS} className={styles.navCard}>
            <div className={styles.navIcon}>
              <FiUsers size={20} />
            </div>
            <FlexBox flexDirection='column' gap='0.125rem'>
              <Typography size='sm' weight='semibold'>
                学生管理
              </Typography>
              <Typography size='xs' color='var(--color-secondary)'>
                学生の登録・トークン発行
              </Typography>
            </FlexBox>
          </Link>
          <Link href={PAGE_PATH.ADMIN_ANALYTICS} className={styles.navCard}>
            <div className={styles.navIcon}>
              <FiBarChart2 size={20} />
            </div>
            <FlexBox flexDirection='column' gap='0.125rem'>
              <Typography size='sm' weight='semibold'>
                分析
              </Typography>
              <Typography size='xs' color='var(--color-secondary)'>
                視聴データの分析・レポート
              </Typography>
            </FlexBox>
          </Link>
        </div>
      </FlexBox>
    </FlexBox>
  )
}
