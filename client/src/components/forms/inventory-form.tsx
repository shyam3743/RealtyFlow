import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const inventoryFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  towerId: z.string().min(1, "Tower is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().min(0, "Floor must be a positive number"),
  propertyType: z.enum(["flat", "bungalow", "row_house", "shop", "office"]),
  size: z.number().min(1, "Size must be greater than 0"),
  baseRate: z.number().min(1, "Base rate must be greater than 0"),
  plc: z.number().min(0, "PLC must be a positive number").optional(),
  gst: z.number().min(0, "GST must be a positive number").optional(),
  stampDuty: z.number().min(0, "Stamp duty must be a positive number").optional(),
  view: z.string().optional(),
  facing: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  projects: any[];
  towers: any[];
  onSubmit: (data: InventoryFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  selectedProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

export default function InventoryForm({ 
  projects, 
  towers, 
  onSubmit, 
  isLoading, 
  onCancel, 
  selectedProjectId,
  onProjectChange 
}: InventoryFormProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      projectId: selectedProjectId || "",
      towerId: "",
      unitNumber: "",
      floor: 0,
      propertyType: "flat",
      size: 0,
      baseRate: 0,
      plc: 0,
      gst: 5, // Default GST rate
      stampDuty: 0,
      view: "",
      facing: "",
    },
  });

  const handleSubmit = (data: InventoryFormData) => {
    const submitData = {
      ...data,
      totalPrice: data.baseRate + (data.plc || 0) + (data.gst || 0) + (data.stampDuty || 0),
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onProjectChange?.(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} - {project.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="towerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tower *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tower" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {towers.map((tower) => (
                      <SelectItem key={tower.id} value={tower.id}>
                        {tower.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="unitNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Number *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2B-405" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Floor number" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="row_house">Row House</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (sq ft) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Unit size" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Rate (₹) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Base rate per sq ft" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PLC (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Preferential Location Charges" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="GST percentage" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stampDuty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stamp Duty (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Stamp duty amount" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="view"
            render={({ field }) => (
              <FormItem>
                <FormLabel>View</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="garden">Garden View</SelectItem>
                    <SelectItem value="pool">Pool View</SelectItem>
                    <SelectItem value="city">City View</SelectItem>
                    <SelectItem value="park">Park View</SelectItem>
                    <SelectItem value="road">Road View</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facing</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                    <SelectItem value="north_east">North East</SelectItem>
                    <SelectItem value="north_west">North West</SelectItem>
                    <SelectItem value="south_east">South East</SelectItem>
                    <SelectItem value="south_west">South West</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-primary-500 hover:bg-primary-600">
            {isLoading ? "Creating..." : "Create Unit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
