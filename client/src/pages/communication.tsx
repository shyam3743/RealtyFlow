import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MessageCircle, Phone, Send, Calendar, Users } from "lucide-react";

export default function Communication() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<"email" | "whatsapp" | "sms">("email");
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

  const { data: communications, isLoading: communicationsLoading } = useQuery({
    queryKey: ["/api/communications"],
    retry: false,
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      await apiRequest("POST", "/api/communications", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      toast({
        title: "Success",
        description: "Campaign sent successfully",
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
        description: "Failed to send campaign",
        variant: "destructive",
      });
    },
  });

  const handleSendCampaign = (type: "email" | "whatsapp" | "sms", template: string) => {
    setSelectedCampaignType(type);
    // In a real implementation, this would open a form with the template
    toast({
      title: "Campaign Started",
      description: `${template} campaign is being sent to selected recipients`,
    });
  };

  const campaignTemplates = {
    email: [
      {
        title: "New Launch Announcement",
        description: "Announce new project launches to your lead database",
        recipients: "1,247 leads",
        icon: "fa-bullhorn",
        color: "blue"
      },
      {
        title: "Follow-up Sequence",
        description: "Automated follow-up emails for unresponsive leads",
        recipients: "342 leads",
        icon: "fa-clock",
        color: "purple"
      },
      {
        title: "Payment Reminders",
        description: "Send payment due notifications to customers",
        recipients: "89 customers",
        icon: "fa-money-bill",
        color: "orange"
      }
    ],
    whatsapp: [
      {
        title: "Site Visit Reminders",
        description: "Remind customers about scheduled site visits",
        recipients: "156 appointments",
        icon: "fa-calendar-check",
        color: "green"
      },
      {
        title: "Welcome Messages",
        description: "Welcome new leads with project information",
        recipients: "78 new leads",
        icon: "fa-handshake",
        color: "emerald"
      },
      {
        title: "Booking Confirmations",
        description: "Confirm unit bookings and next steps",
        recipients: "45 bookings",
        icon: "fa-check-circle",
        color: "teal"
      }
    ],
    sms: [
      {
        title: "Block Expiry Alerts",
        description: "Alert customers about unit block expiration",
        recipients: "23 blocked units",
        icon: "fa-exclamation-triangle",
        color: "red"
      },
      {
        title: "Deal Closure Reminders",
        description: "Remind about pending documentation",
        recipients: "67 deals",
        icon: "fa-file-contract",
        color: "yellow"
      },
      {
        title: "Event Invitations",
        description: "Invite leads to property events",
        recipients: "892 leads",
        icon: "fa-calendar-star",
        color: "pink"
      }
    ]
  };

  if (communicationsLoading) {
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
          <h2 className="text-3xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600">Automated campaigns and customer engagement</p>
        </div>
        <Button onClick={() => setShowCampaignForm(true)} className="bg-primary-500 hover:bg-primary-600">
          <Send className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">12,456</p>
                <p className="text-sm text-success-600">+18% this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">68.4%</p>
                <p className="text-sm text-success-600">+5.2% improvement</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">24.7%</p>
                <p className="text-sm text-success-600">+3.1% increase</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
                <p className="text-sm text-success-600">+12% this month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Templates */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Campaign Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>SMS</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(campaignTemplates).map(([type, templates]) => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {templates.map((template, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-${template.color}-100 rounded-lg flex items-center justify-center`}>
                            <i className={`fas ${template.icon} text-${template.color}-600 text-xl`}></i>
                          </div>
                          <Badge variant="secondary">{template.recipients}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        <Button 
                          className={`w-full bg-${template.color}-600 hover:bg-${template.color}-700`}
                          onClick={() => handleSendCampaign(type as any, template.title)}
                        >
                          Send Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Communications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "email",
                subject: "Welcome to Emerald Heights Project",
                recipient: "rajesh.kumar@email.com",
                status: "delivered",
                time: "2 hours ago",
                icon: "fa-envelope",
                color: "blue"
              },
              {
                type: "whatsapp",
                subject: "Site visit reminder for tomorrow",
                recipient: "+91 9876543210",
                status: "read",
                time: "4 hours ago",
                icon: "fab fa-whatsapp",
                color: "green"
              },
              {
                type: "sms",
                subject: "Payment due reminder",
                recipient: "+91 8765432109",
                status: "sent",
                time: "1 day ago",
                icon: "fa-sms",
                color: "purple"
              },
              {
                type: "email",
                subject: "Unit booking confirmation",
                recipient: "priya.singh@email.com",
                status: "opened",
                time: "2 days ago",
                icon: "fa-envelope",
                color: "blue"
              }
            ].map((comm, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-${comm.color}-100 rounded-lg flex items-center justify-center`}>
                    <i className={`${comm.icon} text-${comm.color}-600`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{comm.subject}</p>
                    <p className="text-sm text-gray-600">{comm.recipient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    className={
                      comm.status === 'delivered' ? 'bg-success-100 text-success-800' :
                      comm.status === 'read' ? 'bg-blue-100 text-blue-800' :
                      comm.status === 'opened' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {comm.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">{comm.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
