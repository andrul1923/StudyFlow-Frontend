import { useAuth } from '../auth'
import { IconUser, IconMail } from '../components/ui'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div>
      <div className="page-head">
        <div className="title-row">
          <span className="page-icon"><IconUser size={22} /></span>
          <div>
            <h1>Mi perfil</h1>
            <p className="muted small">Tu información de cuenta en StudyFlow.</p>
          </div>
        </div>
      </div>

      <div className="card profile-card">
        <span className="avatar avatar-lg">{user.username[0].toUpperCase()}</span>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <div className="profile-row muted"><IconMail size={15} /> {user.email}</div>
        </div>
      </div>
    </div>
  )
}
