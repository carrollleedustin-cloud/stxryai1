'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/nebula/MagicCard';
import { MagicButton } from '@/components/nebula/MagicButton';
import { MagicText } from '@/components/nebula/NebulaText';
import { MagicTopBar } from '@/components/nebula/MagicNav';

/**
 * KIDS ZONE - GAMES PAGE
 * Interactive educational mini-games that make learning fun!
 */

// ============================================
// WORD SCRAMBLE GAME
// ============================================
const wordList = [
  { word: 'DRAGON', hint: '🐉 A fire-breathing creature' },
  { word: 'CASTLE', hint: '🏰 Where kings and queens live' },
  { word: 'MAGIC', hint: '✨ Something supernatural' },
  { word: 'FAIRY', hint: '🧚 A tiny magical being' },
  { word: 'STAR', hint: '⭐ Twinkles in the night sky' },
  { word: 'MOON', hint: '🌙 Lights up the night' },
  { word: 'HERO', hint: '🦸 Someone who saves the day' },
  { word: 'BOOK', hint: '📚 Contains stories' },
];

function WordScrambleGame({ onEarnCoins }: { onEarnCoins: (coins: number) => void }) {
  const [currentWord, setCurrentWord] = useState(wordList[0]);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const scrambleWord = useCallback((word: string) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }, []);

  const newWord = useCallback(() => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomWord);
    setScrambled(scrambleWord(randomWord.word));
    setGuess('');
    setShowHint(false);
    setFeedback(null);
  }, [scrambleWord]);

  useEffect(() => {
    newWord();
  }, [newWord]);

  const checkAnswer = () => {
    if (guess.toUpperCase() === currentWord.word) {
      setFeedback('correct');
      const points = showHint ? 5 : 10;
      setScore(s => s + points);
      setStreak(s => s + 1);
      onEarnCoins(points);
      setTimeout(newWord, 1500);
    } else {
      setFeedback('wrong');
      setStreak(0);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40">
            <span className="text-purple-400 font-bold">Score: {score}</span>
          </div>
          {streak >= 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/40"
            >
              <span className="text-orange-400 font-bold">🔥 {streak} streak!</span>
            </motion.div>
          )}
        </div>
        <MagicButton size="sm" variant="secondary" onClick={() => setShowHint(true)}>
          💡 Hint
        </MagicButton>
      </div>

      <div className="text-center py-8">
        <motion.div
          key={scrambled}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold tracking-widest text-white mb-4"
          style={{ fontFamily: 'var(--font-kids)' }}
        >
          {scrambled.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="inline-block mx-1"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <AnimatePresence>
          {showHint && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white/60 text-lg"
            >
              {currentWord.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Type your answer..."
          className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border-2 border-white/10 text-white text-xl text-center font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-colors"
          style={{ fontFamily: 'var(--font-kids)' }}
        />
        <MagicButton size="lg" onClick={checkAnswer}>
          Check ✓
        </MagicButton>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`text-center text-3xl font-bold ${
              feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {feedback === 'correct' ? '🎉 Correct! +10 ⭐' : '❌ Try again!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MEMORY MATCH GAME
// ============================================
const emojiPairs = ['🐉', '🦄', '🧚', '🏰', '⭐', '🌙', '🦋', '🌈'];

function MemoryMatchGame({ onEarnCoins }: { onEarnCoins: (coins: number) => void }) {
  const [cards, setCards] = useState<{ emoji: string; id: number; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initGame = useCallback(() => {
    const pairs = emojiPairs.slice(0, 6);
    const shuffled = [...pairs, ...pairs]
      .map((emoji, id) => ({ emoji, id, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (selected.length === 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setMatches(m => m + 1);
          setSelected([]);
          
          if (matches + 1 === 6) {
            setGameComplete(true);
            onEarnCoins(Math.max(50 - moves * 2, 10));
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setSelected([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40">
            <span className="text-blue-400 font-bold">Moves: {moves}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40">
            <span className="text-green-400 font-bold">Matches: {matches}/6</span>
          </div>
        </div>
        <MagicButton size="sm" variant="secondary" onClick={initGame}>
          🔄 Restart
        </MagicButton>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <motion.button
            key={index}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50'
                : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
            }`}
            whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              initial={false}
              animate={{ 
                rotateY: card.flipped || card.matched ? 0 : 180,
                opacity: card.flipped || card.matched ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {card.emoji}
            </motion.span>
            {!card.flipped && !card.matched && (
              <span className="text-white/20">?</span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <h3 className="text-3xl font-bold text-green-400 mb-2">🎉 You Win!</h3>
            <p className="text-white/70">Completed in {moves} moves</p>
            <p className="text-yellow-400 font-bold mt-2">+{Math.max(50 - moves * 2, 10)} ⭐</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STORY QUIZ GAME
// ============================================
const quizQuestions = [
  {
    question: "What does the dragon breathe?",
    emoji: "🐉",
    options: ["Water", "Fire", "Ice", "Wind"],
    correct: 1,
  },
  {
    question: "Where does a princess live?",
    emoji: "👸",
    options: ["Cave", "Tree", "Castle", "Ocean"],
    correct: 2,
  },
  {
    question: "What do fairies have on their backs?",
    emoji: "🧚",
    options: ["Fins", "Tails", "Wings", "Horns"],
    correct: 2,
  },
  {
    question: "What magical creature has one horn?",
    emoji: "✨",
    options: ["Dragon", "Unicorn", "Phoenix", "Griffin"],
    correct: 1,
  },
  {
    question: "What do heroes often save?",
    emoji: "🦸",
    options: ["Rocks", "The day", "Socks", "Chairs"],
    correct: 1,
  },
];

function StoryQuizGame({ onEarnCoins }: { onEarnCoins: (coins: number) => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const currentQuestion = quizQuestions[questionIndex];

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    setShowResult(true);

    if (optionIndex === currentQuestion.correct) {
      setScore(s => s + 1);
      onEarnCoins(10);
    }

    setTimeout(() => {
      if (questionIndex + 1 < quizQuestions.length) {
        setQuestionIndex(i => i + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setGameComplete(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <div className="text-6xl mb-4">
          {score === quizQuestions.length ? '🏆' : score >= 3 ? '🌟' : '💪'}
        </div>
        <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-kids)' }}>
          {score === quizQuestions.length ? 'Perfect Score!' : score >= 3 ? 'Great Job!' : 'Good Try!'}
        </h3>
        <p className="text-xl text-white/70 mb-4">
          You got {score} out of {quizQuestions.length} correct!
        </p>
        <p className="text-yellow-400 font-bold text-xl mb-6">
          Total: +{score * 10} ⭐
        </p>
        <MagicButton onClick={restartQuiz}>
          Play Again 🔄
        </MagicButton>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40">
          <span className="text-purple-400 font-bold">
            Question {questionIndex + 1}/{quizQuestions.length}
          </span>
        </div>
        <div className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40">
          <span className="text-yellow-400 font-bold">Score: {score}</span>
        </div>
      </div>

      <motion.div
        key={questionIndex}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="text-center py-6"
      >
        <div className="text-6xl mb-4">{currentQuestion.emoji}</div>
        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-kids)' }}>
          {currentQuestion.question}
        </h3>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selected !== null}
            className={`p-6 rounded-2xl text-xl font-bold transition-all ${
              showResult
                ? index === currentQuestion.correct
                  ? 'bg-green-500/30 border-2 border-green-500'
                  : index === selected
                  ? 'bg-red-500/30 border-2 border-red-500'
                  : 'bg-white/5 border-2 border-white/10 opacity-50'
                : 'bg-white/5 border-2 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10'
            }`}
            whileHover={selected === null ? { scale: 1.02 } : {}}
            whileTap={selected === null ? { scale: 0.98 } : {}}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DRAWING PROMPT GAME
// ============================================
const drawingPrompts = [
  { prompt: "Draw a friendly dragon!", emoji: "🐉" },
  { prompt: "Draw a magical castle!", emoji: "🏰" },
  { prompt: "Draw your favorite animal!", emoji: "🐾" },
  { prompt: "Draw a rocket in space!", emoji: "🚀" },
  { prompt: "Draw a rainbow!", emoji: "🌈" },
  { prompt: "Draw a superhero!", emoji: "🦸" },
];

function DrawingPromptGame({ onEarnCoins }: { onEarnCoins: (coins: number) => void }) {
  const [currentPrompt, setCurrentPrompt] = useState(drawingPrompts[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [completed, setCompleted] = useState(false);

  const startDrawing = () => {
    setIsDrawing(true);
    setTimeLeft(60);
    const randomPrompt = drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)];
    setCurrentPrompt(randomPrompt);
    setCompleted(false);
  };

  useEffect(() => {
    if (isDrawing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isDrawing) {
      setIsDrawing(false);
      setCompleted(true);
      onEarnCoins(20);
    }
  }, [isDrawing, timeLeft, onEarnCoins]);

  const finishEarly = () => {
    setIsDrawing(false);
    setCompleted(true);
    onEarnCoins(20 + Math.floor(timeLeft / 2));
  };

  if (!isDrawing && !completed) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-6">🎨</div>
        <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-kids)' }}>
          Ready to draw?
        </h3>
        <p className="text-white/60 mb-6">
          Get a fun drawing prompt and show off your creativity!
        </p>
        <MagicButton size="lg" onClick={startDrawing}>
          Get a Prompt! ✨
        </MagicButton>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-8xl mb-6">🎉</div>
        <h3 className="text-2xl font-bold text-green-400 mb-4" style={{ fontFamily: 'var(--font-kids)' }}>
          Amazing artwork!
        </h3>
        <p className="text-yellow-400 font-bold text-xl mb-6">
          +{20 + Math.floor(timeLeft / 2)} ⭐
        </p>
        <MagicButton onClick={startDrawing}>
          Draw Again! 🎨
        </MagicButton>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40">
          <span className="text-blue-400 font-bold">⏱️ {timeLeft}s left</span>
        </div>
        <MagicButton size="sm" variant="secondary" onClick={finishEarly}>
          I'm Done! ✓
        </MagicButton>
      </div>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {currentPrompt.emoji}
        </motion.div>
        <h3 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-kids)' }}>
          {currentPrompt.prompt}
        </h3>
      </motion.div>

      <div className="bg-white/5 rounded-3xl p-8 border-2 border-dashed border-white/20 min-h-[200px] flex items-center justify-center">
        <p className="text-white/40 text-lg">
          Draw on paper or tablet and share with your family! 📝
        </p>
      </div>

      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// MAIN GAMES PAGE
// ============================================
const games = [
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    emoji: '🔤',
    description: 'Unscramble the letters to find the word!',
    color: 'purple' as const,
    component: WordScrambleGame,
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    emoji: '🧠',
    description: 'Find the matching pairs!',
    color: 'cyan' as const,
    component: MemoryMatchGame,
  },
  {
    id: 'story-quiz',
    title: 'Story Quiz',
    emoji: '❓',
    description: 'Test your story knowledge!',
    color: 'pink' as const,
    component: StoryQuizGame,
  },
  {
    id: 'drawing-prompt',
    title: 'Drawing Time',
    emoji: '🎨',
    description: 'Get creative with fun prompts!',
    color: 'gold' as const,
    component: DrawingPromptGame,
  },
];

export default function KidsZoneGamesPage() {
  const [coins, setCoins] = useState(150);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  
  const handleEarnCoins = (amount: number) => {
    setCoins(c => c + amount);
  };

  const activeGameData = games.find(g => g.id === activeGame);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <MagicTopBar showCoins={coins} />
      
      <div className="mt-20">
        {!activeGame ? (
          <>
            <section className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 
                  className="text-4xl sm:text-5xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-kids)' }}
                >
                  <MagicText>Game Arcade</MagicText>
                </h1>
                <p className="text-lg text-white/70">
                  Play games and earn stars! 🎮
                </p>
              </motion.div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-24">
              {games.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <MagicCard color={game.color}>
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-4xl"
                        whileHover={{ rotate: 10 }}
                      >
                        {game.emoji}
                      </motion.div>
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-bold text-white mb-1"
                          style={{ fontFamily: 'var(--font-kids)' }}
                        >
                          {game.title}
                        </h3>
                        <p className="text-sm text-white/60 mb-3">
                          {game.description}
                        </p>
                        <MagicButton
                          size="sm"
                          onClick={() => setActiveGame(game.id)}
                        >
                          Play Now ▶️
                        </MagicButton>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            <motion.button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-xl">←</span>
              <span>Back to Games</span>
            </motion.button>

            <MagicCard color={activeGameData?.color}>
              <div className="mb-6">
                <h2 
                  className="text-2xl font-bold text-white flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-kids)' }}
                >
                  <span className="text-3xl">{activeGameData?.emoji}</span>
                  {activeGameData?.title}
                </h2>
              </div>
              
              {activeGameData && <activeGameData.component onEarnCoins={handleEarnCoins} />}
            </MagicCard>
          </>
        )}
      </div>
    </div>
  );
}

