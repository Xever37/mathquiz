import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { quizData, Question } from './data';
import { CheckCircle2, XCircle, RefreshCw, Trophy, ChevronRight, Brain } from 'lucide-react';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState<{ q: string; a: string; user: string; correct: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * quizData.length);
    return quizData[randomIndex];
  };

  const startNewQuestion = () => {
    setCurrentQuestion(getRandomQuestion());
    setUserInput('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    startNewQuestion();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || feedback) return;

    const isCorrect = userInput.trim() === currentQuestion.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setHistory(prev => [
      {
        q: currentQuestion.question,
        a: currentQuestion.answer + (currentQuestion.unit || ''),
        user: userInput + (currentQuestion.unit || ''),
        correct: isCorrect
      },
      ...prev.slice(0, 4)
    ]);

    // Auto next after 1.5s if correct
    if (isCorrect) {
      setTimeout(startNewQuestion, 1500);
    }
  };

  const handleNext = () => {
    startNewQuestion();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Brain size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">数学常数测验</h1>
          <p className="text-gray-500 mt-2">练习百化分、平方、立方与四次方</p>
        </header>

        {/* Score Board */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">正确率</span>
            <span className="text-2xl font-bold text-blue-600">
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">已完成</span>
            <span className="text-2xl font-bold text-gray-800">{score.total}</span>
          </div>
        </div>

        {/* Main Quiz Card */}
        <motion.div 
          layout
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center"
                >
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
                    {currentQuestion.category}
                  </span>
                  
                  <div className="text-5xl font-black mb-8 text-gray-900 tracking-tighter">
                    {currentQuestion.question} = ?
                  </div>

                  <form onSubmit={handleSubmit} className="w-full relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={!!feedback}
                      placeholder="输入答案..."
                      className={`w-full text-center text-2xl font-bold py-4 px-6 rounded-2xl border-2 transition-all outline-none ${
                        feedback === 'correct' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : feedback === 'incorrect'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'
                      }`}
                    />
                    {currentQuestion.unit && !feedback && (
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                        {currentQuestion.unit}
                      </span>
                    )}
                    
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {feedback === 'correct' ? (
                            <CheckCircle2 className="text-green-500" size={32} />
                          ) : (
                            <XCircle className="text-red-500" size={32} />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {feedback === 'incorrect' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center"
                    >
                      <p className="text-sm text-gray-500 mb-1">正确答案是</p>
                      <p className="text-xl font-bold text-gray-800">
                        {currentQuestion.answer}{currentQuestion.unit}
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-8 w-full flex gap-3">
                    {!feedback ? (
                      <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                      >
                        检查答案
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        下一题 <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* History / Recent */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">最近记录</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {item.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.q}</p>
                      <p className="text-xs text-gray-400">你的回答: {item.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">正确答案</p>
                    <p className="font-bold text-blue-600">{item.a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <footer className="mt-12 text-center text-gray-400 text-xs pb-8">
          <p>点击“检查答案”或按回车键提交</p>
          <p className="mt-1">基于常用数学常数表制作</p>
        </footer>
      </div>
    </div>
  );
}
