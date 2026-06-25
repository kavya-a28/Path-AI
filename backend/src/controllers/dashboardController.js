/**
 * dashboardController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/roadmap/dashboard/stats
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');
const { XP_PER_SESSION, XP_PER_MILESTONE } = require('../services/roadmapStats');
const { enrichSessionTimeFields } = require('../utils/timeSplit');
const { generateDashboardInsights } = require('../services/promptEngine');

const formatSession = (s) => {
  enrichSessionTimeFields(s);
  return {
    id:             s.id,
    title:          s.title,
    topicKey:       s.topicKey,
    phaseTitle:     s.phaseTitle,
    day:            s.day,
    status:         s.status,
    estimatedHours: s.estimatedHours,
    estimatedLearningHours: s.estimatedLearningHours,
    estimatedPracticeHours: s.estimatedPracticeHours,
    domain:         s.domain,
    completedAt:    s.completedAt || null,
    topicPart:      s.topicPart,
    time:           s.time,
    embedUrl:       s.embedUrl,
    watchUrl:       s.watchUrl,
    videoId:        s.videoId,
    color:          s.color,
    icon:           s.icon,
    practiceCompleted:    s.practiceCompleted || false,
    practiceStartedAt:    s.practiceStartedAt || null,
    practiceCompletedAt:  s.practiceCompletedAt || null,
    actualLearningSeconds: s.actualLearningSeconds || 0,
    actualPracticeSeconds: s.actualPracticeSeconds || 0,
    actualLearningHours:   s.actualLearningHours || 0,
    actualPracticeHours:   s.actualPracticeHours || 0,
    learningOvertime:      s.learningOvertime || false,
    practiceOvertime:      s.practiceOvertime || false
  };
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No active roadmap found.' });
    }

    const sessions    = roadmap.dailySessions || [];
    const totalSessions = sessions.length;
    const currentDay  = roadmap.stats?.currentDay || 1;
    const hoursPerDay = roadmap.stats?.hoursPerDay || 3;

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const pendingSessions   = sessions.filter(s => s.status === 'missed');
    const masteryProgress   = totalSessions > 0
      ? Math.round((completedSessions.length / totalSessions) * 100)
      : 0;

    const studiedHours = completedSessions.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);

    const weekStart = Math.max(1, currentDay - 6);
    const thisWeekSessions = sessions.filter(s => s.day >= weekStart && s.day <= currentDay);
    const weekCompleted    = thisWeekSessions.filter(s => s.status === 'completed').length;
    const weeklyGoal       = thisWeekSessions.length > 0
      ? Math.round((weekCompleted / thisWeekSessions.length) * 100)
      : 0;

    const todaySessions  = sessions.filter(s => s.day === currentDay);
    const todayCompleted = todaySessions.filter(s => s.status === 'completed').length;
    const todayPending   = todaySessions.filter(s => s.status === 'locked' || s.status === 'current').length;
    const todayMissed    = todaySessions.filter(s => s.status === 'missed').length;
    const todayTotal     = todayCompleted + todayPending + todayMissed;
    const completionPct  = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Current task: current session first, then first locked with prerequisites met
    const anyInProgress = sessions.find(s => s.status === 'current');
    const anyPending    = sessions.find(s => {
      if (s.status !== 'locked') return false;
      const prev = sessions.find(p => p.id === s.id - 1);
      return !prev || prev.status === 'completed';
    });
    const todayInProgress   = todaySessions.find(s => s.status === 'current');
    const todayFirstPending = todaySessions.find(s => s.status === 'locked');
    const currentTask = todayInProgress || todayFirstPending || anyInProgress || anyPending || null;

    const seenTopicKeys = new Set();
    if (currentTask?.topicKey) seenTopicKeys.add(currentTask.topicKey);

    const upNext = [];
    for (const s of sessions) {
      if (upNext.length >= 3) break;
      if (s.status !== 'locked' && s.status !== 'current') continue;
      if (s.id === currentTask?.id) continue;
      if (seenTopicKeys.has(s.topicKey)) continue;
      seenTopicKeys.add(s.topicKey);
      upNext.push(formatSession(s));
    }

    const completedMilestones = (roadmap.milestones || []).filter(m => m.status === 'completed').length;
    const xpScore = completedSessions.length * XP_PER_SESSION + completedMilestones * XP_PER_MILESTONE;

    const remaining = sessions.filter(s => s.status !== 'completed');
    const remainingHours = remaining.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);
    const daysLeft = remaining.length > 0
      ? Math.max(1, Math.ceil(remainingHours / hoursPerDay))
      : 0;

    const missedSessions    = sessions.filter(s => s.status === 'missed');
    const completionRate    = (completedSessions.length + missedSessions.length) > 0
      ? Math.round((completedSessions.length / (completedSessions.length + missedSessions.length)) * 100)
      : 100;

    const pendingCount = sessions.filter(s => s.status === 'locked' || s.status === 'current').length;
    
    // --- Dynamic Roadmap Health Score ---
    const healthConsistency = completionRate;
    const healthMissed = Math.max(0, 100 - (missedSessions.length * 5));
    const healthSkill = Math.min(100, Math.max(50, Math.round(masteryProgress * 1.2)));
    const healthDeadline = Math.max(0, 100 - (missedSessions.length * 2));

    const healthValue = Math.round((healthConsistency + healthMissed + healthSkill + healthDeadline) / 4);
    const healthTrend = healthValue >= 75 ? 'up' : 'down';

    const healthScore = {
      value: healthValue,
      trend: healthTrend,
      factors: [
        { name: 'Consistency', score: healthConsistency, color: 'from-emerald-400 to-emerald-500' },
        { name: 'Missed Tasks', score: healthMissed, color: 'from-blue-400 to-blue-500' },
        { name: 'Skill Balance', score: healthSkill, color: 'from-purple-400 to-purple-500' },
        { name: 'Deadline Adherence', score: healthDeadline, color: 'from-orange-400 to-orange-500' }
      ]
    };

    // --- Dynamic AI Insights ---
    let aiInsights = [];
    const streak = roadmap.stats?.streak || 0;
    
    // Check if we have cached insights and they are recent
    const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    const lastUpdate = roadmap.stats?.aiInsightsUpdatedAt ? new Date(roadmap.stats.aiInsightsUpdatedAt).getTime() : 0;
    
    if (roadmap.stats?.aiInsights && roadmap.stats.aiInsights.length > 0 && (now - lastUpdate < CACHE_TTL_MS)) {
      aiInsights = roadmap.stats.aiInsights;
    } else {
      // Generate new insights
      const generated = await generateDashboardInsights({
        completedSessions: completedSessions.length,
        totalSessions,
        missedTotal: missedSessions.length,
        streak,
        longestStreak: roadmap.stats?.longestStreak || 0,
        masteryProgress,
        studiedHours,
        todayCompleted,
        todayMissed,
        todayPending
      });
      
      if (generated && generated.length > 0) {
        aiInsights = generated;
        
        // Save to DB
        await Roadmap.updateOne(
          { _id: roadmap._id },
          { 
            $set: { 
              'stats.aiInsights': aiInsights,
              'stats.aiInsightsUpdatedAt': new Date()
            }
          }
        );
      } else {
        // Fallback rules if LLM fails
        if (streak >= 3) {
          aiInsights.push({ icon: '🔥', text: `Great job maintaining a ${streak} day learning streak!`, type: 'positive' });
        } else if (todayCompleted > 0) {
          aiInsights.push({ icon: '🎯', text: 'You made progress today. Keep up the momentum!', type: 'positive' });
        } else {
          aiInsights.push({ icon: '💡', text: 'Start a session today to build your learning streak.', type: 'suggestion' });
        }

        if (missedSessions.length > 0) {
          aiInsights.push({ icon: '⚠️', text: `You have ${missedSessions.length} missed tasks. Try to catch up this weekend.`, type: 'warning' });
        } else if (completedSessions.length > 0) {
          aiInsights.push({ icon: '✨', text: 'Perfect attendance! You have no missed tasks.', type: 'positive' });
        }

        const todayAttempted = todayCompleted + todayMissed;
        if (completionPct < 50 && todayAttempted > 0) {
          aiInsights.push({ icon: '⏰', text: `Your daily completion is under 50% (${todayCompleted}/${todayAttempted + todayPending} done today). Consider adjusting your schedule.`, type: 'alert' });
        } else if (studiedHours > 0) {
          aiInsights.push({ icon: '🧠', text: `You've invested ${Math.round(studiedHours * 10) / 10} hours into learning so far. Excellent dedication!`, type: 'positive' });
        }
        
        const lastReschedule = roadmap.stats?.lastReschedule;
        if (lastReschedule?.extraDaysAdded > 0 && missedSessions.length > 0) {
          const modeEmoji = { light: '🟢', medium: '🟡', intensive: '🔴' }[lastReschedule.mode] || '📅';
          aiInsights.push({
            icon: modeEmoji,
            text: `Recovery mode (${lastReschedule.mode}): roadmap extended by ${lastReschedule.extraDaysAdded} day(s). Complete tasks daily to recover.`,
            type: 'warning'
          });
        }
      }
    }

    // ─── Calculate Weakest Area ──────────────────────────────────────────────
    let weakestArea = null;
    if (roadmap.dailySessions && roadmap.dailySessions.length > 0) {
      const topicStats = {};

      roadmap.dailySessions.forEach(session => {
        const key = session.topicKey || session.title;
        if (!topicStats[key]) {
          topicStats[key] = {
            topic: session.title,
            category: session.domain || roadmap.domain,
            totalAssigned: 0,
            totalMissed: 0,
            practiceAttempts: 0,
            successfulRuns: 0,
            hintsUsed: 0,
            videoRewatches: 0,
            actualTime: 0,
            expectedTime: 0
          };
        }
        
        const st = topicStats[key];
        st.totalAssigned += 1;
        if (session.status === 'missed') st.totalMissed += 1;
        
        st.practiceAttempts += session.practiceAttempts || 0;
        if (session.practiceCompleted) st.successfulRuns += 1;
        
        st.hintsUsed += session.hintsUsed || 0;
        st.videoRewatches += session.videoRewatches || 0;
        
        st.actualTime += (session.actualLearningSeconds || 0) + (session.actualPracticeSeconds || 0);
        st.expectedTime += ((session.estimatedLearningHours || 0) + (session.estimatedPracticeHours || 0)) * 3600;
      });

      // ── Build analytics practice result map for score adjustment ──
      const analyticsBoost = {};  // topicKey → { totalCorrect, totalQuestions, count }
      if (roadmap.analyticsTestResults && roadmap.analyticsTestResults.length > 0) {
        roadmap.analyticsTestResults.forEach(result => {
          const key = result.topicKey || result.topic;
          if (!analyticsBoost[key]) {
            analyticsBoost[key] = { totalCorrect: 0, totalQuestions: 0, count: 0 };
          }
          analyticsBoost[key].totalCorrect += result.correctAnswers || 0;
          analyticsBoost[key].totalQuestions += result.totalQuestions || 5;
          analyticsBoost[key].count += 1;
        });
      }

      let maxScore = -1;

      for (const key in topicStats) {
        const st = topicStats[key];
        let accuracy = 1;
        if (st.practiceAttempts > 0) {
          accuracy = st.successfulRuns / st.practiceAttempts;
        }
        const wAccuracy = (1 - accuracy) * 40;

        const failedRuns = Math.max(0, st.practiceAttempts - st.successfulRuns);
        const wFailed = Math.min(failedRuns / 5, 1) * 20;

        const wHints = Math.min(st.hintsUsed / 10, 1) * 15;

        let timeRatio = 1;
        if (st.expectedTime > 0) {
          timeRatio = st.actualTime / st.expectedTime;
        }
        const wTime = Math.min(Math.max(timeRatio - 1, 0), 1) * 10;

        const wMissed = Math.min(st.totalMissed / 3, 1) * 10;
        const wRewatches = Math.min(st.videoRewatches / 3, 1) * 5;

        let score = wAccuracy + wFailed + wHints + wTime + wMissed + wRewatches;

        // ── Apply analytics practice boost ──
        // Check all possible matching keys for this topic
        const normalizedKey = key.toLowerCase();
        const normalizedTitle = (st.topic || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const boost = analyticsBoost[key] || analyticsBoost[normalizedKey] || analyticsBoost[normalizedTitle] || analyticsBoost[st.topic];
        
        if (boost && boost.count > 0) {
          const practiceAccuracy = boost.totalCorrect / boost.totalQuestions;
          // Strong reduction: if user scored ≥80% on practice, reduce weakness by 70-90%
          // If 60-80%, reduce by 40-70%
          // If <60%, small reduction of 10-40%
          let reduction;
          if (practiceAccuracy >= 0.8) {
            reduction = 0.7 + (practiceAccuracy - 0.8) * 1.0; // 70-90% reduction
          } else if (practiceAccuracy >= 0.6) {
            reduction = 0.4 + (practiceAccuracy - 0.6) * 1.5; // 40-70% reduction
          } else {
            reduction = practiceAccuracy * 0.67; // 0-40% reduction
          }
          // Cap at 95% reduction max
          reduction = Math.min(reduction, 0.95);
          // More practice tests = more confidence in the boost
          const confidenceFactor = Math.min(boost.count / 3, 1); // caps at 3 tests
          score *= (1 - reduction * confidenceFactor);
        }

        if (score > maxScore && score > 0) {
          maxScore = score;
          
          let reason = '';
          const actions = [];
          
          if (wAccuracy > 20) {
            reason = `Low practice accuracy (${Math.round(accuracy * 100)}%) with ${failedRuns} failed submissions`;
            actions.push(`Practice ${st.topic}: focus on edge cases and hidden test cases`);
            actions.push(`Solve 5 practice problems on ${st.topic}`);
          } else if (wFailed > 10) {
            reason = `Multiple failed submissions (${failedRuns}) during practice`;
            actions.push(`Solve 3 practice problems on ${st.topic}`);
            actions.push(`Watch a revision video on ${st.topic} patterns`);
          } else if (wHints > 5) {
            reason = `High dependency on hints (${st.hintsUsed} used) during practice`;
            actions.push(`Revisit ${st.topic} learning content before practicing`);
          } else if (wMissed > 5) {
            reason = `Missed ${st.totalMissed} assigned sessions for this topic`;
            actions.push(`Complete your pending ${st.topic} sessions`);
          } else if (wTime > 5) {
            reason = `Taking significantly longer than estimated time`;
            actions.push(`Watch a revision video on ${st.topic} to reinforce concepts`);
          } else if (st.practiceAttempts === 0) {
            reason = `No practice attempts yet`;
            actions.push(`Start practicing ${st.topic}`);
          } else {
            reason = `Needs improvement based on recent activity`;
            actions.push(`Solve 3 practice problems on ${st.topic}`);
          }

          if (wTime > 5 || wRewatches > 0 || wHints > 5) {
            if (!actions.includes(`Watch a revision video on ${st.topic} to reinforce concepts`)) {
               actions.push(`Watch a revision video on ${st.topic} to reinforce concepts`);
            }
          }

          weakestArea = {
            topic: st.topic,
            category: st.category,
            score: Math.round(score),
            reason,
            suggestedActions: actions.slice(0, 4)
          };
        }
      }

      // If the maxScore is very low (< 2) after boosts, it means the user has
      // improved enough — show a positive message instead
      if (weakestArea && maxScore < 2) {
        weakestArea.reason = 'Great improvement! Keep practicing to maintain your skills.';
        weakestArea.suggestedActions = [
          `Continue practicing ${weakestArea.topic} to solidify your understanding`,
          `Try harder problems in ${weakestArea.topic} to push your skills further`
        ];
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // ─── Calculate Skill Mastery & Balance ──────────────────────────────────
    const domainStats = {};
    const roadmapDomains = roadmap.domains && roadmap.domains.length > 0 ? roadmap.domains : [roadmap.domain];
    
    // Initialize domains
    roadmapDomains.forEach(d => {
      domainStats[d] = {
        total: 0, completed: 0, practiceAttemptedSessions: 0, practiceCompletedSessions: 0,
        totalHints: 0, totalAttempts: 0, missed: 0, actualTime: 0, expectedTime: 0
      };
    });

    roadmap.dailySessions?.forEach(session => {
      const d = session.domain || roadmap.domain;
      if (!domainStats[d]) {
        domainStats[d] = {
          total: 0, completed: 0, practiceAttemptedSessions: 0, practiceCompletedSessions: 0,
          totalHints: 0, totalAttempts: 0, missed: 0, actualTime: 0, expectedTime: 0
        };
      }
      
      const st = domainStats[d];
      st.total += 1;
      if (session.status === 'completed') st.completed += 1;
      if (session.status === 'missed') st.missed += 1;
      
      if (session.practiceAttempts > 0) {
        st.practiceAttemptedSessions += 1;
        st.totalAttempts += session.practiceAttempts;
      }
      if (session.practiceCompleted) st.practiceCompletedSessions += 1;
      
      st.totalHints += session.hintsUsed || 0;
      st.actualTime += (session.actualLearningSeconds || 0) + (session.actualPracticeSeconds || 0);
      st.expectedTime += ((session.estimatedLearningHours || 0) + (session.estimatedPracticeHours || 0)) * 3600;
    });

    const abbreviateDomain = (domain) => {
      const normalized = String(domain).toLowerCase();
      const map = {
        "data_structures_and_algorithms": "DSA",
        "dsa": "DSA",
        "web_development": "WEB DEV",
        "machine_learning": "ML",
        "cybersecurity": "CYBERSECURITY",
        "artificial_intelligence": "AI",
        "database_management": "DB",
        "core_cs": "CORE CS"
      };
      if (map[normalized]) return map[normalized];
      return String(domain).replace(/_/g, ' ').toUpperCase();
    };

    const skillMastery = [];
    for (const d in domainStats) {
      const st = domainStats[d];
      if (st.total === 0) {
        skillMastery.push({ skill: abbreviateDomain(d), score: 0 });
        continue;
      }
      
      const completionRate = st.completed / st.total;
      const practiceAccuracy = st.practiceAttemptedSessions > 0 
        ? st.practiceCompletedSessions / st.practiceAttemptedSessions 
        : (st.completed > 0 ? 1 : 0);
      
      let timeEfficiency = 1;
      if (st.actualTime > 0 && st.expectedTime > 0) {
        timeEfficiency = Math.min(st.expectedTime / st.actualTime, 1.2) / 1.2;
      } else if (st.completed > 0) {
        timeEfficiency = 1;
      } else {
        timeEfficiency = 0;
      }
      
      const consistencyBonus = 1 - (st.missed / st.total);
      
      const attemptEfficiency = st.practiceAttemptedSessions > 0
        ? Math.min(1, st.practiceAttemptedSessions / st.totalAttempts)
        : (st.completed > 0 ? 1 : 0);
        
      const hintPenalty = st.practiceAttemptedSessions > 0
        ? Math.max(0, 1 - (st.totalHints / st.practiceAttemptedSessions) / 5)
        : 1;

      const score = (
        completionRate * 0.30 +
        practiceAccuracy * 0.25 +
        timeEfficiency * 0.15 +
        consistencyBonus * 0.15 +
        attemptEfficiency * 0.10 +
        hintPenalty * 0.05
      ) * 100;

      skillMastery.push({
        skill: abbreviateDomain(d),
        score: Math.min(100, Math.round(score))
      });
    }

    let skillBalance = null;
    if (skillMastery.length > 0) {
      const mean = skillMastery.reduce((sum, s) => sum + s.score, 0) / skillMastery.length;
      let balanceScore = 10;
      let laggingSkill = '';
      let leadingSkill = '';
      let insight = '';
      let recommendation = '';
      
      if (skillMastery.length > 1) {
        const variance = skillMastery.reduce((sum, s) => sum + Math.pow(s.score - mean, 2), 0) / skillMastery.length;
        const stdDev = Math.sqrt(variance);
        const cv = mean > 0 ? stdDev / mean : 0;
        
        balanceScore = Math.max(1, Math.min(10, 10 - (cv * 10)));
        balanceScore = Math.round(balanceScore * 10) / 10;
        
        const sorted = [...skillMastery].sort((a, b) => a.score - b.score);
        laggingSkill = sorted[0].skill;
        leadingSkill = sorted[sorted.length - 1].skill;
        
        if (balanceScore >= 8) {
          insight = "Great balance! All skills are progressing evenly.";
          recommendation = "Keep up the balanced learning across all domains.";
        } else if (balanceScore >= 5) {
          insight = `${laggingSkill} is lagging behind other skills.`;
          recommendation = `Focus next 2 weeks on ${laggingSkill} to balance profile.`;
        } else {
          insight = `${laggingSkill} needs urgent attention — significantly behind.`;
          recommendation = `Prioritize ${laggingSkill} practice to strengthen your weakest domain.`;
        }
      } else {
         balanceScore = 10;
         insight = `Focusing entirely on ${skillMastery[0].skill}.`;
         recommendation = `Consider adding another domain to diversify your skill set when ready.`;
      }
      
      skillBalance = {
        score: balanceScore,
        insight,
        recommendation,
        laggingSkill,
        leadingSkill
      };
    }
    // ──────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      stats: {
        weeklyGoal,
        studiedHours: Math.round(studiedHours * 10) / 10,
        masteryProgress,
        todayCompleted,
        todayPending,
        todayMissed,
        completionPct,
        completedSessions: completedSessions.length,
        totalSessions,
        currentDay,
        hoursPerDay,
        xpScore:           roadmap.stats?.xpScore       ?? xpScore,
        daysLeft,
        progressPercent:   roadmap.stats?.progressPercent ?? masteryProgress,
        // Streak
        streak:            roadmap.stats?.streak        ?? 0,
        longestStreak:     roadmap.stats?.longestStreak  ?? 0,
        // Completion tracking
        completionRate,
        missedTotal:       missedSessions.length,
        completedTotal:    completedSessions.length,
        pendingCount,
        pendingSessions:   missedSessions.map(formatSession),
        completedList:     completedSessions
          .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
          .map(formatSession),
        currentTask: currentTask ? formatSession(currentTask) : null,
        upNext,
        healthScore,
        aiInsights,
        weakestArea,
        skillMastery,
        skillBalance,
        // Reschedule / overtime info
        totalDays:       roadmap.stats?.totalDays ?? 0,
        lastReschedule:  roadmap.stats?.lastReschedule
          ? {
              date:              roadmap.stats.lastReschedule.date,
              missedRescheduled: roadmap.stats.lastReschedule.missedRescheduled,
              extraDaysAdded:    roadmap.stats.lastReschedule.extraDaysAdded,
              mode:              roadmap.stats.lastReschedule.mode,
              originalEndDay:    roadmap.stats.lastReschedule.originalEndDay,
              newEndDay:         roadmap.stats.lastReschedule.newEndDay,
              totalRescheduled:  roadmap.stats.lastReschedule.totalRescheduled,
              extraCapPerDay:    roadmap.stats.lastReschedule.extraCapPerDay
            }
          : null
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
