import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/communityApi';
import { getSocket } from '../../services/socket';

const NotificationPanel = ({ onBack, onOpenConnectionRequests, onOpenChat, socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', loadNotifications);
    }
    return () => {
      if (socket) socket.off('notification:new', loadNotifications);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-80">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-400" /> Notifications
        </h3>
        <button onClick={handleReadAll} className="text-xs text-indigo-400 hover:text-indigo-300">
          Mark all read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            You're all caught up!
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              onClick={() => {
                if (!notif.read) handleRead(notif._id);
                if (notif.type === 'connection_request' && onOpenConnectionRequests) {
                  onOpenConnectionRequests();
                }
                if (notif.type === 'connection_accepted' && onOpenChat && notif.data?.conversationId) {
                  onOpenChat(notif.data.conversationId, {
                    _id: notif.sender?._id || notif.data?.senderId,
                    fullName: notif.data?.senderName,
                    avatarUrl: notif.data?.senderAvatar || notif.sender?.avatarUrl
                  });
                }
              }}
              className={`p-3 border-b border-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-indigo-500/5' : ''}`}
            >
              <div className="mt-1">
                {!notif.read && <div className="h-2 w-2 rounded-full bg-indigo-500"></div>}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>
                  {notif.type === 'connection_request' && `New connection request from ${notif.data?.senderName}`}
                  {notif.type === 'connection_accepted' && `🎉 You are now friends with ${notif.data?.senderName}! They accepted your connection request.`}
                  {notif.type === 'group_invite' && `You were invited to ${notif.data?.groupName}`}
                  {notif.type === 'new_message' && `New message received`}
                </p>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
