import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';

interface StockAlert {
    id: number;
    name: string;
    code: string;
    current_stock: number;
    minimum_stock: number;
    status: 'low_stock' | 'out_of_stock';
    category: string;
}

interface StockAlertsProps {
    alerts: StockAlert[];
}

export default function StockAlerts({ alerts }: StockAlertsProps) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No stock alerts
                        </p>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {alert.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {alert.code} • {alert.category}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {alert.current_stock}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            min: {alert.minimum_stock}
                                        </p>
                                    </div>
                                    <Badge 
                                        variant="secondary" 
                                        className={`text-xs ${
                                            alert.status === 'out_of_stock' 
                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                                : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                        }`}
                                    >
                                        {alert.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 