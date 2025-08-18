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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChannelPartnerForm from "@/components/forms/channel-partner-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Users, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Target,
  Calendar,
  Building,
  Download,
  Eye,
  Edit
} from "lucide-react";

export default function ChannelPartners() {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
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

  const { data: partners, isLoading: partnersLoading } = useQuery<any[]>({
    queryKey: ["/api/channel-partners"],
    retry: false,
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (partnerData: any) => {
      await apiRequest("POST", "/api/channel-partners", partnerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channel-partners"] });
      toast({
        title: "Success",
        description: "Channel partner created successfully",
      });
      setShowPartnerForm(false);
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
        description: "Failed to create channel partner",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        label: "Active", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle 
      },
      inactive: { 
        label: "Inactive", 
        className: "bg-red-100 text-red-800",
        icon: AlertCircle 
      },
      pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock 
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      broker: { label: "Broker", className: "bg-blue-100 text-blue-800" },
      direct_sales: { label: "Direct Sales", className: "bg-purple-100 text-purple-800" },
      referral: { label: "Referral", className: "bg-orange-100 text-orange-800" },
      corporate: { label: "Corporate", className: "bg-green-100 text-green-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.broker;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating}/5)</span>
      </div>
    );
  };

  const filteredPartners = partners?.filter((partner) => {
    const matchesSearch = 
      partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone?.includes(searchTerm);
    
    const matchesType = filterType === "all" || partner.type === filterType;
    const matchesStatus = filterStatus === "all" || partner.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStats = () => {
    if (!partners) return { 
      total: 0, 
      active: 0, 
      inactive: 0, 
      totalCommission: 0,
      avgRating: 0 
    };
    
    return {
      total: partners.length,
      active: partners.filter(p => p.status === 'active').length,
      inactive: partners.filter(p => p.status === 'inactive').length,
      totalCommission: partners.reduce((sum, p) => sum + (p.totalCommission || 0), 0),
      avgRating: partners.length > 0 
        ? partners.reduce((sum, p) => sum + (p.rating || 0), 0) / partners.length
        : 0,
    };
  };

  const stats = getStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Channel Partner Management</h2>
          <p className="text-gray-600">Broker network, commission tracking, and performance management</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowPartnerForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Commission Report
          </Button>
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Performance Dashboard
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalCommission.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Performing Partners</span>
              <Award className="w-5 h-5 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partners && partners.length > 0 ? (
              <div className="space-y-4">
                {partners.slice(0, 3).map((partner, index) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback>{partner.name?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.name || "Unknown Partner"}</h3>
                        <p className="text-sm text-gray-600">{partner.location || "Location TBD"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{(partner.totalCommission || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{partner.totalSales || 0} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partner Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "Broker", count: partners?.filter(p => p.type === 'broker').length || 0, color: "blue" },
                { type: "Direct Sales", count: partners?.filter(p => p.type === 'direct_sales').length || 0, color: "purple" },
                { type: "Referral", count: partners?.filter(p => p.type === 'referral').length || 0, color: "orange" },
                { type: "Corporate", count: partners?.filter(p => p.type === 'corporate').length || 0, color: "green" },
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                    <span className="text-sm text-gray-600">{item.type}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="direct_sales">Direct Sales</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Partners ({filteredPartners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {partnersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No channel partners found</h3>
              <p className="text-gray-500">Start by adding your first channel partner.</p>
              <Button 
                onClick={() => setShowPartnerForm(true)} 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{partner.name?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{partner.name || "Unknown Partner"}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {partner.location || "Location TBD"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(partner.type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(partner.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {partner.phone || "No phone"}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {partner.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{partner.totalSales || 0} Sales</p>
                        <p className="text-gray-600">{partner.monthlyTarget || 0} Target</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRatingStars(partner.rating || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-semibold text-green-600">₹{(partner.totalCommission || 0).toLocaleString()}</p>
                        <p className="text-gray-500">{partner.commissionRate || 0}% rate</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Channel Partner Dialog */}
      <Dialog open={showPartnerForm} onOpenChange={setShowPartnerForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Channel Partner</DialogTitle>
          </DialogHeader>
          <ChannelPartnerForm
            onSubmit={createPartnerMutation.mutate}
            isLoading={createPartnerMutation.isPending}
            onCancel={() => setShowPartnerForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}