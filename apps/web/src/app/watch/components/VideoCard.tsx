'use client'

import type { VisibleVideo } from '@monorepo/database'
import { VIDEO_CATEGORY_LABELS } from '../../(authenticated)/admin/videos/constants'
import styles from './VideoCard.module.css'

type Props = {
  video: VisibleVideo
  isWatched: boolean
  onClick: () => void
}

function formatDuration(sec: number | null): string {
  if (!sec) return ''
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return `${min}:${String(s).padStart(2, '0')}`
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  return null
}

export function VideoCard({ video, isWatched, onClick }: Props) {
  const thumbnail = video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl)

  return (
    <button type='button' className={styles.card} onClick={onClick}>
      <div className={styles.thumbnailWrapper}>
        {thumbnail ? (
          <img src={thumbnail} alt={video.title} className={styles.thumbnail} />
        ) : (
          <div className={styles.placeholder}>▶</div>
        )}
        {video.durationSec && <span className={styles.duration}>{formatDuration(video.durationSec)}</span>}
        {!isWatched && <span className={styles.newBadge}>NEW</span>}
        {video.isPinned && <span className={styles.pinnedBadge}>★ おすすめ</span>}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{video.title}</h3>
        {video.description && <p className={styles.description}>{video.description}</p>}
        <span className={styles.category}>{VIDEO_CATEGORY_LABELS[video.category]}</span>
      </div>
    </button>
  )
}
