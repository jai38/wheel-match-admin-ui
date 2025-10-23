import { Car, Settings, TrendingUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your automotive inventory.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cars"
            value="248"
            icon={Car}
            trend="+12% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Total Alloys"
            value="432"
            icon={Settings}
            trend="+8% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Active Listings"
            value="187"
            icon={Package}
            trend="+5% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Total Revenue"
            value="$45.2K"
            icon={TrendingUp}
            trend="+23% from last month"
            trendUp={true}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your inventory</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate("/cars/new")} className="flex-1">
              + Add New Car
            </Button>
            <Button onClick={() => navigate("/alloys/new")} variant="secondary" className="flex-1">
              + Add New Alloy
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New car added: BMW M3</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Alloy updated: 18" Chrome Finish</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
