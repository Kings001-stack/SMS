import SchemaDashboard from '../../components/dashboard/SchemaDashboard.jsx'
import { registrarDashboardSchema } from '../../schemas/dashboards.js'

export default function RegistrarDashboard() {
  return <SchemaDashboard schema={registrarDashboardSchema} />
}
