'use client'

import type { VisibleVideo } from '@monorepo/database'
import { useCallback, useEffect, useRef } from 'react'
import styles from './VideoPlayer.module.css'

type Props = {
  video: VisibleVideo
  token: string
  onClose: () => void
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function VideoPlayer({ video, token, onClose }: Props) {
  const sessionIdRef = useRef(generateSessionId())
  const youtubeId = getYouTubeId(video.videoUrl)

  const trackEvent = useCallback(
    (eventType: string, positionSec = 0) => {
      fetch('/api/watch-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          videoId: video.id,
          eventType,
          positionSec,
          sessionId: sessionIdRef.current,
        }),
      }).catch(() => {})
    },
    [token, video.id],
  )

  useEffect(() => {
    trackEvent('PLAY', 0)

    const interval = setInterval(() => {
      trackEvent('HEARTBEAT')
    }, 30000)

    return () => {
      clearInterval(interval)
      trackEvent('ENDED')
    }
  }, [trackEvent])

  return (
    <div className={styles.overlay}>
      <button type='button' className={styles.overlayButton} onClick={onClose} aria-label='閉じる' />
      <div className={styles.modal}>
        <button type='button' className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h2 className={styles.title}>{video.title}</h2>
        <div className={styles.playerWrapper}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={video.title}
              className={styles.iframe}
              allow='autoplay; encrypted-media'
              allowFullScreen
            />
          ) : (
            <div className={styles.fallback}>
              <a href={video.videoUrl} target='_blank' rel='noopener noreferrer' className={styles.link}>
                外部リンクで視聴する ↗
              </a>
            </div>
          )}
        </div>
        {video.description && <p className={styles.description}>{video.description}</p>}
      </div>
    </div>
  )
}
