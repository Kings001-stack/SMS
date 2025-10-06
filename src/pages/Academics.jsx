export default function Academics() {
  const programs = [
    { name: "Junior Secondary (JSS 1–3)", desc: "Foundational curriculum across sciences, arts, and technology." },
    { name: "Primary(grade 1–5)", desc: "Primary curricular and common en" },
    { name: "STEM Club", desc: "Robotics, coding, and science fairs." },
    { name: "Arts & Culture", desc: "Visual arts, drama, and music." },
    { name: "Sports", desc: "Football, athletics, basketball, and more." },
  ]
  return (
    <section className="container-pad py-14">
      <h1 className="text-3xl font-bold">Academics & Programs</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {programs.map(p => (
          <div key={p.name} className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
