// App.jsx - Add the CategorySelect route
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import CreatePoll from './pages/CreatePoll';
import Vote from './pages/PollVote';
import Waiting from './pages/PollWaiting';
import Result from './pages/PollResult';
import Share from './pages/PollShare';
import CreateDrawEvent from './pages/CreateDrawEvent';
import DrawShare from './pages/DrawShare';
import DrawReveal from './pages/DrawReveal';
import DrawOrganizer from './pages/DrawOrganizer';

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
          <Route path="/poll/create" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<Vote />} />
          <Route path="/poll/waiting/:id" element={<Waiting />} />
          <Route path="/poll/result/:id" element={<Result />} />
          <Route path="/poll/share/:id" element={<Share />} />
          <Route path="/draw/create" element={<CreateDrawEvent />} />
          <Route path="/draw/share/:id" element={<DrawShare />} />
          <Route path="/draw/:id" element={<DrawReveal />} />
          <Route path="/draw/organizer/:id" element={<DrawOrganizer />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;