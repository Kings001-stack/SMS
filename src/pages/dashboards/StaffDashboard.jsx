import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { staffDashboardSchema } from '../../schemas/dashboards.js'

export default function StaffDashboard() {
  return <SchemaDashboard schema={staffDashboardSchema} />
}
