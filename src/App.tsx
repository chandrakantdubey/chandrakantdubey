import { useState, type FormEvent } from "react";
import {
  experience,
  independentProjects,
  profile,
  skills,
  workProjects,
} from "./portfolio";

type ProjectLink = { label: string; url: string };

type Project = {
  number: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
  role?: string;
  products?: string[];
  accessLabel?: string;
};

function ExternalArrow() {
  return (
    <svg aria-hidden="true" className="external-icon" viewBox="0 0 16 16" fill="none">
      <path
        d="M5 3h8v8M13 3 6.5 9.5M11 9v4H3V5h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 10h10m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <p className="section-index"><span>{index}</span> {eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-intro">{description}</p>}
    </div>
  );
}

function ProjectCard({ project, kind }: { project: Project; kind: "work" | "independent" }) {
  return (
    <article className={`project-card project-card--${kind}`}>
      <div className="project-card-top">
        <span className="project-number">{project.number}</span>
        <span className="project-category">{project.category}</span>
      </div>
      <div className="project-card-copy">
        <h3>{project.title}</h3>
        {project.role && <p className="project-role">{project.role}</p>}
        <p className="project-description">{project.description}</p>
        {project.products && (
          <ul className="product-list" aria-label="Products and platforms">
            {project.products.map((product) => <li key={product}>{product}</li>)}
          </ul>
        )}
      </div>
      <ul className="tag-list" aria-label="Technologies and focus areas">
        {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
      <div className="project-card-footer">
        {project.links.length ? (
          <div className="project-links">
            {project.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="project-link">
                {link.label}<ExternalArrow />
              </a>
            ))}
          </div>
        ) : (
          <span className="access-label">{project.accessLabel}</span>
        )}
      </div>
    </article>
  );
}

function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ownerEmail: profile.email, ownerName: profile.name }),
      });
      if (!response.ok) throw new Error("The message could not be sent.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setStatus({ kind: "success", message: "Message sent. Thanks for reaching out." });
    } catch {
      setStatus({ kind: "error", message: "The form could not send your message. Please email me directly instead." });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label><span>Name</span><input autoComplete="name" name="name" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></label>
        <label><span>Email</span><input autoComplete="email" name="email" type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></label>
      </div>
      <label><span>Subject</span><input name="subject" value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} /></label>
      <label><span>Message</span><textarea name="message" rows={4} required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} /></label>
      {status && <p className={`form-status form-status--${status.kind}`} role="status">{status.message}</p>}
      <button className="button button--accent form-submit" disabled={isSending}>
        {isSending ? "Sending…" : "Send message"}<ArrowIcon />
      </button>
    </form>
  );
}

