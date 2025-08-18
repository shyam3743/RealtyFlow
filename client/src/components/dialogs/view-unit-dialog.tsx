import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Eye, 
  Navigation, 
  Building2, 
  Store, 
  Briefcase,
  Building,
  Calendar,
  Layers
} from "lucide-react";

interface ViewUnitDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ViewUnitDialog({ 
  unit, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: ViewUnitDialogProps) {
  if (!unit) return null;

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
    return config;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { 
        label: "Available", 
        className: "bg-green-100 text-green-800"
      },
      blocked: { 
        label: "Blocked", 
        className: "bg-yellow-100 text-yellow-800"
      },
      sold: { 
        label: "Sold", 
        className: "bg-red-100 text-red-800"
      },
      booked: { 
        label: "Booked", 
        className: "bg-blue-100 text-blue-800"
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const propertyTypeInfo = getPropertyTypeInfo(unit.propertyType || 'flat');
  const PropertyTypeIcon = propertyTypeInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${propertyTypeInfo.className.replace('text-', 'bg-').replace('-800', '-50')}`}>
              <PropertyTypeIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Unit {unit.unitNumber}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Tower {unit.tower} • Floor {unit.floor}</span>
              </div>
            </div>
            {getStatusBadge(unit.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Type & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Property Type</h3>
              <Badge className={`${propertyTypeInfo.className} flex items-center gap-2 w-fit`}>
                <PropertyTypeIcon className="w-4 h-4" />
                {propertyTypeInfo.label}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-semibold">{unit.size || unit.area} sq ft</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tower</h3>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span>{unit.tower}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Floor</h3>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span>{unit.floor}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Unit Number</h3>
              <span className="font-mono text-lg">{unit.unitNumber}</span>
            </div>
          </div>

          <Separator />

          {/* View & Facing */}
          {(unit.view || unit.facing) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.view && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">View</h3>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{unit.view}</span>
                    </div>
                  </div>
                )}
                {unit.facing && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Facing</h3>
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{unit.facing}</span>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Pricing Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Rate</span>
                  <span className="font-semibold">₹{parseFloat(unit.baseRate || unit.basePrice || 0).toLocaleString()}</span>
                </div>
                {unit.plc > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">PLC</span>
                    <span className="font-semibold">₹{parseFloat(unit.plc || 0).toLocaleString()}</span>
                  </div>
                )}
                {unit.gst > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GST</span>
                    <span className="font-semibold">{unit.gst}%</span>
                  </div>
                )}
                {unit.stampDuty > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stamp Duty</span>
                    <span className="font-semibold">₹{parseFloat(unit.stampDuty || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Price</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ₹{parseFloat(unit.totalPrice || unit.baseRate || unit.basePrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(unit.createdAt || unit.blockedAt) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {unit.createdAt && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Created At</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(unit.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {unit.blockedAt && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Blocked At</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(unit.blockedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Unit
            </Button>
          )}
          {onDelete && unit.status === 'available' && (
            <Button variant="destructive" onClick={onDelete}>
              Delete Unit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}