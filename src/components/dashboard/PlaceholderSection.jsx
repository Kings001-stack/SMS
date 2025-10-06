import { motion } from 'framer-motion'

export default function PlaceholderSection({ title, subtitle = 'Preview section', items = [] }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {(items.length ? items : defaultItems(title)).map((t, i) => (
          <motion.div
            key={i}
            className="p-4 border rounded-xl hover:shadow-sm"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <div className="font-semibold text-gray-900">{t.title}</div>
            <div className="text-sm text-gray-600 mt-1">{t.meta}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function defaultItems(title){
  return [
    { title: `${title} – Overview`, meta: 'Sample item' },
    { title: `${title} – Recent`, meta: 'Sample item' },
    { title: `${title} – Activity`, meta: 'Sample item' },
    { title: `${title} – Stats`, meta: 'Sample item' },
  ]
}
