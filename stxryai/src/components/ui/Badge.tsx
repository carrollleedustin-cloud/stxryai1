import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'premium'
  | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  animated?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  animated = false,
  pulse = false,
  className = '',
  onClick,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-muted text-muted-foreground border-border',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const BadgeComponent = animated ? motion.span : 'span';

  const animationProps = animated
    ? {
        whileHover: { scale: 1.05 },
        whileTap: onClick ? { scale: 0.95 } : undefined,
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2 },
      }
    : {};

  const pulseAnimation = pulse
    ? {
        animate: {
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {};

  return (
    <BadgeComponent
      {...animationProps}
      {...pulseAnimation}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={iconSizes[size]} />}
      {children}
    </BadgeComponent>
  );
}

/**
 * Achievement Badge with special styling
 */
export function AchievementBadge({
  title,
  icon = 'TrophyIcon',
  unlocked = false,
}: {
  title: string;
  icon?: string;
  unlocked?: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
        unlocked
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      <motion.div
        animate={unlocked ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: unlocked ? Infinity : 0, repeatDelay: 3 }}
      >
        <Icon name={icon} size={20} />
      </motion.div>
      <span className="font-semibold text-sm">{title}</span>
      {unlocked && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />
      )}
    </motion.div>
  );
}

/**
 * Premium Badge with gradient
 */
export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full ${className}`}
    >
      <Icon name="SparklesIcon" size={12} />
      <span>Premium</span>
    </motion.div>
  );
}

/**
 * New Badge with pulse animation
 */
export function NewBadge({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full ${className}`}
    >
      <span className="w-1.5 h-1.5 bg-white rounded-full" />
      <span>NEW</span>
    </motion.div>
  );
}

/**
 * Count Badge (for notifications, etc.)
 */
export function CountBadge({
  count,
  max = 99,
  className = '',
}: {
  count: number;
  max?: number;
  className?: string;
}) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full ${className}`}
    >
      {displayCount}
    </motion.div>
  );
}

/**
 * Status Badge
 */
export function StatusBadge({
  status,
  className = '',
}: {
  status: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-gray-500', label: 'Offline' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    busy: { color: 'bg-red-500', label: 'Busy' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm ${className}`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${config.color}`}
      />
      <span className="text-foreground font-medium">{config.label}</span>
    </motion.div>
  );
}
