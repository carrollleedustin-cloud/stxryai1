import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface FeaturedStory {
  title: string;
  genre: string;
  image: string;
  alt: string;
  rating: number;
}

const BenefitsPanel = () => {
  const benefits: Benefit[] = [
  {
    icon: 'SparklesIcon',
    title: 'AI-Powered Stories',
    description: 'Experience unique narratives generated in real-time based on your choices'
  },
  {
    icon: 'UserGroupIcon',
    title: 'Social Reading',
    description: 'Join clubs, discuss stories, and connect with fellow readers'
  },
  {
    icon: 'TrophyIcon',
    title: 'Achievements & Stats',
    description: 'Track your reading journey and unlock exclusive rewards'
  },
  {
    icon: 'BookOpenIcon',
    title: 'Unlimited Stories',
    description: 'Access thousands of interactive stories across multiple genres'
  }];


  const featuredStories: FeaturedStory[] = [
  {
    title: 'The Midnight Architect',
    genre: 'Horror',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14d1b4ed1-1764675760338.png",
    alt: 'Dark gothic mansion with illuminated windows at night surrounded by fog',
    rating: 4.8
  },
  {
    title: 'Quantum Paradox',
    genre: 'Sci-Fi',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e0c3ea62-1764674109321.png",
    alt: 'Futuristic space station orbiting blue planet with stars in background',
    rating: 4.9
  }];


  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
          Welcome to Stxryai
        </h2>
        <p className="text-muted-foreground">
          Join thousands of readers exploring AI-generated interactive fiction
        </p>
      </div>

      <div className="space-y-4">
        {benefits.map((benefit, index) =>
        <div
          key={index}
          className="flex items-start space-x-4 p-4 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-smooth">

            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
              <Icon name={benefit.icon as any} size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {benefit.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Featured Stories
        </h3>
        <div className="space-y-3">
          {featuredStories.map((story, index) =>
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-smooth cursor-pointer">

              <div className="relative h-32 overflow-hidden">
                <AppImage
                src={story.image}
                alt={story.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500" />

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-accent px-2 py-1 bg-accent/20 rounded-full border border-accent/30">
                    {story.genre}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
                    <span className="text-xs font-semibold text-foreground">
                      {story.rating}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {story.title}
                </h4>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 p-4 rounded-lg bg-success/10 border border-success/30">
        <Icon name="ShieldCheckIcon" size={24} className="text-success flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-success">Secure & Private</p>
          <p className="text-xs text-success/80">
            Your data is encrypted and protected with industry-standard security
          </p>
        </div>
      </div>
    </div>);

};

export default BenefitsPanel;