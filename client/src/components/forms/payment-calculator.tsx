import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Calculator, Edit, Trash2, Plus } from "lucide-react";
import { format, addMonths, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const calculatorFormSchema = z.object({
  totalAmount: z.number().min(1, "Total amount must be greater than 0"),
  planType: z.enum(["full_dp", "subvention", "tlp", "clp", "custom"]),
  downPaymentPercent: z.number().min(0).max(100).default(20),
  installmentCount: z.number().min(1).max(120).default(12),
  startDate: z.date().default(() => new Date()),
  interestRate: z.number().min(0).max(30).default(0),
});

type CalculatorFormData = z.infer<typeof calculatorFormSchema>;

interface PaymentScheduleItem {
  id: string;
  milestone: string;
  amount: number;
  dueDate: Date;
  percentage: number;
  editable: boolean;
}

interface PaymentCalculatorProps {
  onScheduleGenerated?: (schedule: PaymentScheduleItem[]) => void;
  onClose?: () => void;
  initialAmount?: number;
}

export default function PaymentCalculator({ 
  onScheduleGenerated, 
  onClose,
  initialAmount = 0 
}: PaymentCalculatorProps) {
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorFormSchema),
    defaultValues: {
      totalAmount: initialAmount,
      planType: "clp",
      downPaymentPercent: 20,
      installmentCount: 12,
      startDate: new Date(),
      interestRate: 0,
    },
  });

  const watchedValues = form.watch();

  const generatePaymentSchedule = (data: CalculatorFormData) => {
    const schedule: PaymentScheduleItem[] = [];
    const { totalAmount, planType, downPaymentPercent, installmentCount, startDate, interestRate } = data;

    switch (planType) {
      case "full_dp":
        schedule.push({
          id: "1",
          milestone: "Full Payment",
          amount: totalAmount,
          dueDate: startDate,
          percentage: 100,
          editable: true,
        });
        break;

      case "subvention":
        // Down payment
        schedule.push({
          id: "1",
          milestone: "Down Payment",
          amount: (totalAmount * downPaymentPercent) / 100,
          dueDate: startDate,
          percentage: downPaymentPercent,
          editable: true,
        });
        
        // During construction (no payment required)
        schedule.push({
          id: "2",
          milestone: "During Construction",
          amount: 0,
          dueDate: addMonths(startDate, 6),
          percentage: 0,
          editable: false,
        });
        
        // Balance on possession
        schedule.push({
          id: "3",
          milestone: "On Possession",
          amount: totalAmount - (totalAmount * downPaymentPercent) / 100,
          dueDate: addMonths(startDate, 24),
          percentage: 100 - downPaymentPercent,
          editable: true,
        });
        break;

      case "clp":
        // Construction Linked Plan
        const milestones = [
          { name: "Booking Amount", percent: 10 },
          { name: "Foundation Complete", percent: 10 },
          { name: "Ground Floor Slab", percent: 10 },
          { name: "1st Floor Slab", percent: 10 },
          { name: "2nd Floor Slab", percent: 10 },
          { name: "Roof Casting", percent: 15 },
          { name: "Plastering Complete", percent: 10 },
          { name: "Flooring & Finishing", percent: 15 },
          { name: "Possession", percent: 10 },
        ];

        milestones.forEach((milestone, index) => {
          schedule.push({
            id: (index + 1).toString(),
            milestone: milestone.name,
            amount: (totalAmount * milestone.percent) / 100,
            dueDate: addMonths(startDate, index * 3),
            percentage: milestone.percent,
            editable: true,
          });
        });
        break;

      case "tlp":
        // Time Linked Plan
        const downPayment = (totalAmount * downPaymentPercent) / 100;
        const remainingAmount = totalAmount - downPayment;
        const monthlyAmount = remainingAmount / installmentCount;

        // Down payment
        schedule.push({
          id: "1",
          milestone: "Down Payment",
          amount: downPayment,
          dueDate: startDate,
          percentage: downPaymentPercent,
          editable: true,
        });

        // Monthly installments
        for (let i = 1; i <= installmentCount; i++) {
          schedule.push({
            id: (i + 1).toString(),
            milestone: `Installment ${i}`,
            amount: monthlyAmount,
            dueDate: addMonths(startDate, i),
            percentage: (monthlyAmount / totalAmount) * 100,
            editable: true,
          });
        }
        break;

      case "custom":
        // Start with basic structure that user can customize
        schedule.push({
          id: "1",
          milestone: "Booking Amount",
          amount: (totalAmount * 10) / 100,
          dueDate: startDate,
          percentage: 10,
          editable: true,
        });
        schedule.push({
          id: "2",
          milestone: "Balance Payment",
          amount: (totalAmount * 90) / 100,
          dueDate: addMonths(startDate, 6),
          percentage: 90,
          editable: true,
        });
        break;
    }

    return schedule;
  };

  useEffect(() => {
    const schedule = generatePaymentSchedule(watchedValues);
    setPaymentSchedule(schedule);
  }, [watchedValues]);

  const updateScheduleItem = (id: string, field: string, value: any) => {
    setPaymentSchedule(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [field]: value,
              ...(field === 'amount' && { percentage: (value / watchedValues.totalAmount) * 100 })
            }
          : item
      )
    );
  };

  const addCustomItem = () => {
    const newItem: PaymentScheduleItem = {
      id: Date.now().toString(),
      milestone: "Custom Payment",
      amount: 0,
      dueDate: new Date(),
      percentage: 0,
      editable: true,
    };
    setPaymentSchedule(prev => [...prev, newItem]);
  };

  const removeScheduleItem = (id: string) => {
    setPaymentSchedule(prev => prev.filter(item => item.id !== id));
  };

  const totalScheduledAmount = paymentSchedule.reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = watchedValues.totalAmount - totalScheduledAmount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Payment Plan Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Total amount" 
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
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Plan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(watchedValues.planType === "tlp" || watchedValues.planType === "subvention") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="downPaymentPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Down payment percentage" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedValues.planType === "tlp" && (
                  <FormField
                    control={form.control}
                    name="installmentCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Installments</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Number of installments" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </Form>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Schedule</CardTitle>
            {watchedValues.planType === "custom" && (
              <Button onClick={addCustomItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentSchedule.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Milestone</label>
                    {editingItem === item.id ? (
                      <Input
                        value={item.milestone}
                        onChange={(e) => updateScheduleItem(item.id, 'milestone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{item.milestone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount (₹)</label>
                    {editingItem === item.id ? (
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateScheduleItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1 text-green-600">
                        ₹{item.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    {editingItem === item.id ? (
                      <Input
                        type="date"
                        value={format(item.dueDate, "yyyy-MM-dd")}
                        onChange={(e) => updateScheduleItem(item.id, 'dueDate', new Date(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{format(item.dueDate, "dd MMM yyyy")}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Percentage</label>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.editable && (
                    <>
                      {editingItem === item.id ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingItem(null)}
                          variant="outline"
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setEditingItem(item.id)}
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {watchedValues.planType === "custom" && (
                        <Button
                          size="sm"
                          onClick={() => removeScheduleItem(item.id)}
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Amount:</p>
                <p className="font-bold text-lg">₹{watchedValues.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Scheduled Amount:</p>
                <p className="font-bold text-lg text-green-600">₹{totalScheduledAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining:</p>
                <p className={`font-bold text-lg ${remainingAmount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            {onScheduleGenerated && (
              <Button 
                onClick={() => onScheduleGenerated(paymentSchedule)}
                disabled={remainingAmount !== 0}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Use This Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}