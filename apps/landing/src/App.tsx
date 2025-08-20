import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import IndividualsPage from "./pages/IndividualsPage";
import BusinessPage from "./pages/BusinessPage";
import ApplicationPage from "./pages/ApplicationPage";
import JobsPage from "./pages/JobsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { Suspense, lazy } from "react";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/shared/ScrollToTop";

const queryClient = new QueryClient();

const DemoPageLazy = lazy(() => import("./pages/DemoPage"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<IndividualsPage />} />
          <Route path="/mission" element={<HomePage />} />
          <Route path="/enterprise" element={<BusinessPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
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
