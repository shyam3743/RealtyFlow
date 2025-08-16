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
import LeadForm from "@/components/forms/lead-form";
import LeadsTable from "@/components/tables/leads-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Download } from "lucide-react";
import { LeadWithDetails } from "@/types";

export default function Leads() {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
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

  const { data: leads, isLoading: leadsLoading } = useQuery<LeadWithDetails[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      setShowLeadForm(false);
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
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const handleExportLeads = () => {
    // TODO: Implement CSV export functionality
    toast({
      title: "Export Started",
      description: "Your leads export will be ready shortly",
    });
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const leadStatuses = [
    { value: "all", label: "All Status", count: leads?.length || 0 },
    { value: "new", label: "New", count: leads?.filter((l) => l.status === "new").length || 0 },
    { value: "contacted", label: "Contacted", count: leads?.filter((l) => l.status === "contacted").length || 0 },
    { value: "site_visit", label: "Site Visit", count: leads?.filter((l) => l.status === "site_visit").length || 0 },
    { value: "negotiation", label: "Negotiation", count: leads?.filter((l) => l.status === "negotiation").length || 0 },
    { value: "booking", label: "Booking", count: leads?.filter((l) => l.status === "booking").length || 0 },
    { value: "sale", label: "Sale", count: leads?.filter((l) => l.status === "sale").length || 0 },
    { value: "lost", label: "Lost", count: leads?.filter((l) => l.status === "lost").length || 0 },
  ];

  if (leadsLoading) {
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
          <h2 className="text-3xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">Centralized lead capture and assignment system</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowLeadForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
          <Button variant="outline" onClick={handleExportLeads}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        {leadStatuses.map((status) => (
          <Card 
            key={status.value}
            className={`cursor-pointer transition-colors hover:shadow-md ${
              selectedStatus === status.value ? 'ring-2 ring-primary-500 bg-primary-50' : ''
            }`}
            onClick={() => setSelectedStatus(status.value)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{status.count}</p>
              <p className="text-sm text-gray-600 font-medium">{status.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Leads ({filteredLeads.length})</span>
            <Badge variant="secondary">{selectedStatus.replace('_', ' ').toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No leads found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{lead.phone}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {lead.source.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={`text-xs ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-600' :
                              lead.status === 'contacted' ? 'bg-orange-100 text-orange-600' :
                              lead.status === 'site_visit' ? 'bg-purple-100 text-purple-600' :
                              lead.status === 'negotiation' ? 'bg-yellow-100 text-yellow-600' :
                              lead.status === 'booking' ? 'bg-indigo-100 text-indigo-600' :
                              lead.status === 'sale' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {lead.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {lead.budget ? `₹${parseFloat(lead.budget).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Form Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm 
            projects={projects || []}
            onSubmit={createLeadMutation.mutate}
            isLoading={createLeadMutation.isPending}
            onCancel={() => setShowLeadForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
