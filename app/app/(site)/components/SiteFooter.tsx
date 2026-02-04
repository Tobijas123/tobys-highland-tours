import Link from "next/link";

async function getHomepageSettings() {
  try {
    const res = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/globals/homepage?depth=2`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const settings = await getHomepageSettings();
  const footerLogo = settings?.footerLogo;

  return (
    <footer className="thtFooter" aria-label="Site footer">
      <div className="thtFooterInner">
        <div className="thtFooterGrid">
          {/* Brand */}
          <div className="thtFooterCol">
            <div className="thtFooterBrand">
              <div className="thtFooterLogo" aria-hidden="true">
                {footerLogo?.url ? (
                  <img className="thtFooterLogoImg" src={footerLogo.url} alt="Toby's Highland Tours logo" />
                ) : (
                  'LOGO'
                )}
              </div>
              <div>
                <div className="thtFooterTitle">Toby's Highland Tours</div>
                <p className="thtFooterTagline">
                  Private tours • Transfers • Bespoke itineraries
                </p>
              </div>
            </div>

            <p className="thtFooterText">
              Local Inverness-based driver-guide for relaxed, scenic Highland experiences.
              Easy pickup, flexible stops, and straight-to-the-point planning.
            </p>

            <div className="thtFooterBadges" aria-label="Highlights">
              <span className="thtFooterBadge">English / Español</span>
              <span className="thtFooterBadge">Flexible pickup</span>
              <span className="thtFooterBadge">Fast replies</span>
            </div>
          </div>

          {/* Links */}
          <nav className="thtFooterCol" aria-label="Quick links">
            <h3 className="thtFooterHeading">Quick Links</h3>
            <ul className="thtFooterLinks">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/tours">Tours</Link></li>
              <li><Link href="/transfers">Transfers</Link></li>
              <li><Link href="/tours/bespoke">Bespoke Tours</Link></li>
              <li><Link href="/transfers/request">Request a Quote</Link></li>
            </ul>
          </nav>

          {/* Contact + CTA */}
          <div className="thtFooterCol">
            <h3 className="thtFooterHeading">Contact</h3>

            <address className="thtFooterAddress">
              <div>184 Murray Terrace</div>
              <div>Inverness, IV2 7WZ</div>
              <div>Scotland, UK</div>
            </address>

            <div className="thtFooterContacts">
              <a className="thtFooterContact" href="tel:+447383488007">
                +44 7383 488007 (WhatsApp)
              </a>
              <a className="thtFooterContact" href="tel:+441463444222">
                +44 1463 444222
              </a>
              <a className="thtFooterContact" href="mailto:info@tobyshighlandtours.com">
                info@tobyshighlandtours.com
              </a>
            </div>

            <div className="thtFooterCtas">
              <Link className="thtFooterBtn" href="/tours">Book Now</Link>
              <a
                className="thtFooterBtn thtFooterBtnGhost"
                href="https://wa.me/447383488007"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="thtFooterBottom">
          <div>© {year} Toby's Highland Tours. All rights reserved.</div>
          <div className="thtFooterBottomRight">
            <a className="thtFooterBottomLink" href="#top">Back to top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
