'use client';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

function AppContent({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontSize: '16px',
      }}>
        Loading...
      </div>
    );
  }

  // If no user, just render children (login/register pages)
  if (!user) {
    return <>{children}</>;
  }

  // If user is logged in, show app layout
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>UniPlanner — Academic Workload Manager</title>
        <meta name="description" content="Manage your university modules, track assignments, visualize deadlines, and monitor academic progress." />
      </head>
      <body>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
