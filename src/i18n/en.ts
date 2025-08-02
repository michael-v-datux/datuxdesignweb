export default {
  seo: {
    title: "Michael Vyhivskyi – UX/UI & Product Designer focused on B2B experiences",
    description: "Experienced UX/UI & Product Designer specializing in intuitive, scalable, and user-focused B2B digital solutions. Based in Kyiv, open to global collaboration.",
  },
  redirect: {
    initial: "Setting up your language…",
    final: "Almost done…",
  },
  navigation: {
    home: "Hello",
    about: "About me",
    portfolio: "Portfolio",
    articles: "Articles",
    contact: "Contact",
  },
  hero: {
    titleLine1: "Designing products",
    titleLine2: {
      before: "with",
      purpose: "purpose",
      and: "and",
      precision: "precision"
    },
    subtitleLine1: "Hi there, I’m Michael Vyhivskyi — a UX/UI & Product Designer",
    subtitleLine2: "with 6+ years of experience crafting intuitive, scalable interfaces."
  },
  keyStrengths: {
    title: "Designing for Impact",
    items: [
      {
        title: "Systematic UX Thinking",
        description: "Over 5 years in B2B product design taught me to approach challenges through structure, logic, and consistency. I design with systems in mind and users at the center.",
        style: "bordered"
      },
      {
        title: "Simplifying Complex Interfaces",
        description: "Worked on CRMs, dashboards, and enterprise tools — always aiming to reduce cognitive load and increase usability through clear layout and content hierarchy, but not only.",
        style: "gradient-border",
        size: "large",
        image: "/images/c-img-four.svg",
        customClass: "sci-img md:row-span-2 min-h-[320px] md:min-h-auto"
      },
      {
        title: "Design Systems & Scalability",
        description: "Built and maintained design systems from scratch — ensuring UI consistency, reusability, and smooth collaboration across teams.",
        image: "/images/c-img-two.svg",
        style: "bordered",
        customClass: "dss-img"
      },
      {
        title: "Cross-Team Communication",
        description: "From marketing to dev, I bridge disciplines with clarity. I’m comfortable presenting design rationale to stakeholders and syncing with technical teams.",
        style: "gradient",
        image: "/images/c-img-three.svg",
        customClass: "ctc-img"
      },
      {
        title: "Product-Focused Execution",
        description: "Every UI decision ties back to user needs and business goals — from onboarding flows to microinteractions. I think in flows, not just screens.",
        style: "bordered",
        twoColumn: true,
        image: "/images/c-img-five.svg",
        sideImage: "/images/form.svg",
        customClass: "pfe-img relative"
      }
    ]
  },
  projects: {
      comingSoon: "Coming soon...",
      pageNotFound: "Project Not Found"
  },
  selectedProjects: {
    title: "Selected Projects",
    items: [
      { title: "Management Solutions", category: "Master Data", link: "/projects/master-data-management-solutions" },
      { title: "System", category: "Design", link: "/projects/design-system" },
      { title: "Engine", category: "Search", link: "/projects/search-engine" },
      { title: "Materials", category: "Marketing", link: "/projects/marketing-materials" },
      { title: "Strategy", category: "Danube Region", link: "/projects/danube-strategy" },
      { title: "Consultancy", category: "Agency", link: "/projects/agency-consultancy" }
    ]
  },
  availability: {
    title: "Let’s build great products together",
    subtitle: "Hi there! I’m open to joining a team where design is valued, and challenges are approached systemically.",
    tags: [
      { label: "Full-time", color: "green" },
      { label: "Project-base", color: "green" },
      { label: "On-site", color: "green" },
      { label: "Remote", color: "green" },
      { label: "Flexible schedule", color: "green" },
      { label: "Hybrid", color: "yellow" },
      { label: "Relocate", color: "yellow" },
      { label: "Visa sponsorship welcome", color: "yellow" },
      { label: "No gambling", color: "red" },
      { label: "No 18+ content", color: "red" }
    ],
    note: "If you're hiring for a UX/UI or Product Designer, feel free to reach out — I’m always happy to discuss how I can help."
  },
  contact: {
    title: "Contacts",
    formTitle: "Contact via form",
    name: "Name",
    email: "Email",
    vacancy: "Company, Vacancy or Project link",
    message: "Message",
    send: "Send",
    emailTitle: "Send an email",
    emailTitleSub: "via service you prefer",

    // Validation hints
    hints: {
      name: "Full name is preferable, but not mandatory.",
      email: "Example: you@email.com",
      vacancy: "Enter a valid link, without https://",
      message: "At least 6 characters."
    },

    // Validation errors
    errors: {
      name: "Name must be at least 1 character.",
      email: "Please enter a valid email address.",
      vacancy: "Please enter a valid link.",
      message: "Message must be at least 6 characters."
    },

    // Submission confirmation modal
    success: {
      message: "Your message has been sent successfully! 🚀",
      subMessage: "Thank you for reaching out! I'll reply shortly",
      ok: "OK"
    }
  },
  footer: {
    copyright: "All content, including password-protected case studies, is the author's intellectual property and may not be copied, shared, or reproduced in any form without explicit permission.",
    madeWith: "Made with",
  },
  about: {
    title: "Designing for complexity, clarity, and people",
    description: [
      "Specializing in designing digital products for complex systems, mainly in B2B SaaS, I focus on making tools intuitive, beautiful, and business-effective.",
      "That means translating ambiguity into clarity and workflows into experiences people enjoy using. From building a design system from scratch to refining an onboarding flow, the goal remains: thinking in systems and design for humans."
    ]
  },
  protectedProjects: {
    defaultTitle: "Project",
    title: "Protected Project",
    subtitle: "This project is password protected.",
    passwordPlaceholder: "Enter password",
    termsText: "Access to this project is provided for review purposes only. All content is the author’s intellectual property and may not be copied, shared, or reproduced without explicit permission.",
    checkboxLabel: "I have read and accept these terms.",
    checkboxError: "You must accept the terms to proceed.",
    unlockButton: "Unlock",
    backButton: "Back",
    wrongPassword: "Wrong password. Try again.",
    accessGranted: "Access granted"
  },
  cookies: {
    bannerText: "This site uses cookies to analyze traffic and improve your experience.",
    learnMore: "Learn more",
    learnMoreLink: "/cookie-policy",
    accept: "Accept",
    decline: "Decline",
    changeSettings: "Change cookie settings",
    declined: "You have declined cookies. Analytics will not be loaded.",
    accepted: "You have accepted cookies. Analytics is now enabled."
  },
  privacy: {
    title: "Privacy Policy",
    intro: "We value your privacy. This Privacy Policy explains how we collect, use, and protect your data when you interact with this website.",
    lastUpdated: "Last updated: July 26, 2025",
    sections: {
      dataCollected: {
        title: "What data do we collect?",
        content: [
          "We collect only the information you voluntarily provide via the contact form (such as your name, email, and message).",
          "We also use Google Analytics to gather anonymized data, such as IP address, browser type, and approximate location, to understand how users interact with the site."
        ]
      },
      usage: {
        title: "How do we use your data?",
        content: [
          "To respond to your inquiries submitted via the contact form.",
          "To analyze site traffic and improve the user experience through Google Analytics."
        ]
      },
      sharing: {
        title: "Do we share your data?",
        content: [
          "We do not share your personal data with third parties, except when required by law."
        ]
      },
      rights: {
        title: "Your rights",
        content: [
          "You can request access to the data you provided, ask for corrections, or request deletion by contacting us at <a href='mailto:sayhi@datux.design' class='text-blue-600 hover:underline inline-block'>sayhi@datux.design</a>."
        ]
      },
      contact: {
        title: "Contact",
        content: [
          "For any questions regarding this Privacy Policy or your data, contact us at <a href='mailto:sayhi@datux.design' class='text-blue-600 hover:underline inline-block'>sayhi@datux.design</a>."
        ]
      }
    }
  },
  cookiesPolicy: {
    title: "Cookie Policy",
    intro: "This Cookie Policy explains how we use cookies and similar technologies on this website.",
    sections: {
      whatAreCookies: {
        title: "What are cookies?",
        content: [
          "Cookies are small text files stored on your device when you visit a website. They help us provide a better user experience and analyze traffic."
        ]
      },
      howWeUse: {
        title: "How do we use cookies?",
        content: [
          "We use only essential cookies and Google Analytics cookies to analyze traffic and improve the site's performance."
        ]
      },
      control: {
        title: "How can you control cookies?",
        content: [
          "You can accept or decline non-essential cookies through the banner shown when you visit the site.",
          "You can also disable cookies in your browser settings, but some features may not work properly."
        ]
      }
    },
      lastUpdated: "Last updated: July 26, 2025"
    },
    terms: {
      title: "Terms of Use",
      content: [
        "All content on this website, including text, images, and password-protected case studies, is the intellectual property of the author.",
        "You may not copy, distribute, or reproduce any content without explicit written permission.",
        "This website is provided for informational and portfolio purposes only. While we aim to ensure the accuracy of information, we do not guarantee its completeness or reliability.",
        "We may update these Terms of Use at any time without prior notice. Continued use of the site means you accept the updated terms.",
        "For any questions regarding these terms, please contact us at <a href='mailto:sayhi@datux.design' class='text-blue-600 hover:underline'>sayhi@datux.design</a>."
      ],
      lastUpdated: "Last updated: July 26, 2025"
    }
  };

export const messages = {
    wrongPassword: "Wrong password",
    tooManyAttempts: "Too many attempts. Try again in {time}.",
    retryNow: "You can try again now."
};