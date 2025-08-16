import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    location: string;
    totalUnits: number;
    availableUnits: number;
    blockedUnits: number;
    soldUnits: number;
    status: string;
    imageUrl?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const salesProgress = project.totalUnits > 0 
    ? Math.round(((project.soldUnits + project.blockedUnits) / project.totalUnits) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-600';
      case 'pre_launch': return 'bg-warning-100 text-warning-600';
      case 'sold_out': return 'bg-gray-100 text-gray-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300";

  return (
    <Card className="overflow-hidden">
      <img 
        src={project.imageUrl || defaultImage} 
        alt={project.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <p className="text-gray-600 text-sm mb-4">{project.location}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Units</span>
            <span className="font-medium">{project.totalUnits}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available</span>
            <span className="font-medium text-success-600">{project.availableUnits}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Blocked</span>
            <span className="font-medium text-warning-600">{project.blockedUnits}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sold</span>
            <span className="font-medium text-gray-600">{project.soldUnits}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Progress value={salesProgress} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sales Progress</span>
            <span>{salesProgress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
