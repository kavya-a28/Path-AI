import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User } from 'lucide-react';
import { fetchMessages, sendMessageApi as sendDirectMessage, markConversationRead } from '../../services/communityApi';
import { getSocket } from '../../services/socket';

const ChatView = ({ conversationId, meta, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
    
    const socket = getSocket();
    if (socket) {
      socket.emit('conversation:join', conversationId);
      socket.on('message:new', handleNewMessage);
    }
    
    return () => {
      if (socket) {
        socket.emit('conversation:leave', conversationId);
        socket.off('message:new', handleNewMessage);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data.messages || []);
      await markConversationRead(conversationId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => [...prev, data.message]);
      markConversationRead(conversationId);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');
    try {
      await sendDirectMessage(conversationId, text);
      // Socket will broadcast it back to us, or we can optimistically append
    } catch (error) {
      console.error('Failed to send', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 rounded-3xl border border-white/80 overflow-hidden shadow-xl relative">
      {/* Background Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Header */}
      <div className="p-3 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center gap-3 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
             {meta.isGroup ? <span className="text-xl">{meta.icon || '🚀'}</span> : (meta.otherUser?.avatarUrl ? <img src={meta.otherUser.avatarUrl} className="h-full w-full object-cover" alt=""/> : <User className="h-6 w-6 text-slate-400" />)}
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold text-slate-900 text-lg leading-tight">{meta.title}</h3>
            {!meta.isGroup && meta.otherUser && (
              <p className="text-[13px] text-slate-500 font-medium">
                online
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
        {loading ? (
          <div className="text-center text-slate-500 font-medium mt-10">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 font-medium mt-20 bg-white/60 py-2 px-4 rounded-xl max-w-fit mx-auto shadow-sm">Send a message to start the conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            // Check if msg was sent by current user (we don't have direct access to our own user ID here easily, but we can assume if it's not the 'otherUser' it's us, OR we rely on API returning isMine flag. Let's assume the API populates 'sender._id' and we compare it against meta.otherUser._id)
            const isMe = !meta.isGroup ? msg.sender._id !== meta.otherUser?._id : true; // simplification for group
            
            if (msg.type === 'system') {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm text-xs px-4 py-1.5 rounded-lg font-medium">{msg.text}</span>
                </div>
              );
            }

            return (
              <div key={idx} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-3 py-2 pb-6 relative rounded-xl shadow-sm min-w-[80px] ${isMe ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-tr-sm' : 'bg-white text-slate-900 rounded-tl-sm border border-slate-100'}`}>
                  <p className="text-[15px] leading-snug">{msg.text}</p>
                  <span className="text-[10px] text-slate-500 absolute bottom-1 right-2">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white/80 backdrop-blur-sm border-t border-slate-200 z-10">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white border-0 rounded-full py-3 px-5 text-slate-900 shadow-sm outline-none placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center"
          >
            <Send className="h-5 w-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
