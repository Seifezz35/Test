import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { AddTripPage } from "@/pages/AddTripPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { TripDetailPage } from "@/pages/TripDetailPage";
import { useAuthStore } from "@/store/authStore";

const AppLayout = () => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    document.documentElement.dataset.theme = user?.profile?.theme ?? "dark";
  }, [user?.profile?.theme]);

  return (
    <div className="mx-auto min-h-screen max-w-md px-0">
      <div className="relative min-h-screen">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

const PublicOnly = () => {
  const { user, accessToken } = useAuthStore();

  if (user || accessToken) {
    return <Navigate to="/" replace />;
  }

  return <AuthPage />;
};

export const App = () => {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<PublicOnly />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="trips/new" element={<AddTripPage />} />
            <Route path="trips/:id/edit" element={<AddTripPage />} />
            <Route path="trips/:id" element={<TripDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
