import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotInfoCard } from "./components/BotInfoCard/BotInfoCard";
import { ShortlistCard } from "./components/ShortlistCard/ShortlistCard";
import { DateSelector } from "./components/DateSelector";

export const DashboardPage = () => {
  // DRAW
  return (
    <div className="w-full h-full grid grid-cols-[350px_1fr_300px] gap-2">
      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-2">
        <DateSelector />
        <ShortlistCard />
      </div>
      <div className="w-full h-full grid grid-rows-[1fr_3fr] gap-2">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Here are your top recommendations for the week. These are based on
              your preferences and the weather.
            </p>
          </CardContent>
        </Card>
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Here are your top recommendations for the week. These are based on
              your preferences and the weather.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="w-full h-full">
        <BotInfoCard />
      </div>
    </div>
  );
};
