
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Clock, Shield, Calculator, Search, Star, Users, MapPin } from "lucide-react";

// Type for the tracking response
type TrackingResponse = {
  orderNumber: string;
  status: string;
  recipientName: string;
  estimatedDelivery?: string;
  trackingHistory?: Array<{
    id: string;
    orderId: string;
    status: string;
    location?: string;
    notes?: string;
    timestamp: string;
  }>;
};

export default function Landing() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shouldTrack, setShouldTrack] = useState(false);

  const { data: trackingData, isLoading: isTracking, error } = useQuery<TrackingResponse>({
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
      <header className="bg-white shadow-sm border-b border-border fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/attached_assets/icon (2)_1756565780804.png" 
                  alt="LBC Express Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-foreground">LBC Express</h1>
                  <p className="text-xs text-muted-foreground">Express Courier, Cargo, and Money Remittance</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#tracking" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="link-tracking"
              >
                Tracking
              </a>
              <a 
                href="#services" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="link-services"
              >
                Services
              </a>
              <a 
                href="#coverage" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('coverage')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="link-coverage"
              >
                Coverage
              </a>
              <a 
                href="#rates" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('rates')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="link-rates"
              >
                Rates
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="link-testimonials"
              >
                Testimonials
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="tracking"
        className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden pt-16"
        style={{
          backgroundImage: `url('/lbcboss-spot-d.jpg')`
        }}
      >
        <div className="relative min-h-screen flex items-center justify-start">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="space-y-8">
                <div className="space-y-6">
                  {/* Hero content can be added here if needed */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Truck */}
        <div className="absolute bottom-8 right-8 bg-red-600 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3">
            <Truck className="h-10 w-10 text-white" />
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">LBC</span>
            </div>
          </div>
        </div>
        
        {/* Package Tracking Card */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 max-w-md w-full px-4">
          <Card className="shadow-xl border-2 border-red-100">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Track Your Package</span>
              </CardTitle>
              <CardDescription className="text-red-100">
                Enter your tracking number to get real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="LBC-2024-XXXX"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 border-red-200 focus:border-red-500"
                  data-testid="input-tracking-number"
                />
                <Button 
                  onClick={handleTrackPackage}
                  disabled={isTracking || !trackingNumber.trim()}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-track-package"
                >
                  {isTracking ? "Tracking..." : "Track"}
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg" data-testid="text-tracking-error">
                  Order not found. Please check your tracking number.
                </div>
              )}
              
              {trackingData && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-testid="card-tracking-result">
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
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">Comprehensive logistics solutions for all your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow border-red-100 hover:border-red-200">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Express Delivery</CardTitle>
                <CardDescription>Fast nationwide delivery within 1-6 days</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-red-100 hover:border-red-200">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Cargo Services</CardTitle>
                <CardDescription>Large shipments and freight forwarding</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-red-100 hover:border-red-200">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Real-time Tracking</CardTitle>
                <CardDescription>Track your packages every step of the way</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-red-100 hover:border-red-200">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Insurance Coverage</CardTitle>
                <CardDescription>Protect your valuable shipments</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-4">Delivery Coverage</h2>
            <p className="text-xl text-red-600">We deliver nationwide and internationally</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Domestic Delivery</CardTitle>
                <CardDescription>All provinces and cities in the Philippines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">NCR (Metro Manila)</span>
                    <span className="text-red-600 font-semibold">1 day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">North/South Luzon</span>
                    <span className="text-red-600 font-semibold">1-2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Visayas</span>
                    <span className="text-red-600 font-semibold">2-5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Mindanao</span>
                    <span className="text-red-600 font-semibold">3-6 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">International Delivery</CardTitle>
                <CardDescription>Worldwide shipping to over 200 countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">Asia Pacific</span>
                    <span className="text-red-600 font-semibold">3-7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">North America</span>
                    <span className="text-red-600 font-semibold">5-10 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Europe</span>
                    <span className="text-red-600 font-semibold">7-14 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Other Countries</span>
                    <span className="text-red-600 font-semibold">10-21 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/attached_assets/icon (2)_1756565780804.png" 
                alt="LBC Express Logo" 
                className="w-12 h-12 object-contain bg-white rounded-lg p-1"
              />
              <div className="text-left">
                <h3 className="text-xl font-bold">LBC Express</h3>
                <p className="text-red-200 text-sm">Express Courier, Cargo, and Money Remittance</p>
              </div>
            </div>
            <p className="text-red-100 mb-4">
              Your trusted partner for express delivery and logistics solutions
            </p>
            <p className="text-sm text-red-200">
              © 2024 LBC Express. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
