import type { VideoCategory } from '@monorepo/database'

export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  GOAL_APPEAL: '目標の魅力',
  PEOPLE_APPEAL: '人材の魅力',
  ACTIVITY_APPEAL: '活動の魅力',
  CONDITION_APPEAL: '条件の魅力',
  BRIEFING: '会社説明会',
}

export const VIDEO_CATEGORIES: VideoCategory[] = [
  'GOAL_APPEAL',
  'PEOPLE_APPEAL',
  'ACTIVITY_APPEAL',
  'CONDITION_APPEAL',
  'BRIEFING',
]
