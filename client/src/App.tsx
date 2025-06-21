
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLookupData } from "@/hooks/useLookupData";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch } from "@/store/store";
import { fetchProducts } from "@/store/slices/productSlice";
import { fetchModules } from "@/store/slices/moduleSlice";
import { fetchUsers } from "@/store/slices/userSlice";
import { fetchTestSuites } from "@/store/slices/testSlice";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isLoading: lookupLoading } = useLookupData();
  const dispatch = useDispatch<AppDispatch>();

  // Immediately fetch Products, Modules, Users, and Test Suites when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      dispatch(fetchProducts());
      dispatch(fetchModules());
      dispatch(fetchUsers());
      dispatch(fetchTestSuites());
    }
  }, [isAuthenticated, isLoading, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Test Management System
              </h1>
              {user && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.tenant.name} - {user.fullName}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main>
        <Switch>
          <Route path="/" component={Index} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AuthenticatedApp />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
