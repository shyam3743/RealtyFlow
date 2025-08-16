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
  Handshake, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingDown,
  Shield
} from "lucide-react";

export default function Negotiations() {
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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

  const { data: negotiations, isLoading: negotiationsLoading } = useQuery<any[]>({
    queryKey: ["/api/negotiations"],
    retry: false,
  });

  const { data: leads } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const createNegotiationMutation = useMutation({
    mutationFn: async (negotiationData: any) => {
      await apiRequest("POST", "/api/negotiations", negotiationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      toast({
        title: "Success",
        description: "Negotiation created successfully",
      });
      setShowNegotiationForm(false);
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
        description: "Failed to create negotiation",
        variant: "destructive",
      });
    },
  });

  const updateNegotiationMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      await apiRequest("PUT", `/api/negotiations/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      toast({
        title: "Success",
        description: "Negotiation updated successfully",
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
        description: "Failed to update negotiation",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock 
      },
      approved: { 
        label: "Approved", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle 
      },
      rejected: { 
        label: "Rejected", 
        className: "bg-red-100 text-red-800",
        icon: AlertCircle 
      },
      negotiating: { 
        label: "In Progress", 
        className: "bg-blue-100 text-blue-800",
        icon: Handshake 
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

  const filteredNegotiations = negotiations?.filter((negotiation) => {
    const matchesSearch = 
      negotiation.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || negotiation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStats = () => {
    if (!negotiations) return { total: 0, pending: 0, approved: 0, rejected: 0, negotiating: 0 };
    
    return {
      total: negotiations.length,
      pending: negotiations.filter(n => n.status === 'pending').length,
      approved: negotiations.filter(n => n.status === 'approved').length,
      rejected: negotiations.filter(n => n.status === 'rejected').length,
      negotiating: negotiations.filter(n => n.status === 'negotiating').length,
    };
  };

  const stats = getStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Negotiation & Booking Management</h2>
          <p className="text-gray-600">Approval workflows, token management, and allotment letters</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowNegotiationForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            New Negotiation
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Letters
          </Button>
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Token Tracker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Negotiations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Handshake className="w-8 h-8 text-gray-400" />
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.negotiating}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="negotiating">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search negotiations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Negotiations List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Negotiations ({filteredNegotiations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {negotiationsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredNegotiations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No negotiations found</h3>
              <p className="text-gray-500">Start a new negotiation to get things moving.</p>
              <Button 
                onClick={() => setShowNegotiationForm(true)} 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Negotiation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNegotiations.map((negotiation) => (
                <div key={negotiation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{negotiation.leadName || "Unknown Lead"}</h3>
                        {getStatusBadge(negotiation.status)}
                      </div>
                      <p className="text-gray-600 mb-2">
                        Unit: <span className="font-medium">{negotiation.unitNumber || "TBD"}</span> • 
                        Project: <span className="font-medium">{negotiation.projectName || "TBD"}</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Base Price:</p>
                          <p className="font-medium text-green-600">₹{negotiation.basePrice?.toLocaleString() || "TBD"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Requested Price:</p>
                          <p className="font-medium text-blue-600">₹{negotiation.requestedPrice?.toLocaleString() || "TBD"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Discount:</p>
                          <p className="font-medium text-orange-600">{negotiation.discountPercent || 0}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Token Amount:</p>
                          <p className="font-medium text-purple-600">₹{negotiation.tokenAmount?.toLocaleString() || "TBD"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {negotiation.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{negotiation.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(negotiation.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      {negotiation.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateNegotiationMutation.mutate({ id: negotiation.id, status: 'approved' })}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateNegotiationMutation.mutate({ id: negotiation.id, status: 'rejected' })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <FileText className="w-4 h-4 mr-1" />
                        View Details
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