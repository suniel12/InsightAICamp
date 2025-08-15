import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import IndividualsPage from "./pages/IndividualsPage";
import BusinessPage from "./pages/BusinessPage";
import ApplicationPage from "./pages/ApplicationPage";
import { Suspense, lazy } from "react";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DemoPageLazy = lazy(() => import("./pages/DemoPage"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/individuals" element={<IndividualsPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route
            path="/demo"
            element={
              <Suspense
                fallback={
                  <div
                    className="min-h-screen flex items-center justify-center text-slate-300"
                    role="status"
                    aria-live="polite"
                  >
                    Loading demo…
                  </div>
                }
              >
                <DemoPageLazy />
              </Suspense>
            }
          />
          <Route
            path="/demo/:id"
            element={
              <Suspense
                fallback={
                  <div
                    className="min-h-screen flex items-center justify-center text-slate-300"
                    role="status"
                    aria-live="polite"
                  >
                    Loading demo…
                  </div>
                }
              >
                <DemoPageLazy />
              </Suspense>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