function ProfileTerminal() {
  return (
    <aside className="profile-terminal" aria-label="Developer profile">
      <div className="terminal-topbar">
        <div className="terminal-controls" aria-hidden="true"><i /><i /><i /></div>
        <span>chandrakant@portfolio: ~</span>
        <span className="terminal-menu">•••</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-prompt"><span>chandrakant</span><b>@</b>portfolio<span className="terminal-path">:~</span>$ <strong>whoami</strong></p>
        <div className="terminal-identity">
          <div className="terminal-monogram" aria-hidden="true">
            <span>CD</span><i>FULL STACK</i>
          </div>
          <div className="terminal-details">
            <p><span>name</span><b>{profile.name}</b></p>
            <p><span>role</span><b>Full-stack engineer</b></p>
            <p><span>based</span><b>{profile.location}</b></p>
            <p><span>experience</span><b>3+ years</b></p>
          </div>
        </div>
        <div className="terminal-rule"><span>working stack</span></div>
        <ul className="terminal-stack">
          {skills.slice(1, 4).flatMap((group) => group.items.slice(0, 2)).map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="terminal-status"><span className="status-light" /> open to product engineering roles <span className="cursor" aria-hidden="true" /></div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Chandrakant Dubey home">
            <span className="brand-mark">&gt;_</span>
            <span className="brand-name">chandrakant<span>.dev</span></span>
          </a>
          <nav aria-label="Main navigation" className="main-nav">
            <a href="#work"><span>01</span> Work</a>
            <a href="#projects"><span>02</span> Projects</a>
            <a href="#experience"><span>03</span> Experience</a>
            <a href="#contact"><span>04</span> Contact</a>
          </nav>
          <a className="header-resume" href={profile.resume} download>Résumé <span>↓</span></a>
        </div>
      </header>

      <main id="main">
        <section className="hero page-width" id="top">
          <div className="hero-copy">
            <p className="availability"><span className="availability-dot" /> OPEN TO OPPORTUNITIES <span className="availability-divider">/</span> {profile.location}</p>
            <p className="hero-overline">FULL-STACK ENGINEER <span>•</span> PRODUCT BUILDER</p>
            <h1>I build digital<br />products that<br /><span>work for people.</span></h1>
            <p className="hero-summary">I turn real product problems into clear, dependable software — from thoughtful interfaces to the APIs and data behind them.</p>
            <div className="hero-actions">
              <a className="button button--accent" href="#work">Explore selected work <ArrowIcon /></a>
              <a className="button button--outline" href={profile.resume} download>Download résumé <span className="download-mark">↓</span></a>
            </div>
            <div className="hero-links" aria-label="Professional profiles">
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ExternalArrow /></a>
              <a href={`mailto:${profile.email}`}>Email me <ExternalArrow /></a>
            </div>
          </div>
          <ProfileTerminal />
          <div className="hero-bottomline"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>01 / 04</span></div>
        </section>

        <div className="intro-strip page-width">
          <span className="intro-prompt">$</span>
          <p>Shipping web applications, mobile products, and backend services for teams that care about making useful things work well.</p>
          <span className="intro-mark">MUMBAI / INDIA</span>
        </div>

        <section className="content-section page-width" id="work">
          <SectionHeading index="01" eyebrow="Selected professional work" title="Real products. Real users." description="Product engineering across enterprise software, health, family, commerce, and digital safety." />
          <div className="project-grid project-grid--work">
            {workProjects.map((project) => <ProjectCard key={project.number} project={project} kind="work" />)}
          </div>
        </section>

        <section className="content-section page-width" id="projects">
          <SectionHeading index="02" eyebrow="Independent projects" title="Built to explore what’s possible." description="Personal projects in generative design, mobile experiences, fitness, and real-time systems." />
          <div className="project-grid project-grid--independent">
            {independentProjects.map((project) => <ProjectCard key={project.number} project={project} kind="independent" />)}
          </div>
        </section>

        <section className="content-section experience-section page-width" id="experience">
          <div className="experience-layout">
            <div className="experience-intro">
              <SectionHeading index="03" eyebrow="Experience" title="Product-minded, end to end." />
              <p>I work across frontend and backend teams to turn product needs into maintainable software. I care about thoughtful interfaces, clear service boundaries, and shipping reliably.</p>
              <a className="text-link" href={profile.resume} target="_blank" rel="noreferrer">Read the full résumé <ExternalArrow /></a>
            </div>
            <div className="experience-list">
              {experience.map((job, index) => (
                <article className="experience-item" key={job.company}>
                  <span className="experience-index">0{index + 1}</span>
                  <div className="experience-content">
                    <div className="experience-heading"><div><h3>{job.company}</h3><p>{job.role}</p></div><span>{job.period}</span></div>
                    <p className="experience-summary">{job.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="skills-section" aria-labelledby="skills-title">
          <div className="page-width skills-inner">
            <div className="skills-heading">
              <div><p className="section-index"><span>04</span> TOOLKIT</p><h2 id="skills-title">Tools for the<br />whole product.</h2></div>
              <p>From the first interface to the service, database, and delivery pipeline.</p>
            </div>
            <div className="skill-grid">
              {skills.map((group, index) => (
                <article className="skill-group" key={group.category}>
                  <span className="skill-index">0{index + 1}</span>
                  <h3>{group.category}</h3>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section page-width" id="contact">
          <div className="contact-copy">
            <p className="section-index section-index--light"><span>05</span> CONTACT</p>
            <h2>Have a good<br />problem to solve?</h2>
            <p>I’m open to full-stack and product engineering opportunities. Tell me what you’re building.</p>
            <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ExternalArrow /></a>
            <div className="contact-socials">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ExternalArrow /></a>
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
            </div>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer className="site-footer page-width">
        <a className="footer-brand" href="#top"><span className="footer-mark">&gt;_</span> Chandrakant Dubey</a>
        <p>Full-stack engineer <span>·</span> Mumbai, India</p>
        <a className="back-top" href="#top">Back to top ↑</a>
        <small>© {new Date().getFullYear()} Chandrakant Dubey</small>
      </footer>
    </>
  );
}
