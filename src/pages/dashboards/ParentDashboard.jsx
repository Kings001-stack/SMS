import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { parentDashboardSchema } from '../../schemas/dashboards.js'

export default function ParentDashboard() {
  return <SchemaDashboard schema={parentDashboardSchema} />
}
