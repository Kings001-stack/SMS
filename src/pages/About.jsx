export default function About() {
  return (
    <section className="container-pad py-14">
      <h1 className="text-3xl font-bold">About Immaculate heart intl. school</h1>
      <p className="mt-4 text-gray-700">
        Founded in 1998, Immaculate heart intl. school is a vibrant learning community committed to academic excellence and character building.
        We nurture students to become critical thinkers, effective communicators, and compassionate leaders.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          { label: "Mission", text: "To inspire excellence, integrity, and lifelong learning." },
          { label: "Vision", text: "To be a leading institution shaping globally-minded citizens." },
          { label: "Values", text: "Respect, Responsibility, Collaboration, Creativity." }
        ].map((b) => (
          <div key={b.label} className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold">{b.label}</h3>
            <p className="text-sm text-gray-600 mt-2">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

