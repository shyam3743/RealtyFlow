import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
  Users,
  DollarSign,
  Target,
  Activity,
  Building,
  Award,
  Clock,
  FileText,
  Eye,
  RefreshCw
} from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [reportType, setReportType] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: dashboardMetrics } = useQuery<any>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: leads } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: payments } = useQuery<any[]>({
    queryKey: ["/api/payments"],
    retry: false,
  });

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: partners } = useQuery<any[]>({
    queryKey: ["/api/channel-partners"],
    retry: false,
  });

  // Mock data for comprehensive reporting
  const salesTrendData = [
    { month: "Jan", leads: 45, conversions: 12, revenue: 2400000 },
    { month: "Feb", leads: 52, conversions: 15, revenue: 3100000 },
    { month: "Mar", leads: 48, conversions: 18, revenue: 3800000 },
    { month: "Apr", leads: 61, conversions: 22, revenue: 4200000 },
    { month: "May", leads: 55, conversions: 19, revenue: 3900000 },
    { month: "Jun", leads: 67, conversions: 25, revenue: 4800000 },
  ];

  const conversionFunnelData = [
    { stage: "Leads", count: 320, percentage: 100 },
    { stage: "Contacted", count: 280, percentage: 87.5 },
    { stage: "Qualified", count: 200, percentage: 62.5 },
    { stage: "Site Visit", count: 140, percentage: 43.7 },
    { stage: "Negotiation", count: 85, percentage: 26.5 },
    { stage: "Booking", count: 65, percentage: 20.3 },
    { stage: "Closed", count: 45, percentage: 14.0 },
  ];

  const sourceDistribution = [
    { source: "99acres", value: 35, color: "#8884d8" },
    { source: "MagicBricks", value: 25, color: "#82ca9d" },
    { source: "Google Ads", value: 20, color: "#ffc658" },
    { source: "Walk-in", value: 15, color: "#ff7c7c" },
    { source: "Referral", value: 5, color: "#8dd1e1" },
  ];

  const projectPerformance = [
    { project: "Skyline Towers", units: 120, sold: 85, revenue: 18500000, completion: 70 },
    { project: "Garden Heights", units: 80, sold: 65, revenue: 14200000, completion: 81 },
    { project: "Metro Plaza", units: 200, sold: 145, revenue: 29800000, completion: 72 },
    { project: "Sunrise Apartments", units: 150, sold: 95, revenue: 19700000, completion: 63 },
  ];

  const partnerPerformance = partners?.map(partner => ({
    name: partner.name || "Unknown",
    sales: partner.totalSales || 0,
    commission: partner.totalCommission || 0,
    rating: partner.rating || 0,
  })).slice(0, 5) || [];

  const getReportCards = () => {
    return [
      {
        title: "Lead Sources Report",
        description: "Analyze lead generation effectiveness across channels",
        icon: Users,
        color: "bg-blue-500",
        metrics: ["Source conversion rates", "Cost per lead", "Quality scores"],
        action: "Generate Report"
      },
      {
        title: "Sales Performance Report", 
        description: "Track sales team productivity and achievement",
        icon: Target,
        color: "bg-green-500",
        metrics: ["Individual performance", "Target vs achievement", "Commission tracking"],
        action: "View Analytics"
      },
      {
        title: "Financial Analysis Report",
        description: "Revenue analysis and payment tracking",
        icon: DollarSign,
        color: "bg-yellow-500", 
        metrics: ["Revenue trends", "Payment schedules", "Outstanding amounts"],
        action: "Download Report"
      },
      {
        title: "Project Progress Report",
        description: "Construction and sales progress tracking",
        icon: Building,
        color: "bg-purple-500",
        metrics: ["Completion status", "Sales velocity", "Unit availability"],
        action: "View Dashboard"
      },
      {
        title: "Partner Performance Report",
        description: "Channel partner effectiveness analysis",
        icon: Award,
        color: "bg-orange-500",
        metrics: ["Sales contribution", "Commission payouts", "Performance ratings"],
        action: "Generate Report"
      },
      {
        title: "Customer Journey Report",
        description: "Conversion funnel and stage analysis",
        icon: Activity,
        color: "bg-indigo-500",
        metrics: ["Stage conversion rates", "Time in stages", "Drop-off analysis"],
        action: "View Analytics"
      }
    ];
  };

  const reportCards = getReportCards();

  const exportReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} report will be ready for download shortly`,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboards & Reports</h2>
          <p className="text-gray-600">Comprehensive analytics, MIS reports, and performance insights</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-primary-500 hover:bg-primary-600">
            <FileText className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Reports
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-green-600">{dashboardMetrics?.conversions || 0}</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+18% conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{(dashboardMetrics?.revenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+25% from target</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-purple-600">{projects?.length || 0}</p>
              </div>
              <Building className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex items-center mt-2">
              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm text-yellow-600">3 nearing completion</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partners</p>
                <p className="text-2xl font-bold text-orange-600">{partners?.length || 0}</p>
              </div>
              <Award className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">85% active rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Closure</p>
                <p className="text-2xl font-bold text-indigo-600">24 days</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">-3 days improved</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="sales">Sales Reports</SelectItem>
                  <SelectItem value="financial">Financial Reports</SelectItem>
                  <SelectItem value="project">Project Reports</SelectItem>
                  <SelectItem value="partner">Partner Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportCards.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <report.icon className={`w-10 h-10 ${report.color} text-white p-2 rounded-lg`} />
                <Badge variant="outline">Available</Badge>
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              <div className="space-y-1 mb-4">
                {report.metrics.map((metric, i) => (
                  <div key={i} className="flex items-center text-xs text-gray-500">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                    {metric}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  {report.action}
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Trends (6 Months)</span>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => 
                  name === 'revenue' ? [`₹${Number(value).toLocaleString()}`, 'Revenue'] : [value, name]
                } />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lead Sources Distribution</span>
              <PieChartIcon className="w-5 h-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({source, value}) => `${source} (${value}%)`}
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sales Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{stage.stage}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-blue-600">{stage.count}</span>
                    <span className="text-sm text-gray-500">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
                {index < conversionFunnelData.length - 1 && (
                  <div className="absolute right-0 top-12 text-xs text-gray-400">
                    -{((conversionFunnelData[index].count - conversionFunnelData[index + 1].count) / conversionFunnelData[index].count * 100).toFixed(1)}% drop
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Performance Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Performance Analysis</span>
            <Button size="sm" variant="outline" onClick={() => exportReport('Project Performance')}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectPerformance.map((project) => (
              <div key={project.project} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{project.project}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Units:</p>
                        <p className="font-medium text-gray-900">{project.units}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sold:</p>
                        <p className="font-medium text-green-600">{project.sold}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue:</p>
                        <p className="font-medium text-blue-600">₹{project.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completion:</p>
                        <p className="font-medium text-purple-600">{project.completion}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Sales Progress</span>
                      <span className="text-sm font-medium">{Math.round((project.sold / project.units) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(project.sold / project.units) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Construction Progress</span>
                      <span className="text-sm font-medium">{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partner Performance */}
      {partnerPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Channel Partners Performance</span>
              <Button size="sm" variant="outline" onClick={() => exportReport('Partner Performance')}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partnerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="Sales Count" />
                <Bar dataKey="commission" fill="#82ca9d" name="Commission (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}