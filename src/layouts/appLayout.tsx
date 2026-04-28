import Sidebar from "./Sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Scroll Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Page container */}
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;