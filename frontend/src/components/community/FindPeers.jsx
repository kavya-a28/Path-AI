import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, GraduationCap, Target, Flame,
  MessageCircle, UserPlus, Sparkles, Star, Zap,
  ChevronRight, Users
} from 'lucide-react';
import { fetchPeerRecommendations, sendConnectionRequest } from '../../services/communityApi';

const bgGradients = [
  'from-emerald-500 to-blue-500',
  'from-blue-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-violet-500',
];

const FindPeers = ({ socket, onOpenChat, onShowRequests, onlineUsers = new Set() }) => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [connectingIds, setConnectingIds] = useState(new Set());

  const loadPeers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPeerRecommendations();
      setPeers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load peer recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeers();
  }, [loadPeers]);

  useEffect(() => {
    if (!socket) return;

    const handleConnectionAccepted = (data) => {
      setPeers(prev =>
        prev.map(p =>
          p._id === data.userId || p._id === data.fromUserId
            ? { ...p, connectionStatus: 'connected', conversationId: data.conversationId }
            : p
        )
      );
    };

    const handleConnectionRequest = () => {
      setPendingCount(prev => prev + 1);
    };

    socket.on('connection:accepted', handleConnectionAccepted);
    socket.on('connection:request', handleConnectionRequest);

    return () => {
      socket.off('connection:accepted', handleConnectionAccepted);
      socket.off('connection:request', handleConnectionRequest);
    };
  }, [socket]);

  const handleConnect = async (peerId) => {
    try {
      setConnectingIds(prev => new Set(prev).add(peerId));
      await sendConnectionRequest(peerId);
      setPeers(prev =>
        prev.map(p =>
          p._id === peerId ? { ...p, connectionStatus: 'pending_outgoing' } : p
        )
      );
    } catch (err) {
      console.error('Connection request failed:', err);
    } finally {
      setConnectingIds(prev => {
        const next = new Set(prev);
        next.delete(peerId);
        return next;
      });
    }
  };

  const handleMessage = (peer) => {
    if (onOpenChat && peer.conversationId) {
      onOpenChat(peer.conversationId, {
        _id: peer._id,
        fullName: peer.fullName,
        avatarUrl: peer.avatarUrl,
      });
    }
  };

  const filteredPeers = peers.filter(peer => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      peer.fullName?.toLowerCase().includes(q) ||
      peer.skills?.some(s => s.toLowerCase().includes(q)) ||
      peer.college?.toLowerCase().includes(q) ||
      peer.location?.toLowerCase().includes(q)
    );
  });

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[28px] p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-slate-200 rounded-full w-16" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-6 bg-slate-200 rounded-full w-14" />
          </div>
          <div className="mt-4 h-10 bg-slate-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );

  const renderAvatar = (peer, index) => {
    const gradient = bgGradients[index % bgGradients.length];
    if (peer.avatarUrl) {
      return (
        <div className="relative">
          <img
            src={peer.avatarUrl}
            alt={peer.fullName}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
          />
          {onlineUsers.has?.(peer._id) && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          )}
        </div>
      );
    }
    return (
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}
        >
          {peer.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {onlineUsers.has?.(peer._id) && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  const renderConnectionButton = (peer) => {
    const status = peer.connectionStatus || 'none';
    const isConnecting = connectingIds.has(peer._id);

    if (status === 'connected') {
      return (
        <button
          onClick={() => handleMessage(peer)}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      );
    }
    if (status === 'pending_outgoing') {
      return (
        <button
          disabled
          className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Pending
        </button>
      );
    }
    return (
      <button
        onClick={() => handleConnect(peer._id)}
        disabled={isConnecting}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Find Peers</h2>
          <p className="text-slate-500 text-sm mt-0.5">Discover study partners matched to your goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onShowRequests}
          className="relative px-4 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Connection Requests
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, skill, or college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadPeers}
            className="mt-2 text-sm text-red-500 underline hover:text-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && renderSkeleton()}

      {/* Empty state */}
      {!loading && !error && filteredPeers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[28px] p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {search ? 'No peers match your search' : 'No peer recommendations yet'}
          </h3>
          <p className="text-slate-500 text-sm">
            {search
              ? 'Try adjusting your search terms'
              : 'Complete your profile to get matched with study partners!'}
          </p>
        </motion.div>
      )}

      {/* Peers Grid */}
      {!loading && !error && filteredPeers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredPeers.map((peer, index) => (
              <motion.div
                key={peer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[28px] p-6 relative overflow-hidden"
              >
                {/* Perfect Match Badge */}
                {peer.match >= 85 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Perfect Match
                  </div>
                )}

                {/* Peer Info */}
                <div className="flex items-start gap-4 mb-4">
                  {renderAvatar(peer, index)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base truncate">{peer.fullName}</h3>
                    {peer.location && (
                      <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{peer.location}</span>
                      </p>
                    )}
                    {peer.college && (
                      <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{peer.college}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Match Percentage */}
                {peer.match != null && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${peer.match}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{peer.match}%</span>
                  </div>
                )}

                {/* Skills Tags */}
                {peer.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {peer.skills.slice(0, 4).map((skill, si) => (
                      <span
                        key={si}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {peer.skills.length > 4 && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        +{peer.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Goal */}
                {peer.goal && (
                  <p className="text-sm text-slate-600 flex items-center gap-1.5 mb-3">
                    <Target className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{peer.goal}</span>
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  {peer.streak != null && (
                    <span className="flex items-center gap-1 text-orange-500 font-semibold">
                      <Flame className="w-4 h-4" />
                      {peer.streak}
                    </span>
                  )}
                  {peer.level != null && (
                    <span className="flex items-center gap-1 text-blue-500 font-semibold">
                      <Star className="w-4 h-4" />
                      Lv.{peer.level}
                    </span>
                  )}
                  {peer.xp != null && (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Zap className="w-4 h-4" />
                      {peer.xp.toLocaleString()} XP
                    </span>
                  )}
                </div>

                {/* Connection Button */}
                {renderConnectionButton(peer)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FindPeers;
