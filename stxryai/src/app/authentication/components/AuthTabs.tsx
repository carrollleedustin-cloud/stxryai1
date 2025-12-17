'use client';

import Icon from '@/components/ui/AppIcon';

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
  return (
    <div className="flex space-x-2 p-1 bg-muted/30 rounded-lg">
      <button
        onClick={() => onTabChange('login')}
        className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-smooth ${
          activeTab === 'login'
            ? 'bg-primary text-primary-foreground shadow-elevation-1'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon
          name="ArrowRightOnRectangleIcon"
          size={20}
          variant={activeTab === 'login' ? 'solid' : 'outline'}
        />
        <span>Login</span>
      </button>
      <button
        onClick={() => onTabChange('register')}
        className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-smooth ${
          activeTab === 'register'
            ? 'bg-primary text-primary-foreground shadow-elevation-1'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon
          name="UserPlusIcon"
          size={20}
          variant={activeTab === 'register' ? 'solid' : 'outline'}
        />
        <span>Register</span>
      </button>
    </div>
  );
};

export default AuthTabs;
