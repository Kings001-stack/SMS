const staff = [
  { name: "Mrs. Adaeze Okafor", role: "Principal" },
  { name: "Mr. Tunde Afolayan", role: "Mathematics" },
  { name: "Mrs. Chioma Eze", role: "English Language" },
  { name: "Mr. Daniel Etim", role: "Physics" },
  { name: "Ms. Zainab Bello", role: "Chemistry" },
  { name: "Mr. Emeka Nwosu", role: "ICT" },
]

export default function Teachers() {
  return (
    <section className="container-pad py-14">
      <h1 className="text-3xl font-bold">Our Staffs</h1>
      <p className="text-gray-700 mt-3">Experienced, compassionate educators dedicated to student success.</p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {staff.map(s => (
          <div key={s.name} className="bg-white border rounded-2xl p-6 shadow-sm text-center">
            <img src="/src/assets/avatar.svg" alt={s.name} className="w-20 h-20 mx-auto rounded-full mb-3" />
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600">{s.role}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
