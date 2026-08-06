import { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardPage from './admin/DashboardPage';
import MembersPage from './admin/MembersPage';
import TreePage from './admin/TreePage';
import NeighborsPage from './admin/NeighborsPage';
import SearchPage from './admin/SearchPage';
import SettingsPage from './admin/SettingsPage';

type Page = 'dashboard' | 'members' | 'tree' | 'neighbors' | 'search' | 'settings';

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'members': return <MembersPage />;
      case 'tree': return <TreePage />;
      case 'neighbors': return <NeighborsPage />;
      case 'search': return <SearchPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}
