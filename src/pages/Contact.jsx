export default function Contact() {
  return (
    <section className="container-pad py-14">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-gray-700 mt-3">Have questions? Send a message and we'll respond by email.</p>

      <form className="bg-white border rounded-2xl p-6 shadow-sm mt-6 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Full Name</label>
            <input className="w-full mt-1 border rounded-xl px-3 py-2" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input type="email" className="w-full mt-1 border rounded-xl px-3 py-2" placeholder="you@example.com" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm">Message</label>
          <textarea className="w-full mt-1 border rounded-xl px-3 py-2 h-28" placeholder="How can we help?"></textarea>
        </div>
        <button className="mt-4 bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl">Send Message</button>
      </form>

      <div className="mt-8 text-sm text-gray-600">
        <div><strong>Address:</strong> 123 Unity Road, Ikeja, Lagos</div>
        <div><strong>Phone:</strong> +234 706 093 9450</div>
        <div><strong>Email:</strong> immaculate@gmail.com</div>
      </div>
    </section>
  )
}

