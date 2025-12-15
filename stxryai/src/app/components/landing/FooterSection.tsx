import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/' },
      { label: 'Pricing', href: '/' },
      { label: 'Story Library', href: '/story-library' },
      { label: 'Premium', href: '/' }
    ],
    company: [
      { label: 'About Us', href: '/' },
      { label: 'Blog', href: '/' },
      { label: 'Careers', href: '/' },
      { label: 'Contact', href: '/' }
    ],
    legal: [
      { label: 'Terms of Service', href: '/' },
      { label: 'Privacy Policy', href: '/' },
      { label: 'Cookie Policy', href: '/' },
      { label: 'Content Guidelines', href: '/' }
    ],
    social: [
      { icon: 'ChatBubbleLeftRightIcon', label: 'Discord', href: '#' },
      { icon: 'AtSymbolIcon', label: 'Twitter', href: '#' },
      { icon: 'BookOpenIcon', label: 'Medium', href: '#' }
    ]
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4L8 12V28L20 36L32 28V12L20 4Z"
                  fill="url(#footer-logo-gradient)"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 14L14 18V26L20 30L26 26V18L20 14Z"
                  fill="var(--color-background)"
                />
                <defs>
                  <linearGradient
                    id="footer-logo-gradient"
                    x1="8"
                    y1="4"
                    x2="32"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="var(--color-primary)" />
                    <stop offset="1" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-heading text-2xl font-bold text-foreground">
                Stxryai
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI-powered interactive fiction platform where your choices shape infinite story possibilities. Join thousands of readers exploring unique narratives.
            </p>
            <div className="flex items-center space-x-4">
              {footerLinks.social.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-smooth"
                  aria-label={social.label}
                >
                  <Icon name={social.icon as any} size={20} className="text-muted-foreground hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Stxryai. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheckIcon" size={16} className="text-success" />
                <span className="text-xs text-muted-foreground">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="LockClosedIcon" size={16} className="text-success" />
                <span className="text-xs text-muted-foreground">Stripe Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
