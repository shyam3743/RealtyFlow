import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h2>
      <p className="text-gray-600 mb-8">Real-time project and unit availability tracking</p>
      
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-building text-warning-600 text-3xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory System</h3>
        <p className="text-gray-500">Coming soon - Complete inventory management</p>
      </div>
    </div>
  );
}
