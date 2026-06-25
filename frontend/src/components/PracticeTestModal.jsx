import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Code, CheckCircle, AlertCircle, Loader2,
  ChevronRight, ChevronLeft, Clock, XCircle, Settings,
  Timer, Trophy, ArrowRight, Lightbulb
} from 'lucide-react';
import { getPracticeTest, runPracticeTestCode, submitAnalyticsPracticeResult } from '../services/roadmapApi';

export default function PracticeTestModal({ topic, domain, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solutions, setSolutions] = useState({});
  const [testResults, setTestResults] = useState({});
  const [runningIdx, setRunningIdx] = useState(null);
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [testFinished, setTestFinished] = useState(false);
  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);

  // Timer state
  const [timeSeconds, setTimeSeconds] = useState(0);

  useEffect(() => {
    if (testFinished) return;
    let interval = setInterval(() => setTimeSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [testFinished]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getPracticeTest(topic, '', domain);
        setQuestions(data);
        const initSol = {};
        data.forEach((q, idx) => {
          initSol[idx] = q.starterCode || '';
        });
        setSolutions(initSol);
      } catch (err) {
        setError(err.message || 'Failed to load practice test.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [topic, domain]);

  // Sync scroll between line numbers and textarea
  const handleEditorScroll = (e) => {
    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = solutions[currentIndex] || '';
      setSolutions(prev => ({
        ...prev,
        [currentIndex]: val.substring(0, start) + '    ' + val.substring(end)
      }));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRunCode = async (idx) => {
    try {
      setRunningIdx(idx);
      setActiveTestTab(0);
      const challenge = questions[idx];
      const sol = solutions[idx];
      const result = await runPracticeTestCode(challenge, sol);
      setTestResults(prev => ({ ...prev, [idx]: result }));
      if (result.passed) {
        setCompletedQuestions(prev => ({ ...prev, [idx]: true }));
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [idx]: { passed: false, compileError: err.message, testResults: [] }
      }));
    } finally {
      setRunningIdx(null);
    }
  };

  const handleSubmitAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setActiveTestTab(0);
    } else {
      setTestFinished(true);
      // Submit results to backend
      const completed = Object.keys(completedQuestions).length;
      submitAnalyticsPracticeResult({
        topic,
        topicKey: topic.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        domain,
        totalQuestions: questions.length,
        correctAnswers: completed,
        timeSeconds: timeSeconds
      }).then(() => {
        if (onComplete) onComplete();
      }).catch(err => {
        console.error('Failed to submit analytics practice result:', err);
      });
    }
  };

  const completedCount = Object.keys(completedQuestions).length;
  const totalQuestions = questions.length || 5;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center max-w-sm w-full"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-1">Loading Practice Test</h2>
          <p className="text-slate-500 text-sm">Fetching 5 problems for <span className="font-bold text-emerald-600">{topic}</span></p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Error
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <p className="text-slate-700">{error}</p>
          <button onClick={onClose} className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">Close</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // Finished state
  if (testFinished) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Practice Test Complete!</h2>
          <p className="text-slate-500 mb-6">You completed <span className="font-black text-emerald-600">{completedCount}</span> of <span className="font-black">{totalQuestions}</span> questions in <span className="font-mono font-bold">{formatTime(timeSeconds)}</span></p>

          <div className="flex gap-2 justify-center mb-6">
            {questions.map((_, idx) => (
              <div key={idx} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                completedQuestions[idx]
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-red-50 text-red-400 border-2 border-red-200'
              }`}>
                {completedQuestions[idx] ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
            ))}
          </div>

          <button onClick={onClose} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all">
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentResult = testResults[currentIndex];
  const codeLines = (solutions[currentIndex] || '').split('\n');

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#f0f2f5' }}>

      {/* ─── TOP HEADER BAR ─── */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0" style={{ minHeight: 56 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-800 leading-tight">{topic} — Practice Test</h2>
            <p className="text-xs font-semibold text-slate-400">Solve all 5 questions</p>
          </div>
        </div>

        {/* Question Dots */}
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setActiveTestTab(0); }}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                idx === currentIndex
                  ? 'bg-slate-900 text-white shadow-lg scale-110'
                  : completedQuestions[idx]
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {completedQuestions[idx] ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
            <Timer className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-base font-black text-slate-700">{formatTime(timeSeconds)}</span>
          </div>
          <div className="text-xs font-bold text-slate-400">
            {completedCount}/{totalQuestions} solved
          </div>
        </div>
      </header>

      {/* ─── MAIN SPLIT PANE ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ LEFT: PROBLEM DESCRIPTION ═══ */}
        <div className="w-[42%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">

            {/* Title + Difficulty */}
            <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight">{currentQ.title}</h3>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                currentQ.difficulty === 'HARD' ? 'bg-red-100 text-red-600' :
                currentQ.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {currentQ.difficulty === 'HARD' ? 'Hard' : currentQ.difficulty === 'MEDIUM' ? 'Medium' : 'Easy'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Q{currentIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Problem Description */}
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentQ.description}</p>

              {currentQ.inputFormat && (
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Input Format</h4>
                  <p className="text-sm text-slate-600">{currentQ.inputFormat}</p>
                </div>
              )}
              {currentQ.outputFormat && (
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Output Format</h4>
                  <p className="text-sm text-slate-600">{currentQ.outputFormat}</p>
                </div>
              )}
            </div>

            {/* Example */}
            {currentQ.example && (
              <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Examples:</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500">Input:</span>
                    <pre className="mt-1 bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">{currentQ.example.input}</pre>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">Output:</span>
                    <pre className="mt-1 bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">{currentQ.example.output}</pre>
                  </div>
                  {currentQ.example.explanation && (
                    <div>
                      <span className="text-xs font-bold text-slate-500">Explanation:</span>
                      <p className="mt-1 text-sm text-slate-500 italic">{currentQ.example.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: CODE EDITOR + TEST RESULTS ═══ */}
        <div className="flex-1 flex flex-col bg-[#1e1e2e] overflow-hidden">

          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#282840] border-b border-[#3a3a5c] flex-shrink-0">
            <div className="flex items-center gap-3">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">Solution</span>
            </div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider bg-[#1e1e2e] px-3 py-1 rounded-lg">
              {currentQ.codeLanguage || 'code'}
            </span>
          </div>

          {/* Code Editor with Line Numbers */}
          <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
            {/* Line Numbers */}
            <div
              ref={lineNumberRef}
              className="text-right pr-3 pl-3 pt-4 pb-4 select-none overflow-hidden bg-[#1e1e2e] border-r border-[#2a2a48]"
              style={{ minWidth: 48, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace', fontSize: 13, lineHeight: '20px', color: '#555580' }}
            >
              {codeLines.map((_, i) => (
                <div key={i} style={{ height: 20 }}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={solutions[currentIndex] || ''}
              onChange={(e) => setSolutions(prev => ({ ...prev, [currentIndex]: e.target.value }))}
              onScroll={handleEditorScroll}
              onKeyDown={handleTabKey}
              className="flex-1 bg-[#1e1e2e] text-[#e0e0ff] font-mono p-4 focus:outline-none resize-none"
              style={{ fontSize: 13, lineHeight: '20px', tabSize: 4 }}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>

          {/* ─── TEST RESULTS PANEL ─── */}
          {currentResult && (
            <div className="border-t border-[#3a3a5c] bg-white max-h-[40%] overflow-y-auto flex-shrink-0">
              {/* Panel Header */}
              <div className={`flex items-center justify-between px-5 py-3 border-b ${
                currentResult.compileError
                  ? 'bg-red-50 border-red-200'
                  : currentResult.passed
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    currentResult.compileError ? 'text-red-500' :
                    currentResult.passed ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {currentResult.compileError ? 'Compile Error' :
                     currentResult.passed ? 'Accepted' : 'Wrong Answer'}
                  </span>
                  {!currentResult.compileError && currentResult.testResults?.length > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      currentResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {currentResult.testResults.filter(t => t.passed).length}/{currentResult.testResults.length} passed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setTestResults(prev => { const copy = { ...prev }; delete copy[currentIndex]; return copy; })}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compile Error */}
              {currentResult.compileError && (
                <div className="p-5">
                  <pre className="bg-red-50 rounded-xl p-4 border border-red-100 text-red-600 text-sm font-mono whitespace-pre-wrap">{currentResult.compileError}</pre>
                </div>
              )}

              {/* Test Case Tabs */}
              {!currentResult.compileError && currentResult.testResults?.length > 0 && (
                <div className="p-5">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {currentResult.testResults.map((test, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestTab(idx)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                          activeTestTab === idx
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {test.passed
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />
                        }
                        {test.hidden ? `Hidden ${test.index}` : `Case ${test.index}`}
                      </button>
                    ))}
                  </div>

                  {/* Active Test Content */}
                  {currentResult.testResults[activeTestTab] && (
                    <div className="space-y-3">
                      {currentResult.testResults[activeTestTab].input !== undefined && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 mb-1 block">Input</span>
                          <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                            {currentResult.testResults[activeTestTab].input}
                          </div>
                        </div>
                      )}
                      {currentResult.testResults[activeTestTab].actual !== undefined && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 mb-1 block">Output</span>
                          <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                            {currentResult.testResults[activeTestTab].actual}
                          </div>
                        </div>
                      )}
                      {currentResult.testResults[activeTestTab].expected !== undefined && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 mb-1 block">Expected</span>
                          <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                            {currentResult.testResults[activeTestTab].expected}
                          </div>
                        </div>
                      )}
                      {currentResult.testResults[activeTestTab].error && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 mb-1 block">Runtime Error</span>
                          <div className="bg-red-50 rounded-lg p-3 border border-red-100 font-mono text-sm text-red-700 whitespace-pre-wrap">
                            {currentResult.testResults[activeTestTab].error}
                          </div>
                        </div>
                      )}
                      {currentResult.testResults[activeTestTab].hidden && (
                        <p className="text-slate-400 italic text-sm py-2">Hidden test case details are not visible.</p>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold ${
                    currentResult.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {currentResult.passed
                      ? '✅ All visible test cases passed — you can move to the next question.'
                      : '⚠️ Fix the failing test cases and run your code again.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── BOTTOM ACTION BAR ─── */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-400 uppercase">{currentQ.codeLanguage}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Compile & Run */}
              <button
                onClick={() => handleRunCode(currentIndex)}
                disabled={runningIdx !== null}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-xl font-bold text-sm transition-all border border-slate-200"
              >
                {runningIdx === currentIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Compile & Run
              </button>

              {/* Submit / Next */}
              <button
                onClick={handleSubmitAndNext}
                disabled={!completedQuestions[currentIndex]}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  completedQuestions[currentIndex]
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {currentIndex === questions.length - 1 ? (
                  <>
                    <Trophy className="w-4 h-4" />
                    Finish Test
                  </>
                ) : (
                  <>
                    Submit
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
