import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <i className="ri-brain-fill text-white text-sm"></i>
              </div>
              <span className="font-bold text-gray-800 dark:text-white">Innovative AI</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              AI-powered full stack development platform for modern developers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home', icon: 'ri-home-5-line' },
                { href: '/settings', label: 'Settings', icon: 'ri-settings-3-line' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <i className={link.icon}></i>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Features</h3>
            <ul className="space-y-2">
              {[
                { icon: 'ri-robot-2-line', label: 'AI Assistant' },
                { icon: 'ri-code-s-slash-line', label: 'Code Editor' },
                { icon: 'ri-message-3-line', label: 'Team Chat' },
                { icon: 'ri-terminal-box-line', label: 'Terminal' },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <i className={f.icon}></i>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">&copy; {year} Innovative AI. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <i className="ri-github-fill text-xl"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
              <i className="ri-linkedin-box-fill text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
