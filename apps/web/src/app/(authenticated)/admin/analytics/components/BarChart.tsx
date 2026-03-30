import { Typography } from '../../../../../components/common/Typography'
import styles from './BarChart.module.css'

type BarChartItem = {
  label: string
  sublabel?: string
  value: number
  formattedValue: string
}

type Props = {
  items: BarChartItem[]
  maxItems?: number
  barColor?: string
}

export function BarChart({ items, maxItems = 10, barColor }: Props) {
  const displayed = items.slice(0, maxItems)
  const maxValue = Math.max(...displayed.map((i) => i.value), 1)

  return (
    <div className={styles.container}>
      {displayed.map((item) => (
        <div key={item.label} className={styles.row}>
          <div className={styles.label}>
            <Typography size='sm' truncate>
              {item.label}
            </Typography>
            {item.sublabel && (
              <Typography size='xs' color='var(--text-secondary, #606060)'>
                {item.sublabel}
              </Typography>
            )}
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: barColor }}
            />
          </div>
          <div className={styles.value}>
            <Typography size='sm' color='var(--text-secondary, #606060)'>
              {item.formattedValue}
            </Typography>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <Typography size='sm' color='var(--text-secondary, #606060)'>
          データがありません
        </Typography>
      )}
    </div>
  )
}
