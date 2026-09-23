# StudyFlow — Frontend

Interfaz web (React + Vite) para la API REST de **StudyFlow**: autenticación JWT,
proyectos con miembros y roles, tareas, comentarios e historial de actividad.

## Requisitos

- Node.js 18+
- El backend de StudyFlow corriendo (por defecto en `http://127.0.0.1:8000`).

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_BASE si tu backend no está en 127.0.0.1:8000
npm run dev
```

La app queda en **http://localhost:5173** — ese origen ya es el que la guía del
backend sugiere poner en `CORS_ALLOWED_ORIGINS`, así que el navegador no bloqueará
las peticiones. Si cambias el puerto, actualiza también `CORS_ALLOWED_ORIGINS`
en el `.env` del backend.

## Qué cubre

- **Auth**: registro, login, sesión persistente y **refresco automático** del
  `access` cuando expira (usando el `refresh`). Si el `refresh` también expira,
  se cierra sesión automáticamente.
- **Proyectos**: listar los propios, crear, ver detalle; editar y archivar solo
  si eres `ADMIN` del proyecto (los botones aparecen según tu rol).
- **Miembros**: listar; agregar por email, cambiar rol y quitar (solo `ADMIN`).
  Los errores del backend (último admin, usuario inexistente, ya es miembro…)
  se muestran tal cual.
- **Tareas**: listar (excluye archivadas), crear, ver detalle, editar, archivar
  (soft-delete). El selector de "asignar a" solo ofrece miembros del proyecto.
  Una tarea archivada permite editar sus datos pero no reactivar su estado.
- **Comentarios**: listar y crear en una tarea; editar/eliminar **solo los
  propios** (los botones aparecen solo en tus comentarios). En tareas
  archivadas se ocultan los comentarios nuevos.
- **Actividad**: línea de tiempo del proyecto, del evento más reciente al más
  antiguo.

## Configuración

Única variable: `VITE_API_BASE` (URL base del backend). No incluye barra final.

## Estructura

```
src/
  api.js              Cliente HTTP: tokens, refresco automático, errores DRF
  auth.jsx            Contexto de sesión (usuario actual, login/logout)
  App.jsx             Rutas y layout
  pages/              Login, Register, Projects, ProjectDetail, TaskDetail
  components/         ui (badges/modal/alert), TasksPanel, MembersPanel, ActivitiesPanel
```
