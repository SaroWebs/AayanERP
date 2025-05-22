import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <div className="bg-orange-500 max-w-32 rounded-lg">
            <img src="/assets/images/logo.png" alt="" />
        </div>
    );
}
