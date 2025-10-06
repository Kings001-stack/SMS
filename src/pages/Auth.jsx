import { NavLink, Outlet, Link } from 'react-router-dom'

export default function Auth() {
  return (
    <section className="min-h-[70vh] bg-white">
      <div className="container-pad py-12 md:py-16 max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome</h1>
          <p className="text-gray-600 mt-1">Login to continue.</p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm">
          <div className="flex">
            <NavLink
              to="login"
              className={({ isActive }) =>
                `flex-1 text-center px-4 py-3 rounded-t-2xl ${isActive ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`
              }
            >
              Login
            </NavLink>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </section>
  )
}
