const WIDTH = 96;
const HEIGHT = 32;

type SparklineProps = {
    /** ค่าแกน Y ของแต่ละจุดใน viewBox 96x32 (0 = บนสุด) กระจายห่างเท่ากันตามแกน X */
    points: number[];
    /** สีเส้น (ใช้ currentColor ถ้าไม่ระบุ) */
    className?: string;
    /** flat = เส้นประเรียบ ใช้ตอนไม่มีความเคลื่อนไหว */
    flat?: boolean;
};

/** กราฟเส้น minimal ข้างตัวเลขสถิติ: เส้นบาง + พื้นสีจาง 8% (ตามดีไซน์ Home) */
export const Sparkline = ({ points, className, flat = false }: SparklineProps) => {
    if (flat) {
        return (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className={className} aria-hidden>
                <polyline
                    points={`0,27 ${WIDTH},27`}
                    fill="none"
                    stroke="#d4d4d4"
                    strokeWidth={1.6}
                    strokeDasharray="3 4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        );
    }

    const step = WIDTH / (points.length - 1);
    const line = points.map((y, i) => `${Math.round(i * step)},${y}`).join(" ");

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className={className} aria-hidden>
            <polygon points={`${line} ${WIDTH},${HEIGHT} 0,${HEIGHT}`} fill="currentColor" fillOpacity={0.08} />
            <polyline
                points={line}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};
