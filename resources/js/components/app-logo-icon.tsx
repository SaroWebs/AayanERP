import { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className, ...props }: SVGAttributes<SVGElement>) {
    return (
        <div className={cn("max-w-32 rounded-lg", className)}>
            <img src="/assets/images/logo_sm_col.png" alt="" />
        </div>
    );
}
