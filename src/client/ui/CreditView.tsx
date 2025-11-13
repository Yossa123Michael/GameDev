import credits from '../data/credits';
import './CreditView.css';

const CreditView = () => {
  return (
    <div className="credit-root">
      <h1 className="credit-title">Credit</h1>

      <div className="credits-scroll">
        {credits.map((category) => {
          const isTwo = category.layout === 'two-column';

          if (isTwo) {
            // Tetap 2 kolom: kiri (label, right), tengah kosong, kanan (name, left)
            return (
              <section className="credit-category two" key={category.title}>
                <h2 className="category-title">{category.title}</h2>
                {category.subtitle && <div className="category-subtitle">{category.subtitle}</div>}

                <div className="rows">
                  {category.items.map((it, idx) => (
                    <div
                      className="row-3col"
                      key={idx}
                      title={`${it.label ?? ''}${it.label ? ' — ' : ''}${it.name}${it.subtitle ? ' — ' + it.subtitle : ''}`}
                    >
                      <div className="col-left">
                        {it.label ? (
                          it.url ? (
                            <a className="credit-link ellipsis" href={it.url} target="_blank" rel="noopener noreferrer">
                              {it.label}
                            </a>
                          ) : (
                            <span className="plain-text ellipsis">{it.label}</span>
                          )
                        ) : null}
                      </div>

                      <div className="col-mid" />

                      <div className="col-right">
                        {it.url ? (
                          <a className="credit-link strong ellipsis" href={it.url} target="_blank" rel="noopener noreferrer">
                            {it.name}
                          </a>
                        ) : (
                          <span className="plain-text strong ellipsis">{it.name}</span>
                        )}
                        {it.subtitle && (
                          <span className="item-subtitle-inline ellipsis"> — {it.subtitle}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // SINGLE: 1 kolom saja, benar-benar di tengah. Tidak memakai grid/2 kolom.
          return (
            <section className="credit-category single" key={category.title}>
              <h2 className="category-title">{category.title}</h2>
              {category.subtitle && <div className="category-subtitle">{category.subtitle}</div>}

              <ul className="single-list">
                {category.items.map((it, idx) => (
                  <li
                    className="single-item"
                    key={idx}
                    title={`${it.label ?? ''}${it.label ? ' — ' : ''}${it.name}${it.subtitle ? ' — ' + it.subtitle : ''}`}
                  >
                    {/* Name di tengah */}
                    {it.url ? (
                      <a className="credit-link strong ellipsis center-only" href={it.url} target="_blank" rel="noopener noreferrer">
                        {it.name}
                      </a>
                    ) : (
                      <span className="plain-text strong ellipsis center-only">{it.name}</span>
                    )}

                    {/* Subtitle kecil di bawah name, tetap center (opsional) */}
                    {it.subtitle && (
                      <div className="item-subtitle-center ellipsis">— {it.subtitle}</div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CreditView;
