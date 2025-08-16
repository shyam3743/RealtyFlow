import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Download, Eye, Edit, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChannelPartners() {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: partners, isLoading: partnersLoading } = useQuery({
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

  const filteredPartners = partners?.filter((partner: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      partner.name.toLowerCase().includes(searchLower) ||
      partner.phone.includes(searchTerm) ||
      (partner.email && partner.email.toLowerCase().includes(searchLower)) ||
      (partner.company && partner.company.toLowerCase().includes(searchLower))
    );
  }) || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getKycBadge = (kycStatus: boolean) => {
    return kycStatus ? (
      <Badge className="bg-success-100 text-success-800">KYC Complete</Badge>
    ) : (
      <Badge className="bg-warning-100 text-warning-800">KYC Pending</Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-success-100 text-success-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );
  };

  if (partnersLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Channel Partners</h2>
          <p className="text-gray-600">Manage broker relationships and commission tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowPartnerForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{partners?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-tie text-primary-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {partners?.filter((p: any) => p.isActive).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-success-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">KYC Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {partners?.filter((p: any) => p.kycStatus).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-id-card text-warning-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">₹2.4L</p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-danger-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search partners by name, phone, email, or company..."
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
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-tie text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-500">Get started by adding your first channel partner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Info</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agreement Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner: any) => (
                    <TableRow key={partner.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary-100 text-primary-600">
                              {getInitials(partner.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{partner.name}</div>
                            <div className="text-sm text-gray-500">{partner.phone}</div>
                            {partner.email && (
                              <div className="text-sm text-gray-500">{partner.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {partner.company || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary-600">
                          {partner.commissionRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {getKycBadge(partner.kycStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(partner.isActive)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {partner.agreementDate 
                          ? new Date(partner.agreementDate).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-success-600 hover:text-success-700"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
