import React, { useState, useEffect, useRef } from "react";
import { TerminalWindow } from "./components/TerminalWindow";
import {
  Mail,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  Download,
  Eye,
  Send,
  Briefcase,
  Code,
  FileText,
  BookOpen,
  Server,
} from "./components/Icons";
import MatrixBackground from "./components/MatrixBackground";
import { useTypingEffect } from "./hooks/useTypingEffect";
import BottomStatusBar from "./components/BottomStatusBar";
import { Bootloader } from "./components/Bootloader";
import { Neofetch } from "./components/Neofetch";

// --- DATA ---
const portfolioData = {
  name: "Chandrakant Dubey",
  location: "Mumbai, Maharashtra",
  email: "919chandrakant@gmail.com",
  social: {
    linkedin: "chandra-kant-dubey",
    github: "chandrakantdubey",
    twitter: "__chandrakant__",
  },
  summary:
    "Fullstack Developer with experience building scalable web applications, including social platforms, e-commerce, and personalized recommendation systems. Skilled in creating real-time features, dynamic visualizations, and end-to-end solutions using JavaScript, TypeScript, and Python. Experienced in CI/CD, database design, and delivering reliable and user-focused applications.",
  experience: [
    {
      role: "Fullstack Developer",
      company: "Nutriiya",
      period: "Sep 2025 – Present",
      location: "Mumbai, MH",
      points: [
        "Developing fullstack web solutions with Vue.js, React.js, Next.js, and Tailwind CSS.",
        "Building scalable APIs using Node.js, NestJS, and FastAPI, integrating REST and GraphQL.",
        "Implemented CI/CD pipelines and automated deployment to AWS and Hostinger.",
        "Designed database models using PostgreSQL and MySQL for nutrition tracking applications.",
        "Deployed machine learning inference services for personalized nutrition recommendations.",
      ],
    },
    {
      role: "React Developer",
      company: "Kintree Pvt. Ltd.",
      period: "Nov 2024 – Aug 2025",
      location: "Mumbai, MH",
      points: [
        "Developed interactive family tree visualization using BalkanJS and React.js.",
        "Built real-time chat and notification system using Node.js, Socket.IO.",
        "Engineered social feed with TanStack Query for optimized data fetching and caching.",
        "Integrated Google Maps API for geolocation features.",
      ],
    },
    {
      role: "Frontend Engineer",
      company: "Uvation India Pvt. Ltd.",
      period: "Aug 2023 – Oct 2024",
      location: "Remote",
      points: [
        "Developed responsive React.js interfaces for e-commerce and rewards platform.",
        "Built reusable, performant components ensuring cross-browser compatibility.",
        "Improved UX by translating UI/UX wireframes into functional React components.",
        "Collaborated via Git, performed code reviews, and resolved performance bottlenecks.",
      ],
    },
  ],
  education: [
    {
      degree: "Master’s Diploma in Computer Science & Technology",
      institution: "MIA Digital University",
      period: "2022 – 2023",
    },
    {
      degree: "Bachelor of Engineering in Mechanical Engineering",
      institution: "Savitribai Phule Pune University",
      period: "Jun 2015 – Jun 2019",
    },
  ],
  skills: {
    Languages: ["JavaScript", "TypeScript", "Python", "HTML5", "CSS3", "SQL"],
    Frontend: [
      "React.js",
      "Next.js",
      "Vue.js",
      "Redux",
      "Tailwind CSS",
      "Styled Components",
    ],
    Backend: ["Node.js", "Express.js", "NestJS", "FastAPI", "Flask", "GraphQL"],
    Databases: ["PostgreSQL", "MySQL", "MongoDB"],
    "DevOps/Cloud": ["AWS", "Hostinger", "Docker", "CI/CD"],
    "Developer Tools": ["Git", "GitHub", "ViteJS", "Chart.js"],
  },
  projects: [
    {
      title: "NutriTrack AI",
      description:
        "A full-stack nutrition tracking application offering personalized meal recommendations powered by a machine learning inference service.",
      stack: ["Vue.js", "FastAPI", "PostgreSQL", "AWS", "ML"],
      link: "https://github.com/chandrakantdubey",
    },
    {
      title: "Kintree Connect",
      description:
        "A social platform featuring a dynamic family tree visualizer, real-time chat, notifications, and a highly optimized social feed.",
      stack: ["React.js", "Node.js", "Socket.IO", "TanStack Query"],
      link: "https://github.com/chandrakantdubey",
    },
    {
      title: "Markdown Arena",
      description:
        "A blog/notes markdown file renderer for topics like backend, frontend, React, Node.js, FastAPI, Python, JS, system design, etc.",
      stack: ["React.js", "Node.js", "Express", "Markdown"],
      link: "https://github.com/chandrakantdubey",
    },
    {
      title: "Terminal Portfolio",
      description:
        "This portfolio website, built to emulate a retro terminal interface. A personal project to showcase my skills in a creative way.",
      stack: ["React", "TypeScript", "Tailwind CSS"],
      link: "https://github.com/chandrakantdubey",
    },
  ],
  certifications: [
    "Next.js - Udemy, 2024",
    "Meta Front-End Developer - Coursera, 2023",
    "Full Stack Web Development - Newton School, 2023",
  ],
};

