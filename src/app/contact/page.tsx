export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <p className="text-gray-700 leading-7 mb-4">
        We’d love to hear from you! If you have questions, feedback, or 
        partnership opportunities, feel free to reach out.
      </p>

      <ul className="text-gray-700 leading-7 mb-6">
        <li>Email: <a href="mailto:support@uxcurve.in" className="text-blue-600">support@uxcurve.in</a></li>
        <li>Website: <a href="https://uxcurve.in" className="text-blue-600">www.uxcurve.in</a></li>
      </ul>

      <p className="text-gray-700">
        Our team will get back to you as soon as possible.
      </p>
    </main>
  );
}
