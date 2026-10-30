// scripts/enhanceAllJobsData.mjs
// Pristine, professionally enhanced job descriptions for all 58 jobs.

import fs from "fs";

export const CUSTOM_JOB_DESCRIPTIONS = {
  JOB1000: `SWEET DESIGN HUB is looking for a creative and passionate Fresher UI/UX Designer to join our design studio. You will collaborate with senior designers to kickstart your career and craft engaging, intuitive digital experiences across web and mobile platforms.

Key Responsibilities:
• Collaborate with design leads to conceptualize and craft user-friendly interfaces.
• Create wireframes, user flows, and interactive prototypes for web and mobile apps.
• Participate in design critiques, user research, and usability testing sessions.
• Assist in maintaining and expanding design systems and component libraries.

Requirements:
• Degree or certification in Design, HCI, or related field.
• Strong foundational knowledge of Figma and UI/UX design principles.
• Eagerness to learn, receive feedback, and grow in a fast-paced environment.
• A portfolio showcasing personal, academic, or client design projects.

Perks & Benefits:
• Direct mentorship from experienced design practitioners.
• Hands-on exposure to real-world client design challenges.
• Supportive, creative, and collaborative team culture.`,

  JOB1001: `OFB Tech is looking for an experienced UI/UX Designer to craft powerful, practical, and intuitive digital interfaces for our fintech platforms. You will tackle complex workflows, design admin platforms and B2B dashboards, and translate data into elegant design solutions that scale.

Key Responsibilities:
• Design end-to-end admin platforms, B2B dashboards, and internal tools with complex workflows.
• Translate quantitative data and user analytics into actionable interface improvements.
• Collaborate closely with cross-functional teams and product managers in an agile environment.
• Maintain and scale design systems and ensure pixel-perfect visual execution.
• Articulate and present design decisions persuasively to stakeholders.

Requirements:
• 3–5 years of hands-on UI/UX design experience, particularly in B2B or SaaS products.
• Strong understanding of user-centered design, design thinking, and interaction design principles.
• Proficiency in modern design tools (Figma) and familiarity with AI-assisted design workflows.
• Excellent communication, presentation, and collaboration skills.
• Passion for detail and pixel-perfect execution.

Perks & Benefits:
• Continuous learning with access to design workshops, conferences, and resources.
• Ownership and autonomy to drive design solutions end-to-end.
• Celebrations, offsites, and a collaborative, high-energy culture.`,

  JOB1002: `Blurbpoint Media is looking for an enthusiastic Web Designer to join our digital agency team. You will work on real client projects converting design concepts into clean, responsive, and high-performing websites.

Key Responsibilities:
• Convert PSD, Figma, and design mockups into responsive HTML/CSS web pages.
• Build modern, mobile-friendly landing pages and multi-page client websites.
• Collaborate with web developers and digital marketers to optimize layouts and performance.
• Troubleshoot cross-browser compatibility and responsive styling issues.

Requirements:
• Solid understanding of HTML5, CSS3, JavaScript, and Bootstrap.
• Familiarity with converting design files (PSD, Figma) into web templates.
• Knowledge of responsive design principles and mobile-first layouts.
• Strong eye for typography, alignment, and visual aesthetics.
• Eagerness to learn new web technologies and take on creative challenges.`,

  JOB1003: `Pocketful is seeking a creative and user-focused UI/UX Designer to join our fast-growing fintech team. You will play a key role in shaping modern, intuitive financial products that empower users to manage, invest, and grow their wealth effortlessly.

Key Responsibilities:
• Design intuitive user flows, wireframes, and high-fidelity mockups for web and mobile fintech products.
• Collaborate closely with product managers and engineers to implement seamless user experiences.
• Conduct user research, usability testing, and analyze product metrics to optimize user journeys.
• Maintain and evolve a scalable design system with consistent design tokens and components.

Requirements:
• 1+ years of UI/UX design experience working on mobile apps or web platforms.
• Proficiency in modern design and prototyping tools like Figma.
• Strong understanding of information architecture, user journeys, and interaction design.
• Passion for financial technology, problem-solving, and creating delightful user experiences.`,

  JOB1004: `Yellowchalk is looking for a passionate UI/UX Designer to join our design studio team. You will craft intuitive, pixel-perfect interfaces that delight users and deliver transformative digital products for diverse clients.

Key Responsibilities:
• Craft intuitive, pixel-perfect interfaces and seamless design systems across web and mobile platforms.
• Transform complex user requirements into elegant wireframes, user flows, and interactive prototypes.
• Collaborate closely with developers, strategists, and clients to bring design visions to life.
• Participate in design critiques, workshops, and user feedback sessions.

Requirements:
• 1–2 years of hands-on experience in UI/UX design for web and mobile products.
• Proficiency with industry-standard design tools, particularly Figma.
• Strong visual aesthetic, typography skills, and attention to micro-interactions.
• Proven portfolio demonstrating user-centric design thinking and clean visual execution.

Perks & Benefits:
• Collaborative studio culture that celebrates every milestone.
• Hands-on work with diverse clients on cutting-edge products.
• Clear growth paths and ongoing learning opportunities.`,

  JOB1006: `Hyeon Infotech is looking for a creative UI/UX & Graphic Designer to join our product team. In this dual-focus creative role, you will design engaging user interfaces for digital products while also creating impactful visual assets for marketing and brand identity.

Key Responsibilities:
• Design intuitive UI layouts, wireframes, and prototypes for mobile and web applications.
• Create high-converting graphic design assets, illustrations, banners, and marketing creatives.
• Work closely with development teams to ensure pixel-perfect design implementation.
• Maintain visual consistency and brand guidelines across all digital touchpoints.

Requirements:
• 1.5–2 years of experience in UI/UX and graphic design.
• Strong portfolio demonstrating UI design (Figma, Adobe XD) and visual design (Photoshop, Illustrator).
• Solid understanding of typography, color theory, grid systems, and responsive design.
• Strong communication skills and collaborative mindset.

Perks & Benefits:
• Creative, growth-driven, and collaborative culture.
• Opportunities to work on diverse product-based applications.`,

  JOB1007: `Tridizi is looking for a creative and detail-oriented UI/UX Designer to join our team. You will take ownership of interface design, crafting intuitive and engaging digital experiences across web and mobile products.

Key Responsibilities:
• Design user-friendly web and mobile interfaces that align with user needs and product goals.
• Create wireframes, interactive prototypes, and production-ready mockups.
• Collaborate with developers and product managers throughout the product lifecycle.
• Conduct user research, usability testing, and analyze product feedback.
• Improve overall user engagement, retention, and satisfaction through iterative design.
• Stay updated with the latest industry design trends, patterns, and technologies.

Requirements:
• 1+ years of proven experience in UI/UX design.
• Proficiency in Figma, wireframing tools, and design system workflows.
• Strong understanding of user-centered design, responsive layouts, and information architecture.
• Ability to communicate design decisions clearly and work in an agile team.`,

  JOB1008: `Dexio Designs is looking for a motivated UI/UX Design Intern skilled in Figma to join our startup team. You will gain hands-on experience designing real-world digital products in a flexible, collaborative environment.

Key Responsibilities:
• Design user-friendly interfaces for web and mobile applications.
• Create wireframes, interactive prototypes, and high-fidelity mockups.
• Collaborate with the core team to refine product design and user workflows.
• Assist in building visual components and design documentation.

Requirements:
• Strong Figma skills and working knowledge of prototyping.
• Good visual aesthetic sense, typography, and layout fundamentals.
• A neat design portfolio showcasing UI/UX concepts or case studies.
• Creativity, attention to detail, and a strong eagerness to learn and iterate.

Perks & Benefits:
• Real-world startup experience with high ownership.
• Direct mentorship and career growth opportunities.
• Flexible, collaborative, and supportive team culture.`,

  JOB1010: `Nykaa is looking for an experienced Senior UX Researcher to lead research initiatives across our beauty and fashion e-commerce platforms. You will uncover deep user insights, guide product decisions, and shape intuitive shopping experiences for millions of consumers.

Key Responsibilities:
• Plan, design, and conduct qualitative and quantitative user research studies, usability tests, and field studies.
• Translate complex user behaviors and data into actionable insights, journey maps, and research reports.
• Partner with product managers, UX/UI designers, and engineers to inform product roadmap and design solutions.
• Establish research frameworks, benchmarking metrics, and standard user testing methodologies.

Requirements:
• 5+ years of hands-on experience in user experience research, ideally within e-commerce or consumer-facing digital products.
• Expertise in qualitative research methods, usability testing, persona development, and data synthesis.
• Strong ability to present insights persuasively to cross-functional stakeholders and leadership.
• Passion for understanding consumer psychology and driving user-centric innovation.`,

  JOB1015: `Ksolves India Limited is looking for a Senior UI/UX Designer to join our creative team. You will lead the design of cutting-edge digital experiences, working alongside product managers and engineers to craft seamless user journeys and scalable design systems.

Key Responsibilities:
• Design stunning interfaces and seamless user journeys for enterprise and consumer applications.
• Collaborate closely with cross-functional product and development teams from concept to launch.
• Build, prototype, test, and deliver pixel-perfect designs.
• Establish, maintain, and scale comprehensive design systems across multiple products.

Requirements:
• 5+ years of professional experience in UI/UX design.
• Expert proficiency in Figma, Adobe XD, Sketch, and prototyping tools.
• Strong expertise in wireframing, user research, usability testing, and interaction design.
• Thorough understanding of design systems, WCAG accessibility standards, and responsive design.
• Bonus experience with Motion UI, micro-interactions, and AI-powered design tools.`,

  JOB1020: `MindzMap Digital Solutions is looking for a talented UI Designer to craft stunning, intuitive user interfaces across web and mobile applications. You will translate wireframes and user flows into modern visual designs that inspire and delight users.

Key Responsibilities:
• Create high-fidelity mockups, visual components, and interactive prototypes for web and mobile.
• Collaborate with UX researchers, product managers, and developers throughout the delivery cycle.
• Maintain visual consistency and implement scalable design system standards.
• Conduct visual QA to ensure development matches approved design specifications.

Requirements:
• 1–3 years of UI design experience with a strong portfolio of live applications.
• Mastery of Figma, auto-layout, components, and prototyping.
• Solid grasp of visual hierarchy, typography, color palettes, and responsive grid layouts.
• Excellent attention to detail and strong team communication skills.`,

  JOB1022: `Rapidsoft Technologies is looking for a skilled React Developer to build scalable, high-performance web applications. You will work on cutting-edge digital products, collaborating with UI/UX designers and backend engineers to deliver exceptional user experiences.

Key Responsibilities:
• Develop modular, reusable front-end components using React.js and modern JavaScript (ES6+).
• Translate UI/UX designs and wireframes into high-quality, responsive web code.
• Optimize application performance, load times, and cross-browser responsiveness.
• Integrate RESTful APIs and state management solutions (Redux, Context API).
• Participate in code reviews, testing, and continuous deployment workflows.

Requirements:
• 3+ years of professional software development experience in React.js.
• Strong proficiency in HTML5, CSS3, JavaScript/TypeScript, and modern front-end build pipelines.
• Experience with state management (Redux, Zustand, or React Query) and asynchronous API integration.
• Familiarity with Git, component-driven development, and agile methodologies.
• Strong problem-solving mindset and dedication to clean, maintainable code.`,

  JOB1024: `Asymmetri is looking for a creative and detail-oriented UI/UX Designer to join our team. You will take full ownership of the end-to-end design process, transforming complex product requirements into intuitive user journeys and polished interfaces.

Key Responsibilities:
• Take end-to-end ownership of product design from discovery and user flows to wireframes and final UI.
• Design intuitive, responsive interfaces for web and mobile applications.
• Build, document, and scale consistent design systems and component libraries.
• Collaborate with engineers to ensure seamless implementation of interactions and animations.
• Conduct usability tests and gather user feedback to iterate on core product features.

Requirements:
• 2+ years of UI/UX design experience with a strong digital product portfolio.
• Advanced proficiency in Figma and prototyping tools.
• Strong understanding of user research, interaction design, and design token architecture.
• Excellent communication skills and ability to articulate design rationale clearly.`,

  JOB1025: `Yoeki Soft Private Limited is looking for a passionate UI Developer to join our engineering team. You will bridge the gap between design and technology, translating creative mockups into clean, performant, and responsive front-end code.

Key Responsibilities:
• Develop responsive, accessible, and high-performance user interfaces using modern web technologies.
• Collaborate with UI/UX designers to translate Figma mockups into pixel-perfect web pages.
• Optimize web applications for maximum speed, scalability, and cross-browser compatibility.
• Write modular, maintainable CSS/SCSS and clean JavaScript components.

Requirements:
• 1–3 years of professional UI development experience.
• Strong proficiency in HTML5, CSS3, JavaScript, and responsive design frameworks.
• Working knowledge of modern front-end frameworks (React, Angular, or Vue).
• Strong understanding of CSS preprocessors, flexbox, grid, and CSS animations.
• Passion for clean code, pixel-perfect implementation, and modern web standards.`,

  JOB1030: `Infopine is looking for an enthusiastic Frontend Development Intern to join our development team. This internship offers students and fresh graduates an opportunity to gain hands-on experience working on real-world projects, building responsive interfaces, and collaborating with experienced engineers.

Key Responsibilities:
• Build responsive, mobile-friendly web pages using modern HTML, CSS, and JavaScript.
• Collaborate with designers and senior developers to implement user interface components.
• Assist in debugging front-end issues and optimizing website performance.
• Participate in code reviews, technical discussions, and sprint planning meetings.

Requirements:
• Solid foundation in HTML5, CSS3, JavaScript, and responsive web design.
• Familiarity with modern front-end libraries or frameworks (React, Vue, or Bootstrap).
• Understanding of Git version control and developer debugging tools.
• Eagerness to learn, solve technical problems, and work within an agile team.

Perks & Benefits:
• Hands-on experience working on live client projects.
• Direct mentorship and guidance from senior engineers.
• Opportunity for full-time employment based on performance.`,

  JOB1047: `Flight Mode Studio is looking for a talented Graphic Designer to join our creative team. You will turn ideas into compelling visual stories, working on branding projects, digital marketing campaigns, and presentation assets that help modern brands stand out.

Key Responsibilities:
• Design brand identities, social media creatives, digital marketing assets, and presentation decks.
• Collaborate with creative directors and marketers to develop distinctive visual concepts.
• Ensure consistent brand aesthetics, typography, and color harmony across all digital deliverables.
• Produce engaging visual content that drives audience engagement and brand recall.

Requirements:
• 2+ years of professional graphic design experience.
• Mastery of Adobe Creative Suite (Photoshop, Illustrator, InDesign) and Figma.
• Strong foundation in typography, layout composition, color theory, and branding.
• A diverse portfolio demonstrating creative storytelling and high-quality visual craft.
• Strong attention to detail and ability to work in a collaborative studio environment.`,

  JOB1048: `Flight Mode Studio is looking for an experienced UI/UX Designer to join our creative team. You will craft intuitive, visually appealing, and user-centric digital experiences, collaborating closely with developers and stakeholders to transform product ideas into polished digital applications.

Key Responsibilities:
• Craft seamless user journeys, information architectures, and wireframes for web and mobile products.
• Design modern, high-fidelity user interfaces with exceptional visual polish.
• Build interactive prototypes to test ideas and validate product assumptions.
• Partner with engineering teams to oversee design implementation and maintain design fidelity.

Requirements:
• 3+ years of hands-on experience in UI/UX design.
• Expert proficiency in Figma, design systems, and prototyping.
• Strong portfolio demonstrating end-to-end design thinking and pixel-perfect execution.
• Excellent communication skills and ability to present design rationale convincingly.`,

  JOB1049: `Flight Mode Studio is looking for an analytical and results-driven SEO Executive to join our marketing team. You will drive organic search growth, optimize website architectures, and implement data-backed search strategies that deliver measurable visibility and rankings.

Key Responsibilities:
• Conduct in-depth keyword research, competitive analysis, and content gap assessments.
• Execute on-page optimizations including meta tags, internal linking, and content structure.
• Perform technical SEO audits to resolve crawl errors, improve site speed, and enhance indexability.
• Monitor organic search performance, traffic analytics, and conversion metrics using Google Search Console and GA4.
• Collaborate with content creators and designers to align SEO strategy with user intent.

Requirements:
• 1+ years of proven experience in search engine optimization (SEO).
• Proficiency with SEO tools such as SEMrush, Ahrefs, Screaming Frog, and Google Search Console.
• Working knowledge of technical SEO principles, schema markup, and Core Web Vitals.
• Strong analytical mindset with the ability to turn data into actionable search optimizations.`,

  JOB1050: `Flight Mode Studio is looking for a data-driven Performance Marketing Executive to join our growth team. You will manage paid media campaigns, optimize customer acquisition channels, and drive measurable business ROI across digital advertising platforms.

Key Responsibilities:
• Plan, launch, and optimize paid campaigns across Google Ads, Meta Ads, and LinkedIn Ads.
• Monitor campaign metrics, conduct A/B testing on ad creatives and landing pages, and optimize for ROAS.
• Analyze conversion funnels and attribution models to maximize budget efficiency.
• Prepare regular performance reports with actionable insights and growth recommendations.
• Collaborate with designers and copywriters to develop high-converting ad creative.

Requirements:
• 1+ years of experience managing paid digital marketing campaigns.
• Hands-on expertise with Google Ads Manager, Meta Ads Manager, and Google Analytics.
• Strong grasp of CAC, ROAS, CTR, LTV, and performance marketing metrics.
• Analytical mindset with proficiency in Excel/Google Sheets for campaign data analysis.`,

  JOB1054: `Yourdevs is looking for an experienced UI/UX Designer to craft intuitive, user-centered digital experiences for real-world products. You will work closely with cross-functional teams to design seamless user journeys, modern interfaces, and scalable component systems.

Key Responsibilities:
• Design end-to-end user journeys, wireframes, and high-fidelity interfaces for web and mobile products.
• Collaborate closely with product managers and engineers from concept to delivery.
• Conduct user research, usability testing, and translate user feedback into design improvements.
• Build and maintain consistent design systems and component libraries.

Requirements:
• 2+ years of professional UI/UX design experience.
• Proficiency in Figma, wireframing, and interactive prototyping.
• Solid understanding of user-centered design principles and responsive web standards.
• Strong portfolio demonstrating problem-solving skills and clean visual aesthetics.

Perks & Benefits:
• Remote-first collaborative team environment.
• Opportunity to work on meaningful products with high ownership.
• Creative freedom and professional growth opportunities.`,

  JOB1041: `Stimuler is looking for a Creative Strategy Intern to join our global growth team in building virally engaging content for over 15 million users across 180+ countries. If you are obsessed with viral content, algorithm psychology, and the art of shareable storytelling, this is your playground.

Key Responsibilities:
• Script high-retention short-form videos (Reels, TikToks, Shorts) designed to maximize conversion and user acquisition.
• Identify trending hooks, cultural angles, and visual storytelling formats across global markets.
• Collaborate with and manage external creators and influencers to ensure seamless creative execution.
• Partner directly with growth leads to iterate on creative concepts based on audience analytics and performance metrics.

Requirements:
• Native understanding of short-form video culture and algorithm dynamics.
• Deep grasp of consumer psychology and what drives users to share and engage.
• Strong communication, project management, and creator coordination skills.
• Portfolio or links demonstrating high-performing content you have scripted, created, or managed.

Perks & Benefits:
• Work on a global product reaching millions of screens worldwide.
• High-speed, high-ownership, and deeply creative startup environment.
• Direct collaboration with founders and growth leadership.`,

  JOB1009: `Obrimo Technologies is looking for a passionate UI/UX Designer who can craft intuitive, user-centered, and visually engaging digital experiences. You will lead design strategies, conduct research, create prototypes, and collaborate on front-end component implementations.

Key Responsibilities:
• Conduct UX research, audits, and usability testing to drive continuous design improvements.
• Create user personas, journey maps, wireframes, and interactive prototypes to define product vision.
• Design and develop responsive UI components with modern front-end frameworks (React.js/Angular.js).
• Collaborate with product managers, developers, and compliance teams throughout the product lifecycle.
• Optimize digital applications for performance, scalability, and accessibility.
• Mentor junior team members and stay updated with emerging design trends and standards.

Requirements:
• 2–5 years of professional UI/UX design experience.
• Proficiency in modern design tools (Figma, Adobe XD) and front-end technologies (HTML, CSS, React.js/Angular.js).
• Strong understanding of user research, information architecture, and accessibility standards (WCAG).
• Excellent communication skills and ability to present design rationale to cross-functional teams.`,

  JOB1055: `Yourdevs is looking for a motivated UI/UX Design Intern to join our growing design team. You will collaborate with experienced designers and developers, contribute to user-centered digital products, and gain hands-on exposure to real client and product challenges.

Key Responsibilities:
• Assist in creating wireframes, mockups, and interactive prototypes for web and mobile apps.
• Collaborate with senior designers to refine user flows and interface elements.
• Conduct design research, competitor analysis, and gather visual inspiration.
• Participate in design reviews and incorporate feedback into iterative improvements.

Requirements:
• Good understanding of UI/UX design fundamentals and design thinking.
• Working knowledge of Figma and prototyping tools.
• Strong visual aesthetic sense, curiosity, and eagerness to learn.
• Portfolio of design coursework, personal projects, or case studies.

Perks & Benefits:
• Hands-on mentorship from senior designers and engineers.
• Experience working on live digital products.
• Supportive, collaborative, and growth-oriented work environment.`
};
