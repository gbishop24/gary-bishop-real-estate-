import { useState } from "react";
import { Field } from "../components/Field.jsx";
import { submitLead } from "../lib/submitLead.js";

const AREAS = [
  "Palatka",
  "Interlachen",
  "Crescent City",
  "Florahome",
  "Welaka",
  "Pomona Park",
];

export default function Home() {
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
      subject: "Home Value Estimate Request — Putnam County",
      fields: {
        "First Name": data.get("firstName"),
        "Last Name": data.get("lastName"),
        Email: data.get("email"),
        Phone: data.get("phone"),
        Country: data.get("country"),
        "Address Line 1": data.get("address1"),
        "Address Line 2": data.get("address2"),
        City: data.get("city"),
        State: data.get("state"),
        ZIP: data.get("zip"),
        "Looking to sell": data.get("timeline"),
        Notes: data.get("notes"),
      },
    });
    setSubmitted(true);
  }

  return (
    <>
      <section className="hero" aria-label="Gary Bishop, Putnam County REALTOR">
        <div className="hero__media" aria-hidden="true">
          <img
            src="/images/hero-lake.jpg"
            alt=""
            width="2200"
            height="1652"
          />
          <div className="hero__shade" />
        </div>
        <div className="container">
          <div className="hero__content">
            <div className="hero__eyebrow">Putnam County · Local REALTOR®</div>
            <h1>Gary Bishop</h1>
            <p className="hero__lede">
              What’s your Putnam County home worth? Free, no-pressure estimates with honest
              guidance and clear communication from start to close.
            </p>
            <div className="hero-actions">
              <a className="btn btn-light" href="#home-value">
                Get My Free Home Value
              </a>
              <a className="btn btn-ghost" href="tel:3869169896">
                Call 386-916-9896
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--form" id="home-value">
        <div className="container">
          <div className="section-head center">
            <h2>What’s Your Putnam County Home Worth?</h2>
            <p>Get a free, no-pressure home value estimate from a local REALTOR®.</p>
          </div>

          <div className="form-panel center-block">
            {submitted ? (
              <div className="form-success" role="status">
                <h3>Thanks — Gary will be in touch within 24 hours.</h3>
                <p>
                  If your email app opened a draft, send it to finish the request. You can
                  also reach Gary anytime at{" "}
                  <a href="tel:3869169896">386-916-9896</a> or{" "}
                  <a href="mailto:GBishop24@icloud.com">GBishop24@icloud.com</a>.
                </p>
              </div>
            ) : (
              <form className="lead-form" onSubmit={onSubmit} noValidate={false}>
                <div className="field-row two">
                  <Field id="firstName" label="First Name" required autoComplete="given-name" />
                  <Field id="lastName" label="Last Name" required autoComplete="family-name" />
                </div>
                <Field id="email" label="Email" type="email" required autoComplete="email" />
                <Field id="phone" label="Phone" type="tel" required autoComplete="tel" />

                <Field id="country" label="Country" as="select" required defaultValue="United States">
                  <select
                    className="field-select"
                    id="country"
                    name="country"
                    required
                    defaultValue="United States"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Other</option>
                  </select>
                </Field>

                <Field
                  id="address1"
                  label="Address Line 1"
                  required
                  autoComplete="address-line1"
                />
                <Field id="address2" label="Address Line 2" autoComplete="address-line2" />

                <div className="field-row three">
                  <Field id="city" label="City" required autoComplete="address-level2" />
                  <Field id="state" label="State" required autoComplete="address-level1" defaultValue="FL" />
                  <Field id="zip" label="ZIP Code" required autoComplete="postal-code" />
                </div>

                <Field id="timeline" label="When are you looking to sell?" as="select" required>
                  <select className="field-select" id="timeline" name="timeline" required defaultValue="">
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option>ASAP</option>
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>6-12 months</option>
                    <option>Just curious</option>
                  </select>
                </Field>

                <label className="consent">
                  <input type="checkbox" name="consent" required />
                  <span>
                    I agree to be contacted by Gary Bishop of Coldwell Banker Ben Bates, Inc.
                    by phone, text, or email about my property. Consent is not a condition of
                    any purchase. Msg &amp; data rates may apply; reply STOP to opt out.
                  </span>
                </label>

                <Field id="notes" label="Notes" as="textarea" />

                {error ? <p className="form-error">{error}</p> : null}

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">
                    Get My Free Home Value
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="section section--about" id="about">
        <div className="container about-grid">
          <div className="about-copy">
            <h2>About Gary Bishop</h2>
            <p>
              I am a lifelong Putnam County resident with experience in the local real estate
              market since 2016. I work with Coldwell Banker Ben Bates, Inc., REALTORS® and
              focus on Putnam County and surrounding areas.
            </p>
            <p>
              My approach is straightforward: I’m honest, fair, and trustworthy with a strong
              work ethic that you can count on. I believe in clear communication and will keep
              you informed of progress throughout the entire process. Whether you’re selling or
              buying my goal is simple, to help you achieve the best possible outcome at the
              right price and on a timeline that works for you.
            </p>
            <p>
              If you are looking for a local agent who treats your real estate goals with care
              and professionalism, I’m here to help.
            </p>
            <p className="areas" aria-label="Areas served">
              Serving {AREAS.join(" · ")}
            </p>
          </div>
          <div className="about-photo">
            <img
              src="/images/gary-bishop.jpg"
              alt="Gary Bishop, REALTOR® with Coldwell Banker Ben Bates"
              width="640"
              height="800"
            />
          </div>
        </div>
      </section>
    </>
  );
}
