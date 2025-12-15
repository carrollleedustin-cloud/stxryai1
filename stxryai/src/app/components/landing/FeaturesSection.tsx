import Icon from '@/components/ui/AppIcon';

interface Feature {
  icon: string;
  title: string;
  description: string;
  isPremium?: boolean;
}

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: "SparklesIcon",
      title: "AI-Generated Stories",
      description: "Experience unique narratives created in real-time by advanced AI, ensuring no two stories are ever the same."
    },
    {
      icon: "ArrowPathIcon",
      title: "Unlimited Branches",
      description: "Every choice creates new story paths with dynamic consequences that adapt to your decisions.",
      isPremium: true
    },
    {
      icon: "UserGroupIcon",
      title: "Social Community",
      description: "Connect with fellow readers, join clubs, discuss stories, and share your favorite moments."
    },
    {
      icon: "ChatBubbleLeftRightIcon",
      title: "Real-Time Chat",
      description: "Engage in live discussions with other readers while exploring stories together."
    },
    {
      icon: "TrophyIcon",
      title: "Achievements & Stats",
      description: "Track your reading journey, unlock achievements, and compete on leaderboards."
    },
    {
      icon: "PencilSquareIcon",
      title: "Custom Choices",
      description: "Write your own story choices and influence the narrative direction with premium access.",
      isPremium: true
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Powerful Features for
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Immersive Reading
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the tools and features that make Stxryai the ultimate platform for interactive fiction enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glassmorphism rounded-xl p-8 border border-border hover:border-primary/50 transition-smooth group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-smooth">
                    <Icon name={feature.icon as any} size={24} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    {feature.isPremium && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-accent/20 text-accent rounded-full border border-accent/30">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
