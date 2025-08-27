export const jobs = [
  {
    id: 1,
    title: "UI/UX Designer",
    company: "NewBorn Tecc",
    location: "Kozhikode",
    experience: "2 - 4 Years",
    postedDate: "20/8/2024",
    salary: "₹8-12 LPA",
    description: `We are seeking a talented UI/UX Designer to create intuitive, user-friendly designs.
Responsibilities include:
- Designing wireframes, prototypes, and user interfaces
- Collaborating with developers and product managers
- Ensuring responsive, accessible design
Skills Required: Figma, Adobe XD, React basics`,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignWorks Studio",
    location: "Bengaluru",
    experience: "3 - 5 Years",
    postedDate: "18/8/2025",
    salary: "₹10-14 LPA",
    description: `We are looking for a creative Product Designer.
Responsibilities:
- Conduct user research and usability testing
- Translate insights into design solutions
- Create wireframes, prototypes, and UI mockups
Skills Required: Figma, Sketch, UX Research, Prototyping`,
  },
  {
    id: 3,
    title: "UX Researcher",
    company: "UserFirst Labs",
    location: "Hyderabad",
    experience: "2 - 4 Years",
    postedDate: "15/8/2025",
    salary: "₹8-11 LPA",
    description: `Seeking a UX Researcher to understand user needs.
Responsibilities:
- Conduct interviews, surveys, and usability studies
- Analyze user behavior and pain points
- Provide insights to improve product design
Skills Required: User Research, Personas, Usability Testing, Analytics`,
  },
  {
    id: 4,
    title: "Interaction Designer",
    company: "Innovate Labs",
    location: "Delhi",
    experience: "4 - 6 Years",
    postedDate: "22/8/2025",
    salary: "₹12-16 LPA",
    description: `We need an Interaction Designer to craft seamless user experiences.
Responsibilities:
- Design user flows and interaction models
- Work closely with product managers and developers
- Ensure intuitive navigation and usability
Skills Required: Interaction Design, Figma, Motion Design, Prototyping`,
  },
  {
    id: 5,
    title: "Visual Designer",
    company: "Creative Hub",
    location: "Mumbai",
    experience: "2 - 5 Years",
    postedDate: "25/8/2025",
    salary: "₹9-13 LPA",
    description: `Looking for a Visual Designer to enhance UI aesthetics.
Responsibilities:
- Create visual assets, icons, and illustrations
- Work with UI/UX designers to refine interfaces
- Ensure brand consistency across digital platforms
Skills Required: Photoshop, Illustrator, Figma, Branding`,
  },
  {
    id: 6,
    title: "UI Designer",
    company: "BrightTech Pvt Ltd",
    location: "Chennai",
    experience: "3 - 6 Years",
    postedDate: "24/8/2025",
    salary: "₹10-15 LPA",
    description: `Join our team as a UI Designer to design intuitive dashboards and apps.
Responsibilities:
- Develop clean and modern UI layouts
- Collaborate with UX researchers and frontend developers
- Ensure responsive, pixel-perfect designs
Skills Required: Figma, Zeplin, Design Systems, Responsive UI`,
  },
  {
    id: 7,
    title: "UX Designer",
    company: "NextGen Solutions",
    location: "Pune",
    experience: "2 - 4 Years",
    postedDate: "19/8/2025",
    salary: "₹8-12 LPA",
    description: `Hiring a UX Designer to improve product usability.
Responsibilities:
- Conduct usability testing
- Create user flows and wireframes
- Collaborate with developers for implementation
Skills Required: UX Design, Wireframing, Usability Testing, Prototyping`,
  },
  {
    id: 8,
    title: "Design System Specialist",
    company: "PixelCraft",
    location: "Bengaluru",
    experience: "4 - 7 Years",
    postedDate: "23/8/2025",
    salary: "₹12-18 LPA",
    description: `Looking for a Design System Specialist to build and maintain scalable UI components.
Responsibilities:
- Define and manage design tokens
- Create reusable UI patterns and components
- Ensure design consistency across platforms
Skills Required: Figma, Design Systems, Atomic Design, Documentation`,
  },

  // ✅ Duplicate variations to make 50 jobs
  ...Array.from({ length: 42 }).map((_, i) => ({
    id: i + 9,
    title: "UI/UX Designer",
    company: `Creative Agency ${i + 1}`,
    location: ["Kozhikode", "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"][i % 7],
    experience: ["1 - 3 Years", "2 - 4 Years", "3 - 5 Years", "4 - 6 Years"][i % 4],
    postedDate: `${10 + (i % 20)}/8/2025`,
    salary: ["₹6-9 LPA", "₹8-12 LPA", "₹10-15 LPA", "₹12-18 LPA"][i % 4],
    description: `We are hiring UI/UX Designers to join our growing team.
Responsibilities:
- Create wireframes, prototypes, and user journeys
- Work with developers to deliver pixel-perfect UI
- Improve usability and accessibility
Skills Required: Figma, Adobe XD, Prototyping, User Research`,
  })),
];
