import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ChevronRight,
  Handshake,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Send,
  ShieldCheck,
  Sun,
  Truck,
  UsersRound,
  X,
} from "lucide-react";
import { UploadBox } from "./components/UploadBox";
import {
  applicantTypes,
  ApplicantType,
  buildApplicationEmail,
  createMailtoHref,
  getPayLine,
  readApplicationFormFields,
} from "./lib/applicationEmail";
import { company, navItems, serviceCards, stats } from "./siteContent";

type FileSlot = "licenseFront" | "licenseBack";

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("dm-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicantType, setApplicantType] = useState<ApplicantType>("Driver");
  const [licenseFiles, setLicenseFiles] = useState<Record<FileSlot, File | null>>({
    licenseFront: null,
    licenseBack: null,
  });
  const [formStatus, setFormStatus] = useState("");
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("dm-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onClick(event: MouseEvent) {
      const header = headerRef.current;
      if (header && !header.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const payLine = useMemo(() => getPayLine(applicantType), [applicantType]);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleFile(slot: FileSlot, fileList: FileList | null) {
    setLicenseFiles((current) => ({ ...current, [slot]: fileList?.[0] ?? null }));
    setFormStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (!licenseFiles.licenseFront || !licenseFiles.licenseBack) {
      setFormStatus("Please upload both the front and back of the driver license before sending.");
      return;
    }

    const { subject, body } = buildApplicationEmail({
      applicantType,
      fields: readApplicationFormFields(form),
      licenseFrontName: licenseFiles.licenseFront.name,
      licenseBackName: licenseFiles.licenseBack.name,
    });

    window.location.href = createMailtoHref(company.email, subject, body);
    setFormStatus("Email draft opened. Attach the selected license images before sending.");
  }

  return (
    <>
      <a className="skip-link" href="#top">
        Skip to main content
      </a>
      <header ref={headerRef} className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="DM Express home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>DM</strong>
            <em>Express</em>
          </span>
        </a>
        <div className="brand-location" aria-label="Company location">
          <strong>{company.fullLocation}</strong>
          <span>Trucking & Logistics</span>
        </div>

        <nav className="desktop-nav" aria-label="Main menu">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <a className="call-button" href={company.phoneHref} aria-label={`Call DM Express at ${company.phoneDisplay}`}>
            <Phone size={18} />
            <span>Call Us</span>
          </a>
          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile menu">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
                <ChevronRight size={16} aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image">
            <img
              src="/assets/dm-express-hero-volvo.jpg"
              alt="A black Volvo-style semi truck with a dry van trailer in a professional logistics yard"
              width="2000"
              height="1333"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-copy">
              <h1 id="hero-title">
                Moving Freight.
                <span>Driving Success.</span>
              </h1>
              <p className="hero-lede">
                DM Express is a trusted trucking and logistics partner based in
                Lincoln, California. We deliver reliable capacity, dedicated lanes,
                and driver-first opportunities that keep America moving.
              </p>
              <div className="hero-buttons">
                <a className="primary-button" href="#services">
                  Work with us
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="secondary-button" href="#apply">
                  Drive with us
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>

              <div className="hero-proof" aria-label="Company highlights">
                <div>
                  <ShieldCheck size={29} aria-hidden="true" />
                  <strong>10+ years</strong>
                  <span>Of reliable service</span>
                </div>
                <div>
                  <MapPin size={31} aria-hidden="true" />
                  <strong>{company.location}</strong>
                  <span>Strategically located</span>
                </div>
                <div>
                  <UsersRound size={31} aria-hidden="true" />
                  <strong>Driver & partner</strong>
                  <span>Focused</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="service-strip" id="services" aria-label="DM Express services">
          {serviceCards.map((service, index) => {
            const Icon = service.icon;
            return (
              <article className="service-card" key={service.title} data-reveal style={{ transitionDelay: `${index * 45}ms` }}>
                <Icon size={28} aria-hidden="true" />
                <h2>{service.title}</h2>
                <p>{service.body}</p>
                <span className="service-arrow" aria-hidden="true">
                  →
                </span>
              </article>
            );
          })}
        </section>

        <section className="split-section" id="about" aria-labelledby="about-title">
          <div className="section-copy" data-reveal>
            <p className="eyebrow">About DM Express</p>
            <h2 id="about-title">Built for the Road. Backed by Experience.</h2>
            <p>
              For over a decade, DM Express has delivered dependable transportation
              solutions with a driver-first mindset and customer-focused operations.
            </p>
          </div>
          <div className="stats-panel" data-reveal aria-label="Company stats">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <Icon size={34} aria-hidden="true" />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              );
            })}
          </div>
          <div className="built-image" data-reveal>
            <img
              src="/assets/dm-express-fleet.jpg"
              alt="Black Volvo-style DM Express fleet trucks lined up in a logistics yard"
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className="opportunities" id="opportunities" aria-labelledby="opportunities-title">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Opportunities</p>
            <h2 id="opportunities-title">Choose the path that fits your business.</h2>
          </div>
          <div className="opportunity-grid">
            <article className="opportunity-card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <Truck size={30} />
              </div>
              <h3>Company Drivers</h3>
              <p>
                Qualified drivers earn 30% of gross with steady freight, responsive dispatch,
                and paperwork handled clearly.
              </p>
              <a
                href="#apply"
                onClick={() => {
                  setApplicantType("Driver");
                  setFormStatus("");
                }}
              >
                Apply as driver
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
            <article className="opportunity-card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <Handshake size={30} />
              </div>
              <h3>Owner Operators</h3>
              <p>
                Owner operators keep 90% of gross and get access to lanes, support, parking,
                repairs, trailers, and lease-to-own options.
              </p>
              <a
                href="#apply"
                onClick={() => {
                  setApplicantType("Owner Operator");
                  setFormStatus("");
                }}
              >
                Apply as owner operator
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>

        <section className="broker-section" id="brokers" aria-labelledby="brokers-title">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Broker relationships</p>
            <h2 id="brokers-title">Reliable capacity for dedicated lanes and broker freight.</h2>
            <p>
              DM Express works closely with brokers to keep communication clear,
              equipment moving, and lanes covered with dependable operators.
            </p>
            <a className="primary-button broker-cta" href={`mailto:${company.email}?subject=Broker%20inquiry`}>
              Email dispatch
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="yard-section" id="yard" aria-labelledby="yard-title">
          <div className="yard-media" data-reveal>
            <img
              src="/assets/dm-express-fleet.jpg"
              alt="DM Express Volvo-style fleet and trailers parked at a Lincoln, CA logistics yard"
              width="1600"
              height="1100"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="yard-copy" data-reveal>
            <p className="eyebrow">Lincoln yard support</p>
            <h2 id="yard-title">Parking, repairs, trailers, and lease-to-own equipment.</h2>
            <ul>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Parking for trucks and trailers
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Truck and trailer repair support
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Trailer rental for short or long-term needs
              </li>
              <li>
                <CheckCircle2 size={20} aria-hidden="true" />
                Lease-to-own truck and trailer opportunities
              </li>
            </ul>
          </div>
        </section>

        <section className="application-section" id="apply" aria-labelledby="apply-title">
          <div className="application-intro" data-reveal>
            <p className="eyebrow">Apply now</p>
            <h2 id="apply-title">Send your driver or owner operator application.</h2>
            <p>
              Choose the application type, add your contact and equipment details, then upload
              the front and back of your driver license before sending.
            </p>
            <div className="contact-card">
              <a href={company.phoneHref}>
                <Phone size={18} aria-hidden="true" />
                {company.phoneDisplay}
              </a>
              <a href={`mailto:${company.email}`}>
                <Mail size={18} aria-hidden="true" />
                {company.email}
              </a>
              <span>
                <Building2 size={18} aria-hidden="true" />
                {company.location}
              </span>
            </div>
          </div>

          <form className="application-form" onSubmit={handleSubmit} data-reveal>
            <div className="segmented-control" role="tablist" aria-label="Application type">
              {applicantTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  className={applicantType === type ? "active" : ""}
                  aria-selected={applicantType === type}
                  aria-pressed={applicantType === type}
                  onClick={() => {
                    setApplicantType(type);
                    setFormStatus("");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="pay-note" role="note">
              <BadgeDollarSign size={20} aria-hidden="true" />
              <span>{payLine}</span>
            </div>

            <div className="form-grid">
              <label>
                Full name
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[\d\s().+-]{7,}"
                  placeholder="(555) 555-5555"
                  required
                />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" inputMode="email" required />
              </label>
              <label>
                City / State
                <input name="location" type="text" autoComplete="address-level2" placeholder="Lincoln, CA" />
              </label>
              <label>
                CDL experience
                <select name="experience" required defaultValue="">
                  <option value="" disabled>
                    Select experience
                  </option>
                  <option>Less than 1 year</option>
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </label>
              <label>
                Available start date
                <input name="startDate" type="date" min={todayIso} />
              </label>
            </div>

            <label>
              Equipment details
              <input
                name="equipment"
                type="text"
                placeholder={applicantType === "Owner Operator" ? "Truck year/model, trailer, plates" : "Endorsements, preferred truck type"}
              />
            </label>

            <label>
              Preferred lanes
              <input name="lanes" type="text" placeholder="Lanes, regions, home time" />
            </label>

            <fieldset className="upload-grid" aria-label="Driver license upload fields">
              <legend className="visually-hidden">Driver license upload</legend>
              <UploadBox
                id="licenseFront"
                label="Driver license front"
                file={licenseFiles.licenseFront}
                onChange={(fileList) => handleFile("licenseFront", fileList)}
              />
              <UploadBox
                id="licenseBack"
                label="Driver license back"
                file={licenseFiles.licenseBack}
                onChange={(fileList) => handleFile("licenseBack", fileList)}
              />
            </fieldset>

            <label>
              Message
              <textarea name="message" rows={4} placeholder="Tell us about your experience, equipment, or schedule." />
            </label>

            {formStatus && (
              <p
                className={formStatus.startsWith("Please") ? "form-status error" : "form-status"}
                role="status"
                aria-live="polite"
              >
                {formStatus}
              </p>
            )}

            <button className="primary-button form-submit" type="submit">
              <Send size={18} aria-hidden="true" />
              Send application
            </button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>{company.name}</strong>
          <span>
            {company.mcNumber} • {company.dotNumber}
          </span>
        </div>
        <div className="footer-links">
          <a href={company.phoneHref}>{company.phoneDisplay}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
      </footer>
    </>
  );
}
