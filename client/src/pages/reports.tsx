import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, TrendingUp, Users, DollarSign, Home, BarChart3 } from "lucide-react";
import PipelineChart from "@/components/charts/pipeline-chart";
import LeadSourceChart from "@/components/charts/lead-source-chart";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
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

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `${reportType} report export will be ready shortly`,
    });
  };

  const reportCategories = [
    {
      id: "sales",
      title: "Sales Performance",
      icon: TrendingUp,
      color: "primary",
      reports: [
        { name: "Lead Conversion Report", description: "Track lead to sale conversion rates", format: "PDF/Excel" },
        { name: "Sales Funnel Analysis", description: "Detailed pipeline progression analysis", format: "PDF/Excel" },
        { name: "Revenue Breakdown", description: "Project-wise revenue and collection reports", format: "Excel" },
        { name: "Target vs Achievement", description: "Sales team performance against targets", format: "PDF" }
      ]
    },
    {
      id: "customer",
      title: "Customer Analytics",
      icon: Users,
      color: "blue",
      reports: [
        { name: "Lead Source Analysis", description: "Performance of different lead generation channels", format: "PDF/Excel" },
        { name: "Customer Journey Report", description: "Time spent in each pipeline stage", format: "Excel" },
        { name: "Customer Satisfaction", description: "Post-sales satisfaction and feedback", format: "PDF" },
        { name: "Churn Analysis", description: "Lost leads and reasons for dropping out", format: "Excel" }
      ]
    },
    {
      id: "financial",
      title: "Financial Reports",
      icon: DollarSign,
      color: "green",
      reports: [
        { name: "Collections Report", description: "Payment collections and outstanding amounts", format: "Excel" },
        { name: "Commission Tracking", description: "Channel partner commission and payouts", format: "PDF/Excel" },
        { name: "Cash Flow Analysis", description: "Monthly cash inflow and outflow trends", format: "Excel" },
        { name: "Unit Pricing Report", description: "Unit-wise pricing and discount analysis", format: "Excel" }
      ]
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      icon: Home,
      color: "orange",
      reports: [
        { name: "Unit Availability", description: "Real-time inventory status across projects", format: "PDF/Excel" },
        { name: "Booking Velocity", description: "Rate of unit sales over time", format: "Excel" },
        { name: "Project Performance", description: "Individual project sales performance", format: "PDF" },
        { name: "Block Expiry Report", description: "Units with expiring block periods", format: "Excel" }
      ]
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive business intelligence and performance insights</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.revenue ? `₹${(parseFloat(metrics.revenue) / 10000000).toFixed(1)}Cr` : '₹0Cr'}
                </p>
                <p className="text-sm text-success-600">+15.2% vs last period</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-success-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalLeads && metrics?.conversions 
                    ? `${((metrics.conversions / metrics.totalLeads) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
                <p className="text-sm text-success-600">+2.3% improvement</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalLeads || 0}</p>
                <p className="text-sm text-primary-600">+12% new leads</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 text-xl" />
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
                <p className="text-sm text-warning-600">8% of inventory</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Home className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Pipeline Analysis</span>
              <Button variant="outline" size="sm" onClick={() => handleExportReport("Sales Pipeline")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineChart data={metrics?.leadsByStatus || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lead Source Performance</span>
              <Button variant="outline" size="sm" onClick={() => handleExportReport("Lead Sources")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={metrics?.leadsBySource || []} />
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {reportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {reportCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.reports.map((report, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {report.format}
                            </Badge>
                          </div>
                          <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center ml-4 flex-shrink-0`}>
                            <BarChart3 className={`text-${category.color}-600 w-5 h-5`} />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handleExportReport(report.name)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                          <Button variant="outline" size="sm">
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recently Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Monthly Sales Report", type: "Sales Performance", date: "2 hours ago", size: "2.4 MB", status: "ready" },
              { name: "Lead Source Analysis", type: "Customer Analytics", date: "1 day ago", size: "1.8 MB", status: "ready" },
              { name: "Collections Report", type: "Financial Reports", date: "2 days ago", size: "3.2 MB", status: "ready" },
              { name: "Unit Availability", type: "Inventory Reports", date: "3 days ago", size: "1.1 MB", status: "ready" }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-primary-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.type} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <Badge className="bg-success-100 text-success-800 mb-1">
                      {report.status}
                    </Badge>
                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
