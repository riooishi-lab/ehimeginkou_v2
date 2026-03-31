'use client'

import { LuLogOut } from 'react-icons/lu'
import { signOut } from '../../../../app/auth/signout/actions/signOut'
import styles from '../NavBar.module.css'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type='submit' className={styles.actionLink}>
        <LuLogOut className={styles.actionLinkIcon} />
        <span className={styles.actionLinkLabel}>サインアウト</span>
      </button>
    </form>
  )
}
