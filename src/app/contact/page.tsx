export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-white/70">Contact Us</h1>

      <p className="text-white/70 leading-7 mb-4">
        We’d love to hear from you! If you have questions, feedback, or 
        partnership opportunities, feel free to reach out.
      </p>

      <ul className="text-white/70 leading-7 mb-6">
        <li>Email: <a href="mailto:support@zenoway.com" className="text-blue-600">support@zenoway.com</a></li>
        <li>Website: <a href="https://zenoway.com" className="text-blue-600">www.zenoway.com</a></li>
      </ul>

      <p className="text-white/70">
        Our team will get back to you as soon as possible.
      </p>
    </main>
  );
}
