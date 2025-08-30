import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shouldTrack, setShouldTrack] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: trackingData, isLoading: isTracking, error } = useQuery({
    queryKey: ["/api/track", trackingNumber],
    enabled: shouldTrack && trackingNumber.trim().length > 0,
    retry: false,
  });

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShouldTrack(true);
    }
  };

  const handleReset = () => {
    setTrackingNumber("");
    setShouldTrack(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "in-transit":
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "in-transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // For non-authenticated users, show simple tracking interface
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header for Public */}
        <header className="bg-white shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 lbc-bg-red rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">LBC</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">LBC Express</h1>
                    <p className="text-xs text-muted-foreground">Package Tracking</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Package</h1>
            <p className="text-muted-foreground">Enter your tracking number to get real-time updates</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex space-x-4 mb-6">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., LBC-2024-XXXX)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1"
                  data-testid="input-tracking-number"
                />
                <Button 
                  onClick={handleTrack}
                  disabled={isTracking || !trackingNumber.trim()}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-track"
                >
                  {isTracking ? "Tracking..." : "Track"}
                </Button>
              </div>

              {error && (
                <div className="text-center py-8" data-testid="text-tracking-error">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Order Not Found</h3>
                  <p className="text-muted-foreground">
                    Please check your tracking number and try again.
                  </p>
                </div>
              )}

              {trackingData && (
                <div className="space-y-6" data-testid="card-tracking-result">
                  {/* Order Summary */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Order: {trackingData.orderNumber}
                      </h3>
                      <Badge className={getStatusColor(trackingData.status)}>
                        {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Recipient:</span>
                        <p className="font-medium text-foreground">{trackingData.recipientName}</p>
                      </div>
                      {trackingData.estimatedDelivery && (
                        <div>
                          <span className="text-muted-foreground">Est. Delivery:</span>
                          <p className="font-medium text-foreground">
                            {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking History */}
                  {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-foreground mb-4">Tracking History</h4>
                      <div className="space-y-4">
                        {trackingData.trackingHistory.map((entry, index) => (
                          <div key={entry.id || index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getStatusIcon(entry.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {entry.status.replace('-', ' ')}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {entry.location && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {entry.location}
                                </p>
                              )}
                              {entry.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {trackingNumber && !error && !trackingData && !isTracking && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Click "Track" to check your package status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // For authenticated users, show admin interface
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Package Tracking</h1>
              <p className="text-muted-foreground">Track packages and view detailed delivery information</p>
            </div>

            {/* Tracking Search */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Track Package</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Input
                    type="text"
                    placeholder="Enter tracking number (e.g., LBC-2024-XXXX)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1"
                    data-testid="input-admin-tracking-number"
                  />
                  <Button 
                    onClick={handleTrack}
                    disabled={isTracking || !trackingNumber.trim()}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-admin-track"
                  >
                    {isTracking ? "Tracking..." : "Track"}
                  </Button>
                  {(trackingData || error) && (
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      data-testid="button-admin-reset"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {error && (
              <Card>
                <CardContent className="p-8 text-center" data-testid="text-admin-tracking-error">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Order Not Found</h3>
                  <p className="text-muted-foreground">
                    The tracking number you entered could not be found in our system.
                  </p>
                </CardContent>
              </Card>
            )}

            {trackingData && (
              <div className="space-y-6" data-testid="card-admin-tracking-result">
                {/* Order Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Order Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Order Number:</span>
                            <p className="font-medium text-foreground">{trackingData.orderNumber}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(trackingData.status)}>
                              {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Recipient</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium text-foreground">{trackingData.recipientName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Delivery</h4>
                        <div className="space-y-2 text-sm">
                          {trackingData.estimatedDelivery && (
                            <div>
                              <span className="text-muted-foreground">Est. Delivery:</span>
                              <p className="font-medium text-foreground">
                                {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tracking Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {trackingData.trackingHistory.map((entry, index) => (
                          <div key={entry.id || index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {getStatusIcon(entry.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-foreground capitalize">
                                  {entry.status.replace('-', ' ')}
                                </h4>
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
                                <p className="text-sm text-muted-foreground">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
