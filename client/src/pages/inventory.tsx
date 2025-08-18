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
  Building, 
  Home, 
  DollarSign, 
  Eye, 
  Edit,
  Lock,
  Unlock,
  MapPin,
  Layers,
  Grid,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Store,
  Briefcase
} from "lucide-react";

export default function Inventory() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedTower, setSelectedTower] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("all");

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

  const { data: projects, isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: units, isLoading: unitsLoading } = useQuery<any[]>({
    queryKey: ["/api/units", selectedProject],
    enabled: !!selectedProject,
    retry: false,
  });

  const { data: towers } = useQuery<any[]>({
    queryKey: ["/api/towers", selectedProject],
    enabled: !!selectedProject,
    retry: false,
  });

  const { data: floors } = useQuery<any[]>({
    queryKey: ["/api/floors", selectedTower],
    enabled: !!selectedTower,
    retry: false,
  });

  const blockUnitMutation = useMutation({
    mutationFn: async ({ unitId, action }: { unitId: string; action: 'block' | 'unblock' }) => {
      await apiRequest("POST", `/api/units/${unitId}/${action}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Success",
        description: "Unit status updated successfully",
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
        description: "Failed to update unit status",
        variant: "destructive",
      });
    },
  });

  // Filter units based on search and status
  const filteredUnits = units?.filter((unit) => {
    const matchesSearch = 
      unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.floor.toString().includes(searchTerm) ||
      unit.tower.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || unit.status === filterStatus;
    const matchesPropertyType = filterPropertyType === "all" || unit.propertyType === filterPropertyType;

    const matchesProject = selectedProject === "all" || unit.projectId === selectedProject;
    const matchesTower = selectedTower === "all" || unit.tower === selectedTower;
    const matchesFloor = selectedFloor === "all" || unit.floor.toString() === selectedFloor;

    return matchesSearch && matchesStatus && matchesPropertyType && matchesProject && matchesTower && matchesFloor;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { 
        label: "Available", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle 
      },
      blocked: { 
        label: "Blocked", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Lock 
      },
      sold: { 
        label: "Sold", 
        className: "bg-red-100 text-red-800",
        icon: Home 
      },
      booked: { 
        label: "Booked", 
        className: "bg-blue-100 text-blue-800",
        icon: Clock 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPropertyTypeInfo = (propertyType: string) => {
    const typeConfig = {
      flat: { 
        label: "Flat", 
        className: "bg-blue-100 text-blue-800",
        icon: Building2 
      },
      bungalow: { 
        label: "Bungalow", 
        className: "bg-green-100 text-green-800",
        icon: Home 
      },
      row_house: { 
        label: "Row House", 
        className: "bg-purple-100 text-purple-800",
        icon: Building 
      },
      shop: { 
        label: "Shop", 
        className: "bg-orange-100 text-orange-800",
        icon: Store 
      },
      office: { 
        label: "Office", 
        className: "bg-gray-100 text-gray-800",
        icon: Briefcase 
      },
    };

    const config = typeConfig[propertyType as keyof typeof typeConfig] || typeConfig.flat;
    const IconComponent = config.icon;

    return {
      ...config,
      icon: IconComponent
    };
  };

  const getInventoryStats = () => {
    if (!units) return { total: 0, available: 0, blocked: 0, sold: 0, booked: 0 };
    
    return {
      total: units.length,
      available: units.filter(u => u.status === 'available').length,
      blocked: units.filter(u => u.status === 'blocked').length,
      sold: units.filter(u => u.status === 'sold').length,
      booked: units.filter(u => u.status === 'booked').length,
    };
  };

  const stats = getInventoryStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Project → Tower → Floor → Unit hierarchy with dynamic pricing</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowUnitForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
          <Button variant="outline">
            <DollarSign className="w-4 h-4 mr-2" />
            Bulk Pricing
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Building className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.blocked}</p>
              </div>
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-red-600">{stats.sold}</p>
              </div>
              <Home className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedTower} onValueChange={setSelectedTower} disabled={!selectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tower" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Towers</SelectItem>
                  {towers?.map((tower) => (
                    <SelectItem key={tower} value={tower}>
                      Tower {tower}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedFloor} onValueChange={setSelectedFloor} disabled={!selectedTower}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {floors?.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Floor {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterPropertyType} onValueChange={setFilterPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                  <SelectItem value="row_house">Row House</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Unit Inventory ({filteredUnits.length})</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </Button>
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                Floor Plan
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unitsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
              <p className="text-gray-500">Try adjusting your filters or add new units to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUnits.map((unit) => {
                const propertyTypeInfo = getPropertyTypeInfo(unit.propertyType || 'flat');
                const PropertyTypeIcon = propertyTypeInfo.icon;
                
                return (
                  <div key={unit.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                    {/* Header with status and property type */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${propertyTypeInfo.className.replace('text-', 'bg-').replace('-800', '-50')}`}>
                          <PropertyTypeIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{unit.unitNumber}</h3>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>Tower {unit.tower} • Floor {unit.floor}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(unit.status)}
                    </div>
                    
                    {/* Property type badge */}
                    <div className="mb-4">
                      <Badge className={`${propertyTypeInfo.className} flex items-center gap-1 w-fit`}>
                        <PropertyTypeIcon className="w-3 h-3" />
                        {propertyTypeInfo.label}
                      </Badge>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Area</span>
                        <span className="text-sm font-semibold text-gray-900">{unit.size || unit.area} sq ft</span>
                      </div>
                      {unit.view && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">View</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{unit.view}</span>
                        </div>
                      )}
                      {unit.facing && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Facing</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{unit.facing}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Base Price</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{parseFloat(unit.baseRate || unit.basePrice).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {unit.status === 'available' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => blockUnitMutation.mutate({ unitId: unit.id, action: 'block' })}
                          className="text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400"
                        >
                          <Lock className="w-3 h-3" />
                        </Button>
                      ) : unit.status === 'blocked' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => blockUnitMutation.mutate({ unitId: unit.id, action: 'unblock' })}
                          className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                        >
                          <Unlock className="w-3 h-3" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
