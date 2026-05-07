import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MarvelPage from './pages/MarvelPage';
import DCPage from './pages/DCPage';
import HeroDetail from './pages/HeroDetail';
import NewHero from './pages/NewHero';
import EditHero from './pages/EditHero';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content container" style={{ padding: '2rem 1.5rem', minHeight: 'calc(100vh - 70px)' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marvel" element={<MarvelPage />} />
              <Route path="/dc" element={<DCPage />} />
              <Route path="/hero/:id" element={<HeroDetail />} />
              <Route path="/new" element={<NewHero />} />
              <Route path="/edit/:id" element={<EditHero />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