const themes = ["classic", "amber", "arctic", "hacker"];
const sectionIds = [
  "hero",
  "about",
  "projects",
  "experience",
  "resume",
  "contact",
  "terminal-101",
];

type SectionsRef = React.MutableRefObject<Map<string, HTMLElement | null>>;

interface SectionProps {
  sectionsRef: SectionsRef;
  onCommand: (command: string) => void;
}

interface HeroProps extends SectionProps {
  onScrollToSection: (id: string) => void;
}

// --- SECTION COMPONENTS ---
const Hero = ({ sectionsRef, onCommand, onScrollToSection }: HeroProps) => {
  const typedName = useTypingEffect(portfolioData.name, 100);
  return (
    <section
      id="hero"
      ref={(el) => {
        if (el) sectionsRef.current.set("hero", el);
      }}
      className="min-h-screen flex items-center justify-center pt-16"
    >
      <TerminalWindow title="whoami" onCommand={onCommand} autoFocus>
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)] mt-4 h-20">
            <span className="glitch" data-text={typedName}>
              {typedName}
            </span>
          </h1>
          <p className="mt-2 text-lg md:text-xl text-[var(--color-text-secondary)]">
            Full Stack Developer | Software Engineer | Open Source Enthusiast
          </p>
          <div className="mt-6 space-y-2 text-base md:text-lg text-left">
            <p className="flex items-start">
              <span className="text-[var(--color-text-primary)] mr-2">
                &gt;
              </span>{" "}
              Building scalable and performant web applications.
            </p>
            <p className="flex items-start">
              <span className="text-[var(--color-text-primary)] mr-2">
                &gt;
              </span>{" "}
              Creating real-time features and dynamic visualizations.
            </p>
            <p className="flex items-start">
              <span className="text-[var(--color-text-primary)] mr-2">
                &gt;
              </span>{" "}
              Contributing to open source and modern web development.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onScrollToSection("contact")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-alt)] transition-colors rounded-md"
            >
              <Briefcase className="w-5 h-5" /> ./contact.sh
            </button>
            <button
              onClick={() => onScrollToSection("projects")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-text-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-text-tertiary)] hover:text-black transition-colors rounded-md"
            >
              <Code className="w-5 h-5" /> ls -la projects/
            </button>
          </div>
        </div>
      </TerminalWindow>
    </section>
  );
};

