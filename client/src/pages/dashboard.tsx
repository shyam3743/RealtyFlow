import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Target,
  Building,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Eye,
  ArrowRight,
  Star,
  MapPin,
  Bell,
  Plus
} from "lucide-react";
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: partners } = useQuery<any[]>({
    queryKey: ["/api/channel-partners"],
    retry: false,
  });

  const { data: activities } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    retry: false,
  });

  // Generate daily leads data from real leads
  const getDailyLeadsData = () => {
    if (!leads) return [];
    
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    // Generate random data for demo purposes - in real app this would come from daily stats API
    return last7Days.map(day => ({
      date: day,
      leads: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(Math.random() * 8) + 1,
    }));
  };

  const getSourceDistribution = () => {
    if (!leads || leads.length === 0) return [];
    
    const sourceCounts = leads.reduce((acc: any, lead: any) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#ffb347", "#ff6b6b"];
    
    return Object.entries(sourceCounts).map(([source, count], index) => ({
      name: source,
      value: Math.round((count as number / leads.length) * 100),
      color: colors[index % colors.length]
    }));
  };

  const dailyLeadsData = getDailyLeadsData();
  const sourceDistribution = getSourceDistribution();

  const recentActivities = [
    {
      id: 1,
      type: "lead_created",
      title: "New lead from 99acres",
      description: "Rajesh Kumar interested in 3BHK apartment",
      time: "2 minutes ago",
      priority: "high"
    },
    {
      id: 2,
      type: "site_visit",
      title: "Site visit scheduled",
      description: "Priya Sharma - Garden Heights tomorrow 11 AM",
      time: "15 minutes ago",
      priority: "medium"
    },
    {
      id: 3,
      type: "payment_received",
      title: "Token payment received",
      description: "₹2,00,000 from Amit Patel - Skyline Towers",
      time: "1 hour ago",
      priority: "low"
    },
    {
      id: 4,
      type: "booking_confirmed",
      title: "Unit booking confirmed",
      description: "2BHK Unit #405 - Metro Plaza",
      time: "2 hours ago",
      priority: "high"
    },
    {
      id: 5,
      type: "partner_registration",
      title: "New channel partner",
      description: "HomeSpace Realty registered as broker",
      time: "4 hours ago",
      priority: "medium"
    },
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      lead_created: Users,
      site_visit: MapPin,
      payment_received: DollarSign,
      booking_confirmed: CheckCircle,
      partner_registration: Award,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (priority: string) => {
    const colors = {
      high: "text-red-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    };
    return colors[priority as keyof typeof colors] || "text-gray-600";
  };

  const getQuickActions = () => [
    {
      title: "Add New Lead",
      description: "Capture fresh prospect",
      icon: Users,
      color: "bg-blue-500",
      href: "/leads"
    },
    {
      title: "Schedule Site Visit",
      description: "Book customer visit",
      icon: Calendar,
      color: "bg-green-500",
      href: "/customer-journey"
    },
    {
      title: "Record Payment",
      description: "Log payment received",
      icon: DollarSign,
      color: "bg-yellow-500",
      href: "/payments"
    },
    {
      title: "Update Inventory",
      description: "Manage unit status",
      icon: Building,
      color: "bg-purple-500",
      href: "/inventory"
    },
    {
      title: "Add Partner",
      description: "Register new broker",
      icon: Award,
      color: "bg-orange-500",
      href: "/channel-partners"
    },
    {
      title: "View Reports",
      description: "Analytics & insights",
      icon: TrendingUp,
      color: "bg-indigo-500",
      href: "/reports"
    }
  ];

  const quickActions = getQuickActions();

  const getLeadsPipeline = () => {
    if (!leads) return [];
    
    const pipeline = [
      { stage: "New", count: leads.filter(l => l.status === 'new').length, color: "bg-gray-500" },
      { stage: "Contacted", count: leads.filter(l => l.status === 'contacted').length, color: "bg-blue-500" },
      { stage: "Qualified", count: leads.filter(l => l.status === 'qualified').length, color: "bg-purple-500" },
      { stage: "Site Visit", count: leads.filter(l => l.status === 'site_visit').length, color: "bg-orange-500" },
      { stage: "Negotiation", count: leads.filter(l => l.status === 'negotiation').length, color: "bg-yellow-500" },
      { stage: "Booking", count: leads.filter(l => l.status === 'booking').length, color: "bg-green-500" },
      { stage: "Closed", count: leads.filter(l => l.status === 'sale').length, color: "bg-emerald-500" },
    ];
    
    return pipeline;
  };

  const leadsPipeline = getLeadsPipeline();

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "User"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your real estate business today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            <Badge className="ml-2 bg-red-500">5</Badge>
          </Button>
          <Avatar>
            <AvatarFallback>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Leads</p>
                <p className="text-3xl font-bold">{leads?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Conversions</p>
                <p className="text-3xl font-bold">{dashboardMetrics?.conversions || 0}</p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">18.5% conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Revenue</p>
                <p className="text-3xl font-bold">₹{(dashboardMetrics?.revenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-200" />
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+25% from target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Projects</p>
                <p className="text-3xl font-bold">{projects?.length || 0}</p>
              </div>
              <Building className="w-8 h-8 text-purple-200" />
            </div>
            <div className="flex items-center mt-4">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">3 nearing completion</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 ${action.color} text-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Leads Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Leads Performance</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyLeadsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lead Sources Distribution</span>
              <Eye className="w-5 h-5 text-green-500" />
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
                  label={({ name, value }) => `${name}: ${value}%`}
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

      {/* Leads Pipeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales Pipeline Overview</span>
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {leadsPipeline.map((stage) => (
              <div key={stage.stage} className="text-center">
                <div className={`w-full ${stage.color} text-white rounded-lg p-4 mb-2`}>
                  <div className="text-2xl font-bold">{stage.count}</div>
                </div>
                <div className="text-sm font-medium text-gray-700">{stage.stage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activities</span>
              <Activity className="w-5 h-5 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 bg-white rounded-full flex items-center justify-center ${getActivityColor(activity.priority)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <Badge 
                      className={`${
                        activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                        activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {activity.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Activities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Calls Made</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">24</p>
                  <p className="text-xs text-green-600">+15%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Site Visits</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">8</p>
                  <p className="text-xs text-green-600">+20%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Follow-ups</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">12</p>
                  <p className="text-xs text-red-600">-5%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Bookings</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">3</p>
                  <p className="text-xs text-green-600">+50%</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Target Achievement</p>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top Performers This Month</span>
            <Award className="w-5 h-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rajesh Kumar", role: "Sales Executive", sales: 12, revenue: "₹2.4 Cr", avatar: "RK" },
              { name: "Priya Sharma", role: "Senior Sales Manager", sales: 15, revenue: "₹3.1 Cr", avatar: "PS" },
              { name: "Amit Patel", role: "Team Lead", sales: 10, revenue: "₹2.8 Cr", avatar: "AP" },
            ].map((performer, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-bold text-sm">
                  #{index + 1}
                </div>
                <Avatar>
                  <AvatarFallback>{performer.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{performer.name}</h3>
                  <p className="text-sm text-gray-600">{performer.role}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-green-600">{performer.sales} sales</span>
                    <span className="text-xs text-blue-600">{performer.revenue}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}