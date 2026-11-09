import { useId } from "react";

const WIDTH = 120;
const HEIGHT = 48;
const PAD = 4;

/** เส้นโค้งนุ่ม ๆ ผ่านทุกจุด (Catmull-Rom → Bezier) */
const buildPath = (points: number[]) => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const step = WIDTH / (points.length - 1);
    const coords = points.map((p, i) => [
        i * step,
        PAD + (1 - (p - min) / range) * (HEIGHT - PAD * 2),
    ]);

    let d = `M${coords[0][0]},${coords[0][1]}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i - 1] ?? coords[i];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] ?? p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
};

/** กราฟเส้นเล็กพร้อมไล่สีด้านล่าง ใช้ currentColor จึงกำหนดสีผ่าน className ได้ */
export const Sparkline = ({
    points,
    className,
}: {
    points: number[];
    className?: string;
}) => {
    const gradientId = useId();
    const line = buildPath(points);

    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className={className}
            aria-hidden
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={`${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`} fill={`url(#${gradientId})`} />
            <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};
