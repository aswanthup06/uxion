// Edit this file when you have real WhatsApp links for a category.
// Each category gets its own named array (9 links, same order as REGIONS:
// Kerala, Remote, Tamil Nadu, UP, Karnataka, Maharashtra, Telangana,
// Delhi NCR, Other States). Replace a placeholder array's contents and
// nothing else in the app needs to change.

export const REGIONS = [
  { name: "Kerala Jobs Group", description: "Kochi, Kozhikode, Thiruvananthapuram, Thrissur, Kollam" },
  { name: "India Remote Jobs", description: "Remote openings across India" },
  { name: "Tamil Nadu Jobs Group", description: "Chennai, Coimbatore, Tirunelveli, Madurai, Trichy, Salem" },
  { name: "Uttar Pradesh Jobs Group", description: "Noida, Greater Noida, Ghaziabad, Lucknow, Kanpur, Agra, Prayagraj" },
  { name: "Karnataka Jobs Group", description: "Bangalore, Mangalore, Mysore, Hubli-Dharwad, Belgaum" },
  { name: "Maharashtra Jobs Group", description: "Pune, Mumbai, Navi Mumbai, Thane, Nagpur, Nashik" },
  { name: "Telangana Jobs Group", description: "Hyderabad, Warangal, Nizamabad, Khammam" },
  { name: "Delhi NCR Jobs Group", description: "Delhi, Gurgaon, Faridabad" },
  { name: "Other States Jobs Group", description: "All other states not listed above" },
];

const PLACEHOLDER = Array(9).fill("https://chat.whatsapp.com/JPf5mNgzwvLAsYeZtumbgg");

// Real — already live.
export const UI_UX_LINKS = [
  "https://chat.whatsapp.com/KZos56C8RXIAs1PsvwMeH4",
  "https://chat.whatsapp.com/KQh0RqyGEZY44sVhxikzX6",
  "https://chat.whatsapp.com/I8UpuixA5g27hFnISqPFo1",
  "https://chat.whatsapp.com/Had2rAA9b7eDMC3nvMktW7",
  "https://chat.whatsapp.com/Foelmp0RLPWAEHw7YEygUJ",
  "https://chat.whatsapp.com/EkscWFIRJ0iIlsuH20zQY3",
  "https://chat.whatsapp.com/E2OPbNEiDJbEzJ8EsmKkHb",
  "https://chat.whatsapp.com/K9IrBwMERm2LSnFYU7YvAT",
  "https://chat.whatsapp.com/CAuqFrENQ91D05Ha42m4SQ",
];

// Placeholders — paste your 9 real links into each array as you get them.
// Order stays Kerala → Remote → TN → UP → Karnataka → Maharashtra →
// Telangana → Delhi NCR → Other States.
export const SOFTWARE_DEV_LINKS = [...PLACEHOLDER];
export const QA_LINKS = [...PLACEHOLDER];
export const DEVOPS_CLOUD_LINKS = [...PLACEHOLDER];
export const DATA_AI_LINKS = [...PLACEHOLDER];
export const CYBERSECURITY_LINKS = [...PLACEHOLDER];
export const IT_INFRA_LINKS = [...PLACEHOLDER];
export const PRODUCT_PM_LINKS = [...PLACEHOLDER];
export const MARKETING_LINKS = [...PLACEHOLDER];
export const SALES_CS_LINKS = [...PLACEHOLDER];
export const HR_LINKS = [...PLACEHOLDER];
export const BUSINESS_OPS_LINKS = [...PLACEHOLDER];
export const CONTENT_WRITING_LINKS = [...PLACEHOLDER];
export const EMBEDDED_HARDWARE_LINKS = [...PLACEHOLDER];

export const CATEGORIES = [
  {
    name: "UI/UX & Design",
    subs: ["UI Designer", "UX Designer", "Product Designer", "Design System Designer", "UX Researcher", "Visual Designer"],
    links: UI_UX_LINKS,
  },
  {
    name: "Software Development",
    subs: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", "Game Developer"],
    links: SOFTWARE_DEV_LINKS,
  },
  {
    name: "Quality Assurance (QA)",
    subs: ["QA Engineer", "Automation Tester", "Manual Tester", "Performance Tester"],
    links: QA_LINKS,
  },
  {
    name: "DevOps & Cloud",
    subs: ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Platform Engineer"],
    links: DEVOPS_CLOUD_LINKS,
  },
  {
    name: "Data & AI",
    subs: ["Data Analyst", "Data Scientist", "Data Engineer", "Machine Learning Engineer", "AI Engineer", "Prompt Engineer"],
    links: DATA_AI_LINKS,
  },
  {
    name: "Cybersecurity",
    subs: ["Security Analyst", "Penetration Tester", "Security Engineer", "SOC Analyst"],
    links: CYBERSECURITY_LINKS,
  },
  {
    name: "IT Infrastructure & Support",
    subs: ["IT Support Engineer", "System Administrator", "Network Engineer", "Help Desk"],
    links: IT_INFRA_LINKS,
  },
  {
    name: "Product & Project Management",
    subs: ["Product Manager", "Project Manager", "Scrum Master", "Business Analyst"],
    links: PRODUCT_PM_LINKS,
  },
  {
    name: "Marketing",
    subs: ["Digital Marketing", "SEO Specialist", "Performance Marketing", "Content Marketing", "Social Media Manager"],
    links: MARKETING_LINKS,
  },
  {
    name: "Sales & Customer Success",
    subs: ["Technical Sales", "Customer Success Manager", "Customer Support", "Solutions Consultant"],
    links: SALES_CS_LINKS,
  },
  {
    name: "Human Resources (HR)",
    subs: ["HR Executive", "Talent Acquisition", "Technical Recruiter", "HR Business Partner"],
    links: HR_LINKS,
  },
  {
    name: "Business & Operations",
    subs: ["Operations Executive", "Process Analyst", "Business Operations"],
    links: BUSINESS_OPS_LINKS,
  },
  {
    name: "Content & Technical Writing",
    subs: ["Technical Writer", "Content Writer", "Documentation Specialist"],
    links: CONTENT_WRITING_LINKS,
  },
  {
    name: "Embedded & Hardware",
    subs: ["Embedded Engineer", "Firmware Engineer", "IoT Engineer", "Robotics Engineer"],
    links: EMBEDDED_HARDWARE_LINKS,
  },
].map((cat) => ({
  ...cat,
  groups: REGIONS.map((region, i) => ({ ...region, link: cat.links[i] })),
}));
