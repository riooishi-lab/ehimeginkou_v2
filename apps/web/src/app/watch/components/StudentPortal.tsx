'use client'

import type { VisibleStudent, VisibleVideo } from '@monorepo/database'
import { useState } from 'react'
import styles from './StudentPortal.module.css'
import { VideoCard } from './VideoCard'
import { VideoPlayer } from './VideoPlayer'

type Props = {
  student: VisibleStudent
  videos: VisibleVideo[]
  watchedVideoIds: number[]
}

export function StudentPortal({ student, videos, watchedVideoIds }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<VisibleVideo | null>(null)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{student.name}様へのコンテンツ</h1>
        <p className={styles.subtitle}>採用に関する動画をご覧いただけます</p>
      </header>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} studentId={student.id} onClose={() => setSelectedVideo(null)} />
      )}

      <main className={styles.main}>
        <div className={styles.grid}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isWatched={watchedVideoIds.includes(video.id)}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>

        {videos.length === 0 && <p className={styles.empty}>現在公開されている動画はありません。</p>}
      </main>
    </div>
  )
}
