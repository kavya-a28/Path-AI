import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, User } from 'lucide-react';
import { fetchConversations } from '../../services/communityApi';
import { getSocket } from '../../services/socket';
import ChatView from './ChatView';

const Messages = ({ onSelectConversation, activeChatId, activeChatPeer, onCloseChat, socket, currentUser, onlineUsers }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
    const s = getSocket();
    if (s) {
      s.on('message:new', handleNewMessageSocket);
    }
    return () => {
      if (s) s.off('message:new', handleNewMessageSocket);
    };
  }, []);

  const handleNewMessageSocket = () => {
    // Reload conversations to reorder and show unread
    loadConversations();
  };

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load convos', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const title = conv.type === 'group' ? conv.groupRef?.name : conv.otherUser?.fullName;
    return title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading messages...</div>;

  return (
    <div className={`grid ${activeChatId ? 'lg:grid-cols-[380px_1fr]' : 'grid-cols-1'} gap-6 h-[600px]`}>
      
      {/* Left Pane - List of conversations */}
      <div className={`${activeChatId ? 'hidden lg:flex' : 'flex'} flex-col h-full bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden`}>
        {/* Search header area */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 rounded-full py-2.5 pl-12 pr-4 text-slate-900 placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* List area */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center p-12 mt-10">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                {searchQuery ? `No chats found for "${searchQuery}"` : "No conversations yet."}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {searchQuery ? "Go to the Find Peers tab to start a new connection." : "Connect with peers to start chatting."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isGroup = conv.type === 'group';
              const title = isGroup ? conv.groupRef?.name : conv.otherUser?.fullName;
              const icon = isGroup ? conv.groupRef?.icon : null;
              const hasUnread = conv.unreadCount > 0;
              const isSelected = activeChatId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => onSelectConversation(conv._id, { title, isGroup, icon, otherUser: conv.otherUser, groupRef: conv.groupRef, ...conv.otherUser })}
                  className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 transition-colors cursor-pointer relative overflow-hidden ${isSelected ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="relative h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    {isGroup ? (
                      <span className="text-2xl">{icon || '🚀'}</span>
                    ) : conv.otherUser?.avatarUrl ? (
                      <img src={conv.otherUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-7 w-7 text-slate-400" />
                    )}
                    {!isGroup && onlineUsers?.has(conv.otherUser?._id) && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-semibold text-lg truncate ${hasUnread ? 'text-slate-900' : 'text-slate-800'}`}>{title}</h3>
                      {conv.lastMessage?.createdAt && (
                        <span className={`text-xs font-medium whitespace-nowrap ml-2 ${hasUnread ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                      {conv.lastMessage?.text || 'New conversation'}
                    </p>
                  </div>

                  {hasUnread && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-white">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - ChatView */}
      {activeChatId && (
        <div className="h-full">
          <ChatView 
            conversationId={activeChatId}
            meta={{
              isGroup: activeChatPeer?.isGroup || false,
              title: activeChatPeer?.title || activeChatPeer?.fullName || 'Chat',
              otherUser: activeChatPeer?.otherUser || activeChatPeer,
              icon: activeChatPeer?.icon
            }}
            onBack={onCloseChat}
            socket={socket}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
          />
        </div>
      )}
    </div>
  );
};

export default Messages;
