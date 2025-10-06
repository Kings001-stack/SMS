import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { teacherDashboardSchema } from '../../schemas/dashboards.js'

export default function TeacherDashboard() {
  return <SchemaDashboard schema={teacherDashboardSchema} basePath="/dashboard/teacher" />
}
