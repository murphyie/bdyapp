import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { usePhotos } from '@/hooks/useBirthdayData';
import { useConfetti } from '@/components/ui/Confetti';

interface Card {
  id: string;
  photoId: string;
  url: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const { data: photos, isLoading } = usePhotos();
  const { fireConfetti } = useConfetti();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const pairsCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  const initializeGame = useCallback(() => {
    if (!photos || photos.length < pairsCount) return;

    const shuffledPhotos = [...photos]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsCount);

    const cardPairs: Card[] = shuffledPhotos.flatMap((photo, index) => [
      {
        id: `${photo.id}-a`,
        photoId: photo.id,
        url: photo.url,
        isFlipped: false,
        isMatched: false,
      },
      {
        id: `${photo.id}-b`,
        photoId: photo.id,
        url: photo.url,
        isFlipped: false,
        isMatched: false,
      },
    ]);

    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setTimer(0);
    setIsPlaying(true);
  }, [photos, pairsCount]);

  useEffect(() => {
    if (photos && photos.length >= pairsCount) {
      initializeGame();
    }
  }, [photos, pairsCount, initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length === 2) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      
      const [first, second] = newFlipped;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.photoId === secondCard?.photoId) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.photoId === firstCard.photoId ? { ...c, isMatched: true } : c
            )
          );
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches === pairsCount) {
              setGameWon(true);
              setIsPlaying(false);
              fireConfetti();
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!photos || photos.length < 4) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">
              Need at least 4 photos to play! 📸
            </p>
            <Link to="/celebration" className="text-primary underline mt-4 block">
              Go back to celebration
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              to="/celebration"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Celebration
            </Link>
            <h1 className="text-4xl md:text-5xl font-display gradient-text glow-text mb-4">
              Memory Game 🧠
            </h1>
            <p className="text-muted-foreground">
              Match the photos to win! Find all pairs with the fewest moves.
            </p>
          </motion.div>

          {/* Difficulty Selector */}
          <div className="flex justify-center gap-2 mb-6">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  difficulty === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">{formatTime(timer)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {matches}/{pairsCount} pairs
                </span>
              </div>
              <div className="text-muted-foreground">
                {moves} moves
              </div>
            </div>
            <button
              onClick={initializeGame}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              New Game
            </button>
          </motion.div>

          {/* Game Board */}
          <div
            className={`grid gap-3 md:gap-4 ${
              difficulty === 'easy'
                ? 'grid-cols-4'
                : difficulty === 'medium'
                ? 'grid-cols-4'
                : 'grid-cols-4 md:grid-cols-4'
            }`}
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, rotateY: 180 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square perspective-1000"
              >
                <motion.div
                  onClick={() => handleCardClick(card.id)}
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`relative w-full h-full cursor-pointer preserve-3d ${
                    card.isMatched ? 'opacity-60' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center backface-hidden shadow-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-4xl">💝</span>
                  </div>
                  
                  {/* Card Front */}
                  <div
                    className="absolute inset-0 rounded-xl overflow-hidden backface-hidden shadow-lg"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <img
                      src={card.url}
                      alt="Memory card"
                      className="w-full h-full object-cover"
                    />
                    {card.isMatched && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <span className="text-3xl">✨</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Win Modal */}
          <AnimatePresence>
            {gameWon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="glass-card rounded-3xl p-8 text-center max-w-md"
                >
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-display gradient-text mb-4">
                    You Won! 🎉
                  </h2>
                  <div className="space-y-2 mb-6 text-muted-foreground">
                    <p>Time: {formatTime(timer)}</p>
                    <p>Moves: {moves}</p>
                    <p className="text-primary font-semibold">
                      Score: {Math.max(1000 - moves * 10 - timer * 2, 100)} points
                    </p>
                  </div>
                  <button
                    onClick={initializeGame}
                    className="magic-button text-primary-foreground"
                  >
                    Play Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
