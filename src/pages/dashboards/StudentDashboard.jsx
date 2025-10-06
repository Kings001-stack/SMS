import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { studentDashboardSchema } from '../../schemas/dashboards.js'

export default function StudentDashboard() {
  return <SchemaDashboard schema={studentDashboardSchema} basePath="/dashboard/student" />
}
