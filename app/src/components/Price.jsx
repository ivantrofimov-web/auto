import { useMemo, useState } from 'react'
import { price, contacts } from '../data/content.js'
import SectionLabel from './SectionLabel.jsx'

const normalize = (s) => s.toLowerCase().replace(/ё/g, 'е')

// Грубое отсечение окончаний: «колодки» должны находить «колодок», «диски» — «дисков».
const stem = (word) => {
  let w = word
  for (let i = 0; i < 2 && w.length > 4 && /[аеиоуыэюяйьк]$/.test(w); i++) w = w.slice(0, -1)
  return w
}

export const formatPrice = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' ')

const index = price.categories.map((category) => ({
  ...category,
  items: category.items.map((item) => ({
    ...item,
    haystack: normalize(`${item.name} ${item.tags} ${category.name}`),
  })),
}))
const total = index.reduce((sum, c) => sum + c.items.length, 0)

export default function Price() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const stems = normalize(query).split(/[^a-zа-я0-9]+/).filter(Boolean).map(stem)
    if (!stems.length) return index
    return index
      .map((c) => ({ ...c, items: c.items.filter((item) => stems.every((s) => item.haystack.includes(s))) }))
      .filter((c) => c.items.length)
  }, [query])

  const shown = groups.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <section className="sec rail" id="price" aria-labelledby="price-title">
      <div className="rail-side">
        <SectionLabel number={price.number} label={price.label} />
        <p className="side-note">{price.lead}</p>
      </div>
      <div className="rail-main">
        <h2 id="price-title">{price.title}</h2>

        <div className="price-search">
          <label htmlFor="price-q">{price.searchLabel}</label>
          <div className="price-search-row">
            <input
              id="price-q"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder={price.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-controls="price-table"
              aria-describedby="price-count"
            />
            {query && (
              <button type="button" className="price-clear" onClick={() => setQuery('')}>
                {price.clear}
              </button>
            )}
          </div>
          <p id="price-count" className="price-count" role="status">
            {price.found(shown, total)}
          </p>
        </div>

        {shown === 0 ? (
          <div className="price-empty" id="price-table">
            <h3>{price.empty.title}</h3>
            <p>
              {price.empty.text} <a href={contacts.phoneHref}>{contacts.phone}</a>
            </p>
          </div>
        ) : (
          <table className="price-table" id="price-table">
            <caption className="sr-only">{price.label}</caption>
            <thead>
              <tr>
                <th scope="col">{price.columns[0]}</th>
                <th scope="col" colSpan="2" className="num">
                  {price.columns[1]}
                </th>
              </tr>
            </thead>
            {groups.map((category) => (
              <tbody key={category.id}>
                <tr className="price-group">
                  <th scope="colgroup" colSpan="3">
                    {category.name}
                  </th>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">
                      {item.name}
                      {item.note && <small>{item.note}</small>}
                    </th>
                    <td className="from">{item.from && price.fromLabel}</td>
                    <td className="num">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        )}
        <p className="price-footnote">{price.footnote}</p>
      </div>
    </section>
  )
}
