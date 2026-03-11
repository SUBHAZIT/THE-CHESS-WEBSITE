import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Players from "./pages/Players";
import Teams from "./pages/Teams";
import TournamentSetup from "./pages/TournamentSetup";
import Rounds from "./pages/Rounds";
import Leaderboard from "./pages/Leaderboard";
import Knockout from "./pages/Knockout";
import ProjectorMode from "./pages/ProjectorMode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/projector" element={<ProjectorMode />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/players" element={<Players />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/tournament" element={<TournamentSetup />} />
                <Route path="/rounds" element={<Rounds />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/knockout" element={<Knockout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
