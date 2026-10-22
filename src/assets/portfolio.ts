import architha_resume_pdf from '#/assets/Chiluvoju_Architha_Resume.pdf'
import aditi_consultants from '#/assets/aditi_consultants_image.jpg'
import aditi_portfolio from '#/assets/aditi_portfolio_image.jpg'
import cert_gdg from '#/assets/certificate/Architha_Chiluvoju_certificate_s13.jpeg'
import cert_ai from '#/assets/certificate/Certificate-aitools.pdf'
import cert_python from '#/assets/certificate/course_certificate_python.pdf'
import cert_js from '#/assets/certificate/Coursera_certificate_prog_js.pdf'

export const profile = {
  name: 'Architha Chiluvoju',
  location: 'Hyderabad, Telangana, IN',
  email: 'architha108@gmail.com',
  phone: '+91 6281285042',
  resumeHref: architha_resume_pdf,
  phoneHref: 'tel:+916281285042',
  lede: "I build the systems that decide who gets in, what they can touch, and how it's tracked — role-based access control, document platforms, and hiring pipelines used inside real organizations.",
}

export const stats = [
  { num: '3', label: 'Years Experience' },
  { num: '3', label: 'Enterprise Systems Shipped' },
  { num: '60%', label: 'Storage Cost Cut (RFP)' },
  { num: '2', label: 'Live Client Sites' },
]

export const ticker = [
  'Java', 'Spring Boot', 'React.js', 'PostgreSQL',
  'Spring Security', 'JWT', 'Node.js', 'REST APIs',
]

export const skills = [
  { title: 'Languages', items: ['Java', 'JavaScript', 'Python', 'SQL', 'HTML5', 'CSS3'] },
  { title: 'Frontend', items: ['React.js', 'React Hooks', 'React Query', 'React Table', 'React Hook Form', 'ES6+'] },
  { title: 'Backend', items: ['Spring Boot', 'Spring Security', 'REST APIs', 'Microservices', 'JWT Auth', 'Node.js', 'PostgreSQL'] },
  { title: 'Tools & Infra', items: ['Git', 'Maven', 'Postman', 'Swagger', 'JavaMailSender', 'Zod', 'OTP Auth'] },
]

export const experience = [
  {
    id: '01',
    title: 'BLARC — Business Logic & Role-based Access Control',
    sub: 'Access & identity platform',
    points: [
      'Designed and built a role-based access control system using Spring Boot, Spring Security, and JWT.',
      'Integrated OTP authentication validating login via username, password, and one-time code.',
      'Built a Petition Management System for role/permission requests with admin approval and audit tracking.',
      'Engineered a Document Management System replacing external services with internal APIs.',
      'Built Node.js microservices for notifications across WhatsApp, calls, SMS, Zoom, and Google Meet.',
    ],
    stack: ['Spring Boot', 'React.js', 'React Query', 'React Table', 'MySQL'],
  },
  {
    id: '02',
    title: 'RFP — Request for Proposal Management System',
    sub: 'Procurement workflow platform',
    points: [
      'Built a platform managing the full proposal lifecycle, from creation through evaluation.',
      'Implemented multi-level approval hierarchies with document version control.',
      'Replaced third-party document storage with a custom system, cutting costs by 60%.',
      'Designed OTP-based, multi-factor authentication for secure access.',
      'Built automated deadline and stakeholder notifications.',
    ],
    stack: ['Spring Boot', 'React.js', 'React Query', 'React Table', 'PostgreSQL'],
  },
  {
    id: '03',
    title: 'ATS — Applicant Tracking System',
    sub: 'Hiring pipeline platform',
    points: [
      'Built a candidate management system for job postings, applications, and evaluations.',
      'Developed a configurable Candidate Pipeline from application to final placement.',
      'Implemented a resume parser extracting structured data from multiple document formats.',
      'Added team collaboration with user invitations and role-based access.',
      'Built an automated notification scheduler for candidates and hiring managers.',
    ],
    stack: ['Spring Boot', 'React.js', 'React Query', 'React Table', 'PostgreSQL'],
  },
]

export const liveProjects = [
  {
    name: 'Aditi Consultants',
    url: 'https://aditi-consultancy.vercel.app/',
    image: aditi_consultants,
    tags: ['Business website', 'Architecture', 'Hyderabad'],
    desc: 'Website for an architectural, structural and project-management consultancy in Hyderabad, serving clients since 2001. It presents the firm\'s services and projects, such as Anvaya Villas, with a clear "Book Consultation" call to action.',
  },
  {
    name: 'Aditi Pochampally — Portfolio',
    url: 'https://aditi-portfolio-website-one.vercel.app/',
    image: aditi_portfolio,
    tags: ['Personal portfolio', 'Architecture', 'M.Arch · ASU \'26'],
    desc: 'An editorial portfolio for an architect, built around practice, experience, capabilities, recognition and additional works, with Revit BIM and code-compliance expertise up front and a one-click resume.',
  },
]

export const otherProjects = [
  { name: 'Digital College Magazine Platform', desc: 'Content-sharing platform for students with a built-in CMS.' },
  { name: 'Computer Vision Object Detection', desc: 'Object detection in Python using the YOLO v3 algorithm.' },
  { name: 'College Event Management System', desc: 'Event tracking web app with real-time communication.' },
  { name: 'Competitive Programming', desc: 'Verified HackerRank medals; participant in ML workshops.' },
]

export type Cert = {
  name: string
  issuer: string
  kind: 'PDF' | 'Image'
  file: string          // opens in a new tab
  preview?: string      // shows a thumbnail (images only)
  tags: string[]
}

export const certs: Cert[] = [
  {
    name: 'Building 100% Postgres-Compatible AI Applications with Google Cloud — Season 13',
    issuer: 'GDG Cloud Kochi · Code Vipassana',
    kind: 'Image',
    file: cert_gdg,
    preview: cert_gdg,
    tags: ['PostgreSQL', 'Google Cloud', 'AI applications'],
  },
  { name: 'JavaScript, HTML, CSS', issuer: 'Duke University', kind: 'PDF', file: cert_js, tags: ['JavaScript', 'HTML', 'CSS'] },
  { name: 'Python Programming', issuer: 'University of Michigan', kind: 'PDF', file: cert_python, tags: ['Python'] },
  { name: 'AI Tools & Productivity Certification', issuer: 'Be10x', kind: 'PDF', file: cert_ai, tags: ['AI tools', 'Productivity'] },
]