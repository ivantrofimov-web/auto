export default function SectionLabel({ number, label }) {
  return (
    <p className="sec-label">
      <span className="sec-num">{number}</span>
      {label}
    </p>
  )
}
