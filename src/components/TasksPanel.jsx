import TaskFilterList from './TaskFilterList'

export default function TasksPanel({ projectId, members }) {
  return <TaskFilterList projectId={projectId} members={members} />
}
