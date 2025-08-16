import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, Phone, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadsTableProps {
  leads: any[];
  projects: any[];
}

export default function LeadsTable({ leads, projects }: LeadsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      contacted: { label: "Contacted", variant: "secondary" as const, className: "bg-green-100 text-green-800" },
      site_visit: { label: "Site Visit", variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      negotiation: { label: "Negotiation", variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      booking: { label: "Booking", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      sale: { label: "Sale", variant: "secondary" as const, className: "bg-success-100 text-success-800" },
      post_sales: { label: "Post Sales", variant: "secondary" as const, className: "bg-indigo-100 text-indigo-800" },
      lost: { label: "Lost", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
      inactive: { label: "Inactive", variant: "outline" as const, className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      "99acres": { className: "bg-blue-100 text-blue-800" },
      magicbricks: { className: "bg-green-100 text-green-800" },
      website: { className: "bg-purple-100 text-purple-800" },
      walk_in: { className: "bg-orange-100 text-orange-800" },
      broker: { className: "bg-yellow-100 text-yellow-800" },
      google_ads: { className: "bg-red-100 text-red-800" },
      meta_ads: { className: "bg-pink-100 text-pink-800" },
      referral: { className: "bg-indigo-100 text-indigo-800" },
    };

    const config = sourceConfig[source as keyof typeof sourceConfig] || { className: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={config.className}>
        {source.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "-";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "-";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-users text-gray-400 text-3xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">Get started by adding your first lead to the system.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact Info</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Project Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                    {lead.email && (
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getSourceBadge(lead.source)}
              </TableCell>
              <TableCell className="font-medium">
                {getProjectName(lead.projectId)}
              </TableCell>
              <TableCell>
                {getStatusBadge(lead.status)}
              </TableCell>
              <TableCell>
                {lead.budget ? `₹${parseInt(lead.budget).toLocaleString()}` : "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {lead.lastContactedAt ? formatDate(lead.lastContactedAt) : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCall(lead.phone)}
                    className="text-success-600 hover:text-success-700"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
