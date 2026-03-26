import { FiBarChart2, FiHome, FiUsers, FiVideo } from 'react-icons/fi'
import { PAGE_PATH } from '../../../constants/pagePath'
import type { NavItem } from './NavBar.types'

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', href: PAGE_PATH.HOME, icon: FiHome },
  { id: 'videos', label: '動画管理', href: PAGE_PATH.ADMIN_VIDEOS, icon: FiVideo },
  { id: 'students', label: '学生管理', href: PAGE_PATH.ADMIN_STUDENTS, icon: FiUsers },
  { id: 'analytics', label: '分析', href: PAGE_PATH.ADMIN_ANALYTICS, icon: FiBarChart2 },
]
