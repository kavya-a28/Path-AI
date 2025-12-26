import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, MapPin, GraduationCap, Target, Flame,
  MessageCircle, UserPlus, Settings, Trophy, Globe,
  ChevronRight, Sparkles, Star, TrendingUp, Award,
  Shield, Crown, Medal, Zap, Clock, CheckCircle2,
  X, Send, Plus, MoreHorizontal, ArrowLeft, Edit2,
  MessageSquare
} from 'lucide-react';

const CommunityView = () => {
  const [activeTab, setActiveTab] = useState('peers');
  
  // --- STATE FOR GROUPS & CHAT ---
  const [viewingGroupId, setViewingGroupId] = useState(null); 
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
  
  // --- NEW STATE FOR DIRECT MESSAGES & CONNECTIONS ---
  const [connectedPeerIds, setConnectedPeerIds] = useState([]); // IDs of people you connected with
  const [viewingChatId, setViewingChatId] = useState(null); // ID of peer you are chatting with
  const [directMessages, setDirectMessages] = useState({}); // { peerId: [messages] }
  const [dmInput, setDmInput] = useState('');

  // Inputs
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedNewMembers, setSelectedNewMembers] = useState([]); 
  const [messageInput, setMessageInput] = useState('');

  // --- MOCK DATA ---
  
  // Your Peers (Simulating a database)
  const allPeers = [
    {
      id: 1,
      name: 'Raj Kumar',
      avatar: 'R',
      match: 87,
      location: 'Delhi, India',
      college: 'IIT Delhi',
      learning: ['DSA', 'Cybersecurity', 'Python'],
      goal: 'FAANG placement 2026',
      streak: 45,
      level: 12,
      bgGradient: 'from-emerald-500 to-blue-500'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      avatar: 'P',
      match: 78,
      location: 'Mumbai, India',
      college: 'BITS Pilani',
      learning: ['Web Dev', 'React', 'Node.js'],
      goal: 'Full-stack Developer',
      streak: 23,
      level: 9,
      bgGradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 3,
      name: 'Amit Verma',
      avatar: 'A',
      match: 72,
      location: 'Bangalore, India',
      college: 'NIT Karnataka',
      learning: ['Machine Learning', 'AI', 'Python'],
      goal: 'AI Research',
      streak: 34,
      level: 11,
      bgGradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      name: 'Sarah Desai',
      avatar: 'S',
      match: 92,
      location: 'Pune, India',
      college: 'IIT Bombay',
      learning: ['Cloud', 'DevOps', 'Kubernetes'],
      goal: 'Cloud Architect',
      streak: 67,
      level: 14,
      bgGradient: 'from-cyan-500 to-blue-500'
    }
  ];

  // Initial Groups Data
  const [myGroups, setMyGroups] = useState([
    {
      id: 101,
      name: 'Cybersec Warriors',
      icon: '🛡️',
      created: 'Dec 1, 2025',
      members: [
        { name: 'You', id: 'me' },
        { name: 'Raj Kumar', id: 1 },
        { name: 'Priya Sharma', id: 2 }
      ],
      progress: 72,
      challenge: 'Complete 10 DSA problems by Sunday',
      challengeProgress: 8,
      challengeTotal: 10,
      messages: [
        { id: 1, user: 'Priya Sharma', text: 'Just solved Binary Search! 🎉', time: '2m ago', senderId: 2 },
        { id: 2, user: 'Raj Kumar', text: 'Need help with Trees, anyone?', time: '15m ago', senderId: 1 }
      ],
      bgGradient: 'from-emerald-400 to-teal-400'
    },
    {
      id: 102,
      name: 'React Ninjas',
      icon: '⚛️',
      created: 'Nov 20, 2025',
      members: [
        { name: 'You', id: 'me' },
        { name: 'Sarah Desai', id: 4 }
      ],
      progress: 89,
      challenge: 'Build 3 React components',
      challengeProgress: 3,
      challengeTotal: 3,
      messages: [
        { id: 1, user: 'Sarah Desai', text: 'Check out my component library!', time: '1h ago', senderId: 4 }
      ],
      bgGradient: 'from-blue-400 to-indigo-400'
    }
  ]);

  // Leaderboard Data
  const leaderboard = [
    { rank: 1, name: 'Rohit Sharma', xp: 8450, streak: 89, level: 12, icon: Crown, color: 'text-yellow-500' },
    { rank: 2, name: 'Anjali Patel', xp: 7890, streak: 67, level: 11, icon: Medal, color: 'text-slate-400' },
    { rank: 3, name: 'Kavya (You!)', xp: 7120, streak: 12, level: 10, icon: Award, color: 'text-amber-600' },
    { rank: 4, name: 'Raj Kumar', xp: 6980, streak: 45, level: 9, icon: Star, color: 'text-emerald-500' },
    { rank: 5, name: 'Priya Sharma', xp: 6750, streak: 23, level: 9, icon: Sparkles, color: 'text-blue-500' }
  ];

  // Theme Constants
  const theme = {
    glass: "bg-white/80 backdrop-blur-xl border border-white shadow-xl",
    accent: "bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
    cardIcon: "bg-gradient-to-br from-[#10b981] to-[#3b82f6]",
  };

  const tabs = [
    { id: 'peers', icon: UserPlus, label: 'Find Peers' },
    { id: 'groups', icon: Users, label: 'My Groups' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' }, // NEW TAB
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' }
  ];

  // --- FUNCTIONALITY HANDLERS ---

  // 1. Enter Group (Opens Chat View)
  const enterGroup = (groupId) => {
    setViewingGroupId(groupId);
  };

  // 2. Leave Group View (Back to list)
  const exitGroupView = () => {
    setViewingGroupId(null);
  };

  // 3. Send Message in Group
  const handleSendGroupMessage = () => {
    if (!messageInput.trim()) return;
    
    setMyGroups(prevGroups => prevGroups.map(grp => {
      if (grp.id === viewingGroupId) {
        return {
          ...grp,
          messages: [
            ...grp.messages,
            { 
              id: Date.now(), 
              user: 'You', 
              text: messageInput, 
              time: 'Just now', 
              senderId: 'me' 
            }
          ]
        };
      }
      return grp;
    }));
    setMessageInput('');
  };

  // 4. Create New Group
  const toggleMemberSelection = (peerId) => {
    if (selectedNewMembers.includes(peerId)) {
      setSelectedNewMembers(selectedNewMembers.filter(id => id !== peerId));
    } else {
      setSelectedNewMembers([...selectedNewMembers, peerId]);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const membersToAdd = allPeers
      .filter(peer => selectedNewMembers.includes(peer.id))
      .map(peer => ({ name: peer.name, id: peer.id }));

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      icon: '🚀',
      created: 'Just now',
      members: [{ name: 'You', id: 'me' }, ...membersToAdd],
      progress: 0,
      challenge: 'Set a group goal!',
      challengeProgress: 0,
      challengeTotal: 5,
      messages: [],
      bgGradient: 'from-pink-400 to-rose-400'
    };

    setMyGroups([...myGroups, newGroup]);
    setNewGroupName('');
    setSelectedNewMembers([]);
    setIsCreateGroupOpen(false);
  };

  // 5. Manage Group (Rename example)
  const handleUpdateGroup = (groupId, newName) => {
    setMyGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
    setIsManageGroupOpen(false);
  };

  // --- NEW HANDLERS FOR CONNECTIONS & DM ---

  const handleConnect = (peerId) => {
    // Add to connected list
    if (!connectedPeerIds.includes(peerId)) {
      setConnectedPeerIds([...connectedPeerIds, peerId]);
      
      // Initialize chat history for this peer if not exists
      if (!directMessages[peerId]) {
        setDirectMessages(prev => ({
          ...prev,
          [peerId]: [] // Start with empty messages
        }));
      }
    }
  };

  const openDirectChat = (peerId) => {
    // Switch tab and view
    setActiveTab('messages');
    setViewingChatId(peerId);
  };

  const handleSendDirectMessage = () => {
    if (!dmInput.trim() || !viewingChatId) return;

    const newMessage = {
      id: Date.now(),
      text: dmInput,
      senderId: 'me',
      time: 'Just now'
    };

    setDirectMessages(prev => ({
      ...prev,
      [viewingChatId]: [...(prev[viewingChatId] || []), newMessage]
    }));

    setDmInput('');
  };

  // --- RENDER HELPERS ---
  const activeGroupData = myGroups.find(g => g.id === viewingGroupId);
  const activeChatPeer = allPeers.find(p => p.id === viewingChatId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header / Nav */}
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
            
            {/* Hide tabs if we are deep inside a chat view */}
            {!viewingGroupId && !viewingChatId && (
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            )}
          </div>
        </motion.div>

        {/* --- MAIN CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          
          {/* 1. FIND PEERS TAB */}
          {activeTab === 'peers' && !viewingGroupId && !viewingChatId && (
            <motion.div
              key="peers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="grid lg:grid-cols-2 gap-5">
                {allPeers.map((peer, index) => {
                  const isConnected = connectedPeerIds.includes(peer.id);

                  return (
                    <motion.div
                      key={peer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                      className={`${theme.glass} rounded-[28px] p-6 relative overflow-hidden group cursor-pointer border-2 border-white/60 hover:border-emerald-200 transition-all`}
                    >
                      {/* Peer Card Inner Content */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${peer.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      {peer.match >= 85 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-400/30">
                          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span className="text-xs font-black text-white uppercase tracking-wide">Perfect</span>
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${peer.bgGradient} flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-emerald-500/20 flex-shrink-0`}>
                            {peer.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="text-lg font-black text-slate-900 truncate">{peer.name}</h3>
                              <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-400 to-blue-400 px-2.5 py-1 rounded-lg shadow-md shadow-emerald-400/20">
                                <Star className="w-3.5 h-3.5 text-white fill-white" />
                                <span className="text-xs font-black text-white">{peer.match}%</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                              <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span className="font-bold text-slate-700">{peer.location}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-bold text-blue-700">{peer.college}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-red-100 px-2.5 py-1 rounded-lg">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-xs font-black text-orange-700">{peer.streak}d</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 px-2.5 py-1 rounded-lg">
                                <Zap className="w-3.5 h-3.5 text-purple-500" />
                                <span className="text-xs font-black text-purple-700">L{peer.level}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {peer.learning.map((skill, i) => (
                            <span key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200/50">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mb-4 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                          <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-emerald-700 truncate">{peer.goal}</span>
                        </div>

                        <div className="flex gap-2">
                          {/* UPDATED BUTTON LOGIC */}
                          <button 
                            onClick={() => isConnected ? openDirectChat(peer.id) : handleConnect(peer.id)}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                              isConnected 
                              ? "bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50" 
                              : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {isConnected ? "Message" : "Connect"}
                          </button>
                          
                          <button className="px-4 py-2.5 bg-white text-slate-700 rounded-xl font-bold text-sm border-2 border-slate-200 hover:border-slate-300 transition-all">
                            Profile
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 2. GROUPS TAB */}
          {activeTab === 'groups' && !viewingGroupId && !viewingChatId && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ y: -2 }}
                  className={`${theme.glass} rounded-[28px] p-6 relative overflow-hidden border-2 border-white/60 hover:border-emerald-200 transition-all`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${group.bgGradient} flex items-center justify-center text-3xl shadow-lg`}>
                          {group.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">{group.name}</h3>
                          <p className="text-xs font-bold text-slate-500">{group.members.length} members • Created {group.created}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.members.slice(0, 4).map((m, i) => (
                          <span key={i} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">{m.name}</span>
                        ))}
                        {group.members.length > 4 && <span className="text-xs font-bold text-slate-400 py-1">+{group.members.length - 4} more</span>}
                      </div>

                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-emerald-700">GROUP CHALLENGE</span>
                          <span className="text-xs font-bold text-emerald-600">{group.challengeProgress}/{group.challengeTotal}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-2">{group.challenge}</p>
                        <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(group.challengeProgress/group.challengeTotal)*100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-between gap-3 min-w-[140px]">
                      <div className="text-right hidden md:block">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <button 
                          onClick={() => enterGroup(group.id)}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Enter Group
                        </button>
                        <button 
                          onClick={() => { setViewingGroupId(group.id); setIsManageGroupOpen(true); }}
                          className="w-full bg-white text-slate-700 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Create Group Trigger */}
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className={`w-full ${theme.glass} rounded-[28px] p-6 flex items-center justify-center gap-3 text-emerald-600 font-black text-base hover:shadow-xl transition-all border-2 border-dashed border-emerald-200 hover:border-emerald-300`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                Create New Study Group
              </button>
            </motion.div>
          )}

          {/* 3. NEW MESSAGES TAB (LIST VIEW) */}
          {activeTab === 'messages' && !viewingGroupId && !viewingChatId && (
            <motion.div
              key="messages-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {connectedPeerIds.length === 0 ? (
                <div className={`${theme.glass} rounded-[28px] p-12 text-center flex flex-col items-center justify-center`}>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No connections yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">Connect with peers in the "Find Peers" tab to start chatting and collaborating!</p>
                  <button 
                    onClick={() => setActiveTab('peers')}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all"
                  >
                    Find Peers
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allPeers
                    .filter(p => connectedPeerIds.includes(p.id))
                    .map((peer, i) => (
                      <motion.div
                        key={peer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => openDirectChat(peer.id)}
                        className={`${theme.glass} p-4 rounded-2xl cursor-pointer hover:border-emerald-300 border-2 border-transparent transition-all flex items-center gap-4`}
                      >
                         <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${peer.bgGradient} flex items-center justify-center text-xl font-black text-white shadow-md`}>
                            {peer.avatar}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{peer.name}</h4>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                               {directMessages[peer.id]?.length > 0 
                                 ? directMessages[peer.id][directMessages[peer.id].length - 1].text
                                 : "Tap to start chatting"}
                            </p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-300" />
                      </motion.div>
                    ))
                  }
                </div>
              )}
            </motion.div>
          )}

          {/* 4. GROUP CHAT VIEW */}
          {viewingGroupId && activeGroupData && (
             <motion.div
               key="group-chat"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="h-[600px] flex flex-col"
             >
               {/* Chat Header */}
               <div className={`${theme.glass} rounded-t-[28px] p-4 border-b-0 z-10 flex items-center justify-between`}>
                 <div className="flex items-center gap-3">
                   <button onClick={exitGroupView} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <ArrowLeft className="w-5 h-5 text-slate-600" />
                   </button>
                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeGroupData.bgGradient} flex items-center justify-center text-xl`}>
                     {activeGroupData.icon}
                   </div>
                   <div>
                     <h3 className="font-black text-slate-900 text-lg">{activeGroupData.name}</h3>
                     <p className="text-xs font-bold text-slate-500">{activeGroupData.members.length} members online</p>
                   </div>
                 </div>
                 <button onClick={() => setIsManageGroupOpen(true)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200">
                   <Settings className="w-5 h-5 text-slate-600" />
                 </button>
               </div>

               {/* Chat Messages Area */}
               <div className="flex-1 bg-white/50 backdrop-blur-md border-x border-white overflow-y-auto p-6 space-y-4">
                 {activeGroupData.messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                     <p className="font-bold">No messages yet. Start the conversation!</p>
                   </div>
                 ) : (
                   activeGroupData.messages.map((msg) => (
                     <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-center gap-2 mb-1">
                           {msg.senderId !== 'me' && <span className="text-[10px] font-bold text-slate-500">{msg.user}</span>}
                           <span className="text-[10px] text-slate-400">{msg.time}</span>
                         </div>
                         <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                           msg.senderId === 'me' 
                             ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-none' 
                             : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                         }`}>
                           {msg.text}
                         </div>
                      </div>
                   ))
                 )}
               </div>

               {/* Chat Input */}
               <div className={`${theme.glass} rounded-b-[28px] p-4 border-t-0`}>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={messageInput}
                     onChange={(e) => setMessageInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                     placeholder={`Message ${activeGroupData.name}...`}
                     className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white transition-all"
                   />
                   <button 
                     onClick={handleSendGroupMessage}
                     className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:bg-emerald-600 transition-all hover:scale-105"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             </motion.div>
          )}

          {/* 5. NEW DIRECT MESSAGES VIEW */}
          {viewingChatId && activeChatPeer && (
             <motion.div
               key="direct-chat"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="h-[600px] flex flex-col"
             >
               {/* DM Header */}
               <div className={`${theme.glass} rounded-t-[28px] p-4 border-b-0 z-10 flex items-center justify-between`}>
                 <div className="flex items-center gap-3">
                   <button onClick={() => setViewingChatId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <ArrowLeft className="w-5 h-5 text-slate-600" />
                   </button>
                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeChatPeer.bgGradient} flex items-center justify-center text-xl font-bold text-white`}>
                     {activeChatPeer.avatar}
                   </div>
                   <div>
                     <h3 className="font-black text-slate-900 text-lg">{activeChatPeer.name}</h3>
                     <p className="text-xs font-bold text-emerald-500">Online</p>
                   </div>
                 </div>
                 <button className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200">
                   <MoreHorizontal className="w-5 h-5 text-slate-600" />
                 </button>
               </div>

               {/* DM Messages Area */}
               <div className="flex-1 bg-white/50 backdrop-blur-md border-x border-white overflow-y-auto p-6 space-y-4">
                 {(!directMessages[viewingChatId] || directMessages[viewingChatId].length === 0) ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeChatPeer.bgGradient} flex items-center justify-center text-3xl text-white mb-4 opacity-50`}>
                       {activeChatPeer.avatar}
                     </div>
                     <p className="font-bold">Start chatting with {activeChatPeer.name}!</p>
                     <p className="text-xs">Say hello 👋</p>
                   </div>
                 ) : (
                    directMessages[viewingChatId].map((msg) => (
                     <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] text-slate-400">{msg.time}</span>
                         </div>
                         <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                           msg.senderId === 'me' 
                             ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-none' 
                             : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                         }`}>
                           {msg.text}
                         </div>
                      </div>
                   ))
                 )}
               </div>

               {/* DM Input */}
               <div className={`${theme.glass} rounded-b-[28px] p-4 border-t-0`}>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={dmInput}
                     onChange={(e) => setDmInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendDirectMessage()}
                     placeholder={`Message ${activeChatPeer.name}...`}
                     className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white transition-all"
                   />
                   <button 
                     onClick={handleSendDirectMessage}
                     className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:bg-emerald-600 transition-all hover:scale-105"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             </motion.div>
          )}

          {/* 6. LEADERBOARD */}
          {activeTab === 'leaderboard' && !viewingGroupId && !viewingChatId && (
             <div className={`${theme.glass} rounded-[28px] p-6`}>
                <h3 className="text-xl font-black text-slate-900 mb-4">Leaderboard</h3>
                <div className="space-y-3">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-white">
                      <span className="font-black text-slate-400 w-6 text-center">{user.rank}</span>
                      <div className="flex-1 font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{user.xp} XP</div>
                    </div>
                  ))}
                </div>
             </div>
          )}

        </AnimatePresence>
      </div>

      {/* --- MODALS --- */}

      {/* 1. CREATE GROUP MODAL */}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Create Study Group</h3>
                <button onClick={() => setIsCreateGroupOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Algo Masters" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-emerald-400"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Add Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border-2 border-slate-100 rounded-xl p-2">
                    {allPeers.map(peer => (
                      <div 
                        key={peer.id}
                        onClick={() => toggleMemberSelection(peer.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedNewMembers.includes(peer.id) ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                        }`}
                      >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{peer.avatar}</div>
                            <span className="text-sm font-bold text-slate-700">{peer.name}</span>
                          </div>
                          {selectedNewMembers.includes(peer.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleCreateGroup}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MANAGE GROUP MODAL */}
      <AnimatePresence>
        {isManageGroupOpen && activeGroupData && (
          <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
              <motion.div 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
              >
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">Manage Group</h3>
                    <button onClick={() => setIsManageGroupOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center justify-center mb-4">
                     <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activeGroupData.bgGradient} flex items-center justify-center text-4xl shadow-lg`}>
                        {activeGroupData.icon}
                     </div>
                   </div>
                   
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Group Name</label>
                     <div className="flex gap-2">
                        <input 
                          defaultValue={activeGroupData.name}
                          id="editGroupName"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700"
                        />
                        <button 
                          onClick={() => handleUpdateGroup(activeGroupData.id, document.getElementById('editGroupName').value)}
                          className="bg-emerald-500 text-white px-3 rounded-xl"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Members ({activeGroupData.members.length})</label>
                      <div className="bg-slate-50 rounded-xl p-2 space-y-2">
                         {activeGroupData.members.map((m, i) => (
                           <div key={i} className="flex justify-between items-center px-2">
                              <span className="text-sm font-bold text-slate-700">{m.name}</span>
                              <span className="text-[10px] bg-white border px-1.5 rounded text-slate-400">Owner</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   
                   <button className="w-full py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors">
                     Leave Group
                   </button>
                 </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>  
  );
};

export default CommunityView;