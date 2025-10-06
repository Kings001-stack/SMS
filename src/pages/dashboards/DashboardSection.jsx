import FeatureRouter from '../../components/dashboard/FeatureRouter.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardSection() {
  const { user } = useAuth()
  
  return <FeatureRouter user={user} />
}
