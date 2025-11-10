import credits from '../data/credits';
import './CreditView.css';

const CreditView = () => {
  return (
    <div className="credit-root">
      <h1 className="credit-title">Credit</h1>

      <div className="credits-wrapper">
        {credits.map((category) => {
          const isTwo = category.layout === 'two-column';

          if (isTwo) {
            return (
              <section className="credit-category two" key={category.title}>
                <h2 className="category-title">{category.title}</h2>
                <div className="two-col-block">
                  {category.items.map((it, idx) => (
                    <div className="two-col-row" key={idx}>
                      <div className="col-left">
                        {it.url ? (
                          <a className="credit-link" href={it.url} target="_blank" rel="noopener noreferrer">
                            {it.label}
                          </a>
                        ) : (
                          <span className="plain-text">{it.label}</span>
                        )}
                      </div>
                      <div className="col-right">
                        {it.url ? (
                          <a className="credit-link strong" href={it.url} target="_blank" rel="noopener noreferrer">
                            {it.name}
                          </a>
                        ) : (
                          <span className="plain-text strong">{it.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return (
            <section className="credit-category single" key={category.title}>
              <h2 className="category-title">{category.title}</h2>
              <ul className="single-list">
                {category.items.map((it, idx) => (
                  <li className="single-item" key={idx}>
                    {it.url ? (
                      <a className="credit-link strong" href={it.url} target="_blank" rel="noopener noreferrer">
                        {it.name}
                      </a>
                    ) : (
                      <span className="plain-text strong">{it.name}</span>
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
