import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FileText, Download, TrendingUp, Package, Users, Truck } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", { limit: 100 }],
    retry: false,
  });

  const reportTypes = [
    { value: "orders", label: "Orders Report" },
    { value: "customers", label: "Customers Report" },
    { value: "agents", label: "Agents Performance" },
    { value: "revenue", label: "Revenue Report" },
    { value: "delivery", label: "Delivery Analytics" },
  ];

  const handleGenerateReport = () => {
    // In a real application, this would generate and download the report
    console.log("Generating report:", { reportType, dateRange });
  };

  const handleExportData = () => {
    // In a real application, this would export the data as CSV/PDF
    console.log("Exporting data");
  };

  // Calculate some basic analytics from orders data
  const analytics = ordersData ? {
    totalOrders: ordersData.orders?.length || 0,
    completedOrders: ordersData.orders?.filter(o => o.status === 'delivered').length || 0,
    pendingOrders: ordersData.orders?.filter(o => o.status === 'pending').length || 0,
    inTransitOrders: ordersData.orders?.filter(o => o.status === 'in-transit').length || 0,
    completionRate: ordersData.orders?.length > 0 
      ? ((ordersData.orders.filter(o => o.status === 'delivered').length / ordersData.orders.length) * 100).toFixed(1)
      : 0,
  } : null;

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate detailed reports and analyze business performance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Generation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Generate Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger data-testid="select-report-type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date Range</label>
                    <DatePickerWithRange 
                      date={dateRange}
                      onDateChange={setDateRange}
                    />
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={!reportType}
                      className="w-full bg-primary hover:bg-primary/90"
                      data-testid="button-generate-report"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    
                    <Button 
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full"
                      data-testid="button-export-data"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 w-12 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-orders-report">
                            {stats?.totalOrders || 0}
                          </p>
                        )}
                      </div>
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 w-12 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-foreground" data-testid="text-delivered-orders-report">
                            {stats?.deliveredOrders || 0}
                          </p>
                        )}
                      </div>
                      <Truck className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                        {ordersLoading ? (
                          <Skeleton className="h-6 w-12 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-foreground" data-testid="text-completion-rate">
                            {analytics?.completionRate || 0}%
                          </p>
                        )}
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 w-12 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-foreground" data-testid="text-in-transit-report">
                            {stats?.inTransitOrders || 0}
                          </p>
                        )}
                      </div>
                      <Truck className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : analytics ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Delivered</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(analytics.completedOrders / analytics.totalOrders) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {analytics.completedOrders}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">In Transit</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(analytics.inTransitOrders / analytics.totalOrders) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {analytics.inTransitOrders}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Pending</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full" 
                              style={{ width: `${(analytics.pendingOrders / analytics.totalOrders) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {analytics.pendingOrders}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="text-no-data">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average delivery time</span>
                          <span className="font-medium text-foreground">3.2 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer satisfaction</span>
                          <span className="font-medium text-foreground">4.8/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">On-time delivery</span>
                          <span className="font-medium text-foreground">94%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Regional Distribution</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NCR</span>
                          <span className="font-medium text-foreground">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Visayas</span>
                          <span className="font-medium text-foreground">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mindanao</span>
                          <span className="font-medium text-foreground">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Luzon</span>
                          <span className="font-medium text-foreground">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
