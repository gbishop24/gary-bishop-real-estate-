import { useState } from "react";
import { Field } from "../components/Field.jsx";
import { submitLead } from "../lib/submitLead.js";

const STEPS = [
  "Get pre-approved with a lender.",
  "Decide on your must-haves and preferred areas.",
  "Tour homes with your agent.",
  "Make an offer and negotiate.",
  "Inspections, appraisal, and closing.",
];

export default function Buyers() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);

    if (data.get("consent") !== "on") {
      setError("Please agree to be contacted before submitting.");
      return;
    }

    submitLead({
      subject: "Buyer Inquiry — Putnam County Home Search",
      fields: {
        "First Name": data.get("firstName"),
        "Last Name": data.get("lastName"),
        Email: data.get("email"),
        Phone: data.get("phone"),
        "Areas of interest": data.get("areas"),
        "Price range": data.get("priceRange"),
        Timeframe: data.get("timeframe"),
        "Pre-approved": data.get("preapproved"),
        Comments: data.get("comments"),
      },
    });
    setSubmitted(true);
  }

  return (
    <>
      <section className="hero hero--buyers" aria-label="Buying in Putnam County">
        <div className="hero__media" aria-hidden="true">
          <img src="/images/hero-home.jpg" alt="" width="2200" height="1333" />
          <div className="hero__shade" />
        </div>
        <div className="container">
          <div className="hero__content">
            <div className="hero__eyebrow">Buying a Home · Putnam County</div>
            <h1>Gary Bishop</h1>
            <p className="hero__lede">
              Looking to buy in Putnam County? Share what you need and I’ll connect you with a
              trusted buyer’s agent and a custom home search.
            </p>
            <div className="hero-actions">
              <a className="btn btn-light" href="#buyer-form">
                Get Started
              </a>
              <a className="btn btn-ghost" href="tel:3869169896">
                Call 386-916-9896
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--form" id="buyer-form">
        <div className="container buyers-layout">
          <div className="buyers-intro">
            <h2>Looking to Buy in Putnam County?</h2>
            <p>
              Tell me what you’re looking for and I’ll connect you with a trusted buyer’s agent
              at Coldwell Banker Ben Bates who can set up a custom home search for you.
            </p>
          </div>

          <div className="form-panel align-end">
            {submitted ? (
              <div className="form-success" role="status">
                <h3>Thanks — Gary will be in touch within 24 hours.</h3>
                <p>
                  If your email app opened a draft, send it to finish the request. Prefer to
                  talk now? Call <a href="tel:3869169896">386-916-9896</a>.
                </p>
              </div>
            ) : (
              <form className="lead-form" onSubmit={onSubmit}>
                <div className="field-row two">
                  <Field id="firstName" label="First Name" required autoComplete="given-name" />
                  <Field id="lastName" label="Last Name" required autoComplete="family-name" />
                </div>
                <Field id="email" label="Email" type="email" required autoComplete="email" />
                <Field id="phone" label="Phone" type="tel" required autoComplete="tel" />
                <Field
                  id="areas"
                  label="Areas of interest"
                  placeholder="Palatka, Interlachen, Crescent City…"
                />

                <Field id="priceRange" label="Price range" as="select" required>
                  <select
                    className="field-select"
                    id="priceRange"
                    name="priceRange"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option>Under $150k</option>
                    <option>$150k–$250k</option>
                    <option>$250k–$400k</option>
                    <option>$400k+</option>
                  </select>
                </Field>

                <Field id="timeframe" label="Timeframe" as="select" required>
                  <select
                    className="field-select"
                    id="timeframe"
                    name="timeframe"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option>0–3 months</option>
                    <option>3–6 months</option>
                    <option>6–12 months</option>
                    <option>Just browsing</option>
                  </select>
                </Field>

                <div className="field">
                  <div className="field-label">
                    Pre-approved? <span className="field-hint">(required)</span>
                  </div>
                  <div className="radio-row">
                    <label>
                      <input type="radio" name="preapproved" value="Yes" required /> Yes
                    </label>
                    <label>
                      <input type="radio" name="preapproved" value="No" /> No
                    </label>
                    <label>
                      <input type="radio" name="preapproved" value="Not yet" /> Not yet
                    </label>
                  </div>
                </div>

                <Field id="comments" label="Comments" as="textarea" />

                <label className="consent">
                  <input type="checkbox" name="consent" required />
                  <span>
                    I agree to be contacted by Gary Bishop of Coldwell Banker Ben Bates, Inc.
                    by phone, text, or email about my home search. Consent is not a condition of
                    any purchase. Msg &amp; data rates may apply; reply STOP to opt out.
                  </span>
                </label>

                {error ? <p className="form-error">{error}</p> : null}

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">
                    Get Started
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="section section--guide">
        <div className="container">
          <div className="section-head">
            <h2>Buyer’s Quick Guide</h2>
          </div>
          <ol className="guide-list">
            {STEPS.map((step, index) => (
              <li key={step}>
                <span className="num">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
