import { IconSearch, IconBell, IconSun, IconMoon } from './ui'
import { useTheme } from '../theme'

export default function Topbar({ search, onSearchChange, searchPlaceholder = 'Buscar…' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="topbar2">
      <div className="topbar2-search">
        <IconSearch size={16} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="topbar2-actions">
        <button className="icon-btn" title="Notificaciones"><IconBell size={18} /></button>
        <button
          className="icon-btn"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>
      </div>
    </div>
  )
}
