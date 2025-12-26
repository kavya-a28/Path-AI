import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  // Dummy notification data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Task Completed',
      message: 'You finished "React Hooks" module.',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'alert',
      title: 'Daily Goal Risk',
      message: 'You are 30 mins behind schedule.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'New Resource',
      message: 'Added: Advanced System Design PDF.',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'milestone',
      title: 'Level Up!',
      message: 'You reached Level 5. Keep it up!',
      time: 'Yesterday',
      read: true
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'milestone': return <Star className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={onClose} 
          />
          
          {/* Dropdown Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 right-10 z-50 w-96 bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Notifications</h3>
                  <p className="text-xs text-slate-500 font-bold">You have 2 unread</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin p-2">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-2xl mb-1 flex gap-4 transition-all cursor-pointer ${
                    notif.read ? 'bg-transparent hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm ${notif.read ? 'font-bold text-slate-700' : 'font-black text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;