import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const BotInfoCard = () => {
  // DRAW
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Trading Bot</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            Create Bot
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Here are your top active bots.</p>
      </CardContent>
    </Card>
  );
};
