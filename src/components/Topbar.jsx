import { IconSearch, IconBell, IconSun } from './ui'

export default function Topbar({ search, onSearchChange, searchPlaceholder = 'Buscar…' }) {
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
        <button className="icon-btn" title="Tema"><IconSun size={18} /></button>
      </div>
    </div>
  )
}