const About = ({ sectionsRef, onCommand }: SectionProps) => (
  <section
    id="about"
    ref={(el) => {
      if (el) sectionsRef.current.set("about", el);
    }}
    className="py-16 md:py-24"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <TerminalWindow
        title="neofetch"
        icon={<Server className="w-5 h-5 text-[var(--color-text-primary)]" />}
        onCommand={onCommand}
      >
        <Neofetch name={portfolioData.name} summary={portfolioData.summary} />
      </TerminalWindow>
      <TerminalWindow
        title="ls skills/"
        icon={<Code className="w-5 h-5 text-[var(--color-text-primary)]" />}
        onCommand={onCommand}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {Object.entries(portfolioData.skills).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-[var(--color-text-primary)] font-semibold mb-1">
                {category}
              </h3>
              <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                {skills.map((skill) => (
                  <li key={skill} className="flex items-start">
                    <span className="text-[var(--color-text-primary)] mr-2">
                      &gt;
                    </span>{" "}
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </TerminalWindow>
    </div>
  </section>
);

const Projects = ({ sectionsRef, onCommand }: SectionProps) => (
  <section
    id="projects"
    ref={(el) => {
      if (el) sectionsRef.current.set("projects", el);
    }}
    className="py-16 md:py-24"
  >
    <TerminalWindow
      title="ls -la projects/"
      icon={<Code className="w-5 h-5 text-[var(--color-text-primary)]" />}
      fullWidth
      onCommand={onCommand}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolioData.projects.map((project, index) => (
          <div
            key={index}
            className="border border-[var(--color-border)] p-4 rounded-md bg-black/30 hover:bg-white/5 hover:border-[var(--color-primary)] transition-all duration-300 group"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                {project.title}
              </h3>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)] font-mono mb-2">
              -rwxr-xr-- 1 user staff{" "}
              {Math.floor(Math.random() * (20 - 2 + 1) + 2)}.
              {Math.floor(Math.random() * 9)}K Oct {28 - index} 15:3{index}{" "}
              {project.title.toLowerCase().replace(/\s+/g, "-")}
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm mb-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-white/10 text-[var(--color-text-primary)] px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TerminalWindow>
  </section>
);

const Experience = ({ sectionsRef, onCommand }: SectionProps) => (
  <section
    id="experience"
    ref={(el) => {
      if (el) sectionsRef.current.set("experience", el);
    }}
    className="py-16 md:py-24"
  >
    <TerminalWindow
      title="cat experience.log"
      icon={<Briefcase className="w-5 h-5 text-[var(--color-text-primary)]" />}
      fullWidth
      onCommand={onCommand}
    >
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-border)]"></div>
        {portfolioData.experience.map((job, index) => (
          <div key={index} className="mb-8 relative">
            <div className="absolute -left-[27px] top-1 w-4 h-4 bg-[var(--color-primary)] rounded-full border-4 border-[var(--color-bg-alt)]"></div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
              {job.role}
            </h3>
            <p className="text-[var(--color-text-tertiary)]">
              {job.company} | {job.period}
            </p>
            <ul className="mt-2 space-y-1 text-[var(--color-text-secondary)]">
              {job.points.map((point, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-[var(--color-text-primary)] mr-2">
                    &gt;
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </TerminalWindow>
  </section>
);

interface ResumeProps extends SectionProps {
  onQuickView: () => void;
}

const Resume = ({ sectionsRef, onCommand, onQuickView }: ResumeProps) => (
  <section
    id="resume"
    ref={(el) => {
      if (el) sectionsRef.current.set("resume", el);
    }}
    className="py-16 md:py-24"
  >
    <TerminalWindow
      title="./resume.pdf --view"
      icon={<FileText className="w-5 h-5 text-[var(--color-text-primary)]" />}
      fullWidth
      onCommand={onCommand}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Download Resume
          </h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Get the complete PDF version of my resume with detailed information
            about my experience, skills, and achievements.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a href="/Chandrakant_Dubey.pdf" download="Chandrakant_Dubey.pdf">
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg-alt)] font-bold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </a>
            <button
              onClick={onQuickView}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              <Eye className="w-5 h-5" /> Quick View
            </button>
          </div>
        </div>
        <div className="md:col-span-2 border border-[var(--color-border)] p-6 rounded-md bg-black/30">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {portfolioData.name}
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Full Stack Developer
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {portfolioData.email}
              </p>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {portfolioData.location}
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1 mb-2">
              Key Skills
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {Object.values(portfolioData.skills)
                .flat()
                .slice(0, 12)
                .join(", ")}
              ...
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1 mb-2">
                Education
              </h4>
              {portfolioData.education.map((edu) => (
                <div key={edu.institution} className="mt-2">
                  <p className="font-semibold text-[var(--color-text-secondary)] text-sm">
                    {edu.degree}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {edu.institution}, {edu.period}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1 mb-2">
                Certifications
              </h4>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1 mt-2">
                {portfolioData.certifications.map((cert) => (
                  <li key={cert}>&gt; {cert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TerminalWindow>
  </section>
);

interface ContactProps extends SectionProps {
  onSendMessage: (formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  setToast: (message: string | null) => void;
  isSending: boolean;
}

const Contact = ({
  sectionsRef,
  onCommand,
  onSendMessage,
  setToast,
  isSending,
}: ContactProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      setToast("Error: Name and message fields are required.");
      return;
    }
    onSendMessage(formData).then(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
    });
  };

  return (
    <section
      id="contact"
      ref={(el) => {
        if (el) sectionsRef.current.set("contact", el);
      }}
      className="py-16 md:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TerminalWindow
          title="./contact.sh --init"
          icon={<Mail className="w-5 h-5 text-[var(--color-text-primary)]" />}
          onCommand={onCommand}
        >
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Get In Touch
          </h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Let's discuss opportunities, collaborations, or just have a chat
            about technology.
          </p>
          <div className="mt-6 space-y-4">
            <a
              href={`mailto:${portfolioData.email}`}
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Mail className="w-5 h-5" /> {portfolioData.email}
            </a>
            <a
              href={`https://linkedin.com/in/${portfolioData.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Linkedin className="w-5 h-5" /> linkedin.com/in/
              {portfolioData.social.linkedin}
            </a>
            <a
              href={`https://github.com/${portfolioData.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Github className="w-5 h-5" /> github.com/
              {portfolioData.social.github}
            </a>
            <a
              href={`https://x.com/${portfolioData.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Twitter className="w-5 h-5" /> @{portfolioData.social.twitter}
            </a>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-sm space-y-1">
            <p>
              <span className="text-[var(--color-text-primary)]">
                &gt; Status:
              </span>{" "}
              Available for opportunities
            </p>
            <p>
              <span className="text-[var(--color-text-primary)]">
                &gt; Location:
              </span>{" "}
              {portfolioData.location}
            </p>
            <p>
              <span className="text-[var(--color-text-primary)]">
                &gt; Response Time:
              </span>{" "}
              &lt; 24 hours
            </p>
          </div>
        </TerminalWindow>
        <TerminalWindow
          title="./send-message.sh"
          icon={<Send className="w-5 h-5 text-[var(--color-text-primary)]" />}
          onCommand={onCommand}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-secondary)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-secondary)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Brief description of your inquiry"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-black/50 border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-secondary)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell me about your project, collaboration opportunity, or question..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-black/50 border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-secondary)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg-alt)] font-bold hover:bg-[var(--color-primary-hover)] transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />{" "}
              {isSending ? "Transmitting..." : "Send Message"}
            </button>
          </form>
        </TerminalWindow>
      </div>
    </section>
  );
};

const Terminal101 = ({ sectionsRef, onCommand }: SectionProps) => (
  <section
    id="terminal-101"
    ref={(el) => {
      if (el) sectionsRef.current.set("terminal-101", el);
    }}
    className="py-16 md:py-24"
  >
    <TerminalWindow
      title="cat /usr/share/doc/terminal-101.txt"
      icon={<BookOpen className="w-5 h-5 text-[var(--color-text-primary)]" />}
      fullWidth
      onCommand={onCommand}
    >
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Welcome to Terminal 101!
      </h2>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        This site is designed to be navigated like a real terminal. Here are
        some commands you can use:
      </p>
      <div className="mt-6 space-y-4 font-mono text-sm">
        <div>
          <p className="text-[var(--color-text-primary)]">$ neofetch</p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Displays system information and a summary about me.
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-primary)]">$ ls -la projects/</p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Lists all projects with details.
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-primary)]">
            $ cat experience.log
          </p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Displays my professional work history.
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-primary)]">
            $ theme set &lt;theme_name&gt;
          </p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Changes the color theme. Try{" "}
            <code className="bg-black/50 p-1 rounded">theme set hacker</code>.
            Use <code className="bg-black/50 p-1 rounded">theme list</code> to
            see options.
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-primary)]">$ help</p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Shows a list of available navigation commands.
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-primary)]">$ clear</p>
          <p className="pl-4 text-[var(--color-text-secondary)]">
            - Returns you to the top of the page.
          </p>
        </div>
      </div>
    </TerminalWindow>
  </section>
);

interface FooterProps {
  onCommand: (command: string) => void;
}

const Footer = ({ onCommand }: FooterProps) => (
  <footer className="pb-24 pt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <TerminalWindow
        title={`echo "Built with passion and lots of coffee ☕️"`}
        onCommand={onCommand}
      >
        <p className="text-center text-[var(--color-text-tertiary)]">
          &copy; {new Date().getFullYear()} {portfolioData.name}. All rights
          reserved.
        </p>
      </TerminalWindow>
    </div>
  </footer>
);

interface ResumeModalProps {
  onClose: () => void;
}

const ResumeModal = ({ onClose }: ResumeModalProps) => (
  <div
    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fadeIn"
    onClick={onClose}
  >
    <div
      className="w-full max-w-4xl h-[90vh] flex"
      onClick={(e) => e.stopPropagation()}
    >
      <TerminalWindow
        title="less /etc/resume.md"
        onCommand={(cmd) => {
          if (["exit", "q", "quit"].includes(cmd)) onClose();
        }}
        className="flex-grow"
      >
        <div className="h-full overflow-y-auto pr-2 text-[var(--color-text-secondary)] text-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {portfolioData.name}
            </h1>
            <p>{portfolioData.summary.split(".")[0]}.</p>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
              <span>{portfolioData.email}</span>
              <span className="hidden sm:inline">|</span>
              <span>{portfolioData.location}</span>
              <span className="hidden sm:inline">|</span>
              <a
                href={`https://github.com/${portfolioData.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-text-primary)]"
              >
                GitHub
              </a>
              <span className="hidden sm:inline">|</span>
              <a
                href={`https://linkedin.com/in/${portfolioData.social.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-text-primary)]"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
              == SUMMARY ==
            </h2>
            <p className="leading-relaxed">{portfolioData.summary}</p>
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
              == SKILLS ==
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(portfolioData.skills).map(
                ([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-[var(--color-text-secondary)]">
                      {category}:
                    </h3>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {skills.join(", ")}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
              == EXPERIENCE ==
            </h2>
            {portfolioData.experience.map((job, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[var(--color-text-secondary)]">
                    {job.role}{" "}
                    <span className="text-[var(--color-text-primary)]">
                      @ {job.company}
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {job.period}
                  </p>
                </div>
                <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                  {job.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
              == PROJECTS ==
            </h2>
            {portfolioData.projects.slice(0, 3).map((project) => (
              <div key={project.title} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[var(--color-text-secondary)]">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    [{project.stack.join(", ")}]
                  </p>
                </div>
                <p className="text-xs">{project.description}</p>
              </div>
            ))}
          </div>

          {/* Education & Certs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
                == EDUCATION ==
              </h2>
              {portfolioData.education.map((edu) => (
                <div key={edu.institution} className="mt-2">
                  <p className="font-semibold text-[var(--color-text-secondary)] text-sm">
                    {edu.degree}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {edu.institution} | {edu.period}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] pb-1 mb-2">
                == CERTIFICATIONS ==
              </h2>
              <ul className="text-xs text-[var(--color-text-secondary)] list-disc list-inside space-y-1 mt-2">
                {portfolioData.certifications.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[var(--color-text-tertiary)]">
            -- END OF DOCUMENT -- Type 'q' or 'exit' to close --
          </p>
        </div>
      </TerminalWindow>
    </div>
  </div>
);

const successMessages = [
  "Message dispatched into the digital ether. Roger that.",
  "Signal received. Your message is now safely in my inbox.",
  "Transmission complete. I'll get back to you shortly.",
  "Packet successfully delivered. Awaiting response.",
  "Your message has landed. Stand by for a reply.",
  "Message received, loud and clear. Thanks for reaching out!",
  "Connection established. Your inquiry is being processed.",
  "Encrypted message received and decrypted. I'll be in touch.",
  "Quantum entanglement successful. Your message appeared instantly.",
  "Your message has been logged. I'll review it soon.",
  "The carrier pigeon has arrived. Thanks for the note!",
  "Message beamed directly to my terminal. Acknowledged.",
  "Your message slipped through the firewall. Nice one!",
  "Got it. I'm on it. You'll hear from me soon.",
  "Message successfully parsed. Thank you for the input.",
];

// --- MAIN APP ---
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("classic");
  const [currentSection, setCurrentSection] = useState("hero");
  const [toast, setToast] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const sections = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    document.body.className = `bg-[var(--color-bg)] theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentSections = sections.current;
    currentSections.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      currentSections.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [isLoading]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCommand = (command: string) => {
    const [cmd, ...args] = command.trim().toLowerCase().split(" ");

    const commandMap: { [key: string]: string } = {
      whoami: "hero",
      "cd ~": "hero",
      "./about.sh": "about",
      about: "about",
      "cat about.txt": "about",
      "ls skills/": "about",
      neofetch: "about",
      "./projects.sh": "projects",
      projects: "projects",
      "ls -la projects/": "projects",
      "./experience.sh": "experience",
      experience: "experience",
      "cat experience.log": "experience",
      "./resume.sh": "resume",
      resume: "resume",
      "./resume.pdf --view": "resume",
      "./contact.sh": "contact",
      contact: "contact",
      "./contact.sh --init": "contact",
      "./send-message.sh": "contact",
      "./terminal-101.sh": "terminal-101",
      terminal101: "terminal-101",
      "man terminal": "terminal-101",
    };

    if (commandMap[command.trim().toLowerCase()]) {
      const targetId = commandMap[command.trim().toLowerCase()];
      scrollToSection(targetId);
      return;
    }

    switch (cmd) {
      case "theme":
        if (args[0] === "set" && args[1]) {
          if (themes.includes(args[1])) {
            setTheme(args[1]);
            setToast(`Theme changed to ${args[1]}`);
          } else {
            setToast(`Error: Theme '${args[1]}' not found.`);
          }
        } else if (args[0] === "list") {
          setToast(`Available themes: ${themes.join(", ")}`);
        } else {
          setToast("Usage: theme set <theme_name> | theme list");
        }
        break;
      case "help":
        setToast(
          "Commands: about, projects, experience, resume, contact, terminal101, theme, clear, neofetch"
        );
        break;
      case "clear":
      case "reboot":
        scrollToSection("hero");
        break;
      default:
        setToast(
          `Command not found: ${command}. Type 'help' for a list of commands.`
        );
        break;
    }
  };

  const handleSendMessage = async (formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ownerEmail: "919chandrakant@gmail.com",
          ownerName: "Chandrakant Dubey",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        console.error("send-email error:", err);
        throw new Error("Failed to send email");
      }

      const randomSuccessMessage =
        successMessages[Math.floor(Math.random() * successMessages.length)];
      setToast(randomSuccessMessage);
    } catch (error) {
      console.error("Sending message failed:", error);
      setToast(
        "Error: Could not dispatch message. Your signal was lost in the static."
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <Bootloader onBootComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="text-[var(--color-text-secondary)] font-mono min-h-screen relative overflow-x-hidden">
      <MatrixBackground />
      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Hero
            sectionsRef={sections}
            onCommand={handleCommand}
            onScrollToSection={scrollToSection}
          />
          <About sectionsRef={sections} onCommand={handleCommand} />
          <Projects sectionsRef={sections} onCommand={handleCommand} />
          <Experience sectionsRef={sections} onCommand={handleCommand} />
          <Resume
            sectionsRef={sections}
            onCommand={handleCommand}
            onQuickView={() => setIsResumeModalOpen(true)}
          />
          <Contact
            sectionsRef={sections}
            onCommand={handleCommand}
            onSendMessage={handleSendMessage}
            setToast={setToast}
            isSending={isSending}
          />
          <Terminal101 sectionsRef={sections} onCommand={handleCommand} />
        </main>
        <Footer onCommand={handleCommand} />
      </div>
      {isResumeModalOpen && (
        <ResumeModal onClose={() => setIsResumeModalOpen(false)} />
      )}
      {toast && (
        <div className="fixed top-5 right-5 bg-[var(--color-primary)] text-[var(--color-bg-alt)] px-4 py-2 rounded-md shadow-lg z-50 animate-pulse">
          <span className="font-bold">&gt; </span>
          {toast}
        </div>
      )}
      <BottomStatusBar
        currentTheme={theme}
        currentSection={currentSection}
        sections={sectionIds}
        onNavigate={scrollToSection}
      />
    </div>
  );
};

export default App;
