// src/data/categories.ts
// Comprehensive Tech, Design & IT Categories for Zenoway

export const JOB_CATEGORIES = [
  "UI/UX & Product Design",
  "Graphic & Visual Design",
  "Motion & 3D Design",
  "Frontend & UI Engineering",
  "Backend & Systems Engineering",
  "Full Stack Development",
  "DevOps, Cloud & Infrastructure",
  "QA & Automation Testing",
  "Data Science & AI / ML",
  "Product Management",
  "Marketing, SEO & Growth",
  "HR, Recruitment & Talent",
  "Sales & Business Development",
  "Customer Success & Support",
  "Other Tech & Creative",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

/**
 * Intelligent helper to match a job title (and optional description) to the closest canonical category.
 * Primary focus is always on the job title.
 */
export function matchJobCategory(input: string): JobCategory {
  const text = (input || "").toLowerCase().trim();

  // 1. UI/UX & Product Design
  if (
    /\b(ui\/?ux|ux\/?ui|user experience|user interface|product designer|product design|interaction design|interaction designer|design system|wirefram|figma|ux researcher|ux research)\b/i.test(
      text
    )
  ) {
    return "UI/UX & Product Design";
  }

  // 2. Graphic & Visual Design
  if (
    /\b(graphic|visual design|visual designer|brand designer|branding|illustrator|illustration|creatives|photoshop|banner designer|canva|print design)\b/i.test(
      text
    )
  ) {
    return "Graphic & Visual Design";
  }

  // 3. Motion & 3D Design
  if (
    /\b(motion|motion graphics|3d|3d artist|animator|animation|vfx|after effects|cinema 4d|blender|video editor|video editing)\b/i.test(
      text
    )
  ) {
    return "Motion & 3D Design";
  }

  // 4. Frontend & UI Engineering
  if (
    /\b(frontend|front-end|front end|ui developer|ui engineer|react|reactjs|next\.js|nextjs|vue|angular|web developer|javascript developer|typescript developer|css|html|tailwind)\b/i.test(
      text
    )
  ) {
    return "Frontend & UI Engineering";
  }

  // 5. Full Stack Development
  if (
    /\b(full stack|fullstack|mern|mean|software engineer|software developer|sde|web application developer)\b/i.test(
      text
    )
  ) {
    return "Full Stack Development";
  }

  // 6. Backend & Systems Engineering
  if (
    /\b(backend|back-end|back end|node\.?js|express|django|flask|spring boot|java developer|golang|go developer|rust developer|c\+\+|php developer|laravel|ruby|database engineer)\b/i.test(
      text
    )
  ) {
    return "Backend & Systems Engineering";
  }

  // 7. DevOps & Cloud
  if (
    /\b(devops|cloud engineer|aws|azure|gcp|docker|kubernetes|k8s|sre|site reliability|infrastructure|sysadmin|linux admin)\b/i.test(
      text
    )
  ) {
    return "DevOps, Cloud & Infrastructure";
  }

  // 8. QA & Software Testing
  if (
    /\b(qa|quality assurance|tester|test engineer|automation test|selenium|cypress|playwright|sdet|manual testing)\b/i.test(
      text
    )
  ) {
    return "QA & Automation Testing";
  }

  // 9. Data Science, AI & ML
  if (
    /\b(data science|data scientist|data analyst|machine learning|deep learning|ai engineer|mlops|nlp|big data|business intelligence|power bi|tableau|sql developer)\b/i.test(
      text
    )
  ) {
    return "Data Science & AI / ML";
  }

  // 10. Product Management
  if (
    /\b(product manager|product management|pm|scrum master|agile coach|product owner|technical product manager)\b/i.test(
      text
    )
  ) {
    return "Product Management";
  }

  // 11. Marketing, SEO & Growth
  if (
    /\b(marketing|seo|growth hacker|content writer|copywriter|social media|sem|campaign manager|brand manager|email marketer|performance marketing)\b/i.test(
      text
    )
  ) {
    return "Marketing, SEO & Growth";
  }

  // 12. HR, Recruitment & Talent (strictly matching HR title keywords, not just emails)
  if (
    /\b(human resources|hr manager|hr executive|hr generalist|talent acquisition|recruiter|recruitment|people operations|sourcer|technical sourcer)\b/i.test(
      text
    )
  ) {
    return "HR, Recruitment & Talent";
  }

  // 13. Sales & Business Development
  if (
    /\b(sales|business development|bde|sdr|bdr|account executive|account manager|client acquisition|telecaller)\b/i.test(
      text
    )
  ) {
    return "Sales & Business Development";
  }

  // 14. Customer Success & Support
  if (
    /\b(customer support|customer service|customer success|client success|technical support|helpdesk|service desk representative)\b/i.test(
      text
    )
  ) {
    return "Customer Success & Support";
  }

  return "UI/UX & Product Design";
}
