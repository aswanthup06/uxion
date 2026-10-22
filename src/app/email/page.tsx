function MailIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 7 5.2a1.7 1.7 0 0 0 2 0L20 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 2.9 19a1.4 1.4 0 0 0 1.2 2.1h15.8a1.4 1.4 0 0 0 1.2-2.1L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 9v4.5m0 3h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const subjectLines = [
  "Application for UI/UX Designer Position",
  "Frontend Developer Application - John Doe",
  "Applying for Product Designer Role | [Your Name]",
];

const documents = [
  { title: "Updated resume", note: "Use a clear filename, such as YourName_Resume.pdf" },
  { title: "Portfolio link", note: "Check that your projects open correctly" },
  { title: "Cover letter", note: "Optional, unless the job asks for one" },
  { title: "Relevant certifications", note: "Optional; include only what supports your application" },
];

const checklist = [
  "Correct recipient email address",
  "Professional subject line",
  "Resume attached and properly named",
  "Portfolio link works and is included",
  "No spelling or grammar mistakes",
];

const mistakes = [
  "Sending an email without a subject line",
  "Forgetting to attach your resume",
  "Using an unprofessional email address",
  "Writing a message that is too long",
  "Leaving out a relevant portfolio link",
  'Using a generic greeting like “To whom it may concern”',
];

const steps = [
  { number: "01", title: "Use a clear subject line", description: "Make the role immediately obvious. If the employer provided a reference number or a required format, follow it." },
  { number: "02", title: "Introduce yourself briefly", description: "Keep your introduction concise. Mention the position, then highlight one or two relevant skills or experiences in two or three sentences." },
  { number: "03", title: "Attach the right documents", description: "Include the materials requested in the job description. Keep filenames professional and make links easy to open." },
  { number: "04", title: "Review before sending", description: "A quick final review can prevent avoidable mistakes. Check each item before you press send." },
];

export default function EmailGuidePage() {
  return (
    <main className="h-dvh overflow-y-auto bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Simple editorial header */}
        <header className="mb-14 border-b border-slate-200 pb-10 sm:mb-16 sm:pb-12">
          <div className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <MailIcon className="h-5 w-5" />
            <span>ZENOWAY CAREER GUIDE</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            How to write a professional job application email
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A thoughtful email helps recruiters understand who you are and why you could be a good fit. Follow these practical steps to make a confident first impression.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>4 simple steps</span>
            <span aria-hidden="true" className="text-slate-300">•</span>
            <span>Sample email</span>
            <span aria-hidden="true" className="text-slate-300">•</span>
            <span>Pre-send checklist</span>
          </div>
        </header>

        {/* Steps: plain content, no individual cards */}
        <section aria-label="Steps for writing a job application email" className="mb-16">
          {steps.map((step, index) => (
            <article key={step.number} className={`grid gap-4 py-8 sm:grid-cols-[72px_1fr] sm:gap-6 ${index !== 0 ? "border-t border-slate-200" : "pt-0"}`}>
              <div className="text-sm font-bold tracking-widest text-blue-700">{step.number}</div>
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{step.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">{step.description}</p>

                {index === 0 && (
                  <div className="mt-5 space-y-3">
                    {subjectLines.map((subject) => (
                      <div key={subject} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{subject}</span>
                      </div>
                    ))}
                  </div>
                )}

                {index === 1 && (
                  <p className="mt-4 max-w-2xl border-l-2 border-blue-500 pl-4 text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-900">Tip:</span> Focus on what you can contribute to the company—not only on what you hope to gain from the role.
                  </p>
                )}

                {index === 2 && (
                  <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {documents.map((document) => (
                      <div key={document.title}>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                          {document.title}
                        </div>
                        <p className="mt-1 pl-6 text-sm leading-6 text-slate-500">{document.note}</p>
                      </div>
                    ))}
                  </div>
                )}

                {index === 3 && (
                  <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                        <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* The only boxed section: sample email */}
        <section aria-labelledby="sample-heading" className="mb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Ready-to-use example</p>
            <h2 id="sample-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Sample job application email</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Adapt this example to your experience and the role. Replace the placeholders before sending.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-500">New message</span>
            </div>
            <div className="p-5 sm:p-8">
              <div className="mb-6 space-y-3 border-b border-slate-100 pb-5 text-sm">
                <p><span className="inline-block w-16 font-medium text-slate-500">To</span><span className="text-slate-700">Hiring manager / recruiter</span></p>
                <p className="flex items-start"><span className="inline-block w-16 shrink-0 font-medium text-slate-500">Subject</span><span className="font-semibold text-slate-800">Application for UI/UX Designer Position | [Your Name]</span></p>
              </div>
              <div className="space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p>Dear Hiring Team,</p>
                <p>I hope you are doing well.</p>
                <p>I am writing to apply for the UI/UX Designer position at your company. My experience in creating user-centered interfaces and designing responsive web and mobile applications has helped me develop skills that I would be excited to bring to your team.</p>
                <p>Please find my resume attached for your review. You can also view selected projects in my portfolio:</p>
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-800">Portfolio: </span><span className="break-all text-blue-700">https://yourportfolio.com</span></p>
                <p>Thank you for your time and consideration. I would welcome the opportunity to discuss how my skills and experience align with this role.</p>
                <p className="pt-2">Best regards,<br /><span className="font-semibold text-slate-900">[Your Name]</span><br />[your.email@example.com]<br />[Your phone number]</p>
              </div>
              <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                <strong>Before sending:</strong> Personalize the role title, experience, portfolio URL, and contact details. Remember to attach your resume.
              </p>
            </div>
          </div>
        </section>

        {/* Plain-text checklist style for common mistakes */}
        <section aria-labelledby="mistakes-heading" className="border-t border-slate-200 pt-10">
          <div className="flex items-start gap-3">
            <AlertIcon className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">Final reminders</p>
              <h2 id="mistakes-heading" className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Common mistakes to avoid</h2>
            </div>
          </div>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {mistakes.map((mistake) => (
              <li key={mistake} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-14 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm leading-6 text-slate-500">A thoughtful email is a small step toward presenting your application professionally.</p>
          <p className="mt-2 text-xs font-medium text-slate-400">Zenoway · Career resources</p>
        </footer>
      </div>
    </main>
  );
}
