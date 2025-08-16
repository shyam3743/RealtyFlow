import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Route, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  Phone,
  MessageSquare,
  FileText,
  Target,
  Activity,
  MapPin,
  Timer,
  Filter
} from "lucide-react";

export default function CustomerJourney() {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: leads, isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    retry: false,
  });

  const addActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      await apiRequest("POST", "/api/activities", activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Activity added successfully",
      });
      setShowActivityForm(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    },
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: string }) => {
      await apiRequest("PUT", `/api/leads/${leadId}`, { status: stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead stage updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update lead stage",
        variant: "destructive",
      });
    },
  });

  const journeyStages = [
    { 
      id: "new", 
      label: "New Lead", 
      color: "bg-gray-100 text-gray-800",
      icon: Plus,
      description: "Fresh leads from various sources"
    },
    { 
      id: "contacted", 
      label: "Contacted", 
      color: "bg-blue-100 text-blue-800",
      icon: Phone,
      description: "Initial contact made"
    },
    { 
      id: "qualified", 
      label: "Qualified", 
      color: "bg-purple-100 text-purple-800",
      icon: CheckCircle,
      description: "Budget and requirements confirmed"
    },
    { 
      id: "site_visit", 
      label: "Site Visit", 
      color: "bg-orange-100 text-orange-800",
      icon: MapPin,
      description: "Scheduled or completed site visits"
    },
    { 
      id: "negotiation", 
      label: "Negotiation", 
      color: "bg-yellow-100 text-yellow-800",
      icon: MessageSquare,
      description: "Price and terms discussion"
    },
    { 
      id: "booking", 
      label: "Booking", 
      color: "bg-green-100 text-green-800",
      icon: FileText,
      description: "Agreement and token payment"
    },
    { 
      id: "sale", 
      label: "Sale", 
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Deal closed successfully"
    },
    { 
      id: "lost", 
      label: "Lost", 
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      description: "Lead couldn't be converted"
    },
  ];

  const getStageBadge = (stage: string) => {
    const stageConfig = journeyStages.find(s => s.id === stage) || journeyStages[0];
    const IconComponent = stageConfig.icon;

    return (
      <Badge className={`${stageConfig.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {stageConfig.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { 
        label: "High Priority", 
        className: "bg-red-100 text-red-800",
        icon: AlertTriangle 
      },
      medium: { 
        label: "Medium", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock 
      },
      low: { 
        label: "Low", 
        className: "bg-gray-100 text-gray-800",
        icon: Clock 
      },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === "all" || lead.status === filterStage;
    const matchesPriority = filterPriority === "all" || lead.priority === filterPriority;
    
    return matchesSearch && matchesStage && matchesPriority;
  }) || [];

  const getStageStats = () => {
    if (!leads) return {};
    
    return journeyStages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.status === stage.id).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const stageStats = getStageStats();

  const getConversionRate = () => {
    if (!leads || leads.length === 0) return 0;
    const converted = leads.filter(lead => lead.status === 'sale').length;
    return Math.round((converted / leads.length) * 100);
  };

  const getDaysInStage = (lead: any) => {
    if (!lead.updatedAt) return 0;
    const days = Math.floor((new Date().getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Journey Tracking</h2>
          <p className="text-gray-600">Complete sales pipeline management with stage-wise progress tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowActivityForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Follow-up
          </Button>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Journey Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        {journeyStages.map((stage) => (
          <Card key={stage.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <stage.icon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{stage.label}</h3>
              <p className="text-2xl font-bold text-blue-600 mb-1">{stageStats[stage.id] || 0}</p>
              <p className="text-xs text-gray-500">{stage.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{getConversionRate()}%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-blue-600">
                  {leads?.filter(l => !['sale', 'lost'].includes(l.status)).length || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Days/Stage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {leads?.length ? Math.round(leads.reduce((sum, l) => sum + getDaysInStage(l), 0) / leads.length) : 0}
                </p>
              </div>
              <Timer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales Pipeline Flow</span>
            <Route className="w-5 h-5 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {journeyStages.slice(0, -1).map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (stageStats[stage.id] || 0) > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <stage.icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 mt-2 text-center">{stage.label}</p>
                  <p className="text-lg font-bold text-blue-600">{stageStats[stage.id] || 0}</p>
                </div>
                {index < journeyStages.length - 2 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {journeyStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Journey Progress ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads in journey</h3>
              <p className="text-gray-500">Leads will appear here as they progress through the sales pipeline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar>
                        <AvatarFallback>{lead.name?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{lead.name || "Unknown Lead"}</h3>
                          {getStageBadge(lead.status)}
                          {lead.priority && getPriorityBadge(lead.priority)}
                        </div>
                        <p className="text-gray-600 mb-2">
                          Phone: {lead.phone || "N/A"} • Email: {lead.email || "N/A"}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Source:</p>
                            <p className="font-medium capitalize">{lead.source || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Assigned To:</p>
                            <p className="font-medium">{lead.assignedTo || "Unassigned"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Days in Stage:</p>
                            <p className="font-medium">{getDaysInStage(lead)} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Activity:</p>
                            <p className="font-medium">{lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString() : "None"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{lead.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(lead.createdAt).toLocaleDateString()} • 
                      Updated: {new Date(lead.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Select 
                        value={lead.status} 
                        onValueChange={(value) => updateLeadStageMutation.mutate({ leadId: lead.id, stage: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {journeyStages.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}