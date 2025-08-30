import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, MapPin, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RateCalculatorProps {
  onRateCalculated?: (rate: { rate: number; estimatedDays: string }) => void;
  className?: string;
}

export default function RateCalculator({ onRateCalculated, className }: RateCalculatorProps) {
  const [fromRegion, setFromRegion] = useState("");
  const [toRegion, setToRegion] = useState("");
  const [weight, setWeight] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [calculatedRate, setCalculatedRate] = useState<{ rate: number; estimatedDays: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
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
      onRateCalculated?.(rateData);
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
    setCalculatedRate(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Rate Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-region">From Region</Label>
            <Select value={fromRegion} onValueChange={setFromRegion}>
              <SelectTrigger data-testid="select-calc-from-region">
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
              <SelectTrigger data-testid="select-calc-to-region">
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

        {/* Weight and Service Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              data-testid="input-calc-weight"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service-type">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger data-testid="select-calc-service-type">
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-4">
          <Button 
            onClick={handleCalculate}
            disabled={isCalculating}
            className="bg-primary hover:bg-primary/90 flex-1"
            data-testid="button-calc-calculate"
          >
            {isCalculating ? "Calculating..." : "Calculate Rate"}
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            data-testid="button-calc-reset"
          >
            Reset
          </Button>
        </div>

        {/* Results */}
        {calculatedRate && (
          <div className="mt-4 p-4 bg-muted rounded-lg" data-testid="card-calc-result">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Shipping Rate:</span>
              <span className="text-lg font-bold text-primary">
                ₱{calculatedRate.rate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Delivery Time:</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {calculatedRate.estimatedDays} days
              </span>
            </div>
            
            {fromRegion && toRegion && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{fromRegion} → {toRegion}</span>
                  </div>
                  <span className="capitalize">{serviceType}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
