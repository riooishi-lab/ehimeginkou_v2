import Link from 'next/link'
import { LuSettings } from 'react-icons/lu'
import { PAGE_PATH } from '../../../constants/pagePath'
import { NavLink } from './components/NavLink'
import { SignOutButton } from './components/SignOutButton'
import { NAV_ITEMS } from './NavBar.constants'
import styles from './NavBar.module.css'

export function NavBar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logo}>R</div>
        <span className={styles.logoText}>採用動画管理</span>
      </div>

      <div className={styles.navItems}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.id} href={item.href}>
            <item.icon className={styles.navItemIcon} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href={PAGE_PATH.ADMIN_SETTINGS} className={styles.actionLink}>
          <LuSettings className={styles.actionLinkIcon} />
          設定
        </Link>
        <SignOutButton />
      </div>
    </aside>
  )
}
