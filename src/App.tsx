import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BottomNavigation from "./components/ui/bottom-navigation";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { cn } from "@/lib/utils";
import Landing from "./pages/Landing";
import OnboardingWrapper from "./pages/OnboardingWrapper";
import CommunityDashboard from "./pages/CommunityDashboard";
import Missions from "./pages/Missions";
import MissionDetails from "./pages/MissionDetails";
import Chat from "./pages/Chat";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import CreateMission from "./pages/CreateMission";
import DebugAuth from "./pages/DebugAuth";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideBottomNav =
    location.pathname === "/" ||
    location.pathname === "/onboarding" ||
    location.pathname.startsWith("/chat") ||
    location.pathname === "/login";
  
  return (
    <div className="flex min-h-screen w-full">
      <DesktopSidebar />
      <div className={cn(
        "flex-1 transition-all duration-300",
        isOpen ? "lg:ml-64" : "lg:ml-16"
      )}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/onboarding"
          element={(
            <ProtectedRoute>
              <OnboardingWrapper />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute allowGuest>
              <CommunityDashboard />
            </ProtectedRoute>
          )}
        />
        <Route path="/missions" element={<Missions />} />
        <Route
          path="/missions/:id"
          element={(
            <ProtectedRoute allowGuest>
              <MissionDetails />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/chat"
          element={(
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/chat/:id"
          element={(
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/wallet"
          element={(
            <ProtectedRoute>
              <RoleGuard allowed={["worker", "employer", "admin"]}>
                <Wallet />
              </RoleGuard>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/notifications"
          element={(
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/create-mission"
          element={(
            <ProtectedRoute>
              <RoleGuard allowed={["worker", "employer", "admin"]}>
                <CreateMission />
              </RoleGuard>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
        {!hideBottomNav && <BottomNavigation />}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
