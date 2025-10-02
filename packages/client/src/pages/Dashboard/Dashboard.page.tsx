import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotInfoCard } from "./components/BotInfoCard/BotInfoCard";
import { DateSelector } from "./components/DateSelector";
import { ShortlistCard } from "./components/ShortlistCard/ShortlistCard";
import { useQueryParams } from "@/utils/hooks/useQueryParams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const DashboardPage = () => {
  // HOOKS
  const { botId } = useQueryParams();

  console.log({ botId });

  // DRAW
  return (
    <div className="w-full h-full grid grid-cols-[350px_1fr_300px] gap-2">
      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-2">
        <DateSelector />
        <ShortlistCard />
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <div className="w-full h-full grid grid-rows-[1fr_3fr] gap-2">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Here are your top recommendations for the week. These are
                  based on your preferences and the weather.
                </p>
              </CardContent>
            </Card>
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Here are your top recommendations for the week. These are
                  based on your preferences and the weather.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="statistics">
          <div className="w-full h-full grid grid-rows-[1fr_3fr] gap-2">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Here are your top recommendations for the week. These are
                  based on your preferences and the weather.
                </p>
              </CardContent>
            </Card>
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Here are your top recommendations for the week. These are
                  based on your preferences and the weather.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <div className="w-full h-full">
        <BotInfoCard />
      </div>
    </div>
  );
};
