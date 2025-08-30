import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { updateOrderSchema, insertOrderTrackingSchema, type OrderWithDetails } from "@shared/schema";
import { z } from "zod";
import { MapPin, Clock, Package, User } from "lucide-react";

interface OrderModalProps {
  order: OrderWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

type UpdateOrderForm = z.infer<typeof updateOrderSchema>;
type AddTrackingForm = z.infer<typeof insertOrderTrackingSchema>;

export default function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateForm = useForm<UpdateOrderForm>({
    resolver: zodResolver(updateOrderSchema),
    values: order ? {
      senderName: order.senderName,
      senderPhone: order.senderPhone || "",
      senderEmail: order.senderEmail || "",
      senderAddress: order.senderAddress,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone || "",
      recipientEmail: order.recipientEmail || "",
      recipientAddress: order.recipientAddress,
      packageType: order.packageType,
      weight: order.weight ? parseFloat(order.weight) : undefined,
      declaredValue: order.declaredValue ? parseFloat(order.declaredValue) : undefined,
      description: order.description || "",
      serviceType: order.serviceType,
      fromRegion: order.fromRegion,
      toRegion: order.toRegion,
      status: order.status,
      assignedAgentId: order.assignedAgentId || "",
      isCod: order.isCod,
      codAmount: order.codAmount ? parseFloat(order.codAmount) : undefined,
      hasInsurance: order.hasInsurance,
      hasSmsNotification: order.hasSmsNotification,
      shippingRate: order.shippingRate ? parseFloat(order.shippingRate) : undefined,
      totalAmount: order.totalAmount ? parseFloat(order.totalAmount) : undefined,
    } : {},
  });

  const trackingForm = useForm<AddTrackingForm>({
    resolver: zodResolver(insertOrderTrackingSchema.omit({ orderId: true, updatedBy: true })),
    defaultValues: {
      status: "",
      location: "",
      notes: "",
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/agents", { active: true }],
    retry: false,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: UpdateOrderForm) => {
      if (!order) return;
      const response = await apiRequest("PUT", `/api/orders/${order.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
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
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const addTrackingMutation = useMutation({
    mutationFn: async (data: AddTrackingForm) => {
      if (!order) return;
      const response = await apiRequest("POST", `/api/orders/${order.id}/tracking`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tracking update added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      trackingForm.reset();
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
        description: "Failed to add tracking update",
        variant: "destructive",
      });
    },
  });

  const onUpdateSubmit = (data: UpdateOrderForm) => {
    updateOrderMutation.mutate(data);
  };

  const onTrackingSubmit = (data: AddTrackingForm) => {
    addTrackingMutation.mutate(data);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      "in-transit": "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.orderNumber}</span>
            <Badge className={getStatusBadgeClass(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" data-testid="tab-order-details">Order Details</TabsTrigger>
            <TabsTrigger value="tracking" data-testid="tab-tracking">Tracking</TabsTrigger>
            <TabsTrigger value="edit" data-testid="tab-edit">Edit Order</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Package</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{order.packageType}</p>
                <p className="text-sm text-muted-foreground">{order.weight} kg</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Route</span>
                </div>
                <p className="text-sm text-muted-foreground">{order.fromRegion} → {order.toRegion}</p>
                <p className="text-sm text-muted-foreground capitalize">{order.serviceType}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Agent</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.assignedAgent?.fullName || "Unassigned"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Sender and Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Sender Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium text-foreground">{order.senderName}</p>
                  </div>
                  {order.senderPhone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium text-foreground">{order.senderPhone}</p>
                    </div>
                  )}
                  {order.senderEmail && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium text-foreground">{order.senderEmail}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium text-foreground">{order.senderAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Recipient Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium text-foreground">{order.recipientName}</p>
                  </div>
                  {order.recipientPhone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium text-foreground">{order.recipientPhone}</p>
                    </div>
                  )}
                  {order.recipientEmail && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium text-foreground">{order.recipientEmail}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium text-foreground">{order.recipientAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            {order.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Package Description</h3>
                  <p className="text-sm text-muted-foreground">{order.description}</p>
                </div>
              </>
            )}

            {/* Pricing */}
            <Separator />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Rate:</span>
                    <span className="font-medium text-foreground">
                      ₱{order.shippingRate ? parseFloat(order.shippingRate).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Declared Value:</span>
                    <span className="font-medium text-foreground">
                      ₱{order.declaredValue ? parseFloat(order.declaredValue).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  {order.isCod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COD Amount:</span>
                      <span className="font-medium text-foreground">
                        ₱{order.codAmount ? parseFloat(order.codAmount).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">COD:</span>
                    <Badge variant={order.isCod ? "default" : "secondary"}>
                      {order.isCod ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Insurance:</span>
                    <Badge variant={order.hasInsurance ? "default" : "secondary"}>
                      {order.hasInsurance ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">SMS Notifications:</span>
                    <Badge variant={order.hasSmsNotification ? "default" : "secondary"}>
                      {order.hasSmsNotification ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            {/* Add New Tracking */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Add Tracking Update</h3>
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={trackingForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tracking-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="in-transit">In Transit</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={trackingForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Current location" {...field} data-testid="input-tracking-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={trackingForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-tracking-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    disabled={addTrackingMutation.isPending}
                    data-testid="button-add-tracking"
                  >
                    {addTrackingMutation.isPending ? "Adding..." : "Add Update"}
                  </Button>
                </form>
              </Form>
            </div>

            <Separator />

            {/* Tracking History */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Tracking History</h3>
              {order.trackingHistory && order.trackingHistory.length > 0 ? (
                <div className="space-y-4">
                  {order.trackingHistory.map((entry, index) => (
                    <div key={entry.id || index} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={getStatusBadgeClass(entry.status)}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.location && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {entry.location}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-foreground">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-tracking">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No tracking updates yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
                {/* Status and Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={updateForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in-transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="assignedAgentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Agent</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order-agent">
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
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

                {/* Contact Updates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-4">Sender Information</h4>
                    <div className="space-y-4">
                      <FormField
                        control={updateForm.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-sender-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={updateForm.control}
                        name="senderPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-sender-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-4">Recipient Information</h4>
                    <div className="space-y-4">
                      <FormField
                        control={updateForm.control}
                        name="recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-recipient-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={updateForm.control}
                        name="recipientPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-recipient-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateOrderMutation.isPending}
                    data-testid="button-save-order"
                  >
                    {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
