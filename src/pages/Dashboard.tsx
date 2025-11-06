import { Car, Settings, TrendingUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCars } from "@/hooks/useCars";
import { useAlloys } from "@/hooks/useAlloys";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: carsData, isLoading: carsLoading } = useCars({ page: 1, limit: 1 });
  const { data: alloysData, isLoading: alloysLoading } = useAlloys({ page: 1, limit: 1 });

  const totalCars = carsData?.pagination.totalItems ?? 0;
  const totalAlloys = alloysData?.pagination.totalItems ?? 0;
  const activeListings = Math.floor(totalCars * 0.75); // Mock calculation
  const totalRevenue = (totalCars * 1850).toFixed(1); // Mock calculation

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
          {carsLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Total Cars"
              value={totalCars.toString()}
              icon={Car}
              trend="+12% from last month"
              trendUp={true}
            />
          )}
          {alloysLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Total Alloys"
              value={totalAlloys.toString()}
              icon={Settings}
              trend="+8% from last month"
              trendUp={true}
            />
          )}
          {carsLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Active Listings"
              value={activeListings.toString()}
              icon={Package}
              trend="+5% from last month"
              trendUp={true}
            />
          )}
          {carsLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Total Revenue"
              value={`$${totalRevenue}K`}
              icon={TrendingUp}
              trend="+23% from last month"
              trendUp={true}
            />
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate("/cars/new")} className="flex-1">
              + Add New Car
            </Button>
            <Button
              onClick={() => navigate("/alloys/new")}
              variant="secondary"
              className="flex-1">
              + Add New Alloy
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        {/* <Card>
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
        </Card> */}
      </div>
    </MainLayout>
  );
}
