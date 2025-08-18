import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  TrendingUp, 
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  User
} from "lucide-react";

// Lead form schema with validation
const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  source: z.string().min(1, "Source is required"),
  status: z.string().min(1, "Status is required"),
  budget: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export default function Leads() {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [editingLead, setEditingLead] = useState<any>(null);

  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "",
      status: "new",
      budget: "",
      preferences: "",
      notes: "",
      assignedTo: "",
    },
  });

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

  useEffect(() => {
    if (editingLead) {
      form.reset({
        name: editingLead.name || "",
        phone: editingLead.phone || "",
        email: editingLead.email || "",
        source: editingLead.source || "",
        status: editingLead.status || "new",
        budget: editingLead.budget || "",
        preferences: editingLead.preferences || "",
        notes: editingLead.notes || "",
        assignedTo: editingLead.assignedTo || "",
        projectId: editingLead.projectId || "",
      });
    }
  }, [editingLead, form]);

  const { data: leads, isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: LeadFormData) => {
      const endpoint = editingLead ? `/api/leads/${editingLead.id}` : "/api/leads";
      const method = editingLead ? "PUT" : "POST";
      await apiRequest(method, endpoint, leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: editingLead ? "Lead updated successfully" : "Lead created successfully",
      });
      setShowLeadForm(false);
      setEditingLead(null);
      form.reset();
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
        description: editingLead ? "Failed to update lead" : "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      await apiRequest("PUT", `/api/leads/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to update lead",
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await apiRequest("DELETE", `/api/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
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
        description: "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    createLeadMutation.mutate(data);
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDelete = (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLeadMutation.mutate(leadId);
    }
  };

  const handleScheduleSiteVisit = (lead: any) => {
    // For now, we'll update the lead status to site_visit and show a toast
    // In a real implementation, this would open a calendar/scheduling dialog
    updateLeadMutation.mutate({
      id: lead.id,
      status: "site_visit",
      nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    });
    
    toast({
      title: "Site Visit Scheduled",
      description: `Site visit scheduled for ${lead.name}`,
    });
  };

  const handleQuickActions = (lead: any) => {
    // For now, we'll redirect to the customer journey page with the lead ID
    // In a real implementation, this might open a quick actions menu
    window.location.href = `/customer-journey?leadId=${lead.id}`;
  };

  const resetForm = () => {
    setEditingLead(null);
    setShowLeadForm(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New", className: "bg-gray-100 text-gray-800", icon: Clock },
      contacted: { label: "Contacted", className: "bg-blue-100 text-blue-800", icon: Phone },
      qualified: { label: "Qualified", className: "bg-purple-100 text-purple-800", icon: CheckCircle },
      site_visit: { label: "Site Visit", className: "bg-orange-100 text-orange-800", icon: MapPin },
      negotiation: { label: "Negotiation", className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      booking: { label: "Booking", className: "bg-green-100 text-green-800", icon: CheckCircle },
      sale: { label: "Sale", className: "bg-green-100 text-green-800", icon: CheckCircle },
      lost: { label: "Lost", className: "bg-red-100 text-red-800", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-green-100 text-green-800" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesSource = filterSource === "all" || lead.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  }) || [];

  const getLeadStats = () => {
    if (!leads) return { 
      total: 0, 
      new: 0, 
      contacted: 0, 
      qualified: 0, 
      converted: 0 
    };
    
    return {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      converted: leads.filter(l => ['booking', 'sale'].includes(l.status)).length,
    };
  };

  const stats = getLeadStats();

  const leadSources = [
    { value: "99acres", label: "99acres" },
    { value: "magicbricks", label: "MagicBricks" },
    { value: "website", label: "Website" },
    { value: "walk_in", label: "Walk-in" },
    { value: "broker", label: "Broker" },
    { value: "google_ads", label: "Google Ads" },
    { value: "meta_ads", label: "Facebook/Meta Ads" },
    { value: "referral", label: "Referral" }
  ];

  const leadStatuses = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "site_visit", label: "Site Visit" },
    { value: "negotiation", label: "Negotiation" },
    { value: "booking", label: "Booking" },
    { value: "sale", label: "Sale" },
    { value: "post_sales", label: "Post Sales" },
    { value: "lost", label: "Lost" },
    { value: "inactive", label: "Inactive" }
  ];

  const salesTeam = [
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Singh", "Vikash Gupta"
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">Capture, track, and nurture your sales prospects</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showLeadForm} onOpenChange={(open) => {
            if (!open) resetForm();
            setShowLeadForm(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLead ? "Edit Lead" : "Add New Lead"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Source *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lead source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {leadSources.map((source) => (
                                <SelectItem key={source.value} value={source.value}>
                                  {source.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lead status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {leadStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interested Project</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name} - {project.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {salesTeam.map((member) => (
                                <SelectItem key={member} value={member}>
                                  {member}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 50-75 Lakhs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferences</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter customer preferences (e.g., 2BHK, specific location, amenities)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes or comments"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createLeadMutation.isPending}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      {createLeadMutation.isPending ? (
                        editingLead ? "Updating..." : "Creating..."
                      ) : (
                        editingLead ? "Update Lead" : "Create Lead"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
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
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-green-600">{stats.contacted}</p>
              </div>
              <Phone className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.qualified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {leadStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {leadSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 relative">
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
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== "all" || filterSource !== "all" 
                  ? "No leads match your current filters."
                  : "Start by adding your first lead to begin tracking prospects."
                }
              </p>
              <Button onClick={() => setShowLeadForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {lead.name?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{lead.name || "Unknown"}</p>
                          <p className="text-sm text-gray-500">ID: {lead.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.phone || "No phone"}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {leadSources.find(s => s.value === lead.source)?.label || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(lead.priority)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">{lead.budget || "Not specified"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.assignedTo || "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(lead.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(lead)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleScheduleSiteVisit(lead)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Schedule Site Visit"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickActions(lead)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Quick Actions"
                        >
                          <Filter className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}