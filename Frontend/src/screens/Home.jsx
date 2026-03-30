import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
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
        localStorage.setItem("token", token);
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
        if (res.data.success) setNotifications(res.data.notifications);
      });

      axios.get("/notifications/unread-count").then((res) => {
        if (res.data.success) setUnreadCount(res.data.count);
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
      />

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">

        {/* 🔔 NOTIFICATION BUTTON */}
        <div className="flex justify-end mb-4 relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1 rounded">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotifications && (
            <div className="absolute top-10 right-0 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-2">
              {notifications.length === 0 && (
                <p className="text-sm text-gray-400">No notifications</p>
              )}

              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-2 hover:bg-gray-800 rounded text-sm"
                >
                  {n.message || "New update"}
                </div>
              ))}
            </div>
          )}
        </div>

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
