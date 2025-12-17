import Icon from '@/components/ui/AppIcon';

const TrustSignals = () => {
  const stats = [
    { value: '50K+', label: 'Active Readers' },
    { value: '10K+', label: 'Stories Created' },
    { value: '4.9', label: 'Average Rating' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stat?.value}</div>
            <div className="text-xs text-muted-foreground">{stat?.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center space-x-6 py-4 border-t border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="LockClosedIcon" size={16} className="text-success" />
          <span className="text-xs text-muted-foreground">SSL Secured</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="ShieldCheckIcon" size={16} className="text-success" />
          <span className="text-xs text-muted-foreground">GDPR Compliant</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Trusted by readers worldwide since 2024</p>
      </div>
    </div>
  );
};

export default TrustSignals;
