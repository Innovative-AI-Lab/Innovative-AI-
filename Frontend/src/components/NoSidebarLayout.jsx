import React from 'react';

const NoSidebarLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0a0b0f] text-zinc-100">
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default NoSidebarLayout;
