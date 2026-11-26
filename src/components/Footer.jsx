export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-stack">
            <a href="tel:3869169896">Cell: 386-916-9896</a>
            <a href="mailto:GBishop24@icloud.com">GBishop24@icloud.com</a>
            <div className="footer-brand">Coldwell Banker Ben Bates, Inc., REALTORS®</div>
            <div>3400 Crill Ave, Suite 1, Palatka, FL 32177</div>
            <div>Office: 386-328-6716</div>
          </div>

          <div className="footer-marks">
            <img
              className="eho"
              src="/images/equal-housing.svg"
              alt="Equal Housing Opportunity"
              width="64"
              height="64"
            />
            <img
              className="cb-logo"
              src="/images/cb-ben-bates.png"
              alt="Coldwell Banker Ben Bates, Inc., REALTORS®"
              width="190"
              height="70"
            />
          </div>
        </div>

        <p className="footer-note">
          Gary Bishop is a Sales Associate with Coldwell Banker Ben Bates, Inc., REALTORS®
          (License #SL3360313), serving Putnam County and surrounding communities including
          Palatka, Interlachen, Crescent City, Florahome, Welaka, and Pomona Park.
        </p>
      </div>
    </footer>
  );
}
