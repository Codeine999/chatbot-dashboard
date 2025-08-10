import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, ResponsiveContainer, Line, LineChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig
// const chartData = [
//   {
//     label: "Day",
//     data: [
//       { month: "Mon", desktop: 50, mobile: 20 },
//       { month: "Tue", desktop: 70, mobile: 25 },
//       { month: "Wed", desktop: 65, mobile: 30 },
//       { month: "Thu", desktop: 80, mobile: 40 },
//       { month: "Fri", desktop: 90, mobile: 50 },
//       { month: "Sat", desktop: 100, mobile: 60 },
//       { month: "Sun", desktop: 120, mobile: 70 },
//     ],
//   },
//   {
//     label: "Week",
//     data: [
//       { month: "W1", desktop: 300, mobile: 200 },
//       { month: "W2", desktop: 450, mobile: 300 },
//       { month: "W3", desktop: 350, mobile: 250 },
//       { month: "W4", desktop: 500, mobile: 400 },
//     ],
//   },
//   {
//     label: "Month",
//     data: [
//       { month: "Jan", desktop: 186, mobile: 80 },
//       { month: "Feb", desktop: 305, mobile: 200 },
//       { month: "Mar", desktop: 237, mobile: 120 },
//       { month: "Apr", desktop: 73, mobile: 190 },
//       { month: "May", desktop: 209, mobile: 130 },
//       { month: "Jun", desktop: 214, mobile: 140 },
//     ],
//   },
//   {
//     label: "Year",
//     data: [
//       { month: "2021", desktop: 1200, mobile: 800 },
//       { month: "2022", desktop: 1400, mobile: 1000 },
//       { month: "2023", desktop: 1600, mobile: 1200 },
//       { month: "2024", desktop: 1800, mobile: 1400 },
//     ],
//   },
// ];


const ViewChart = ({ selected }: { selected: string }) => {
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

  return (
    <div className='lg:-mx-10 md:-mx-6 -mx-6 mt-1'>
      <CardHeader>
        <CardDescription className='px-10 -mt-6 text-sm flex'>
          Trending up by 5.2% this month
          <TrendingUp className="h-4 w-4 ml-1 text-green-300" />
        </CardDescription>
      </CardHeader>


      <ChartContainer
        config={chartConfig}
        className="mt-10 w-full h-[220px] md:px-5 px-3"
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ 
            left: isDesktop ? 30 : isNotebook ? 60 : isTablet ? 30 : 50,
            top: isDesktop ? 10 : isNotebook ? 20 : isTablet ? 30 : 20,
            right: isDesktop ? 10 : isNotebook ? 60 : isTablet ? 30 : 50
          }}
        >

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="desktop"
            type="natural"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>

    </div>
  )
}

export default ViewChart
