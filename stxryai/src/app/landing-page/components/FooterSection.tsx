'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Github, MessageCircle, Mail } from 'lucide-react';

/**
 * FOOTER SECTION
 * The quiet ending to every journey.
 * Minimal, respectful, ever-present.
 */
export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { label: 'Library', href: '/story-library' },
      { label: 'Create', href: '/story-creation-studio' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Community', href: '/community-hub' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Help', href: '/help' },
      { label: 'Support', href: '/support' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  };
  
  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/stxryai', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/stxryai', label: 'GitHub' },
    { icon: MessageCircle, href: 'https://discord.gg/stxryai', label: 'Discord' },
  ];
  
  return (
    <footer className="relative border-t border-membrane">
      {/* Top gradient line */}
      <div 
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.2), transparent)',
        }}
      />
      
      <div className="container-void py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 36 36"
                fill="none"
              >
                <path
                  d="M18 2L4 10v16l14 8 14-8V10L18 2z"
                  fill="url(#footer-logo-gradient)"
                />
                <path
                  d="M18 10l-8 5v10l8 5 8-5V15l-8-5z"
                  fill="var(--void-absolute)"
                />
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="4" y1="2" x2="32" y2="34">
                    <stop stopColor="var(--spectral-cyan)" />
                    <stop offset="1" stopColor="var(--spectral-violet)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-display text-lg tracking-widest text-text-primary">
                STXRY
              </span>
            </Link>
            
            <p className="font-prose text-sm text-text-tertiary max-w-xs mb-8 leading-relaxed">
              Where infinite stories await. AI-powered interactive fiction that adapts to your choices.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-void-mist flex items-center justify-center text-text-tertiary hover:text-spectral-cyan hover:bg-void-whisper transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h4 className="font-ui text-xs tracking-widest uppercase text-text-ghost mb-6">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="font-prose text-sm text-text-tertiary hover:text-spectral-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-ui text-xs tracking-widest uppercase text-text-ghost mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="font-prose text-sm text-text-tertiary hover:text-spectral-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="font-ui text-xs tracking-widest uppercase text-text-ghost mb-6">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="font-prose text-sm text-text-tertiary hover:text-spectral-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-membrane flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-ghost">
            © {currentYear} Stxryai. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/accessibility"
              className="text-xs text-text-ghost hover:text-text-tertiary transition-colors"
            >
              Accessibility
            </Link>
            <Link 
              href="/sitemap-page"
              className="text-xs text-text-ghost hover:text-text-tertiary transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
      
      {/* Ambient glow at bottom */}
      <div 
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(0, 245, 212, 0.05) 0%, transparent 70%)',
        }}
      />
    </footer>
  );
}
