import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function StatsCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    color = 'blue'
}: StatsCardProps) {
    return (
        <Card className={`border-sidebar-border/70 dark:border-sidebar-border bg-${color}-50`}>
            <CardContent className={`p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold">{value}</p>
                            {trend && (
                                <span className={`text-sm font-medium ${
                                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {trend.isPositive ? '+' : ''}{trend.value}%
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 