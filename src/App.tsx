import { useState, type FormEvent } from "react";
import {
  experience,
  independentProjects,
  profile,
  skills,
  workProjects,
} from "./portfolio";

type ProjectLink = {
  label: string;
  url: string;
};

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

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
    >
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

function ExternalArrow() {
  return (
    <svg
      aria-hidden="true"
      className="external-icon"
      viewBox="0 0 16 16"
      fill="none"
    >
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

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-intro">{description}</p>}
    </div>
  );
}

function ProjectCard({
  project,
  kind,
}: {
  project: Project;
  kind: "work" | "independent";
}) {
  return (
    <article className={"project-card project-card--" + kind}>
      <div className="project-card-top">
        <span className="project-number">{project.number}</span>
        <span className="project-category">{project.category}</span>
      </div>
      <div className="project-card-copy">
        <h3>{project.title}</h3>
        {project.role && <p className="project-role">{project.role}</p>}
        <p className="project-description">{project.description}</p>
        {project.products && (
          <ul className="product-list">
            {project.products.map((product) => (
              <li key={product}>{product}</li>
            ))}
          </ul>
        )}
      </div>
      <ul className="tag-list" aria-label="Technologies and focus areas">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <div className="project-card-footer">
        {project.links.length > 0 ? (
          <div className="project-links">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="project-link"
              >
                {link.label}
                <ExternalArrow />
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
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ownerEmail: profile.email,
          ownerName: profile.name,
        }),
      });

      if (!response.ok) {
        throw new Error("The message could not be sent.");
      }

      setFormData({ name: "", email: "", subject: "", message: "" });
      setStatus({
        kind: "success",
        message: "Thanks — your message has been sent.",
      });
    } catch {
      setStatus({
        kind: "error",
        message:
          "The form could not send your message. Please email me directly instead.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>Name</span>
          <input
            autoComplete="name"
            name="name"
            required
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
          />
        </label>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(event) =>
              setFormData({ ...formData, email: event.target.value })
            }
          />
        </label>
      </div>
      <label>
        <span>Subject</span>
        <input
          name="subject"
          value={formData.subject}
          onChange={(event) =>
            setFormData({ ...formData, subject: event.target.value })
          }
        />
      </label>
      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={(event) =>
            setFormData({ ...formData, message: event.target.value })
          }
        />
      </label>
      {status && (
        <p className={"form-status form-status--" + status.kind} role="status">
          {status.message}
        </p>
      )}
      <button className="button button--light form-submit" disabled={isSending}>
        {isSending ? "Sending message…" : "Send message"}
        <ArrowIcon />
      </button>
    </form>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Chandrakant Dubey home">
            <span className="brand-mark">CD</span>
            <span className="brand-name">Chandrakant Dubey</span>
          </a>
          <nav aria-label="Main navigation" className="main-nav">
            <a href="#work">Work</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="header-resume" href={profile.resume} download>
            Résumé <ExternalArrow />
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero page-width" id="top">
          <div className="hero-copy">
            <p className="availability">
              <span className="availability-dot" />
              Open to new opportunities
              <span className="availability-divider">·</span>
              {profile.location}
            </p>
            <h1>
              I build digital
              <br />
              products that
              <br />
              <span>work for people.</span>
            </h1>
            <p className="hero-summary">
              Full-stack engineer focused on clear product experiences and
              dependable systems — from the first interaction to the API and
              data behind it.
            </p>
            <div className="hero-actions">
              <a className="button button--dark" href="#work">
                Explore selected work
                <ArrowIcon />
              </a>
              <a
                className="button button--outline"
                href={profile.resume}
                download
              >
                Download résumé
                <ExternalArrow />
              </a>
            </div>
            <div className="hero-links" aria-label="Professional profiles">
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub <ExternalArrow />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <ExternalArrow />
              </a>
              <a href={"mailto:" + profile.email}>Email me</a>
            </div>
          </div>

          <aside className="hero-visual" aria-label="Product engineering focus">
            <div className="visual-topline">
              <span>FULL-STACK ENGINEERING</span>
              <span className="visual-live">
                <span /> BUILDING
              </span>
            </div>
            <div className="visual-headline">
              <span className="visual-kicker">From interface</span>
              <strong>to data model.</strong>
            </div>
            <div className="architecture">
              <div className="architecture-layer architecture-layer--ui">
                <span className="layer-index">01</span>
                <span className="layer-label">Product UI</span>
                <span className="layer-stack">React · Vue · React Native</span>
              </div>
              <div className="architecture-connector" />
              <div className="architecture-layer architecture-layer--api">
                <span className="layer-index">02</span>
                <span className="layer-label">Services & APIs</span>
                <span className="layer-stack">Node.js · FastAPI</span>
              </div>
              <div className="architecture-connector" />
              <div className="architecture-layer architecture-layer--data">
                <span className="layer-index">03</span>
                <span className="layer-label">Data & delivery</span>
                <span className="layer-stack">PostgreSQL · AWS · Docker</span>
              </div>
            </div>
            <div className="visual-caption">
              <span className="caption-mark">✳</span>
              Thinking through the whole product, one useful detail at a time.
            </div>
            <div className="visual-orbit visual-orbit--one" />
            <div className="visual-orbit visual-orbit--two" />
          </aside>
        </section>

        <div className="intro-strip page-width">
          <p>
            I’m Chandrakant, a Mumbai-based developer with 3+ years of
            experience shipping web applications, mobile products, and
            backend services.
          </p>
          <span className="intro-mark">CD<span>.</span></span>
        </div>

        <section className="content-section page-width" id="work">
          <SectionHeading
            eyebrow="Professional work"
            title="Products I’ve helped bring to life"
            description="A selection of product and platform work across enterprise software, health, family, commerce, and digital safety."
          />
          <div className="project-grid">
            {workProjects.map((project) => (
              <ProjectCard
                key={project.number}
                project={project}
                kind="work"
              />
            ))}
          </div>
        </section>

        <section className="content-section page-width" id="projects">
          <SectionHeading
            eyebrow="Independent projects"
            title="Curiosity, turned into working software"
            description="Personal builds that let me explore mobile interfaces, product systems, real-time collaboration, and generative design."
          />
          <div className="project-grid project-grid--independent">
            {independentProjects.map((project) => (
              <ProjectCard
                key={project.number}
                project={project}
                kind="independent"
              />
            ))}
          </div>
        </section>

        <section className="content-section page-width" id="experience">
          <div className="experience-layout">
            <div className="experience-intro">
              <SectionHeading
                eyebrow="Experience"
                title="A product-minded engineer"
              />
              <p>
                I work across frontend and backend teams to turn product needs
                into maintainable software. I care about thoughtful interfaces,
                clear service boundaries, and shipping reliably.
              </p>
              <a
                className="text-link"
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
              >
                Read the full résumé <ExternalArrow />
              </a>
            </div>
            <div className="experience-list">
              {experience.map((job) => (
                <article className="experience-item" key={job.company}>
                  <div className="experience-heading">
                    <div>
                      <h3>{job.company}</h3>
                      <p>{job.role}</p>
                    </div>
                    <span>{job.period}</span>
                  </div>
                  <p className="experience-summary">{job.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="skills-section">
          <div className="page-width skills-inner">
            <SectionHeading
              eyebrow="Toolkit"
              title="Technologies I work with"
              description="A practical toolkit for building, integrating, and delivering products."
            />
            <div className="skill-grid">
              {skills.map((group) => (
                <article className="skill-group" key={group.category}>
                  <h3>{group.category}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section page-width" id="contact">
          <div className="contact-copy">
            <p className="eyebrow eyebrow--light">Contact</p>
            <h2>Have a product to build?</h2>
            <p>
              I’m open to full-stack and product engineering opportunities.
              Send a note and tell me what you’re working on.
            </p>
            <a className="contact-email" href={"mailto:" + profile.email}>
              {profile.email}
              <ExternalArrow />
            </a>
            <div className="contact-socials">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <ExternalArrow />
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub <ExternalArrow />
              </a>
            </div>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer className="site-footer page-width">
        <a className="footer-brand" href="#top">
          Chandrakant Dubey<span>.</span>
        </a>
        <p>Full-stack developer · Mumbai, India</p>
        <p>© {new Date().getFullYear()} Chandrakant Dubey</p>
      </footer>
    </>
  );
}
