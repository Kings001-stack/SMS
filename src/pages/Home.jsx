import { Link } from 'react-router-dom'
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  TrophyIcon,
  PlayIcon,
  ArrowRightIcon,
  PhoneIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <>
      {/* Hero Section with Background Video */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/src/assets/hero.jpeg"
          >
            <source src="/src/assets/hero-vid.mp4" type="video/mp4" />
            <source src="/src/assets/hero-video.webm" type="video/webm" />
            {/* Fallback for browsers that don't support video */}
            <img src="/src/assets/hero.jpeg" alt="Students" className="w-full h-full object-cover" />
          </video>
          
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="container-pad py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center text-white">
              {/* School Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                <AcademicCapIcon className="w-5 h-5" />
                <span>Immaculate Heart International School</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                We are the{' '}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  heroes
                </span>{' '}
                of tomorrow
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                Welcome to Immaculate Heart International School — a nurturing community focused on 
                academic excellence and character development.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/auth/signup" 
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-red-lg"
                >
                  <PlayIcon className="w-5 h-5" />
                  Get Started
                </Link>
                <Link 
                  to="/academics" 
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 px-8 py-4 rounded-xl transition-all duration-200"
                >
                  <BookOpenIcon className="w-5 h-5" />
                  Explore Academics
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 px-8 py-4 rounded-xl transition-all duration-200"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Contact Us
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {[
                  { icon: UserGroupIcon, number: '1.2k+', label: 'Students' },
                  { icon: TrophyIcon, number: '95%', label: 'Pass Rate' },
                  { icon: AcademicCapIcon, number: '30+', label: 'Clubs' }
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-extrabold text-white mb-1">{stat.number}</div>
                    <div className="text-sm uppercase tracking-wide text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <section className="container-pad py-14 grid md:grid-cols-3 gap-6">
        {[
          { 
            title: "Qualified Teachers", 
            text: "Experts passionate about teaching and mentoring.",
            icon: AcademicCapIcon
          },
          { 
            title: "Modern Facilities", 
            text: "Well-equipped labs, library, and sports grounds.",
            icon: BookOpenIcon
          },
          { 
            title: "Holistic Education", 
            text: "Academic excellence with arts, sports, and leadership.",
            icon: TrophyIcon
          }
        ].map((c) => (
          <div key={c.title} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-red-lg transition-all duration-300 transform hover:scale-105">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <c.icon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg text-secondary-900 mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-white">
        <div className="container-pad py-14">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Latest News & Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 1, title: "Science Fair 2024", description: "Annual science exhibition showcasing student innovations and discoveries." },
              { id: 2, title: "Sports Week", description: "Inter-house competitions and athletic events for all students." },
              { id: 3, title: "Cultural Day", description: "Celebrating diversity through music, dance, and traditional displays." }
            ].map((event) => (
              <article key={event.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-red-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <BookOpenIcon className="w-16 h-16 text-primary-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-secondary-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <Link to="/events" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Read more 
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

