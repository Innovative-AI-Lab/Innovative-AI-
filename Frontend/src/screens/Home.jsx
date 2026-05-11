import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "../config/axios";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../hooks/useToast";
import { BRAND } from "../constants";
import Toast from "../components/common/Toast";
import CreateModal from "../components/common/CreateModal";
import DashboardView from "../components/home/DashboardView";
import ProjectsView from "../components/home/ProjectsView";
import AIStudioView from "../components/home/AIStudioView";
import ActivityView from "../components/home/ActivityView";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const { user, token, logout } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast } = useToast();
  const location = useLocation();

  const activeId = location.pathname.substring(1) || "dashboard";

  /* ================= TOKEN LOGIN ================= */
  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("ai_token", token);
        window.history.replaceState({}, "", "/");
        addToast(`Welcome to ${BRAND.name}!`);
      } catch (e) {}
    }
  }, [searchParams]);

  /* ================= PROJECT FETCH ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setFetching(true);

    axios
      .get("/projects")
      .then((res) => setProjects(res.data.data || []))
      .catch(() => addToast("Failed to load projects", "error"))
      .finally(() => setFetching(false));
  }, [token]);

  /* ================= SMART NOTIFICATIONS ================= */
  useEffect(() => {
    if (!token) return;

    let interval;

    const fetchNotifications = () => {
      axios.get("/notifications?limit=10").then((res) => {
        if (res.data.success) setNotifications(res.data.data.notifications || res.data.notifications || []);
      });

      axios.get("/notifications/unread-count").then((res) => {
        if (res.data.success) setUnreadCount(res.data.data.count || res.data.count || 0);
      });
    };

    fetchNotifications();

    interval = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  /* ================= HANDLERS ================= */
  const handleProjectCreated = (p) => {
    setProjects((prev) => [...prev, p]);
    addToast(`"${p.name}" created`);
    navigate("/projects");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenProject = (p) =>
    navigate(`/project/${p._id}`, { state: { project: p } });

  /* ================= DATA ================= */
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Developer";

  const totalMembers = projects.reduce(
    (t, p) => t + (p.users?.length || 0),
    0
  );

  const sharedProps = {
    projects,
    fetching,
    displayName,
    onOpenModal: () => setIsModalOpen(true),
    onProjectClick: handleOpenProject,
    onProjectUpdated: setProjects,
    totalMembers,
    addToast,
    user,
  };

  /* ================= PAGE RENDER ================= */
  const renderPage = () => {
    switch (activeId) {
      case "dashboard":
        return <DashboardView {...sharedProps} />;
      case "projects":
        return <ProjectsView {...sharedProps} />;
      case "ai-studio":
        return <AIStudioView user={user} />;
      case "activity":
        return (
          <ActivityView
            projects={projects}
            displayName={displayName}
          />
        );
      default:
        return <DashboardView {...sharedProps} />;
    }
  };

  /* ================= UI ================= */
  return (
    <div className="flex min-h-screen bg-[#0a0b0f] text-zinc-100">

      {/* SIDEBAR */}
      <Sidebar
        activeId={activeId}
        onNewProject={() => setIsModalOpen(true)}
        displayName={displayName}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* MOBILE HEADER */}
        <header className="lg:hidden h-16 border-b border-white/[0.06] flex items-center justify-between px-4 bg-[#0a0b0f] shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
              IA
            </div>
            <span className="font-bold text-sm tracking-tight">{BRAND.name}</span>
          </div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-white transition-colors relative"
          >
            <i className="ri-notification-3-line text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0a0b0f]"></span>
            )}
          </button>
        </header>

        {/* DESKTOP NOTIFICATION & SEARCH BAR */}
        <div className="hidden lg:flex justify-end p-6 lg:px-8 pb-0 relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all group"
          >
            <i className="ri-notification-3-line text-xl text-zinc-400 group-hover:text-white transition-colors"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-[#0a0b0f]"></span>
            )}
          </button>

          {/* DROPDOWN */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-20 right-8 w-80 bg-[#121318] border border-white/[0.08] rounded-2xl shadow-2xl p-4 z-[90] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-zinc-100">Notifications</h3>
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{unreadCount} New</span>
                </div>
                
                <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <i className="ri-notification-off-line text-3xl text-zinc-700 mb-2 block"></i>
                      <p className="text-xs text-zinc-500">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 hover:bg-white/[0.03] rounded-xl transition-all cursor-pointer group">
                        <p className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-zinc-600 mt-1 block">Just now</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PAGE CONTENT CONTAINER */}
        <div className={`flex-1 flex flex-col ${activeId === 'ai-studio' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-6 lg:p-8'} custom-scrollbar relative`}>

        {/* PAGE CONTENT */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {fetching ? (
              <div className="space-y-3">
                <div className="h-4 w-40 bg-gray-700 animate-pulse rounded"></div>
                <div className="h-4 w-28 bg-gray-700 animate-pulse rounded"></div>
              </div>
            ) : (
              renderPage()
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateModal
            onClose={() => setIsModalOpen(false)}
            onCreated={handleProjectCreated}
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default Home;
