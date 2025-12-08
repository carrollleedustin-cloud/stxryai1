'use client';



interface OAuthButtonsProps {
  onOAuthClick: (provider: string) => void;
  isLoading: boolean;
}

const OAuthButtons = ({ onOAuthClick, isLoading }: OAuthButtonsProps) => {
  const providers = [
    {
      name: 'Google',
      icon: 'https://www.google.com/favicon.ico',
      alt: 'Google logo with multicolored G letter',
      bgColor: 'bg-white hover:bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      name: 'Discord',
      icon: 'https://discord.com/assets/favicon.ico',
      alt: 'Discord logo with white game controller icon on blue background',
      bgColor: 'bg-[#5865F2] hover:bg-[#4752C4]',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <button
          key={provider.name}
          onClick={() => onOAuthClick(provider.name.toLowerCase())}
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border border-border ${provider.bgColor} ${provider.textColor} font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
        >
          <img
            src={provider.icon}
            alt={provider.alt}
            className="w-5 h-5"
          />
          <span>Continue with {provider.name}</span>
        </button>
      ))}
    </div>
  );
};

export default OAuthButtons;