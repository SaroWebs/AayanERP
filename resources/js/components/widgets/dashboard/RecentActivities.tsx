import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, ShoppingCart, Package, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    type: 'enquiry' | 'quotation' | 'stock_movement' | 'purchase_order';
    id: number;
    title: string;
    description: string;
    status: string;
    date: string;
    user: string;
}

interface RecentActivitiesProps {
    activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'enquiry':
            return <FileText className="h-4 w-4" />;
        case 'quotation':
            return <ShoppingCart className="h-4 w-4" />;
        case 'stock_movement':
            return <Package className="h-4 w-4" />;
        case 'purchase_order':
            return <Building className="h-4 w-4" />;
        default:
            return <User className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'draft':
            return 'gray';
        case 'pending_review':
        case 'pending_approval':
            return 'yellow';
        case 'approved':
            return 'green';
        case 'rejected':
            return 'red';
        case 'in':
            return 'green';
        case 'out':
            return 'red';
        default:
            return 'blue';
    }
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border gap-0">
            <CardHeader className='shadow-md pb-4'>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activities
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-4 max-h-80 overflow-y-auto'>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No recent activities
                        </p>
                    ) : (
                        activities.map((activity, index) => (
                            <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium truncate">
                                            {activity.title}
                                        </p>
                                        <Badge 
                                            variant="secondary" 
                                            className="text-xs"
                                            color={getStatusColor(activity.status)}
                                        >
                                            {activity.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-muted-foreground">
                                            by {activity.user}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 