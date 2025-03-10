import { Progress } from "@radix-ui/react-progress";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { creditService } from "@/lib/services/credits.service";
import { useCompany } from "@/hooks/use-company";
import { cn } from "@/lib/utils";

export const AvailableCredits = () => {
  const { companyId } = useCompany();

  const [creditsData, setCreditsData] = useState<any>(null);

  useEffect(() => {
    const fetchCreditsData = async () => {
      if (!companyId) return;
      const creditsData = await creditService.getCreditsData(companyId);
      setCreditsData(creditsData);
    };
    fetchCreditsData();
  }, [companyId]);

  const {
    credits_balance = 0 ,
    credits_used = 0,
    credits_remaining = 0,
    credits_used_percentage = 0
  } = creditsData || {};

  return (
    <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        Available Credits
      </CardTitle>
      <CardDescription>
        Your current credit usage and limits
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-end">
        <div className={cn(
          "flex flex-col gap-2",
          credits_used_percentage > 50 ? credits_used_percentage > 70 ? "text-red-500" : "text-yellow-500" : "text-muted-foreground"
        )}>
          <p className="text-3xl font-bold">{credits_remaining}</p>
          <p className="text-sm text-muted-foreground">credits remaining</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={credits_used_percentage} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {credits_used_percentage.toFixed(1)}% used ({credits_used} used of {(credits_balance)} credits)
        </p>
      </div>
    </CardContent>
  </Card>
  );
};
