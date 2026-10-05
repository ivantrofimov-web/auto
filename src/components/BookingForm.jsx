import { useEffect, useRef, useState } from 'react'
import { form, contacts, policy } from '../data/content.js'
import SectionLabel from './SectionLabel.jsx'

const { fields } = form
const EMPTY = { name: '', phone: '', car: '', problem: '', consent: false }
const ORDER = ['name', 'phone', 'car', 'consent']

function validate(v) {
  const errors = {}
  if (v.name.trim().length < 2) errors.name = fields.name.error
  const digits = v.phone.replace(/\D/g, '')
  if (digits.length !== 11 || !/^[78]/.test(digits)) errors.phone = fields.phone.error
  if (v.car.trim().length < 3) errors.car = fields.car.error
  if (!v.consent) errors.consent = form.consent.error
  return errors
}

const mailBody = (v) =>
  [
    `${fields.name.label}: ${v.name.trim()}`,
    `${fields.phone.label}: ${v.phone.trim()}`,
    `${fields.car.label}: ${v.car.trim()}`,
    v.problem.trim() && `${fields.problem.label}: ${v.problem.trim()}`,
  ]
    .filter(Boolean)
    .join('\n')

const openPolicy = () => {
  document.getElementById(policy.id).open = true
}

export default function BookingForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | mail | ok | fail
  const [hydrated, setHydrated] = useState(false)
  const formRef = useRef(null)

  // Пока скрипт не загрузился, работает встроенная проверка браузера.
  useEffect(() => setHydrated(true), [])

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest)
  }

  async function onSubmit(e) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    const first = ORDER.find((name) => found[name])
    if (first) {
      formRef.current.elements[first].focus()
      return
    }

    if (!form.endpoint) {
      const subject = encodeURIComponent(form.mailSubject)
      const body = encodeURIComponent(mailBody(values))
      window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`
      setStatus('mail')
      return
    }

    setStatus('sending')
    try {
      const { consent, ...payload } = values
      const res = await fetch(form.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('ok')
      setValues(EMPTY)
    } catch {
      setStatus('fail')
    }
  }

  const errorCount = Object.keys(errors).length
  const result = { mail: form.sentMail, ok: form.sentOk, fail: form.sentFail }[status]
  const field = (name) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    placeholder: fields[name].placeholder,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `e-${name}` : fields[name].hint ? `h-${name}` : undefined,
  })
  const error = (name) =>
    errors[name] && (
      <p className="field-error" id={`e-${name}`}>
        {errors[name]}
      </p>
    )

  return (
    <section className="booking" id="booking" aria-labelledby="booking-title">
      <SectionLabel number={form.number} label={form.label} />
      <div className="plate">
        <div className="plate-in">
          <h2 id="booking-title">{form.title}</h2>
          <p className="booking-lead">{form.lead}</p>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate={hydrated}
            action={`mailto:${contacts.email}`}
            method="post"
            encType="text/plain"
          >
            <div className="field">
              <label htmlFor="f-name">{fields.name.label}</label>
              <input {...field('name')} type="text" autoComplete="given-name" required />
              {error('name')}
            </div>

            <div className="field">
              <label htmlFor="f-phone">{fields.phone.label}</label>
              <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" required />
              {error('phone') || (
                <p className="field-hint" id="h-phone">
                  {fields.phone.hint}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="f-car">{fields.car.label}</label>
              <input {...field('car')} type="text" autoComplete="off" required />
              {error('car')}
            </div>

            <div className="field">
              <label htmlFor="f-problem">
                {fields.problem.label} <span className="optional">— {fields.problem.optional}</span>
              </label>
              <textarea {...field('problem')} rows="3" />
            </div>

            <div className="field consent">
              <input
                id="f-consent"
                name="consent"
                type="checkbox"
                checked={values.consent}
                onChange={set('consent')}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? 'e-consent' : undefined}
                required
              />
              <label htmlFor="f-consent">
                {form.consent.before}
                <a href={`#${policy.id}`} onClick={openPolicy}>
                  {form.consent.link}
                </a>
              </label>
              {error('consent')}
            </div>

            {errorCount > 0 && (
              <p className="form-summary" role="alert">
                {form.errorSummary(errorCount)}
              </p>
            )}

            <button className="btn" type="submit" disabled={status === 'sending'}>
              {form.submit}
            </button>

            {result && (
              <div className={`form-result${status === 'fail' ? ' is-fail' : ''}`} role="status">
                <strong>{result.title}</strong>
                <p>
                  {result.text} <a href={contacts.phoneHref}>{contacts.phone}</a>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
