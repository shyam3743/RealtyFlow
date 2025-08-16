import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import CustomerJourney from "@/pages/customer-journey";
import Inventory from "@/pages/inventory";
import Negotiations from "@/pages/negotiations";
import Payments from "@/pages/payments";
import ChannelPartners from "@/pages/channel-partners";
import Communication from "@/pages/communication";
import Reports from "@/pages/reports";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <TopNav />
              <main className="flex-1 overflow-auto">
                <Route path="/" component={Dashboard} />
                <Route path="/leads" component={Leads} />
                <Route path="/customer-journey" component={CustomerJourney} />
                <Route path="/inventory" component={Inventory} />
                <Route path="/negotiations" component={Negotiations} />
                <Route path="/payments" component={Payments} />
                <Route path="/channel-partners" component={ChannelPartners} />
                <Route path="/communication" component={Communication} />
                <Route path="/reports" component={Reports} />
              </main>
            </div>
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
