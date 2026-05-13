import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import MouseGlow from './components/MouseGlow';
import Home from './pages/Home';
import Courts from './pages/Courts';
import CourtDetails from './pages/CourtDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';
import BookingHistory from './pages/BookingHistory';
import PlayerProfile from './pages/PlayerProfile';
import OwnerPortal from './pages/OwnerPortal';
import AdminPanel from './pages/AdminPanel';
import Playpals from './pages/Playpals';
import Tournaments from './pages/Tournaments';
import Notifications from './pages/Notifications';
import HowItWorks from './pages/HowItWorks';

function AppContent() {
  const { currentPage } = useApp();

  const noNavFooterPages = ['login', 'signup'];
  const showNavFooter = !noNavFooterPages.includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'courts': return <Courts />;
      case 'court-details': return <CourtDetails />;
      case 'login': return <Login />;
      case 'signup': return <Signup />;
      case 'payment': return <Payment />;
      case 'booking-history': return <BookingHistory />;
      case 'player-profile': return <PlayerProfile />;
      case 'owner-portal': return <OwnerPortal />;
      case 'admin-panel': return <AdminPanel />;
      case 'playpals': return <Playpals />;
      case 'tournaments': return <Tournaments />;
      case 'notifications': return <Notifications />;
      case 'how-it-works': return <HowItWorks />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <ScrollProgress />
      <MouseGlow />
      {showNavFooter && <Navbar />}
      <main className="relative z-10">{renderPage()}</main>
      {showNavFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
