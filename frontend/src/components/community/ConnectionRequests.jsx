import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, User, Clock } from 'lucide-react';
import { fetchPendingConnections as fetchPendingRequests, acceptConnection as acceptRequest, rejectConnection as rejectRequest } from '../../services/communityApi';

const ConnectionRequests = ({ onOpenChat, socket }) => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  // Listen for real-time incoming connection requests via socket
  useEffect(() => {
    if (!socket) return;
    const handleNewRequest = () => {
      loadRequests();
    };
    socket.on('connection:request', handleNewRequest);
    socket.on('notification:new', handleNewRequest);
    return () => {
      socket.off('connection:request', handleNewRequest);
      socket.off('notification:new', handleNewRequest);
    };
  }, [socket]);

  const loadRequests = async () => {
    try {
      const data = await fetchPendingRequests();
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await acceptRequest(id);
      setIncoming(prev => prev.filter(req => req._id !== id));
      if (res && res.conversationId && onOpenChat) {
        const reqData = incoming.find(r => r._id === id);
        if (reqData) {
          onOpenChat(res.conversationId, {
            _id: reqData.sender._id,
            fullName: reqData.sender.fullName,
            avatarUrl: reqData.sender.avatarUrl
          });
        }
      }
    } catch (error) {
      console.error('Accept failed', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id);
      setIncoming(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      console.error('Reject failed', error);
    }
  };

  if (loading) return <div className="text-slate-500 font-medium p-8 text-center">Loading requests...</div>;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-black text-slate-900 mb-4">Incoming Requests ({incoming.length})</h3>
        {incoming.length === 0 ? (
          <p className="text-slate-500 italic bg-white/50 backdrop-blur p-4 rounded-xl border border-white shadow-sm">No incoming requests.</p>
        ) : (
          <div className="space-y-4">
            {incoming.map((req) => (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border border-white shadow-md hover:shadow-lg rounded-[24px] transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                    {req.sender.avatarUrl ? <img src={req.sender.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold">{req.sender.fullName}</h4>
                    <p className="text-sm text-slate-500 font-medium">{req.sender.college || 'Learning enthusiast'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req._id)} className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white hover:shadow-md transition-all shadow-sm">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleReject(req._id)} className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-md transition-all shadow-sm">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-xl font-black text-slate-900 mb-4">Outgoing Requests ({outgoing.length})</h3>
        {outgoing.length === 0 ? (
          <p className="text-slate-500 italic bg-white/50 backdrop-blur p-4 rounded-xl border border-white shadow-sm">No outgoing requests.</p>
        ) : (
          <div className="space-y-4">
            {outgoing.map((req) => (
              <div key={req._id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-xl border border-white shadow-sm rounded-[24px] opacity-80">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    {req.receiver.avatarUrl ? <img src={req.receiver.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" /> : <User className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-slate-700 font-bold">{req.receiver.fullName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{req.receiver.college || 'Learning enthusiast'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConnectionRequests;
