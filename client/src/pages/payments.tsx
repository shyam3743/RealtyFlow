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
import { 
  Plus, 
  Search, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Bell,
  Calendar,
  TrendingUp,
  Download
} from "lucide-react";

export default function Payments() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");

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

  const { data: payments, isLoading: paymentsLoading } = useQuery<any[]>({
    queryKey: ["/api/payments"],
    retry: false,
  });

  const { data: pendingPayments } = useQuery<any[]>({
    queryKey: ["/api/payments/pending"],
    retry: false,
  });

  const { data: bookings } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    retry: false,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      await apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/pending"] });
      toast({
        title: "Success",
        description: "Payment record created successfully",
      });
      setShowPaymentForm(false);
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
        description: "Failed to create payment record",
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await apiRequest("POST", `/api/payments/${paymentId}/reminder`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder sent successfully",
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
        description: "Failed to send reminder",
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
      received: { 
        label: "Received", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle 
      },
      overdue: { 
        label: "Overdue", 
        className: "bg-red-100 text-red-800",
        icon: AlertCircle 
      },
      partial: { 
        label: "Partial", 
        className: "bg-blue-100 text-blue-800",
        icon: CreditCard 
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

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      clp: { label: "CLP", className: "bg-blue-100 text-blue-800" },
      tlp: { label: "TLP", className: "bg-green-100 text-green-800" },
      custom: { label: "Custom", className: "bg-purple-100 text-purple-800" },
    };

    const config = planConfig[plan as keyof typeof planConfig] || planConfig.custom;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch = 
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesPlan = filterPlan === "all" || payment.paymentPlan === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];

  const getStats = () => {
    if (!payments) return { 
      total: 0, 
      pending: 0, 
      received: 0, 
      overdue: 0, 
      totalAmount: 0,
      receivedAmount: 0 
    };
    
    return {
      total: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      received: payments.filter(p => p.status === 'received').length,
      overdue: payments.filter(p => p.status === 'overdue').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      receivedAmount: payments.filter(p => p.status === 'received').reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  };

  const stats = getStats();

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Payments & Finance Management</h2>
          <p className="text-gray-600">CLP/TLP plans, demand notes, and automated reminders</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowPaymentForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Demand Note
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-gray-400" />
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
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-2xl font-bold text-green-600">{stats.received}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.receivedAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Payments Alert */}
      {pendingPayments && pendingPayments.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Urgent: {pendingPayments.length} Overdue Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-red-700">
                Total overdue amount: ₹{pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
              </p>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  pendingPayments.forEach(p => sendReminderMutation.mutate(p.id));
                }}
              >
                <Bell className="w-4 h-4 mr-1" />
                Send All Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="clp">CLP</SelectItem>
                  <SelectItem value="tlp">TLP</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Start by adding a payment record or adjust your filters.</p>
              <Button 
                onClick={() => setShowPaymentForm(true)} 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{payment.customerName || "Unknown Customer"}</h3>
                        {getStatusBadge(payment.status)}
                        {getPlanBadge(payment.paymentPlan)}
                        {isOverdue(payment.dueDate) && payment.status === 'pending' && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        Unit: <span className="font-medium">{payment.unitNumber || "TBD"}</span> • 
                        Receipt: <span className="font-medium">{payment.receiptNumber || "Pending"}</span>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Amount:</p>
                          <p className="font-bold text-lg text-green-600">₹{payment.amount?.toLocaleString() || "0"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due Date:</p>
                          <p className={`font-medium ${isOverdue(payment.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Type:</p>
                          <p className="font-medium capitalize">{payment.paymentType || "TBD"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Milestone:</p>
                          <p className="font-medium">{payment.milestone || "TBD"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      {payment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendReminderMutation.mutate(payment.id)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Send Reminder
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        View Receipt
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
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