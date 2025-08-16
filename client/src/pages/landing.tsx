import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mr-4">
              <i className="fas fa-building text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">RealEstate CRM</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive Sales Management System for Real Estate Developers
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
            alt="Modern Real Estate Office" 
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl mb-8"
          />
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
          >
            <i className="fas fa-sign-in-alt mr-3"></i>
            Access CRM Dashboard
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-primary-600 text-xl"></i>
              </div>
              <CardTitle className="text-lg">Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Centralized lead capture from multiple sources with automated assignment and deduplication
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-route text-success-600 text-xl"></i>
              </div>
              <CardTitle className="text-lg">Customer Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Track complete sales pipeline from new leads to post-sales with automated notifications
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-building text-warning-600 text-xl"></i>
              </div>
              <CardTitle className="text-lg">Inventory Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Real-time unit availability with dynamic pricing and anti-double-booking protection
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-bar text-danger-600 text-xl"></i>
              </div>
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Comprehensive dashboards and reports for data-driven decision making
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Phases */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-12">Complete CRM Workflow</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { phase: "Lead Intake", icon: "fa-download", color: "primary" },
              { phase: "Customer Journey", icon: "fa-route", color: "blue" },
              { phase: "Inventory Mgmt", icon: "fa-warehouse", color: "purple" },
              { phase: "Negotiations", icon: "fa-handshake", color: "orange" },
              { phase: "Payments", icon: "fa-credit-card", color: "green" },
              { phase: "Channel Partners", icon: "fa-user-tie", color: "indigo" },
              { phase: "Communication", icon: "fa-comments", color: "pink" },
              { phase: "Reports", icon: "fa-chart-line", color: "red" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fas ${item.icon} text-${item.color}-600 text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-900">{item.phase}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
