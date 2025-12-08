import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  alt: string;
  rating: number;
  comment: string;
  storiesRead: number;
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Premium Member",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13a641097-1763296216549.png",
    alt: "Professional woman with long brown hair wearing black blazer smiling at camera",
    rating: 5,
    comment: "The AI-generated stories are incredibly immersive. I've never experienced interactive fiction like this before. Every choice feels meaningful and the narratives are genuinely unpredictable.",
    storiesRead: 47
  },
  {
    name: "Marcus Chen",
    role: "Creator Member",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19be5ea52-1763295914952.png",
    alt: "Asian man with short black hair in navy blue shirt smiling confidently",
    rating: 5,
    comment: "As a writer, the AI writing assistant has transformed my creative process. The collaborative tools make it easy to work with other authors, and the analytics help me understand what readers love.",
    storiesRead: 89
  },
  {
    name: "Elena Rodriguez",
    role: "Free Member",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a36548bd-1763296665300.png",
    alt: "Hispanic woman with curly dark hair wearing red top with warm smile",
    rating: 5,
    comment: "I started with the free plan and was hooked immediately. The community features are amazing - I've made friends who share my love for dark fantasy stories. Upgraded to premium after just one week!",
    storiesRead: 23
  }];


  return (
    <section className="py-20 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Loved by
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Story Enthusiasts
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of readers who have discovered their next favorite story on Stxryai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) =>
          <div
            key={index}
            className="glassmorphism rounded-xl p-8 border border-border hover:border-primary/50 transition-smooth">

              <div className="flex items-center space-x-4 mb-6">
                <AppImage
                src={testimonial.avatar}
                alt={testimonial.alt}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />

                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) =>
              <Icon
                key={i}
                name="StarIcon"
                size={20}
                className="text-accent"
                variant="solid" />

              )}
              </div>

              <p className="text-foreground mb-4 italic">
                "{testimonial.comment}"
              </p>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="BookOpenIcon" size={16} />
                <span>{testimonial.storiesRead} stories read</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Active Readers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Stories Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">1M+</div>
            <div className="text-sm text-muted-foreground">Choices Made</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>);

};

export default TestimonialsSection;