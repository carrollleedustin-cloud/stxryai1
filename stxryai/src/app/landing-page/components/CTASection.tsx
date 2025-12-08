import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glassmorphism rounded-2xl p-12 border border-primary/30 shadow-elevation-2">
          <Icon name="SparklesIcon" size={48} className="text-accent mx-auto mb-6" />
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Ready to Begin Your
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Story Adventure?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of readers exploring infinite story possibilities. Start your journey today with our free plan or unlock unlimited access with premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/authentication"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold text-lg shadow-elevation-2 hover:shadow-elevation-1 transition-smooth flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              href="/story-library"
              className="w-full sm:w-auto px-8 py-4 bg-card border-2 border-primary text-foreground rounded-lg font-semibold text-lg hover:bg-primary/10 transition-smooth flex items-center justify-center space-x-2"
            >
              <Icon name="BookOpenIcon" size={20} />
              <span>Browse Stories</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;