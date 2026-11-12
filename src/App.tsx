import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { CrmView } from './components/views/CrmView';
import { HrmsView } from './components/views/HrmsView';
import { ProjectsView } from './components/views/ProjectsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { SettingsView } from './components/views/SettingsView';
import type { NavigationTab } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'crm':
        return <CrmView />;
      case 'hrms':
        return <HrmsView />;
      case 'projects':
        return <ProjectsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai-assistant':
        return <AiAssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
