import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Package, MapPin, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RateCalculator() {
  const [fromRegion, setFromRegion] = useState("");
  const [toRegion, setToRegion] = useState("");
  const [weight, setWeight] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [packageType, setPackageType] = useState("");
  const [calculatedRate, setCalculatedRate] = useState<{ rate: number; estimatedDays: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const regions = [
    { value: "NCR", label: "NCR (Metro Manila)" },
    { value: "NORTH LUZON", label: "North Luzon" },
    { value: "SOUTH LUZON", label: "South Luzon" },
    { value: "VISAYAS", label: "Visayas" },
    { value: "MINDANAO", label: "Mindanao" },
  ];

  const serviceTypes = [
    { value: "express", label: "Express" },
    { value: "regular", label: "Regular" },
    { value: "economy", label: "Economy" },
  ];

  const packageTypes = [
    { value: "document", label: "Document" },
    { value: "package", label: "Package" },
    { value: "parcel", label: "Parcel" },
    { value: "cargo", label: "Cargo" },
  ];

  const handleCalculate = async () => {
    if (!fromRegion || !toRegion || !weight || !serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiRequest("POST", "/api/calculate-rate", {
        fromRegion,
        toRegion,
        weight: weightNum,
        serviceType,
      });
      const rateData = await response.json();
      setCalculatedRate(rateData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate shipping rate",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setFromRegion("");
    setToRegion("");
    setWeight("");
    setServiceType("");
    setPackageType("");
    setCalculatedRate(null);
  };

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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Rate Calculator</h1>
              <p className="text-muted-foreground">Calculate shipping rates and delivery times</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span>Shipping Calculator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Origin and Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-region">From Region</Label>
                      <Select value={fromRegion} onValueChange={setFromRegion}>
                        <SelectTrigger data-testid="select-from-region">
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="to-region">To Region</Label>
                      <Select value={toRegion} onValueChange={setToRegion}>
                        <SelectTrigger data-testid="select-to-region">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="package-type">Package Type</Label>
                      <Select value={packageType} onValueChange={setPackageType}>
                        <SelectTrigger data-testid="select-package-type">
                          <SelectValue placeholder="Select package type" />
                        </SelectTrigger>
                        <SelectContent>
                          {packageTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        data-testid="input-weight"
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="service-type">Service Type</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <Button 
                      onClick={handleCalculate}
                      disabled={isCalculating}
                      className="bg-primary hover:bg-primary/90 flex-1"
                      data-testid="button-calculate-rate"
                    >
                      {isCalculating ? "Calculating..." : "Calculate Rate"}
                    </Button>
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                {calculatedRate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span>Shipping Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <span className="text-lg font-medium text-foreground">Shipping Rate</span>
                          <span className="text-2xl font-bold text-primary" data-testid="text-calculated-rate">
                            ₱{calculatedRate.rate.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Delivery Time</span>
                          </div>
                          <span className="text-sm font-medium text-foreground" data-testid="text-delivery-time">
                            {calculatedRate.estimatedDays} days
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">From:</span>
                            <p className="font-medium text-foreground">{fromRegion}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To:</span>
                            <p className="font-medium text-foreground">{toRegion}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weight:</span>
                            <p className="font-medium text-foreground">{weight} kg</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Service:</span>
                            <p className="font-medium text-foreground capitalize">{serviceType}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rate Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Delivery Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Service Types</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Express</span>
                            <span className="text-foreground">Fastest delivery</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Regular</span>
                            <span className="text-foreground">Standard delivery</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Economy</span>
                            <span className="text-foreground">Budget-friendly</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Coverage Areas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">NCR</span>
                            <span className="text-foreground">1 day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">North/South Luzon</span>
                            <span className="text-foreground">1-2 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Visayas</span>
                            <span className="text-foreground">2-5 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mindanao</span>
                            <span className="text-foreground">3-6 days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
