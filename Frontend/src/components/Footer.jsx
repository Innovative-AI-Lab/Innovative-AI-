import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">

      {/* Glow Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-brain-fill text-white text-lg"></i>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white">
                  Innovative AI
                </h2>
                <p className="text-xs text-gray-400">v1.0.0</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Build, manage and deploy AI-powered applications faster than ever.
              Your all-in-one development platform.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home", icon: "ri-home-5-line" },
                { href: "/projects", label: "Projects", icon: "ri-folder-line" },
                { href: "/settings", label: "Settings", icon: "ri-settings-3-line" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:translate-x-1"
                  >
                    <i className={link.icon}></i>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* FEATURES */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              {[
                { icon: "ri-robot-2-line", label: "AI Assistant" },
                { icon: "ri-code-s-slash-line", label: "Code Editor" },
                { icon: "ri-terminal-box-line", label: "Terminal" },
                { icon: "ri-cloud-line", label: "Cloud Sync" },
              ].map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                >
                  <i className={f.icon}></i>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT / SOCIAL */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              Connect
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Stay connected with us for updates & features 🚀
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <i className="ri-github-fill text-lg"></i>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              >
                <i className="ri-linkedin-box-fill text-lg"></i>
              </a>

              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-900 transition"
              >
                <i className="ri-twitter-x-line text-lg"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            © {year} Innovative AI. Built with ❤️ for developers.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="hover:text-blue-500 cursor-pointer">Privacy</span>
            <span className="hover:text-blue-500 cursor-pointer">Terms</span>
            <span className="hover:text-blue-500 cursor-pointer">Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;