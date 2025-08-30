import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, Bus, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeliveryAgentSchema, type DeliveryAgent } from "@shared/schema";
import { z } from "zod";

type AgentForm = z.infer<typeof insertDeliveryAgentSchema>;

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["/api/agents"],
    retry: false,
  });

  const form = useForm<AgentForm>({
    resolver: zodResolver(insertDeliveryAgentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      employeeId: "",
      region: "NCR",
      isActive: true,
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (agentData: AgentForm) => {
      const response = await apiRequest("POST", "/api/agents", agentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delivery agent created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setIsDialogOpen(false);
      form.reset();
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
        description: "Failed to create delivery agent",
        variant: "destructive",
      });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AgentForm }) => {
      const response = await apiRequest("PUT", `/api/agents/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delivery agent updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setIsDialogOpen(false);
      setSelectedAgent(null);
      form.reset();
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
        description: "Failed to update delivery agent",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      await apiRequest("DELETE", `/api/agents/${agentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delivery agent deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
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
        description: "Failed to delete delivery agent",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (agent: DeliveryAgent) => {
    setSelectedAgent(agent);
    form.reset({
      fullName: agent.fullName,
      email: agent.email || "",
      phone: agent.phone,
      employeeId: agent.employeeId,
      region: agent.region,
      isActive: agent.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (agentId: string) => {
    if (confirm("Are you sure you want to delete this delivery agent?")) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const onSubmit = (data: AgentForm) => {
    if (selectedAgent) {
      updateAgentMutation.mutate({ id: selectedAgent.id, data });
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const filteredAgents = agents?.filter(agent =>
    agent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 lbc-bg-red rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">LBC</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Delivery Agents</h1>
              <p className="text-muted-foreground">Manage delivery personnel and assignments</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    setSelectedAgent(null);
                    form.reset();
                  }}
                  data-testid="button-add-agent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAgent ? "Edit Delivery Agent" : "Add New Delivery Agent"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input placeholder="EMP-001" {...field} data-testid="input-employee-id" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="agent@lbc.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+63 9XX XXX XXXX" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-region">
                                  <SelectValue placeholder="Select region" />
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
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-is-active"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active Agent</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Agent is available for order assignments
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
                        data-testid="button-save-agent"
                      >
                        {selectedAgent ? "Update" : "Create"} Agent
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search agents by name, employee ID, or region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-agents"
                />
              </div>
            </CardContent>
          </Card>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : filteredAgents?.length > 0 ? (
              filteredAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow" data-testid={`card-agent-${agent.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{agent.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{agent.employeeId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={agent.isActive ? "default" : "secondary"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(agent)}
                            className="text-primary hover:text-primary/80"
                            data-testid={`button-edit-agent-${agent.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(agent.id)}
                            className="text-destructive hover:text-destructive/80"
                            disabled={deleteAgentMutation.isPending}
                            data-testid={`button-delete-agent-${agent.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <span className="font-medium mr-2">Region:</span>
                        <span>{agent.region}</span>
                      </div>
                      {agent.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{agent.email}</span>
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{agent.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-agents">
                <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No delivery agents found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by adding your first delivery agent"}
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsDialogOpen(true)}
                  data-testid="button-add-first-agent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
