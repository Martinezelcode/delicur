import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Orders from "@/pages/orders";
import CreateOrder from "@/pages/create-order";
import Customers from "@/pages/customers";
import Agents from "@/pages/agents";
import RateCalculator from "@/pages/rate-calculator";
import Tracking from "@/pages/tracking";
import Reports from "@/pages/reports";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/track/:orderNumber?" component={Tracking} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/orders" component={Orders} />
          <Route path="/create-order" component={CreateOrder} />
          <Route path="/customers" component={Customers} />
          <Route path="/agents" component={Agents} />
          <Route path="/rate-calculator" component={RateCalculator} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/reports" component={Reports} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
