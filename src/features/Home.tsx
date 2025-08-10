import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

import Chatbot from "./home/Chat";

import OverviewCard from "./home/components/OverviewCard";
import MoneyCard from "./home/components/MoneyCard";
import Order from "./home/components/OrderCard";
import ViewCard from "./home/components/ViewCard";

const home = () => {

  return (
    <div className="2xl:px-28 max-w-8xl mx-auto mb-12">

      <div className="mt-2 text-color">
        <CardTitle className="text-2xl">
          Welcome, Codeine
        </CardTitle>
        <CardDescription className="text-sm">
          Overview dashboard
        </CardDescription>
      </div>


      <div className="mt-4 flex flex-col gap-4">

        {/* Overview */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
          <OverviewCard />
        </div>

        {/* Chart and Recent order */}
        <div className="grid md:grid-cols-[60%_39%] gap-4">
          <MoneyCard />
          <Order />
        </div>

        {/* Chatbot and View */}
        <div className="grid md:grid-cols-[49%_50%] gap-4">
          <Chatbot />
          <ViewCard />
        </div>

      </div>
    </div>
  );
};

export default home;
