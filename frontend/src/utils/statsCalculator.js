export const parseDurationToDays = (durationStr) => {
  if (!durationStr) return 60; // default 2 months
  const str = String(durationStr).toLowerCase();
  let maxNum = 0;
  
  // Match digits (e.g. "1-2" -> 1, 2. We take 2)
  const matches = str.match(/\d+/g);
  if (matches) {
    maxNum = Math.max(...matches.map(Number));
  } else {
    return 60;
  }
  
  if (str.includes('year')) return maxNum * 365;
  if (str.includes('month')) return maxNum * 30;
  if (str.includes('week')) return maxNum * 7;
  if (str.includes('day')) return maxNum;
  
  return maxNum * 30; // default to months
};

export const calculateRealtimeStats = (roadmapData) => {
  const sessions = roadmapData?.dailySessions || [];
  const milestones = roadmapData?.milestones || [];
  
  const totalDays = parseDurationToDays(roadmapData?.profile?.targetDuration);
  
  let completedDays = 0;
  const sessionsByDay = {};
  sessions.forEach(s => {
    if (!sessionsByDay[s.day]) sessionsByDay[s.day] = [];
    sessionsByDay[s.day].push(s);
  });
  
  Object.values(sessionsByDay).forEach(daySessions => {
    if (daySessions.every(s => s.status === 'completed')) {
      completedDays++;
    }
  });
  
  const daysLeft = Math.max(0, totalDays - completedDays);
  
  const completedSessionCount = sessions.filter(s => s.status === 'completed').length;
  const completedMilestoneCount = milestones.filter(m => m.status === 'completed').length;
  
  const xpScore = (completedSessionCount * 30) + (completedMilestoneCount * 250);
  
  return {
    totalDays,
    completedDays,
    daysLeft,
    xpScore,
    completedSessionCount,
    completedMilestoneCount
  };
};
