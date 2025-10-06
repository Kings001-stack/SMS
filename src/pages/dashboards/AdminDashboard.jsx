import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { adminDashboardSchema } from '../../schemas/dashboards.js'

export default function AdminDashboard() {
  return <SchemaDashboard schema={adminDashboardSchema} basePath="/dashboard/admin" />
}
