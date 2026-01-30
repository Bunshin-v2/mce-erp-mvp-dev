import { Text, Box } from '@/components/primitives';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-center justify-between mb-8', className)}>
      <Box className="flex flex-col gap-1">
        {subtitle && (
          <Text variant="gov-label" color="secondary" className="truncate">
            {subtitle}
          </Text>
        )}
        <Text as="h1" variant="gov-hero" className="truncate">
          {title}
        </Text>
      </Box>
      {actions && <Box className="page-actions">{actions}</Box>}
    </header>
  );
}
