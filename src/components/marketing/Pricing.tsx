import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function Pricing({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section id="cennik" className="section">
      <div className="section-head">
        <span className="eyebrow">Cenník</span>
        <h2>Jednoduché ceny. Žiadne prekvapenia.</h2>
        <p>
          Začni zadarmo. Plať len keď to naozaj používaš — kredity míňaš len za
          odpovede AI.
        </p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`price-card ${plan.highlight ? "featured" : ""}`}
          >
            {plan.highlight && <div className="price-badge">Najobľúbenejší</div>}
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
            {plan.id === "free" ? (
              <Link
                href={loggedIn ? "/chat" : "/signup"}
                className="btn btn-outline full"
              >
                {plan.cta}
              </Link>
            ) : (
              <span className="btn btn-primary full disabled" aria-disabled>
                Čoskoro 🔜
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="pricing-note">
        💳 Platby (Stripe) pripravujeme. Zatiaľ si vyskúšaj všetko zadarmo na
        štartovacích kreditoch.
      </p>
    </section>
  );
}
