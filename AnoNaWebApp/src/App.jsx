// App.jsx - Add the CategorySelect route
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import CategorySelect from './pages/CategorySelect';
import CreatePoll from './pages/CreatePoll';
import Vote from './pages/Vote';
import Waiting from './pages/Waiting';
import Result from './pages/Result';
import Share from './pages/Share';
import CreatePullEvent from './pages/CreatePullEvent';
import PullShare from './pages/PullShare';
import PullReveal from './pages/PullReveal';
import PullOrganizer from './pages/PullOrganizer';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 1500, 
          style: { 
            background: '#1B4D3E', 
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontFamily: "'Inter', system-ui, sans-serif"
          } 
        }} 
      />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/category" element={<CategorySelect />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<Vote />} />
          <Route path="/waiting/:id" element={<Waiting />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/share/:id" element={<Share />} />
          <Route path="/pull/create" element={<CreatePullEvent />} />
          <Route path="/pull/share/:id" element={<PullShare />} />
          <Route path="/pull/:id" element={<PullReveal />} />
          <Route path="/pull/organizer/:id" element={<PullOrganizer />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;