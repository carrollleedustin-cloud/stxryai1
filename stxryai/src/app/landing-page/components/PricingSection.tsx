import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const PricingSection = () => {
  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for casual readers exploring interactive fiction",
      features: [
        "5 story choices per day",
        "Access to public stories",
        "Basic community features",
        "Reading statistics",
        "Story bookmarks"
      ],
      ctaText: "Start Free",
      ctaLink: "/authentication"
    },
    {
      name: "Premium",
      price: "$9.99",
      originalPrice: "$14.99",
      description: "Unlimited access for dedicated story enthusiasts",
      features: [
        "Unlimited story choices",
        "Exclusive premium stories",
        "Custom choice writing",
        "AI story branch visualization",
        "Priority story generation",
        "Ad-free experience",
        "Advanced analytics",
        "Early access to new features"
      ],
      isPopular: true,
      ctaText: "Start Premium Trial",
      ctaLink: "/authentication"
    },
    {
      name: "Creator",
      price: "$19.99",
      originalPrice: "$29.99",
      description: "For authors and collaborative storytellers",
      features: [
        "Everything in Premium",
        "AI writing assistant",
        "Story creation tools",
        "Co-authoring features",
        "Creator analytics dashboard",
        "Version control system",
        "Custom story themes",
        "Revenue sharing program"
      ],
      ctaText: "Become a Creator",
      ctaLink: "/authentication"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-card to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <Icon name="SparklesIcon" size={20} className="text-accent" />
            <span className="text-sm font-medium text-accent">Launch Special - Limited Time</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Choose Your
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Story Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade anytime. All plans include our core interactive fiction experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative glassmorphism rounded-xl p-8 border transition-smooth ${
                tier.isPopular
                  ? 'border-primary shadow-elevation-2 lg:scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full text-sm font-bold shadow-elevation-1">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center space-x-2 mb-2">
                  <span className="text-5xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {tier.originalPrice && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {tier.originalPrice}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-accent/20 text-accent rounded-full">
                      33% OFF
                    </span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Icon
                      name="CheckCircleIcon"
                      size={20}
                      className="text-success flex-shrink-0 mt-0.5"
                      variant="solid"
                    />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaLink}
                className={`block w-full px-6 py-4 rounded-lg font-semibold text-center transition-smooth ${
                  tier.isPopular
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-elevation-2 hover:shadow-elevation-1'
                    : 'bg-card border-2 border-primary text-foreground hover:bg-primary/10'
                }`}
              >
                {tier.ctaText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include 14-day money-back guarantee • Cancel anytime • Secure payment via Stripe
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;