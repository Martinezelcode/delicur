import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Clock, Shield, Calculator, Search } from "lucide-react";

export default function Landing() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shouldTrack, setShouldTrack] = useState(false);

  const { data: trackingData, isLoading: isTracking, error } = useQuery({
    queryKey: ["/api/track", trackingNumber],
    enabled: shouldTrack && trackingNumber.trim().length > 0,
    retry: false,
  });

  const handleTrackPackage = () => {
    if (trackingNumber.trim()) {
      setShouldTrack(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 lbc-bg-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LBC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">LBC Express</h1>
                  <p className="text-xs text-muted-foreground">Nationwide Express Delivery</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-login"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background to-accent py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Fast, Reliable
              <span className="text-primary block">Express Delivery</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              LBC Express delivers your packages safely and quickly across the Philippines and worldwide. 
              Track your shipments in real-time.
            </p>
            
            {/* Package Tracking */}
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Search className="h-5 w-5 text-primary" />
                    <span>Track Your Package</span>
                  </CardTitle>
                  <CardDescription>Enter your tracking number to get real-time updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="LBC-2024-XXXX"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="flex-1"
                      data-testid="input-tracking-number"
                    />
                    <Button 
                      onClick={handleTrackPackage}
                      disabled={isTracking || !trackingNumber.trim()}
                      className="bg-primary hover:bg-primary/90"
                      data-testid="button-track-package"
                    >
                      {isTracking ? "Tracking..." : "Track"}
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="text-sm text-destructive text-center" data-testid="text-tracking-error">
                      Order not found. Please check your tracking number.
                    </div>
                  )}
                  
                  {trackingData && (
                    <div className="bg-muted p-4 rounded-lg" data-testid="card-tracking-result">
                      <h4 className="font-medium text-foreground mb-2">
                        Order: {trackingData.orderNumber}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`status-${trackingData.status} px-2 py-1 rounded-full text-xs font-medium`}>
                            {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Recipient:</span>
                          <span className="text-foreground">{trackingData.recipientName}</span>
                        </div>
                        {trackingData.estimatedDelivery && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Delivery:</span>
                            <span className="text-foreground">
                              {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">Comprehensive logistics solutions for all your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Express Delivery</CardTitle>
                <CardDescription>Fast nationwide delivery within 1-6 days</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Cargo Services</CardTitle>
                <CardDescription>Large shipments and freight forwarding</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>Track your packages every step of the way</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Insurance Coverage</CardTitle>
                <CardDescription>Protect your valuable shipments</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Delivery Coverage</h2>
            <p className="text-xl text-muted-foreground">We deliver nationwide and internationally</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Domestic Delivery</CardTitle>
                <CardDescription>All provinces and cities in the Philippines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">NCR (Metro Manila)</span>
                    <span className="text-muted-foreground">1 day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">North/South Luzon</span>
                    <span className="text-muted-foreground">1-2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Visayas</span>
                    <span className="text-muted-foreground">2-5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Mindanao</span>
                    <span className="text-muted-foreground">3-6 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>International Delivery</CardTitle>
                <CardDescription>Worldwide shipping to over 200 countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">Asia Pacific</span>
                    <span className="text-muted-foreground">3-7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">North America</span>
                    <span className="text-muted-foreground">5-10 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Europe</span>
                    <span className="text-muted-foreground">7-14 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Other Countries</span>
                    <span className="text-muted-foreground">10-21 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 lbc-bg-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">LBC</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">LBC Express</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Your trusted partner for express delivery and logistics solutions
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 LBC Express. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
