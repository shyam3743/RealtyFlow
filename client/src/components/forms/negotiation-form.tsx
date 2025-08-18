import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const negotiationFormSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  unitId: z.string().optional(),
  projectId: z.string().optional(),
  basePrice: z.number().min(0, "Base price must be positive").optional(),
  requestedPrice: z.number().min(0, "Requested price must be positive").optional(),
  discountPercent: z.number().min(0).max(100, "Discount cannot exceed 100%").optional(),
  tokenAmount: z.number().min(0, "Token amount must be positive").optional(),
  paymentPlan: z.enum(["full_dp", "subvention", "tlp", "clp", "custom"]).optional(),
  isTokenReady: z.boolean().default(false),
  notes: z.string().optional(),
});

type NegotiationFormData = z.infer<typeof negotiationFormSchema>;

interface NegotiationFormProps {
  leads: any[];
  units: any[];
  projects: any[];
  onSubmit: (data: NegotiationFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  selectedLeadId?: string;
}

export default function NegotiationForm({ 
  leads, 
  units, 
  projects, 
  onSubmit, 
  isLoading, 
  onCancel,
  selectedLeadId 
}: NegotiationFormProps) {
  const form = useForm<NegotiationFormData>({
    resolver: zodResolver(negotiationFormSchema),
    defaultValues: {
      leadId: selectedLeadId || "",
      unitId: "",
      projectId: "",
      basePrice: 0,
      requestedPrice: 0,
      discountPercent: 0,
      tokenAmount: 0,
      paymentPlan: "full_dp",
      isTokenReady: false,
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads?.filter(lead => lead.status === 'negotiation').map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
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
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects?.map((project) => (
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
        </div>

        <FormField
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units?.filter(unit => unit.status === 'available').map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber} - Tower {unit.tower}, Floor {unit.floor} - ₹{unit.baseRate?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Base price" 
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
            name="requestedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer's Asking Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Customer's request" 
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
            name="discountPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Discount percentage" 
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
            name="tokenAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Amount (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Token amount" 
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
            name="paymentPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Plan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full_dp">Full Down Payment</SelectItem>
                    <SelectItem value="subvention">Subvention</SelectItem>
                    <SelectItem value="tlp">Time Linked Plan (TLP)</SelectItem>
                    <SelectItem value="clp">Construction Linked Plan (CLP)</SelectItem>
                    <SelectItem value="custom">Custom Plan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isTokenReady"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Customer is ready for token payment
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about the negotiation..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-primary-500 hover:bg-primary-600">
            {isLoading ? "Starting..." : "Start Negotiation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}