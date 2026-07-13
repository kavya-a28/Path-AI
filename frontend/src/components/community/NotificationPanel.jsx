import React, { useState, useEffect } from 'react';
import { Bell, Check, MessageCircle, UserPlus, Users } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/communityApi';
import { getSocket } from '../../services/socket';

const NotificationPanel = ({ onBack, onOpenConnectionRequests, onOpenChat, socket, onMarkAllRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const s = getSocket();
    if (s) {
      s.on('notification:new', loadNotifications);
    }
    return () => {
      if (s) s.off('notification:new', loadNotifications);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications((data || []).filter(n => !n.read));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications([]);
      if (onMarkAllRead) onMarkAllRead();
    } catch (error) {
      console.error(error);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'connection_request': return <UserPlus className="h-4 w-4 text-blue-400" />;
      case 'connection_accepted': return <Users className="h-4 w-4 text-emerald-400" />;
      case 'new_message': return <MessageCircle className="h-4 w-4 text-indigo-400" />;
      default: return <Bell className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getNotifText = (notif) => {
    switch (notif.type) {
      case 'connection_request':
        return `New connection request from ${notif.data?.senderName || notif.sender?.fullName || 'someone'}`;
      case 'connection_accepted':
        return `🎉 ${notif.data?.senderName || notif.sender?.fullName} accepted your connection request!`;
      case 'new_message':
        return `${notif.data?.senderName || notif.sender?.fullName || 'Someone'}: ${notif.data?.messageText || 'sent a message'}`;
      case 'group_invite':
        return `You were invited to ${notif.data?.groupName}`;
      default:
        return 'New notification';
    }
  };

  const handleNotifClick = (notif) => {
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
    if (notif.type === 'new_message' && onOpenChat && notif.data?.conversationId) {
      onOpenChat(notif.data.conversationId, {
        _id: notif.sender?._id,
        fullName: notif.data?.senderName || notif.sender?.fullName,
        avatarUrl: notif.data?.senderAvatar || notif.sender?.avatarUrl
      });
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-80">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-400" /> Notifications
        </h3>
        <button onClick={handleReadAll} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
          Mark all read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-5 text-center text-gray-500 text-sm">
            You're all caught up!
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              onClick={() => handleNotifClick(notif)}
              className={`p-3 border-b border-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-indigo-500/10' : ''}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getNotifIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>
                  {getNotifText(notif)}
                </p>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!notif.read && <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
