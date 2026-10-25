-- Zenoway Supabase Seed Script
-- Realistic Indian career opportunities for development and testing.
-- All records are clearly distinguishable with is_test_data = true and a [Test Dataset] marker.
-- Do not import, copy, or retain any records from Google Sheets.

-- Clean up any prior test records before seeding
DELETE FROM public.jobs WHERE is_test_data = TRUE;

INSERT INTO public.jobs (
  id,
  title,
  company,
  location,
  experience,
  posted_date,
  salary,
  mail,
  company_link,
  apply,
  description,
  views,
  employment_type,
  work_mode,
  applicant_country,
  valid_through,
  is_test_data,
  status
) VALUES
(
  'JOB1001',
  'Senior Product Designer [Test Dataset]',
  'Razorpay',
  'Bengaluru, Karnataka',
  '4-7 years',
  now() - INTERVAL '1 day',
  '₹22–32 LPA',
  'design-careers@razorpay.demo',
  'https://razorpay.com',
  'https://razorpay.com/jobs/senior-product-designer',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
We are seeking an experienced Senior Product Designer to spearhead design initiatives for our merchant checkout and payment gateway experiences. You will collaborate closely with product managers, engineers, and data analysts to design intuitive, high-conversion interfaces used by millions of businesses across India.

### Responsibilities:
• Lead end-to-end product design across web and mobile surfaces for merchant-facing tools.
• Conduct usability evaluations, user interviews, and translate complex financial workflows into elegant user interfaces.
• Maintain and contribute to our centralized design system in Figma.
• Partner closely with frontend engineers to ensure high-fidelity implementation and motion fidelity.

### Requirements:
• 4+ years of hands-on product design experience in high-growth SaaS, fintech, or consumer tech products.
• Deep proficiency in Figma, design systems, interactive prototyping, and user journey mapping.
• Strong portfolio demonstrating structured problem-solving, UI craft, and measurable business outcomes.
• Excellent written and verbal communication skills.',
  42,
  'FULL_TIME',
  'Hybrid',
  'IN',
  now() + INTERVAL '45 days',
  TRUE,
  'published'
),
(
  'JOB1002',
  'Creative Frontend Developer [Test Dataset]',
  'CRED',
  'Bengaluru, Karnataka',
  '2-5 years',
  now() - INTERVAL '2 days',
  '₹18–28 LPA',
  'careers@cred.demo',
  'https://cred.club',
  'https://cred.club/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Join the design engineering crew at CRED. We care deeply about micro-interactions, smooth 60fps animations, typography, and web performance. You will be building interactive web experiences that wow users.

### Responsibilities:
• Build responsive, accessible, and high-performance web applications using Next.js, React, TypeScript, and Tailwind CSS.
• Implement rich micro-animations and physics-driven UI transitions with Framer Motion and WebGL.
• Collaborate with product designers to bridge the gap between design vision and technical execution.
• Optimize Core Web Vitals and ensure frictionless mobile browser experiences.

### Requirements:
• 2–5 years of modern frontend engineering experience with React, Next.js, and TypeScript.
• Expertise in responsive web design, CSS layout techniques, and animation libraries (Framer Motion / GSAP).
• Passion for craft, accessibility (WCAG), and clean component architecture.
• Familiarity with modern build tooling and performance profiling.',
  88,
  'FULL_TIME',
  'Onsite',
  'IN',
  now() + INTERVAL '60 days',
  TRUE,
  'published'
),
(
  'JOB1003',
  'Lead UI/UX Designer [Test Dataset]',
  'Swiggy',
  'Remote, India',
  '5+ years',
  now() - INTERVAL '3 days',
  '₹26–36 LPA',
  'design-jobs@swiggy.demo',
  'https://swiggy.com',
  'https://careers.swiggy.com',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Swiggy is looking for a Lead UI/UX Designer to architect next-generation delivery and quick-commerce experiences. This is a fully remote role open to exceptional design leaders across India.

### Responsibilities:
• Own the user experience strategy for high-volume customer discovery and ordering funnels.
• Mentor junior and mid-level designers, fostering a culture of rapid iteration and design excellence.
• Drive user research studies, quantitative A/B testing, and usability benchmarking.
• Partner with executive stakeholders to align design roadmaps with organizational goals.

### Requirements:
• 5+ years of UX design experience in consumer-facing mobile or web applications at scale.
• Proven track record of launching impactful features with strong qualitative and quantitative results.
• Masterful command of Figma, design tokens, responsive typography, and mobile-first UX.
• Experience working with distributed, cross-functional agile squads.',
  135,
  'FULL_TIME',
  'Remote',
  'IN',
  now() + INTERVAL '30 days',
  TRUE,
  'published'
),
(
  'JOB1004',
  'Design Systems Engineer [Test Dataset]',
  'Postman',
  'Remote, India',
  '3-6 years',
  now() - INTERVAL '4 days',
  '₹20–30 LPA',
  'careers@postman.demo',
  'https://postman.com',
  'https://www.postman.com/company/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
We are seeking a Design Systems Engineer to maintain and scale our multi-platform UI component library. You will work at the intersection of design and code, providing tools and components used daily by dozens of product squads.

### Responsibilities:
• Maintain and evolve accessible UI component libraries built in React, TypeScript, and Storybook.
• Manage design tokens across web, desktop, and documentation platforms.
• Ensure WCAG 2.1 AA accessibility standards across all primitives.
• Document component guidelines, write automated visual regression tests, and assist engineering teams with adoption.

### Requirements:
• 3+ years of experience specializing in design systems, component libraries, and frontend infrastructure.
• Advanced proficiency in React, TypeScript, Radix UI or headless UI primitives, and modern CSS.
• Strong understanding of accessibility standards (ARIA, keyboard navigation, contrast).
• Excellent documentation and developer advocacy skills.',
  74,
  'FULL_TIME',
  'Remote',
  'IN',
  now() + INTERVAL '45 days',
  TRUE,
  'published'
),
(
  'JOB1005',
  'Junior UI/UX Designer [Test Dataset]',
  'CareStack',
  'Kochi, Kerala',
  '0-2 years',
  now() - INTERVAL '5 days',
  '₹6–9 LPA',
  'talent@carestack.demo',
  'https://carestack.com',
  'https://carestack.com/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
CareStack is looking for an enthusiastic Junior UI/UX Designer to join our Kochi office. If you have an eye for clean aesthetics, intuitive workflows, and a strong foundational grasp of user-centered design, this is the perfect role to accelerate your career.

### Responsibilities:
• Create wireframes, user journeys, mockups, and prototypes for healthcare SaaS applications.
• Assist senior designers in conducting usability tests and compiling feedback into actionable refinements.
• Prepare design assets and inspect frontend builds for visual precision.
• Maintain organized design files and adhere to the corporate design system.

### Requirements:
• 0–2 years of experience or a compelling design portfolio showcasing web/mobile UI case studies.
• Solid grasp of Figma, layout grids, visual hierarchy, and interaction patterns.
• Degree in Design, Human-Computer Interaction, Computer Science, or self-taught equivalent with strong portfolio.
• Willingness to learn, receive constructive feedback, and collaborate actively.',
  61,
  'FULL_TIME',
  'Onsite',
  'IN',
  now() + INTERVAL '30 days',
  TRUE,
  'published'
),
(
  'JOB1006',
  'Frontend Engineering Intern [Test Dataset]',
  'Zerodha',
  'Bengaluru, Karnataka',
  'Fresher',
  now() - INTERVAL '6 days',
  '₹35,000–50,000/month',
  'hiring@zerodha.demo',
  'https://zerodha.com',
  'https://zerodha.com/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Zerodha is hiring Frontend Interns who are passionate about building fast, minimalistic, and resilient web tools. You will work alongside our core team building high-performance charting and investment tools.

### Responsibilities:
• Build performant and clean UI components in HTML, CSS, JavaScript, and modern frameworks.
• Assist in debugging cross-browser issues and improving mobile responsiveness.
• Participate in design and code reviews with senior engineers.

### Requirements:
• Final year students or recent graduates in Computer Science or related fields.
• Solid understanding of vanilla JavaScript (ES6+), DOM APIs, HTML5, and CSS.
• Basic familiarity with React, Next.js, or Vue.
• Curiosity about financial markets and fintech products.',
  198,
  'INTERN',
  'Onsite',
  'IN',
  now() + INTERVAL '20 days',
  TRUE,
  'published'
),
(
  'JOB1007',
  'UX Researcher [Test Dataset]',
  'Zomato',
  'Gurugram, Haryana',
  '2-4 years',
  now() - INTERVAL '7 days',
  '₹14–20 LPA',
  'research@zomato.demo',
  'https://zomato.com',
  'https://www.zomato.com/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
We are seeking an empathetic UX Researcher to join Zomato in Gurugram. You will champion the voice of dining customers, delivery partners, and restaurant owners, translating research into actionable design opportunities.

### Responsibilities:
• Conduct qualitative research including 1-on-1 interviews, contextual inquiries, and usability testing.
• Design and analyze quantitative user surveys and customer satisfaction metrics.
• Present compelling research reports and customer journey frameworks to design and product teams.
• Partner with product managers to validate hypotheses before development begins.

### Requirements:
• 2–4 years of experience as a UX Researcher or User Researcher in consumer internet products.
• Expertise in qualitative research methodologies, usability testing tools, and survey design.
• Excellent storytelling skills to convey user needs and friction points clearly.
• Bachelor’s or Master’s degree in Psychology, HCI, Design, or equivalent practical experience.',
  47,
  'FULL_TIME',
  'Hybrid',
  'IN',
  now() + INTERVAL '30 days',
  TRUE,
  'published'
),
(
  'JOB1008',
  'Interaction & Motion Designer [Test Dataset]',
  'Urban Company',
  'Gurugram, Haryana',
  '3-5 years',
  now() - INTERVAL '8 days',
  '₹16–24 LPA',
  'design@urbancompany.demo',
  'https://urbancompany.com',
  'https://www.urbancompany.com/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Urban Company is looking for a talented Interaction & Motion Designer to craft micro-interactions, delightful onboarding animations, and design system motion tokens for our mobile app ecosystem.

### Responsibilities:
• Design micro-interactions, state transitions, and loading states for our consumer and partner apps.
• Create Lottie animations, SVG animations, and video prototypes for mobile and web surfaces.
• Establish motion design guidelines and tokens within our Figma design system.
• Work with mobile engineers (React Native, iOS, Android) to ensure smooth 60fps implementation.

### Requirements:
• 3+ years of interaction and motion design experience.
• Mastery of After Effects, Lottie, Figma, and Principle or ProtoPie.
• Strong portfolio highlighting refined animation timing, easing curves, and UI interaction mechanics.
• Understanding of technical constraints in mobile environments.',
  53,
  'FULL_TIME',
  'Hybrid',
  'IN',
  now() + INTERVAL '45 days',
  TRUE,
  'published'
),
(
  'JOB1009',
  'Senior UI Engineer [Test Dataset]',
  'Freshworks',
  'Chennai, Tamil Nadu',
  '4-8 years',
  now() - INTERVAL '9 days',
  '₹20–30 LPA',
  'careers@freshworks.demo',
  'https://freshworks.com',
  'https://www.freshworks.com/company/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Freshworks is looking for an experienced Senior UI Engineer to craft customer engagement interfaces. You will build resilient, accessible, and scalable UI modules for our global suite of SaaS products.

### Responsibilities:
• Architect, implement, and maintain high-traffic frontend features in React and TypeScript.
• Collaborate with designers to translate wireframes and specifications into accessible web pages.
• Drive frontend performance optimizations, unit testing, and automated integration testing.
• Mentor engineers and champion clean code standards.

### Requirements:
• 4+ years of professional web development experience with React, TypeScript, and state management.
• Deep expertise in semantic HTML, modern CSS architectures, and RESTful API integration.
• Familiarity with Jest, React Testing Library, and CI/CD pipelines.
• Strong debugging and cross-browser troubleshooting capabilities.',
  39,
  'FULL_TIME',
  'Hybrid',
  'IN',
  now() + INTERVAL '60 days',
  TRUE,
  'published'
),
(
  'JOB1010',
  'Mobile UI/UX Designer [Test Dataset]',
  'Meesho',
  'Bengaluru, Karnataka',
  '2-5 years',
  now() - INTERVAL '10 days',
  '₹15–22 LPA',
  'design-team@meesho.demo',
  'https://meesho.io',
  'https://meesho.io/careers',
  '**[Test Dataset - For Development & Testing Only]**

### About the Role
Join Meesho’s product design team to create e-commerce experiences tailored for the next billion internet users in India. We focus on lightweight, intuitive, and multilingual mobile experiences.

### Responsibilities:
• Design intuitive consumer flows for product discovery, checkout, and vernacular communication.
• Conduct research with Tier-2 and Tier-3 Indian consumers to uncover behavioral nuances.
• Produce rapid prototypes in Figma and test hypotheses with real user cohorts.
• Collaborate with engineering teams to ensure pixel-perfect delivery across diverse Android devices.

### Requirements:
• 2–5 years of mobile UX/UI design experience, ideally in consumer e-commerce or social platforms.
• Deep understanding of Android design patterns, Material Design, and mobile performance factors.
• Strong portfolio demonstrating end-to-end mobile app design for Indian audiences.
• Empathy for diverse user personas and vernacular design needs.',
  94,
  'FULL_TIME',
  'Onsite',
  'IN',
  now() + INTERVAL '30 days',
  TRUE,
  'published'
);

-- Reset sequence to the next number
SELECT setval('public.job_id_seq', 1011, false);
