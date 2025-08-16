import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PipelineChart from "@/components/charts/pipeline-chart";
import LeadSourceChart from "@/components/charts/lead-source-chart";
import ProjectCard from "@/components/cards/project-card";
import type { DashboardMetrics } from "@/types";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ["/api/payments/pending"],
    retry: false,
  });

  if (metricsLoading || projectsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatRevenue = (revenue: string) => {
    const amount = parseFloat(revenue) / 10000000; // Convert to crores
    return `₹${amount.toFixed(1)}Cr`;
  };

  return (
    <div className="p-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h2>
        <p className="text-gray-600">Monitor your real estate sales performance and team activity</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalLeads || 0}</p>
                <p className="text-sm text-success-600">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.conversions || 0}</p>
                <p className="text-sm text-success-600">+8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-success-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.revenue ? formatRevenue(metrics.revenue) : '₹0Cr'}
                </p>
                <p className="text-sm text-success-600">+15% from last month</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-rupee-sign text-warning-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Units Sold</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.unitsSold || 0}</p>
                <p className="text-sm text-success-600">+5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-home text-danger-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineChart data={metrics?.leadsByStatus || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={metrics?.leadsBySource || []} />
          </CardContent>
        </Card>
      </div>

      {/* Customer Journey Pipeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customer Journey Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {[
              { stage: "New Leads", count: metrics?.leadsByStatus?.find(s => s.status === 'new')?.count || 0, color: "primary" },
              { stage: "Contacted", count: metrics?.leadsByStatus?.find(s => s.status === 'contacted')?.count || 0, color: "blue" },
              { stage: "Site Visit", count: metrics?.leadsByStatus?.find(s => s.status === 'site_visit')?.count || 0, color: "purple" },
              { stage: "Negotiation", count: metrics?.leadsByStatus?.find(s => s.status === 'negotiation')?.count || 0, color: "orange" },
              { stage: "Booking", count: metrics?.leadsByStatus?.find(s => s.status === 'booking')?.count || 0, color: "success" },
              { stage: "Sale", count: metrics?.leadsByStatus?.find(s => s.status === 'sale')?.count || 0, color: "green" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-${item.color}-500 rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                <Badge className={`bg-${item.color}-100 text-${item.color}-600`}>
                  {item.count}
                </Badge>
                {index < 5 && <i className="fas fa-arrow-right text-gray-400"></i>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects and Communication Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Project Cards */}
        {(projects as any[])?.slice(0, 3).map((project: any) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Quick Actions and Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Communication Center */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-blue-600"></i>
                <div>
                  <p className="font-medium text-gray-900">Email Campaign</p>
                  <p className="text-sm text-gray-600">New launch announcement</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className="fab fa-whatsapp text-green-600"></i>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Blast</p>
                  <p className="text-sm text-gray-600">Site visit reminders</p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Send</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className="fas fa-sms text-purple-600"></i>
                <div>
                  <p className="font-medium text-gray-900">SMS Alerts</p>
                  <p className="text-sm text-gray-600">Payment due notifications</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">Send</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">₹2.8Cr</p>
                <p className="text-sm text-gray-600">Collected This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">₹1.4Cr</p>
                <p className="text-sm text-gray-600">Pending Collection</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {(pendingPayments as any[])?.slice(0, 2).map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payment Due</p>
                    <p className="text-sm text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-danger-600">₹{parseFloat(payment.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Overdue</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button className="w-full" variant="outline">
                View All Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
