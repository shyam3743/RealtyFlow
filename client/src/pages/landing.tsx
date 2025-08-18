import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Route, Building, ChartBar, ArrowRight, Shield, Zap, Target, UserPlus } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleRegister = () => {
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RealEstate CRM
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sales Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleRegister}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </Button>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-4 py-2 rounded-full font-medium mb-4">
              🏆 Complete 8-Phase DPR Workflow Implementation
            </Badge>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Real Estate Sales
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Complete Sales Management System with Lead Intake, Customer Journey Tracking, Inventory Management, 
              Negotiations, Payments, Channel Partners, Automation & Real-time Reports
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-3" />
              Access Dashboard
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <Target className="w-5 h-5 mr-3" />
              View Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              Multi-Level Access Control
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Real-time Automation
            </div>
            <div className="flex items-center">
              <ChartBar className="w-4 h-4 mr-2 text-blue-500" />
              Advanced Analytics
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Multi-source lead capture (99acres, MagicBricks, Google Ads, Walk-ins) with automated deduplication and intelligent assignment
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Auto-Assignment</Badge>
                <Badge variant="secondary" className="text-xs">Deduplication</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Route className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Customer Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Complete sales pipeline tracking: New → Contacted → Site Visit → Negotiation → Booking → Sale → Post-Sales
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Pipeline Tracking</Badge>
                <Badge variant="secondary" className="text-xs">Auto-Reminders</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Inventory Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Project → Tower → Floor → Unit hierarchy with dynamic pricing, blocking system, and real-time availability
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Dynamic Pricing</Badge>
                <Badge variant="secondary" className="text-xs">Block Protection</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ChartBar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Real-time MIS, conversion funnels, payment tracking, and performance analytics across all projects
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Real-time MIS</Badge>
                <Badge variant="secondary" className="text-xs">Performance Analytics</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete 8-Phase DPR Workflow */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 shadow-2xl mb-20">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm mb-6">
              🏗️ COMPLETE DPR IMPLEMENTATION
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              8-Phase CRM Workflow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Every phase from the Detailed Project Report implemented with extraordinary attention to detail
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                phase: "Lead Intake & Assignment", 
                icon: Users, 
                color: "from-blue-500 to-cyan-500",
                description: "Multi-source capture, deduplication, auto-assignment"
              },
              { 
                phase: "Customer Journey", 
                icon: Route, 
                color: "from-green-500 to-emerald-500",
                description: "Pipeline tracking, interaction logs, automated follow-ups"
              },
              { 
                phase: "Inventory Management", 
                icon: Building, 
                color: "from-purple-500 to-pink-500",
                description: "Project hierarchy, dynamic pricing, blocking system"
              },
              { 
                phase: "Negotiation & Booking", 
                icon: Target, 
                color: "from-orange-500 to-red-500",
                description: "Approval workflows, token management, allotment letters"
              },
              { 
                phase: "Payments & Finance", 
                icon: ChartBar, 
                color: "from-indigo-500 to-purple-500",
                description: "CLP/TLP plans, demand notes, auto-reminders"
              },
              { 
                phase: "Channel Partners", 
                icon: Users, 
                color: "from-teal-500 to-blue-500",
                description: "KYC onboarding, commission tracking, payouts"
              },
              { 
                phase: "Automation & Communication", 
                icon: Zap, 
                color: "from-yellow-500 to-orange-500",
                description: "WhatsApp/SMS campaigns, drip marketing, alerts"
              },
              { 
                phase: "Dashboards & Reports", 
                icon: ChartBar, 
                color: "from-pink-500 to-red-500",
                description: "Real-time MIS, conversion analytics, performance insights"
              }
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 leading-tight">
                      {item.phase}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Level Access Control */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl mb-20">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-full font-bold text-sm mb-6">
              🔐 MULTI-LEVEL ACCESS CONTROL
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Hierarchical Role Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Three-tier access structure ensuring secure, role-based operations across your organization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 border border-blue-200 dark:border-gray-600">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Developer HQ</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Master login with complete system access</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Full visibility across all projects</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Create and manage projects</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Override any user actions</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>System configuration access</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 border border-green-200 dark:border-gray-600">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Admin</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Per-project control and team management</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Full project control</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Manage Sales Team logins</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Approve negotiations & discounts</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Project analytics & reports</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 border border-orange-200 dark:border-gray-600">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sales Team</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Day-to-day sales operations and lead management</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Handle assigned leads</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Update customer journey</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Raise discount/offer requests</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Conduct site visits & bookings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Real Estate Sales?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join leading developers who have revolutionized their sales process with our complete CRM solution
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Shield className="w-5 h-5 mr-3" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
