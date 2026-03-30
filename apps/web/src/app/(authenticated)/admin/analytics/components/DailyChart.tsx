import { Typography } from '../../../../../components/common/Typography'
import styles from './DailyChart.module.css'

type DayData = {
  label: string
  views: number
  viewers: number
  isToday: boolean
}

type Props = {
  days: DayData[]
}

export function DailyChart({ days }: Props) {
  const maxViews = Math.max(...days.map((d) => d.views), 1)

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {days.map((day) => (
          <div key={day.label} className={styles.column}>
            <div className={styles.barArea}>
              <div
                className={`${styles.bar} ${day.isToday ? styles.today : ''}`}
                style={{ height: `${(day.views / maxViews) * 100}%` }}
                title={`${day.label}: ${day.views}回再生, ${day.viewers}人`}
              />
            </div>
            <Typography size='xxs' color='var(--text-secondary, #606060)' align='center'>
              {day.label}
            </Typography>
          </div>
        ))}
      </div>
      {days.every((d) => d.views === 0) && (
        <div className={styles.empty}>
          <Typography size='sm' color='var(--text-secondary, #606060)'>
            データがありません
          </Typography>
        </div>
      )}
    </div>
  )
}
