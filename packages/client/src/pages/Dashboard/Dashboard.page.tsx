import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardPage = () => {
  // DRAW
  return (
    <div className="w-full h-full grid grid-cols-[1fr_2fr] gap-2">
      <div className="w-full h-full grid grid-rows-[2fr_1fr] gap-2">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>Shortlist</CardTitle>
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
            <CardTitle>Forecast Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Here are your top active bots.</p>
          </CardContent>
        </Card>
      </div>
      <div className="w-full h-full grid grid-rows-[1fr_3fr_1fr] gap-2">
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
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Here are your top recommendations for the week. These are based on
              your preferences and the weather.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
