import Icon from '@/components/ui/AppIcon';

interface TrustSignal {
  icon: string;
  title: string;
  description: string;
}

const TrustSignalsSection = () => {
  const trustSignals: TrustSignal[] = [
    {
      icon: "ShieldCheckIcon",
      title: "SSL Encrypted",
      description: "Your data is protected with industry-standard 256-bit SSL encryption"
    },
    {
      icon: "LockClosedIcon",
      title: "Secure Payments",
      description: "All transactions processed through Stripe's secure payment gateway"
    },
    {
      icon: "UserGroupIcon",
      title: "Privacy First",
      description: "We never share your personal information with third parties"
    },
    {
      icon: "CheckBadgeIcon",
      title: "Verified Platform",
      description: "Trusted by thousands of readers and content creators worldwide"
    }
  ];

  return (
    <section className="py-16 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustSignals.map((signal, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 mb-4">
                <Icon name={signal.icon as any} size={32} className="text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {signal.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
