import { Typography } from '../../../../../components/common/Typography'
import styles from './HourHeatmap.module.css'

type HourData = {
  hour: number
  views: number
}

type Props = {
  hours: HourData[]
}

function getIntensityClass(views: number, maxViews: number): string {
  if (maxViews === 0 || views === 0) return styles.intensity0
  const ratio = views / maxViews
  if (ratio <= 0.25) return styles.intensity1
  if (ratio <= 0.5) return styles.intensity2
  if (ratio <= 0.75) return styles.intensity3
  return styles.intensity4
}

export function HourHeatmap({ hours }: Props) {
  const allHours = Array.from({ length: 24 }, (_, i) => {
    const found = hours.find((h) => h.hour === i)
    return { hour: i, views: found?.views ?? 0 }
  })
  const maxViews = Math.max(...allHours.map((h) => h.views), 1)

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {allHours.map((h) => (
          <div key={h.hour} className={styles.cell}>
            <div
              className={`${styles.block} ${getIntensityClass(h.views, maxViews)}`}
              title={`${h.hour}時: ${h.views}回`}
            >
              {h.views > 0 && (
                <Typography size='xxs' color='inherit'>
                  {h.views}
                </Typography>
              )}
            </div>
            <Typography size='xxs' color='var(--text-secondary, #606060)'>
              {h.hour}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  )
}
