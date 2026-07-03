import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, User, Send, ArrowLeft, Check, CheckCheck, Smile, Trash2 } from 'lucide-react';
import { fetchConversations, fetchMessages, sendMessageApi, markConversationRead } from '../../services/communityApi';
import { getSocket, emitTypingStart, emitTypingStop } from '../../services/socket';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatListTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','👍','👎','❤️','🔥','🎉','💪','🙏','😢','😮','🤣','😊','🥺','😤','👋','✨','💯','🚀','⭐','💡','🎯'];

// ─── Avatar Component ────────────────────────────────────────────────────────
const Avatar = ({ user, isGroup, icon, size = 'md', isOnline = false }) => {
  const sizeMap = { sm: 'h-10 w-10', md: 'h-12 w-12', lg: 'h-14 w-14' };
  const iconSize = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' };
  const dotSize = { sm: 'h-3 w-3 border-[1.5px]', md: 'h-3.5 w-3.5 border-2', lg: 'h-4 w-4 border-2' };

  return (
    <div className={`relative ${sizeMap[size]} rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-visible`}>
      {isGroup ? (
        <span className="text-xl">{icon || '🚀'}</span>
      ) : user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center`}>
          <User className={`${iconSize[size]} text-white`} />
        </div>
      )}
      {!isGroup && isOnline && (
        <span className={`absolute bottom-0 right-0 ${dotSize[size]} rounded-full bg-emerald-500 border-white`} />
      )}
    </div>
  );
};

// ─── Typing Indicator ────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end mr-auto max-w-[60%] mb-1">
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-slate-100 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="h-2 w-2 bg-slate-400 rounded-full inline-block"
            style={{ animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe, onDelete }) => {
  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 group`}
    >
      <div
        className={`relative max-w-[75%] px-3 pt-2 pb-5 rounded-2xl shadow-sm min-w-[70px] ${
          isMe
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-br-sm'
            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words pr-4">{msg.text}</p>
        <div className={`absolute bottom-1.5 right-2 flex items-center gap-0.5 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
          <span className="text-[10px] font-medium">{formatTime(msg.createdAt)}</span>
          {isMe && <CheckCheck className="h-3 w-3 ml-0.5" />}
        </div>
        {isMe && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}
            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Chat Panel ──────────────────────────────────────────────────────────────
const ChatPanel = ({ conversation, currentUser, onBack, onlineUsers, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // other user typing
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);
  const conversationId = conversation._id;
  const isGroup = conversation.type === 'group';
  const otherUser = conversation.otherUser;
  const title = isGroup ? conversation.groupRef?.name : otherUser?.fullName;
  const icon = isGroup ? conversation.groupRef?.icon : null;
  const isOnline = !isGroup && onlineUsers?.has(otherUser?._id?.toString());

  useEffect(() => {
    loadMessages();
    const socket = getSocket();
    if (socket) {
      socket.emit('conversation:join', conversationId);
      socket.on('message:new', handleSocketMessage);
      socket.on('typing:start', handleTypingStart);
      socket.on('typing:stop', handleTypingStop);
      socket.on('message:deleted', handleMessageDeleted);
    }
    return () => {
      if (socket) {
        socket.emit('conversation:leave', conversationId);
        socket.off('message:new', handleSocketMessage);
        socket.off('typing:start', handleTypingStart);
        socket.off('typing:stop', handleTypingStop);
        socket.off('message:deleted', handleMessageDeleted);
      }
      clearTimeout(typingTimerRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchMessages(conversationId);
      setMessages(data.messages || []);
      await markConversationRead(conversationId);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocketMessage = (data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => {
        // Avoid duplicate if we already optimistically added it
        if (prev.find(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      markConversationRead(conversationId).catch(() => {});
      onMessageSent && onMessageSent(conversationId, data.message);
    }
  };

  const handleTypingStart = ({ conversationId: cid, userId }) => {
    if (cid === conversationId && userId !== currentUser?._id?.toString() && userId !== currentUser?.id?.toString()) {
      setIsTyping(true);
    }
  };

  const handleTypingStop = ({ conversationId: cid }) => {
    if (cid === conversationId) setIsTyping(false);
  };

  const handleMessageDeleted = ({ messageId, conversationId: cid }) => {
    if (cid === conversationId) {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    // Emit typing start
    emitTypingStart(conversationId);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTypingStop(conversationId);
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setText('');
    emitTypingStop(conversationId);
    clearTimeout(typingTimerRef.current);

    // Optimistic message
    const optimisticMsg = {
      _id: `optimistic_${Date.now()}`,
      text: trimmed,
      sender: { _id: currentUser?._id || currentUser?.id, fullName: currentUser?.fullName },
      createdAt: new Date().toISOString(),
      type: 'text',
      readBy: [currentUser?._id || currentUser?.id],
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      setSending(true);
      const sent = await sendMessageApi(conversationId, trimmed);
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m._id === optimisticMsg._id ? sent : m));
      onMessageSent && onMessageSent(conversationId, sent);
    } catch (err) {
      console.error('Send failed', err);
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('pathai_token')}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const isMine = (msg) => {
    const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
    const myId = currentUser?._id?.toString() || currentUser?.id?.toString();
    return senderId === myId;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 rounded-2xl overflow-hidden shadow-xl relative">
      {/* WhatsApp-style subtle pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar user={otherUser} isGroup={isGroup} icon={icon} size="md" isOnline={isOnline} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{title}</h3>
          {isTyping ? (
            <p className="text-xs text-emerald-500 font-semibold">typing…</p>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              {isOnline ? <span className="text-emerald-500">● online</span> : 'offline'}
            </p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 z-10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-5 py-2.5 rounded-full font-medium shadow-sm">
              You are now connected! Start messaging.
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={msg._id || idx} msg={msg} isMe={isMine(msg)} onDelete={handleDelete} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 px-3 py-3 z-10 relative">
        {showEmoji && (
          <div className="absolute bottom-16 left-3 bg-white rounded-xl shadow-xl border border-slate-200 p-3 grid grid-cols-8 gap-1 z-50 w-72">
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setText(prev => prev + emoji); setShowEmoji(false); }}
                className="text-xl hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0">
            <Smile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
            placeholder="Type a message"
            className="flex-1 bg-white rounded-full py-2.5 px-4 text-slate-900 text-sm shadow-sm outline-none placeholder-slate-400 border border-slate-200 focus:border-emerald-300 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-md transition-all flex-shrink-0 active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

// ─── Conversation List Item ──────────────────────────────────────────────────
const ConvItem = ({ conv, isActive, onSelect, onlineUsers, currentUser }) => {
  const isGroup = conv.type === 'group';
  const title = isGroup ? conv.groupRef?.name : conv.otherUser?.fullName;
  const icon = isGroup ? conv.groupRef?.icon : null;
  const hasUnread = conv.unreadCount > 0;
  const isOnline = !isGroup && onlineUsers?.has(conv.otherUser?._id?.toString());
  const lastMsg = conv.lastMessage;

  return (
    <motion.div
      whileHover={{ backgroundColor: isActive ? undefined : '#f8fafc' }}
      onClick={() => onSelect(conv)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-colors relative ${
        isActive ? 'bg-slate-100 border-l-4 border-l-emerald-500' : 'bg-white'
      }`}
    >
      <Avatar user={conv.otherUser} isGroup={isGroup} icon={icon} size="lg" isOnline={isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className={`font-semibold truncate text-[15px] ${hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>
            {title}
          </h3>
          {lastMsg?.createdAt && (
            <span className={`text-[11px] ml-2 flex-shrink-0 font-medium ${hasUnread ? 'text-emerald-600' : 'text-slate-400'}`}>
              {formatListTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
            {lastMsg?.text || 'Start the conversation…'}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Messages (Main Component) ───────────────────────────────────────────────
const Messages = ({ onSelectConversation, activeChatId, activeChatPeer, onCloseChat, socket, currentUser, onlineUsers }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConv, setActiveConv] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // When activeChatId changes from outside (e.g. connection accepted / notification), sync active conv
  useEffect(() => {
    if (!activeChatId) return;
    const found = conversations.find(c => c._id === activeChatId);
    if (found) {
      setActiveConv(found);
    } else if (!loading) {
      // Conv not in list yet — reload then try again
      loadConversations().then(() => {
        setConversations(prev => {
          const f = prev.find(c => c._id === activeChatId);
          if (f) setActiveConv(f);
          return prev;
        });
      });
    }
  }, [activeChatId, conversations.length]);

  // Listen for real-time new messages to refresh the conversation list
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const handler = (data) => {
      // Update conversation list - move the updated convo to top with new lastMessage
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c._id === data.conversationId) {
            const isFromOther = data.message.sender?._id !== (currentUser?._id || currentUser?.id);
            return {
              ...c,
              lastMessage: { text: data.message.text, sender: data.message.sender?._id, createdAt: data.message.createdAt },
              unreadCount: (activeConv?._id === data.conversationId) ? 0 : (isFromOther ? (c.unreadCount || 0) + 1 : c.unreadCount || 0)
            };
          }
          return c;
        });
        // Re-sort by most recent
        return [...updated].sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
          return bTime - aTime;
        });
      });
    };
    s.on('message:new', handler);
    return () => s.off('message:new', handler);
  }, [activeConv, currentUser]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConv = useCallback((conv) => {
    setActiveConv(conv);
    // Clear unread badge locally
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    // Also notify parent
    const isGroup = conv.type === 'group';
    const title = isGroup ? conv.groupRef?.name : conv.otherUser?.fullName;
    onSelectConversation(conv._id, { title, isGroup, icon: conv.groupRef?.icon, otherUser: conv.otherUser, groupRef: conv.groupRef });
  }, [onSelectConversation]);

  const handleBack = useCallback(() => {
    setActiveConv(null);
    onCloseChat();
  }, [onCloseChat]);

  const handleMessageSent = useCallback((convId, msg) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c._id === convId) {
          return {
            ...c,
            lastMessage: { text: msg.text, sender: msg.sender?._id, createdAt: msg.createdAt },
          };
        }
        return c;
      });
      return [...updated].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
        return bTime - aTime;
      });
    });
  }, []);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const title = conv.type === 'group' ? conv.groupRef?.name : conv.otherUser?.fullName;
    return title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Mobile: show only the panel that's active
  const showList = !activeConv; // on mobile hide list when chat open
  const showChat = !!activeConv;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 overflow-hidden">

      {/* ── Left Panel: Conversation List ── */}
      <div className={`${showChat ? 'hidden lg:flex' : 'flex'} lg:flex flex-col w-full lg:w-[360px] flex-shrink-0 border-r border-slate-200 bg-white`}>
        {/* Search */}
        <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded-full w-1/2" />
                    <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-sm">
                {searchQuery ? `No chats matching "${searchQuery}"` : 'No conversations yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? '' : 'Connect with peers to start chatting.'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map(conv => (
                <ConvItem
                  key={conv._id}
                  conv={conv}
                  isActive={activeConv?._id === conv._id}
                  onSelect={handleSelectConv}
                  onlineUsers={onlineUsers}
                  currentUser={currentUser}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat View ── */}
      <div className={`${showChat ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30`}>
        {activeConv ? (
          <ChatPanel
            key={activeConv._id}
            conversation={activeConv}
            currentUser={currentUser}
            onBack={handleBack}
            onlineUsers={onlineUsers}
            onMessageSent={handleMessageSent}
          />
        ) : (
          /* Empty state for large screens */
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center gap-4">
            <div className="w-24 h-24 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle className="h-12 w-12 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
