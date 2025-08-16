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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Send, 
  MessageSquare, 
  Mail,
  Phone,
  Zap,
  Calendar,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function Communication() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const { data: communications, isLoading: communicationsLoading } = useQuery<any[]>({
    queryKey: ["/api/communications"],
    retry: false,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: leads } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      await apiRequest("POST", "/api/campaigns", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      setShowCampaignForm(false);
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
        description: "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      await apiRequest("POST", "/api/communications", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      setShowMessageForm(false);
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
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      whatsapp: { 
        label: "WhatsApp", 
        className: "bg-green-100 text-green-800",
        icon: MessageSquare 
      },
      sms: { 
        label: "SMS", 
        className: "bg-blue-100 text-blue-800",
        icon: Phone 
      },
      email: { 
        label: "Email", 
        className: "bg-purple-100 text-purple-800",
        icon: Mail 
      },
      automated: { 
        label: "Automated", 
        className: "bg-orange-100 text-orange-800",
        icon: Zap 
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.sms;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { 
        label: "Sent", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle 
      },
      pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock 
      },
      failed: { 
        label: "Failed", 
        className: "bg-red-100 text-red-800",
        icon: AlertCircle 
      },
      scheduled: { 
        label: "Scheduled", 
        className: "bg-blue-100 text-blue-800",
        icon: Calendar 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredCommunications = communications?.filter((comm) => {
    const matchesSearch = 
      comm.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || comm.type === filterType;
    const matchesStatus = filterStatus === "all" || comm.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStats = () => {
    if (!communications) return { 
      total: 0, 
      sent: 0, 
      pending: 0, 
      failed: 0,
      whatsapp: 0,
      sms: 0,
      email: 0 
    };
    
    return {
      total: communications.length,
      sent: communications.filter(c => c.status === 'sent').length,
      pending: communications.filter(c => c.status === 'pending').length,
      failed: communications.filter(c => c.status === 'failed').length,
      whatsapp: communications.filter(c => c.type === 'whatsapp').length,
      sms: communications.filter(c => c.type === 'sms').length,
      email: communications.filter(c => c.type === 'email').length,
    };
  };

  const stats = getStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Automation & Communication</h2>
          <p className="text-gray-600">WhatsApp/SMS campaigns, drip marketing, and automated alerts</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowMessageForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button onClick={() => setShowCampaignForm(true)} variant="outline">
            <Target className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Automation Rules
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Bulk
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                <p className="text-2xl font-bold text-green-600">{stats.whatsapp}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SMS</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sms}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-2xl font-bold text-purple-600">{stats.email}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Campaigns</span>
            <Button size="sm" onClick={() => setShowCampaignForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Campaign
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {campaign.targetCount || 0} targets • {campaign.sentCount || 0} sent
                    </div>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active campaigns. Create your first campaign to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>Communication History ({filteredCommunications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {communicationsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
              <p className="text-gray-500">Start by sending a message or adjust your filters.</p>
              <Button 
                onClick={() => setShowMessageForm(true)} 
                className="mt-4"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunications.map((comm) => (
                <div key={comm.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{comm.leadName || "Unknown Recipient"}</h3>
                        {getTypeBadge(comm.type)}
                        {getStatusBadge(comm.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{comm.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>To: {comm.phone || comm.email}</span>
                        <span>•</span>
                        <span>{new Date(comm.sentAt || comm.createdAt).toLocaleString()}</span>
                        {comm.campaign && (
                          <>
                            <span>•</span>
                            <span>Campaign: {comm.campaign}</span>
                          </>
                        )}
                      </div>
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