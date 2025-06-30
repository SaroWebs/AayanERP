import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyData {
    month: string;
    enquiries: number;
    quotations: number;
    orders: number;
    purchases: number;
}

interface MonthlyChartProps {
    data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                <p className="font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function MonthlyChart({ data }: MonthlyChartProps) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border gap-0">
            <CardHeader className='shadow-md pb-4'>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-2'>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="month" 
                                fontSize={12}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis 
                                fontSize={12}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                dataKey="enquiries" 
                                fill="#3b82f6" 
                                name="Enquiries"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="quotations" 
                                fill="#10b981" 
                                name="Quotations"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="orders" 
                                fill="#f59e0b" 
                                name="Orders"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="purchases" 
                                fill="#8b5cf6" 
                                name="Purchases"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 