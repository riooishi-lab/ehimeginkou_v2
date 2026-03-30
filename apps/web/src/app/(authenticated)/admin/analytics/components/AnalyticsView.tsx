'use client'

import type { VideoCategory } from '@monorepo/database'
import { useMemo } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { SearchParamTab } from '../../../../../components/common/SearchParamTab'
import styles from './AnalyticsView.module.css'
import { PersonTab } from './PersonTab'
import { StatCard } from './StatCard'
import { TimeTab } from './TimeTab'
import { formatTime } from './utils'
import { VideoTab } from './VideoTab'

type PersonTabData = {
  students: {
    id: number
    name: string
    university: string | null
    videosWatched: number
    totalViews: number
    completionCount: number
    watchTimeSec: number
    lastWatch: Date | null
  }[]
  universities: {
    university: string
    studentCount: number
    viewers: number
    totalViews: number
    watchTimeSec: number
  }[]
  studentVideos: {
    studentId: number
    videoTitle: string
    videoCategory: VideoCategory
    views: number
    completions: number
    watchTimeSec: number
  }[]
}

type TimeTabData = {
  daily: {
    day: Date
    uniqueViewers: number
    totalViews: number
    watchTimeSec: number
  }[]
  hourly: {
    hour: number
    totalViews: number
    watchTimeSec: number
  }[]
  dayOfWeek: {
    dow: number
    totalViews: number
    watchTimeSec: number
  }[]
  recentActivity: {
    createdAt: Date
    studentName: string
    videoTitle: string
    eventType: string
  }[]
}

type VideoTabData = {
  videos: {
    id: number
    title: string
    category: VideoCategory
    viewers: number
    views: number
    completions: number
    watchTimeSec: number
  }[]
  categories: {
    category: VideoCategory
    videoCount: number
    viewers: number
    views: number
    watchTimeSec: number
  }[]
  videoViewers: {
    videoId: number
    videoTitle: string
    studentName: string
    views: number
    watchTimeSec: number
    lastWatch: Date | null
  }[]
}

type Props = {
  totalStudents: number
  totalVideos: number
  uniqueViewers: number
  totalViews: number
  estimatedWatchTimeSec: number
  tabIndex: number
  personData: PersonTabData | null
  timeData: TimeTabData | null
  videoData: VideoTabData | null
}

export function AnalyticsView({
  totalStudents,
  totalVideos,
  uniqueViewers,
  totalViews,
  estimatedWatchTimeSec,
  tabIndex,
  personData,
  timeData,
  videoData,
}: Props) {
  const contents = useMemo(
    () => [
      {
        id: 'person',
        label: '人軸（学生別）',
        content: personData ? (
          <PersonTab
            students={personData.students}
            universities={personData.universities}
            studentVideos={personData.studentVideos}
            totalStudents={totalStudents}
          />
        ) : null,
      },
      {
        id: 'time',
        label: '時間軸',
        content: timeData ? (
          <TimeTab
            daily={timeData.daily}
            hourly={timeData.hourly}
            dayOfWeek={timeData.dayOfWeek}
            recentActivity={timeData.recentActivity}
          />
        ) : null,
      },
      {
        id: 'video',
        label: '動画軸',
        content: videoData ? (
          <VideoTab videos={videoData.videos} categories={videoData.categories} videoViewers={videoData.videoViewers} />
        ) : null,
      },
    ],
    [personData, timeData, videoData, totalStudents],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem' padding='1.5rem'>
      <div className={styles.summaryGrid}>
        <StatCard label='登録学生数' value={totalStudents} />
        <StatCard label='公開動画数' value={totalVideos} />
        <StatCard label='ユニーク視聴者' value={uniqueViewers} />
        <StatCard label='総再生回数' value={totalViews} />
        <StatCard label='総視聴時間' value={formatTime(estimatedWatchTimeSec)} />
      </div>

      <SearchParamTab keyName='tabIndex' selectedIndex={tabIndex} contents={contents} />
    </FlexBox>
  )
}
