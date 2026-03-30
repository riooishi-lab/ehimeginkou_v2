import { Typography } from '../../../../../components/common/Typography'
import styles from './StatCard.module.css'

type Props = {
  label: string
  value: string | number
}

export function StatCard({ label, value }: Props) {
  return (
    <div className={styles.card}>
      <Typography size='xs' color='var(--text-secondary, #606060)'>
        {label}
      </Typography>
      <Typography size='xxl' weight='bold'>
        {value}
      </Typography>
    </div>
  )
}
