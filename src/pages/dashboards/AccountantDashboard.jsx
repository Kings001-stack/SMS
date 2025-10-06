import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { accountantDashboardSchema } from '../../schemas/dashboards.js'

export default function AccountantDashboard() {
  return <SchemaDashboard schema={accountantDashboardSchema} />
}
