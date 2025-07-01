import React, { useMemo } from 'react'

type Props = {}

const BgBlur = (props: Props) => {

    const bgCircles = useMemo(() => {
        const colors = [
            'bg-blue-400',
            'bg-pink-400',
            'bg-yellow-300',
            'bg-green-300',
            'bg-purple-400',
            'bg-indigo-300',
            'bg-rose-300',
        ];
        const blurs = ['blur-2xl', 'blur-3xl'];
        const blend = 'mix-blend-multiply';
        const circles = Array.from({ length: 5 }, (_, i) => {
            const size = Math.floor(Math.random() * 10 + 16) * 16; // 256px to 416px
            const top = Math.random() < 0.5
                ? `-${Math.floor(Math.random() * 80 + 40)}px`
                : `${Math.floor(Math.random() * 60 + 10)}%`;
            const left = Math.random() < 0.5
                ? `-${Math.floor(Math.random() * 80 + 40)}px`
                : `${Math.floor(Math.random() * 60 + 10)}%`;
            const right = Math.random() < 0.5
                ? `-${Math.floor(Math.random() * 80 + 40)}px`
                : `${Math.floor(Math.random() * 60 + 10)}%`;
            const bottom = Math.random() < 0.5
                ? `-${Math.floor(Math.random() * 80 + 40)}px`
                : `${Math.floor(Math.random() * 60 + 10)}%`;
            const style = {
                width: size,
                height: size,
                top: Math.random() > 0.5 ? top : 'auto',
                left: Math.random() > 0.5 ? left : 'auto',
                right: Math.random() > 0.5 ? right : 'auto',
                bottom: Math.random() > 0.5 ? bottom : 'auto',
                opacity: Math.random() * 0.2 + 0.2, // 0.2 to 0.4
                zIndex: 0,
            };
            return {
                key: i,
                className: `pointer-events-none absolute rounded-full ${colors[Math.floor(Math.random() * colors.length)]} ${blend} filter ${blurs[Math.floor(Math.random() * blurs.length)]}`,
                style,
            };
        });
        return circles;
    }, []);

    return (
        <>
            {bgCircles.map((circle) => (
                <div key={circle.key} className={circle.className} style={circle.style} />
            ))}
        </>
    )
}

export default BgBlur