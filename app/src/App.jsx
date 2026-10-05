import { Fragment } from 'react'
import Gear from './components/Gear.jsx'
import Price, { formatPrice } from './components/Price.jsx'
import BookingForm from './components/BookingForm.jsx'
import SectionLabel from './components/SectionLabel.jsx'
import { site, contacts, nav, hero, trust, process, terms, contactsBlock, policy, footer } from './data/content.js'

const asset = (file) => `${import.meta.env.BASE_URL}${file}`

function Top() {
  return (
    <header className="top">
      <a className="brand" href="#top">
        <span>{site.kind}</span>
        {site.name}
      </a>
      <nav aria-label="Разделы страницы">
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="top-contact">
        <a href={contacts.phoneHref}>{contacts.phone}</a>
        <span>{contacts.hoursShort}</span>
      </p>
    </header>
  )
}

function Hero() {
  const { order } = hero
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-main">
        <p className="hero-label">{hero.label}</p>
        <h1 id="hero-title">
          {hero.title.map((line) => (
            <span key={line}>{line} </span>
          ))}
        </h1>
        <p className="hero-lead">{hero.lead}</p>
        <a className="text-link" href="#price">
          {hero.secondary}
        </a>
      </div>
      <Gear />
      <div className="hero-bottom">
        <a className="hero-cta" href="#booking">
          {hero.cta}
        </a>
        <table className="order">
          <caption>
            {order.title} <span>{order.tag}</span>
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{order.columns[0]}</th>
              <th scope="col">{order.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {order.rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">
                  {row.name}
                  {row.note && <small> — {row.note}</small>}
                </th>
                <td className="num">
                  {row.was && <s>{formatPrice(row.was)}</s>} {formatPrice(row.price)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {order.totals.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td className="num">{formatPrice(row.price)}</td>
              </tr>
            ))}
            <tr className="order-foot">
              <td colSpan="2">{order.footer}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="hazard" aria-hidden="true" />
    </section>
  )
}

function Trust() {
  return (
    <section className="sec rail" id="trust" aria-labelledby="trust-title">
      <div className="rail-side">
        <SectionLabel number={trust.number} label={trust.label} />
        <p className="side-note">{trust.lead}</p>
      </div>
      <div className="rail-main">
        <h2 id="trust-title">{trust.title}</h2>
        <table className="fears">
          <thead>
            <tr>
              {trust.headers.map((h) => (
                <th scope="col" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trust.rows.map((row) => (
              <tr key={row.fear}>
                <th scope="row">{row.fear}</th>
                <td>{row.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="crew-title">{trust.crewTitle}</h3>
        <table className="crew">
          <thead>
            <tr>
              {trust.crewHeaders.map((h, i) => (
                <th scope="col" key={h} className={i === 2 ? 'num' : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trust.crew.map((m) => (
              <tr key={m.name}>
                <th scope="row">{m.name}</th>
                <td>{m.role}</td>
                <td className="num">
                  {m.years} <span>лет</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="crew-note">{trust.crewNote}</p>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="sec" id="process" aria-labelledby="process-title">
      <div className="rail">
        <div className="rail-side">
          <SectionLabel number={process.number} label={process.label} />
        </div>
        <div className="rail-main">
          <h2 id="process-title">{process.title}</h2>
        </div>
      </div>
      <ol className="steps">
        {process.steps.map((step, i) => (
          <li key={step.title} className={step.decision ? 'is-decision' : undefined}>
            <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            {step.decision && <span className="step-mark">{process.decisionMark}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Terms() {
  return (
    <section className="sec terms" id="terms" aria-labelledby="terms-title">
      <div className="rail">
        <div className="rail-side">
          <SectionLabel number={terms.number} label={terms.label} />
        </div>
        <div className="rail-main">
          <h2 id="terms-title">{terms.title}</h2>
        </div>
      </div>
      <dl className="terms-list">
        {terms.items.map((item) => (
          <div key={item.term}>
            <dt>{item.term}</dt>
            <dd>
              <strong>{item.value}</strong>
              {item.text}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Contacts() {
  const { image } = contactsBlock
  return (
    <section className="contacts" id="contacts" aria-labelledby="contacts-title">
      <SectionLabel number={contactsBlock.number} label={contactsBlock.label} />
      <h2 id="contacts-title">{contactsBlock.title}</h2>
      <dl className="contact-list">
        <div>
          <dt>{contactsBlock.phoneLabel}</dt>
          <dd>
            <a className="contact-phone" href={contacts.phoneHref}>
              {contacts.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt>{contactsBlock.hoursLabel}</dt>
          <dd>
            {contacts.hours.map((h) => (
              <Fragment key={h.days}>
                <span className="hours-days">{h.days}</span> {h.time}
                <br />
              </Fragment>
            ))}
          </dd>
        </div>
        <div>
          <dt>{contactsBlock.addressLabel}</dt>
          <dd>
            {contacts.city}, {contacts.address}
            <br />
            <a href={contacts.mapHref} rel="noopener">
              {contactsBlock.mapLink}
            </a>
          </dd>
        </div>
        <div>
          <dt>{contactsBlock.emailLabel}</dt>
          <dd>
            <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </dd>
        </div>
      </dl>
      <figure className="landmark">
        <picture>
          <source srcSet={asset(`${image.file}.avif`)} type="image/avif" />
          <source srcSet={asset(`${image.file}.webp`)} type="image/webp" />
          <img
            src={asset(`${image.file}.jpg`)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <figcaption>{contacts.landmark}</figcaption>
      </figure>
    </section>
  )
}

function Footer() {
  return (
    <footer className="foot">
      <details className="policy" id={policy.id}>
        <summary>{policy.title}</summary>
        <p className="policy-date">{policy.updated}</p>
        {policy.sections.map((s) => (
          <Fragment key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Fragment>
        ))}
      </details>
      <p className="foot-note">{footer.note}</p>
      <p className="foot-legal">
        {contacts.legal} · {contacts.city}, {contacts.address}
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <div className="page">
      <Top />
      <main>
        <Hero />
        <Trust />
        <Price />
        <Process />
        <Terms />
        <div className="closing">
          <Contacts />
          <BookingForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
