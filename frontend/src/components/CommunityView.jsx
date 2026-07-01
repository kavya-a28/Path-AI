import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, MessageSquare, Bell, ArrowLeft } from 'lucide-react';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import { fetchUnreadNotificationCount } from '../services/communityApi';
import FindPeers from './community/FindPeers';
import ConnectionRequests from './community/ConnectionRequests';
import Messages from './community/Messages';
import ChatView from './community/ChatView';

import NotificationPanel from './community/NotificationPanel';

const CommunityView = () => {
  const [activeTab, setActiveTab] = useState('peers');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notificationCount, setNotificationCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  // Sub-views
  const [viewingChatId, setViewingChatId] = useState(null); // conversationId for DM
  const [chatPeerData, setChatPeerData] = useState(null); // peer info for chat header
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('pathai_user') || '{}');

  // Initialize socket
  useEffect(() => {
    const s = connectSocket();
    if (s) {
      setSocket(s);

      // Receive the full list of online users on connect
      s.on('users:online', ({ userIds }) => {
        setOnlineUsers(new Set(userIds));
      });

      s.on('user:online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      s.on('user:offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      // Notification badge for real notifications (connection requests, etc.)
      s.on('notification:new', () => {
        setNotificationCount(prev => prev + 1);
      });

      s.on('connection:accepted', (data) => {
        // Automatically open the chat when someone accepts your connection request
        if (data.conversationId && data.accepter) {
          setViewingChatId(data.conversationId);
          setChatPeerData(data.accepter);
          setShowConnectionRequests(false);
          setShowNotifications(false);
          setActiveTab('messages'); // optional, but good UX to set base tab
        }
      });
    }

    // Fetch initial notification count
    fetchUnreadNotificationCount().then(count => setNotificationCount(count)).catch(() => {});

    return () => {
      // Don't disconnect socket on unmount - keep it alive for dashboard
    };
  }, []);

  const openDirectChat = useCallback((conversationId, peerData) => {
    setViewingChatId(conversationId);
    setChatPeerData(peerData);
    setActiveTab('messages');
  }, []);

  const goBack = useCallback(() => {
    setViewingChatId(null);
    setChatPeerData(null);
  }, []);

  const handleCloseSubViews = useCallback(() => {
    setViewingChatId(null);
    setChatPeerData(null);
    setShowNotifications(false);
    setShowConnectionRequests(false);
  }, []);

  const theme = {
    glass: "bg-white/80 backdrop-blur-xl border border-white shadow-xl",
    accent: "bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
  };

  const tabs = [
    { id: 'peers', icon: UserPlus, label: 'Find Peers' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  const isInSubView = showNotifications || showConnectionRequests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.glass} rounded-[32px] p-6 relative overflow-hidden`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`${theme.accent} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community</h2>
                <p className="text-slate-500 font-semibold text-xs">Connect & Collaborate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleCloseSubViews();
                      setActiveTab(tab.id);
                    }}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' 
                        : 'bg-white/70 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Notification bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2.5 bg-white/70 rounded-xl hover:bg-white transition-all"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Sub-views take priority */}
          {showNotifications && (
            <NotificationPanel 
              key="notifications"
              onBack={() => { setShowNotifications(false); setNotificationCount(0); }} 
              onOpenConnectionRequests={() => {
                setShowNotifications(false);
                setActiveTab('peers');
                setShowConnectionRequests(true);
              }}
              onOpenChat={(conversationId, peerData) => {
                setShowNotifications(false);
                setNotificationCount(0);
                openDirectChat(conversationId, peerData);
              }}
              socket={socket}
              onMarkAllRead={() => setNotificationCount(0)}
            />
          )}

          {showConnectionRequests && (
            <ConnectionRequests 
              key="connection-requests"
              onBack={() => setShowConnectionRequests(false)}
              socket={socket}
              onOpenChat={openDirectChat}
            />
          )}



          {/* Main tabs */}
          {!isInSubView && activeTab === 'peers' && (
            <FindPeers 
              key="peers"
              socket={socket}
              onOpenChat={openDirectChat}
              onShowRequests={() => setShowConnectionRequests(true)}
              onlineUsers={onlineUsers}
            />
          )}

          {!isInSubView && activeTab === 'messages' && (
            <Messages 
              key="messages"
              socket={socket}
              onSelectConversation={openDirectChat}
              activeChatId={viewingChatId}
              activeChatPeer={chatPeerData}
              onCloseChat={goBack}
              onlineUsers={onlineUsers}
              currentUser={currentUser}
            />
          )}


        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityView;