import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container-pad py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/src/assets/logo.png" alt="Logo" className="w-9 h-9" />
            <div className="text-white text-lg font-semibold">Immaculate heart intl. school</div>
          </div>
          <p className="text-sm text-gray-400">Inspiring excellence, character, and lifelong learning since 1998.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/academics" className="hover:underline">Academics</Link></li>
            <li><Link to="/teachers" className="hover:underline">Teachers</Link></li>
            <li><Link to="/events" className="hover:underline">Events</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm text-gray-400">
            Karu,opposite assemblies of god church, B-close<br/>
            +234 706 093 645 0<br/>
            Immaculateheart@gmail.com
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Newsletter</h4>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input type="email" placeholder="Your email" className="flex-1 rounded-xl px-3 py-2 text-gray-900" />
            <button className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Immaculate heart intl. school. All rights reserved.
      </div>
    </footer>
  )
}

