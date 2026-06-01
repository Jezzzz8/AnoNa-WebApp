import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Illustration from '../components/Illustration';
import FloatingBackButton from '../components/FloatingBackButton';

export default function PullShare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/pull/${id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: 'PullNa Event', url: link });
    } else copyLink();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="flex flex-col items-center justify-center px-6 py-12 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto bg-[#E9F5E8] rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-[#52B788]" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent">Event Created!</h2>
          <p className="text-[#84A98C] text-sm">Share this link with participants</p>
          <Illustration type="groupChat" size="md" className="my-2" />
          <div className="bg-white p-5 rounded-2xl flex justify-center shadow-md border border-[#D8F3DC]">
            <QRCodeSVG value={link} size={180} bgColor="#FFFFFF" fgColor="#1B4D3E" level="H" />
          </div>
          <div className="bg-white rounded-xl p-3 flex items-center justify-between gap-2 border border-[#D8F3DC]">
            <span className="text-[#52796F] text-xs truncate flex-1">{link}</span>
            <button onClick={copyLink} className="p-2 bg-[#E9F5E8] rounded-xl">
              {copied ? <CheckCircle size={16} className="text-[#52B788]" /> : <Copy size={16} />}
            </button>
          </div>
          <button onClick={shareNative} className="w-full py-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-white rounded-xl flex items-center justify-center gap-2">
            <Share2 size={18} /> Send to Chat
          </button>
        </motion.div>
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}