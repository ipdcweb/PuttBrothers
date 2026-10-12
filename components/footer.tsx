import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Facebook, Instagram, Linkedin } from "lucide-react"

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]
const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61551240330686", icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/puttbrothersnz/", icon: Instagram },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/puttbrothers/", icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="pb-shell-footer pb-v2">
      <section className="pb-shell-footer__cta" aria-labelledby="pb-footer-project-title">
        <div className="pb-container pb-shell-footer__cta-inner">
          <div><p className="pb-eyebrow">Your next big idea starts here</p><h2 id="pb-footer-project-title">Let’s build<br />what’s next.</h2></div>
          <Link href="/contact#contact" className="pb-shell-footer__project-link"><span>Start your project</span><ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </section>
      <div className="pb-container pb-shell-footer__base">
        <div className="pb-shell-footer__columns">
          <div className="pb-shell-footer__brand">
            <Link href="/" aria-label="Putt Brothers home"><Image src="/images/design-mode/Logo-White.webp" alt="Putt Brothers" width={240} height={67} /></Link>
            <p>Building better entertainment experiences together for over 20 years.</p>
            <p className="pb-shell-footer__tagline">More than games,<br />we design happiness.</p>
          </div>
          <nav aria-label="Footer navigation" className="pb-shell-footer__navigation">
            <h3>Explore</h3>
            <ul>{footerLinks.map((item) => (<li key={item.href}><Link href={item.href}>{item.name}<ArrowUpRight size={16} aria-hidden="true" /></Link></li>))}</ul>
          </nav>
          <div className="pb-shell-footer__contact">
            <h3>Let’s talk</h3>
            <a className="pb-shell-footer__email" href="mailto:sales@puttbrothers.com">sales@puttbrothers.com</a>
            <p>Auckland, New Zealand.<br />Creating experiences around the world.</p>
            <div className="pb-shell-footer__socials">
              {socialLinks.map(({ name, href, icon: Icon }) => (<a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`}><Icon size={20} aria-hidden="true" /></a>))}
            </div>
          </div>
        </div>
        <p className="pb-shell-footer__imagery-note">Concept imagery shown for inspiration.</p>
        <div className="pb-shell-footer__legal">
          <p>© {new Date().getFullYear()} PuttBrothers. All rights reserved.</p>
          <p>Developed by <a href="https://www.ipdc.co.nz" target="_blank" rel="noopener noreferrer">IPDC<span className="sr-only"> (opens in a new tab)</span><ArrowUpRight size={13} aria-hidden="true" /></a></p>
        </div>
      </div>
    </footer>
  )
}
