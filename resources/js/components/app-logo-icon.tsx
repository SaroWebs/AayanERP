import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <div className="max-w-32 rounded-lg">
            <img src="/assets/images/logo_sm_col.png" alt="" />
        </div>
    );
}
