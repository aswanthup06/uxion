export default function EmailGuidePage() {
  return (
    <div className="h-full overflow-scroll">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 md:px-8">
        {/* Header with accent */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How to Send a Professional Job Application Email
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A well-written email helps recruiters quickly understand who you are
            and why you're a good fit for the role. Follow these simple steps to
            improve your chances of getting noticed.
          </p>
        </div>

        {/* Steps with icons */}
        <div className="space-y-6 mb-16">
          {/* Step 1 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Use a Clear Subject Line
                </h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Application for UI/UX Designer Position</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Frontend Developer Application - John Doe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Applying for Product Designer Role | [Your Name]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Introduce Yourself Briefly
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Keep your introduction short and professional. Mention the role
                  you're applying for and highlight your relevant skills or
                  experience in 2-3 sentences maximum.
                </p>
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                  💡 Pro tip: Focus on what you can bring to the company, not just what you want from them
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Attach Important Documents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Updated Resume', 'Portfolio Link', 'Cover Letter (Optional)', 'Relevant Certifications (Optional)'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Double Check Before Sending
                </h2>
                <div className="space-y-2">
                  {[
                    'Correct recipient email address',
                    'Professional subject line',
                    'Resume attached and properly named',
                    'Portfolio link works and is included',
                    'No spelling or grammar mistakes'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Email Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="text-2xl font-bold text-gray-900">Sample Job Application Email</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-sm text-gray-500 ml-3">example@email.com</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Subject:</span>
                <span className="ml-2 text-gray-700">Application for UI/UX Designer Position / Your Name</span>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Dear Hiring Team,</p>
                <p>I hope you are doing well.</p>
                <p>
                  I am writing to apply for the UI/UX Designer position at your
                  company. With 3+ years of experience creating user-centered interfaces
                  and designing responsive web and mobile applications, I'm confident
                  I can contribute effectively to your team.
                </p>
                <p>
                  Please find my resume attached for your review. I have also
                  included my portfolio link below.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Portfolio:</span>{' '}
                    <a href="#" className="text-blue-600 hover:underline">https://yourportfolio.com</a>
                  </p>
                </div>
                <p>
                  Thank you for your time and consideration. I look forward to the
                  opportunity to discuss my application further.
                </p>
                <div className="pt-4">
                  <p>
                    Best regards,<br />
                    <span className="font-medium">Your Name</span><br />
                    your.email@example.com<br />
                    +91 XXXXX XXXXX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">
                Common Mistakes to Avoid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Sending an email without a subject line',
                  'Forgetting to attach your resume',
                  'Using an unprofessional email address',
                  'Writing very long email messages',
                  'Not including a portfolio link when applicable',
                  'Generic greetings like "To whom it may concern"'
                ].map((mistake, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Use this guide to craft your next job application email and stand out from other candidates
          </p>
        </div>
      </div>
    </div>
  );
}