import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { insertOrderSchema, updateOrderSchema, type Order } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";

interface OrderFormProps {
  order?: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const createOrderSchema = insertOrderSchema.extend({
  weight: z.coerce.number().min(0.1, "Weight must be at least 0.1 kg"),
  declaredValue: z.coerce.number().min(0, "Declared value must be positive"),
  codAmount: z.coerce.number().optional(),
});

type OrderFormData = z.infer<typeof createOrderSchema>;

export default function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedRate, setCalculatedRate] = useState<{ rate: number; estimatedDays: string } | null>(null);

  const isEditing = !!order;
  const schema = isEditing ? updateOrderSchema : createOrderSchema;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(schema),
    defaultValues: order ? {
      senderName: order.senderName,
      senderPhone: order.senderPhone || "",
      senderEmail: order.senderEmail || "",
      senderAddress: order.senderAddress,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone || "",
      recipientEmail: order.recipientEmail || "",
      recipientAddress: order.recipientAddress,
      packageType: order.packageType,
      weight: order.weight ? parseFloat(order.weight) : 1,
      declaredValue: order.declaredValue ? parseFloat(order.declaredValue) : 0,
      description: order.description || "",
      serviceType: order.serviceType,
      fromRegion: order.fromRegion,
      toRegion: order.toRegion,
      isCod: order.isCod,
      codAmount: order.codAmount ? parseFloat(order.codAmount) : 0,
      hasInsurance: order.hasInsurance,
      hasSmsNotification: order.hasSmsNotification,
      shippingRate: order.shippingRate ? parseFloat(order.shippingRate) : 0,
      totalAmount: order.totalAmount ? parseFloat(order.totalAmount) : 0,
      status: order.status,
      assignedAgentId: order.assignedAgentId || "auto",
    } : {
      senderName: "",
      senderPhone: "",
      senderEmail: "",
      senderAddress: "",
      recipientName: "",
      recipientPhone: "",
      recipientEmail: "",
      recipientAddress: "",
      packageType: "package",
      weight: 1,
      declaredValue: 0,
      description: "",
      serviceType: "regular",
      fromRegion: "NCR",
      toRegion: "NCR",
      isCod: false,
      codAmount: 0,
      hasInsurance: false,
      hasSmsNotification: false,
      shippingRate: 0,
      totalAmount: 0,
      status: "pending",
      assignedAgentId: "auto",
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/agents", { active: true }],
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const url = isEditing ? `/api/orders/${order.id}` : "/api/orders";
      const method = isEditing ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Order ${isEditing ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onSuccess?.();
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
        description: `Failed to ${isEditing ? "update" : "create"} order`,
        variant: "destructive",
      });
    },
  });

  // Auto-calculate rate when relevant fields change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.fromRegion && value.toRegion && value.weight && value.serviceType) {
        calculateRate(value.fromRegion, value.toRegion, value.weight, value.serviceType);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const calculateRate = async (fromRegion: string, toRegion: string, weight: number, serviceType: string) => {
    try {
      const response = await apiRequest("POST", "/api/calculate-rate", {
        fromRegion,
        toRegion,
        weight,
        serviceType,
      });
      const rateData = await response.json();
      setCalculatedRate(rateData);
      
      // Update form with calculated rate
      form.setValue("shippingRate", rateData.rate);
      const codAmount = form.getValues("isCod") ? form.getValues("codAmount") || 0 : 0;
      const insuranceAmount = form.getValues("hasInsurance") ? rateData.rate * 0.1 : 0;
      form.setValue("totalAmount", rateData.rate + insuranceAmount);
    } catch (error) {
      console.error("Error calculating rate:", error);
    }
  };

  const onSubmit = (data: OrderFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Sender and Recipient Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sender Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sender name" {...field} data-testid="input-sender-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senderPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 9XX XXX XXXX" {...field} data-testid="input-sender-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="sender@example.com" {...field} data-testid="input-sender-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senderAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Complete sender address" {...field} data-testid="textarea-sender-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipient name" {...field} data-testid="input-recipient-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 9XX XXX XXXX" {...field} data-testid="input-recipient-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="recipient@example.com" {...field} data-testid="input-recipient-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Complete recipient address" {...field} data-testid="textarea-recipient-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Package Details */}
        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-package-type">
                          <SelectValue placeholder="Select package type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="package">Package</SelectItem>
                        <SelectItem value="parcel">Parcel</SelectItem>
                        <SelectItem value="cargo">Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} data-testid="input-weight" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="declaredValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Declared Value (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-declared-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the package contents" {...field} data-testid="textarea-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Service Options */}
        <Card>
          <CardHeader>
            <CardTitle>Service Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-service-type">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="economy">Economy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fromRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-from-region">
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NCR">NCR (Metro Manila)</SelectItem>
                        <SelectItem value="NORTH LUZON">North Luzon</SelectItem>
                        <SelectItem value="SOUTH LUZON">South Luzon</SelectItem>
                        <SelectItem value="VISAYAS">Visayas</SelectItem>
                        <SelectItem value="MINDANAO">Mindanao</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="toRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-to-region">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NCR">NCR (Metro Manila)</SelectItem>
                        <SelectItem value="NORTH LUZON">North Luzon</SelectItem>
                        <SelectItem value="SOUTH LUZON">South Luzon</SelectItem>
                        <SelectItem value="VISAYAS">Visayas</SelectItem>
                        <SelectItem value="MINDANAO">Mindanao</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedAgentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Agent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "auto"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-assigned-agent">
                          <SelectValue placeholder="Auto-assign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto">Auto-assign</SelectItem>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Options Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="isCod"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-cod"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>COD (Cash on Delivery)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasInsurance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-insurance"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Insurance</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasSmsNotification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-sms-notification"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>SMS Notification</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* COD Amount */}
            {form.watch("isCod") && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="codAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>COD Amount (₱)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-cod-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Display */}
        {calculatedRate && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Shipping Rate:</span>
                  <span className="text-lg font-bold text-primary" data-testid="text-shipping-rate">
                    ₱{calculatedRate.rate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Delivery Time:</span>
                  <span className="text-sm font-medium text-foreground" data-testid="text-delivery-time">
                    {calculatedRate.estimatedDays} days
                  </span>
                </div>
                {form.watch("hasInsurance") && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Insurance:</span>
                    <span className="text-sm font-medium text-foreground">
                      ₱{(calculatedRate.rate * 0.1).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Total Amount:</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-total-amount">
                      ₱{form.watch("totalAmount")?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-order"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={mutation.isPending}
            data-testid="button-submit-order"
          >
            {mutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Order" : "Create Order")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
