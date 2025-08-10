import { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"
import {
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

import { weekmoneyData } from '@/data/money.data'
import { TrendingUp } from 'lucide-react';


const chartConfig = {
  total: {
    label: "total",
  },
} satisfies ChartConfig


const MoneyChart = ({ selected }: { selected: string }) => {
  const [screenSize, setScreenSize] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const isDesktop = screenSize >= 1600;
  const isNotebook = screenSize >= 1024 && screenSize < 1550;
  const isTablet = screenSize >= 768 && screenSize < 1024;


  const barSize = isDesktop ? 45 : isNotebook ? 40 : isTablet ? 40 : 35;

  const currentData = weekmoneyData.find((c) => c.label === selected)?.data || [];

  return (
    <div className='lg:-mx-10 md:-mx-6 -mx-6 mt-1'>
      <CardHeader>
        <CardDescription className='lg:px-4 -mt-3 text-sm flex'>
          Trending up by 5.2% this month
          <TrendingUp className="h-4 w-4 ml-1 text-green-300" />
        </CardDescription>
      </CardHeader>

      <ChartContainer
        config={chartConfig}
        className="mt-12 w-full h-[220px] md:px-5 px-3"
      >
        <BarChart
          accessibilityLayer
          barSize={barSize}
          data={currentData}
          margin={{ left: isDesktop ? 0 : isNotebook ? -12 : isTablet ? -10 : -15 }}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 5)}
            tick={{ fill: "#000000", fontSize: 12 }}
          />

          <YAxis
            tick={{ fill: "#000000", fontSize: isDesktop ? 12 : 10 }}
            tickMargin={2}
          />

          <Tooltip content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="total" fill="#8884d8" radius={5} />
        </BarChart>
      </ChartContainer>

    </div>
  );
};

export default MoneyChart
