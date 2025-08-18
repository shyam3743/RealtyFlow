import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUnitDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteUnitDialog({
  unit,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}: DeleteUnitDialogProps) {
  if (!unit) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Unit {unit.unitNumber}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this unit? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm">
                <strong>Unit Details:</strong>
                <br />
                Unit Number: {unit.unitNumber}
                <br />
                Tower: {unit.tower} • Floor: {unit.floor}
                <br />
                Property Type: {unit.propertyType}
                <br />
                Size: {unit.size || unit.area} sq ft
                <br />
                Status: {unit.status}
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ This will permanently remove the unit from the inventory.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Unit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}