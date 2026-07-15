import Link from "next/link";
import { getDict } from "@/lib/i18n";

export default async function Pricing({ loggedIn }: { loggedIn: boolean }) {
  const { t } = await getDict();
  const p = t.pricing;
  return (
    <section id="cennik" className="section">
      <div className="section-head">
        <span className="eyebrow">{p.eyebrow}</span>
        <h2>{p.title}</h2>
        <p>{p.sub}</p>
      </div>

      <div className="pricing-grid">
        {p.plans.map((plan) => {
          const isFree = plan.price.replace(/[^0-9]/g, "") === "0";
          return (
            <div
              key={plan.name}
              className={`price-card ${plan.highlight ? "featured" : ""}`}
            >
              {plan.highlight && (
                <div className="price-badge">{p.popular}</div>
              )}
              <div className="price-name">{plan.name}</div>
              <div className="price-amount">
                <span className="price-value">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <div className="price-credits">{plan.credits}</div>
              <ul className="price-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className="check">✓</span> {f}
                  </li>
                ))}
              </ul>
              {isFree ? (
                <Link
                  href={loggedIn ? "/chat" : "/signup"}
                  className="btn btn-outline full"
                >
                  {plan.cta}
                </Link>
              ) : (
                <span className="btn btn-primary full disabled" aria-disabled>
                  {p.soon}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="pricing-note">{p.note}</p>
    </section>
  );
}
