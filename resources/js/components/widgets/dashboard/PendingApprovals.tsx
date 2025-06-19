import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, ShoppingCart, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingApproval {
    type: 'quotation' | 'purchase_order';
    id: number;
    title: string;
    description: string;
    status: string;
    date: string;
    user: string;
}

interface PendingApprovalsProps {
    approvals: PendingApproval[];
}

const getApprovalIcon = (type: PendingApproval['type']) => {
    switch (type) {
        case 'quotation':
            return <FileText className="h-4 w-4" />;
        case 'purchase_order':
            return <ShoppingCart className="h-4 w-4" />;
        default:
            return <Building className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending_review':
            return 'yellow';
        case 'pending_approval':
            return 'orange';
        default:
            return 'blue';
    }
};

export default function PendingApprovals({ approvals }: PendingApprovalsProps) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending Approvals
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {approvals.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No pending approvals
                        </p>
                    ) : (
                        approvals.map((approval, index) => (
                            <div key={`${approval.type}-${approval.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                                        {getApprovalIcon(approval.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {approval.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {approval.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            by {approval.user}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        color={getStatusColor(approval.status)}
                                    >
                                        {approval.status.replace('_', ' ')}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(approval.date), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 