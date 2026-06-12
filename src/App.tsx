import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AIAssistant } from '@/components/AIAssistant';
import { RecordModal } from '@/components/RecordModal';
import { HomePage } from '@/sections/HomePage';
import { RecordPage } from '@/sections/RecordPage';
import { AnalysisPage } from '@/sections/AnalysisPage';
import { ReportPage } from '@/sections/ReportPage';
import { ProfilePage } from '@/sections/ProfilePage';
import { PrivacyPage } from '@/sections/PrivacyPage';
import { PersonalProfilePage } from '@/sections/PersonalProfilePage';
import { NotificationsPage } from '@/sections/NotificationsPage';
import { HelpCenterPage } from '@/sections/HelpCenterPage';
import { AboutPage } from '@/sections/AboutPage';
import { FeedbackPage } from '@/sections/FeedbackPage';
import { SearchPage } from '@/sections/SearchPage';
import { WaterTrackerPage } from '@/sections/WaterTrackerPage';
import { FiberTrackerPage } from '@/sections/FiberTrackerPage';
import { HospitalPage } from '@/sections/HospitalPage';
import { HealthScoreDetailPage } from '@/sections/HealthScoreDetailPage';
import { AuthFlow } from '@/sections/auth/AuthFlow';
import { OnboardingPage } from '@/sections/auth/OnboardingPage';
import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { TabType } from '@/types';

type SubPage =
  | 'privacy'
  | 'personal'
  | 'notifications'
  | 'help'
  | 'about'
  | 'feedback'
  | 'search'
  | 'water'
  | 'fiber'
  | 'hospital'
  | 'health-score'
  | 'privacy-policy'
  | null;

function MainApp() {
  const auth = useAuth();
  const {
    currentTab,
    setCurrentTab,
    user,
    records,
    reminders,
    friendPosts,
    postComments,
    gutPet,
    healthData,
    aiMessages,
    isDarkMode,
    unreadCount,
    addRecord,
    toggleReminder,
    toggleLike,
    sendPaperGift,
    addComment,
    sendAIMessage,
    toggleDarkMode,
  } = useAppState({
    userId: auth.userId,
    enabled: auth.isInApp,
    authProfile: auth.profile,
    userEmail: auth.email,
  });

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(null);

  const handleAddRecord = (record: Parameters<typeof addRecord>[0]) => {
    addRecord(record);
    toast.success('记录成功！', {
      description: '继续保持良好的排便习惯',
    });
    setIsRecordModalOpen(false);
  };

  const handleNotificationClick = () => {
    navigateToSubPage('notifications');
  };

  const handleSearchClick = () => {
    navigateToSubPage('search');
  };

  const navigateToSubPage = (page: SubPage) => {
    setSubPage(page);
  };

  const handleBackFromSubPage = () => {
    setSubPage(null);
  };

  const handleToolClick = (tool: string) => {
    switch (tool) {
      case 'water':
        navigateToSubPage('water');
        break;
      case 'fiber':
        navigateToSubPage('fiber');
        break;
      case 'hospital':
        navigateToSubPage('hospital');
        break;
      case 'privacy':
        navigateToSubPage('privacy');
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setSubPage(null);
    setCurrentTab(tab);
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast.info('已退出登录', { description: '期待你再次回来' });
    setSubPage(null);
  };

  const renderSubPage = () => {
    switch (subPage) {
      case 'privacy':
        return <PrivacyPage onBack={handleBackFromSubPage} />;
      case 'personal':
        return (
          <PersonalProfilePage
            onBack={handleBackFromSubPage}
            user={user}
            onSaveProfile={auth.updateUserProfile}
            onProfileUpdated={auth.refreshProfile}
          />
        );
      case 'notifications':
        return <NotificationsPage onBack={handleBackFromSubPage} />;
      case 'help':
        return <HelpCenterPage onBack={handleBackFromSubPage} />;
      case 'about':
        return <AboutPage onBack={handleBackFromSubPage} />;
      case 'feedback':
        return <FeedbackPage onBack={handleBackFromSubPage} />;
      case 'search':
        return <SearchPage onBack={handleBackFromSubPage} records={records} />;
      case 'water':
        return <WaterTrackerPage onBack={handleBackFromSubPage} />;
      case 'fiber':
        return <FiberTrackerPage onBack={handleBackFromSubPage} />;
      case 'hospital':
        return <HospitalPage onBack={handleBackFromSubPage} />;
      case 'health-score':
        return (
          <HealthScoreDetailPage
            onBack={handleBackFromSubPage}
            records={records}
            healthScore={user.healthScore}
            previousScore={80}
            onNavigateToHelp={() => navigateToSubPage('help')}
          />
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            user={user}
            reminders={reminders}
            friendPosts={friendPosts}
            postComments={postComments}
            gutPet={gutPet}
            onToggleReminder={toggleReminder}
            onToggleLike={toggleLike}
            onSendPaper={sendPaperGift}
            onAddComment={addComment}
            onAddRecord={() => setIsRecordModalOpen(true)}
            onViewCalendar={() => {
              setCurrentTab('record');
            }}
            onViewHealthDetails={() => navigateToSubPage('health-score')}
            onToolClick={handleToolClick}
          />
        );
      case 'record':
        return <RecordPage records={records} onAddRecord={handleAddRecord} />;
      case 'analysis':
        return <AnalysisPage healthData={healthData} records={records} onViewHealthDetails={() => navigateToSubPage('health-score')} />;
      case 'report':
        return <ReportPage user={user} records={records} />;
      case 'profile':
        return (
          <ProfilePage
            user={user}
            records={records}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onNavigateToPersonal={() => navigateToSubPage('personal')}
            onNavigateToNotifications={() => navigateToSubPage('notifications')}
            onNavigateToPrivacy={() => navigateToSubPage('privacy')}
            onNavigateToHelp={() => navigateToSubPage('help')}
            onNavigateToAbout={() => navigateToSubPage('about')}
            onNavigateToFeedback={() => navigateToSubPage('feedback')}
            onNavigateToHealthScore={() => navigateToSubPage('health-score')}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  const appChrome = (
    <>
      <div className="app-shell">
        <div className="app-shell-content">
          {subPage ? (
            renderSubPage()
          ) : (
            <>
              <Header
                userName={user.name}
                userAvatar={user.avatar}
                unreadCount={unreadCount}
                onNotificationClick={handleNotificationClick}
                onSearchClick={handleSearchClick}
              />
              <main className="px-4 py-4 page-enter">
                {renderMainContent()}
              </main>
            </>
          )}
        </div>

        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
      </div>

      <AIAssistant
        messages={aiMessages}
        onSendMessage={sendAIMessage}
        userAvatar={user.avatar}
      />

      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleAddRecord}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--app-card)',
            color: 'var(--app-text)',
          },
        }}
      />
    </>
  );

  if (auth.needsOnboarding && auth.authScreen === 'onboarding') {
    return (
      <>
        <OnboardingPage
          email={auth.email}
          avatarUrl={auth.profile?.avatarUrl}
          onComplete={auth.saveOnboarding}
        />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--app-card)',
              color: 'var(--app-text)',
            },
          }}
        />
      </>
    );
  }

  return appChrome;
}

function App() {
  const auth = useAuth();

  return (
    <div className="app-viewport">
      {auth.isLoading || !auth.isInApp ? <AuthFlow /> : <MainApp />}
    </div>
  );
}

export default App;
