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
  
  // Fetch total counts (limit: 1 to get only pagination info)
  const { data: totalCarsData, isLoading: totalCarsLoading } = useCars({ page: 1, limit: 1 });
  const { data: totalAlloysData, isLoading: totalAlloysLoading } = useAlloys({ page: 1, limit: 1 });
  
  // Fetch active counts
  const { data: activeCarsData, isLoading: activeCarsLoading } = useCars({ page: 1, limit: 1, isActive: true });
  const { data: activeAlloysData, isLoading: activeAlloysLoading } = useAlloys({ page: 1, limit: 1, isActive: true });

  const totalCars = totalCarsData?.pagination.totalItems ?? 0;
  const totalAlloys = totalAlloysData?.pagination.totalItems ?? 0;
  const activeCars = activeCarsData?.pagination.totalItems ?? 0;
  const activeAlloys = activeAlloysData?.pagination.totalItems ?? 0;
  
  const isLoading = totalCarsLoading || totalAlloysLoading || activeCarsLoading || activeAlloysLoading;

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
          {isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Total Cars"
              value={totalCars.toString()}
              icon={Car}
              trend=""
              trendUp={true}
            />
          )}
          {isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Total Alloys"
              value={totalAlloys.toString()}
              icon={Settings}
              trend=""
              trendUp={true}
            />
          )}
          {isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Active Cars"
              value={activeCars.toString()}
              icon={Package}
              trend=""
              trendUp={true}
            />
          )}
          {isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <StatsCard
              title="Active Alloys"
              value={activeAlloys.toString()}
              icon={TrendingUp}
              trend=""
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
