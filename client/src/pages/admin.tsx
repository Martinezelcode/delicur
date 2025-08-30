
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Package, TrendingUp, Settings, Database } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      return response.json();
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  System administration and management
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                System Online
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {agents?.filter((agent: any) => agent.isActive).length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Currently available</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customers?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
                      <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium">System started</p>
                            <p className="text-muted-foreground">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium">Database connected</p>
                            <p className="text-muted-foreground">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Healthy
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API Server</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Running
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Authentication</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" placeholder="Enter username" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Enter email" />
                        </div>
                      </div>
                      <Button>Create User</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.orders?.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell>{order.senderName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No orders found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input id="siteName" value="LBC Boss Logistics" />
                        </div>
                        <div>
                          <Label htmlFor="timezone">Timezone</Label>
                          <Input id="timezone" value="Asia/Manila" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>System Maintenance</Label>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Database className="w-4 h-4 mr-2" />
                            Backup Database
                          </Button>
                          <Button variant="outline" size="sm">
                            Clear Cache
                          </Button>
                        </div>
                      </div>
                      
                      <Button className="w-full">Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
