import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

interface Balloon {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const confettiColors = ['#FF69B4', '#FFD700', '#00CED1', '#9B59B6', '#FF1493', '#00FFFF'];
const balloonColors = ['#FF69B4', '#9B59B6', '#00CED1', '#FFD700', '#FF1493'];

function generateConfetti(count: number): Confetti[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));
}

function generateBalloons(count: number): Balloon[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
    delay: Math.random() * 3,
    size: 40 + Math.random() * 30,
  }));
}

export default function Fireworks() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [key, setKey] = useState(0);

  const startCelebration = useCallback(() => {
    setConfetti(generateConfetti(50));
    setBalloons(generateBalloons(15));
    setIsPlaying(true);
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    startCelebration();
  }, [startCelebration]);

  const handleReplay = () => {
    startCelebration();
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden relative">
        {/* Confetti */}
        <AnimatePresence>
          {isPlaying && confetti.map((piece) => (
            <motion.div
              key={`${key}-confetti-${piece.id}`}
              initial={{ y: -20, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
              animate={{ 
                y: '110vh', 
                rotate: 720,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: piece.duration,
                delay: piece.delay,
                ease: 'linear'
              }}
              className="fixed top-0 w-3 h-3 z-10"
              style={{ 
                backgroundColor: piece.color,
                left: 0,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </AnimatePresence>

        {/* Balloons */}
        <AnimatePresence>
        {isPlaying && balloons.map((balloon) => (
            <motion.div
              key={`${key}-balloon-${balloon.id}`}
              initial={{ y: '110vh', x: `${balloon.x}vw`, rotate: -5 }}
              animate={{ 
                y: '-20vh',
                rotate: [-5, 5, -5],
              }}
              transition={{ 
                y: { duration: 8, delay: balloon.delay, ease: 'linear' },
                rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="fixed bottom-0 z-5"
              style={{ 
                left: 0,
                fontSize: balloon.size,
              }}
            >
              🎈
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main Content */}
        <div className="text-center relative z-20">
          {/* Sparkles decoration */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-16 h-16 text-birthday-gold" />
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8,
              type: 'spring',
              bounce: 0.5
            }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-4">
              <motion.span
                animate={{ 
                  textShadow: [
                    '0 0 20px hsl(330 85% 65% / 0.5)',
                    '0 0 40px hsl(330 85% 65% / 0.8)',
                    '0 0 20px hsl(330 85% 65% / 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="gradient-text inline-block"
              >
                Happy Birthday!
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8"
          >
            Wishing you all the joy and happiness! 🎉
          </motion.p>

          {/* Animated emojis */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-4 text-4xl md:text-6xl mb-12"
          >
            {['🎂', '🎁', '🎊', '🥳', '🎈'].map((emoji, i) => (
              <motion.span
                key={emoji}
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          {/* Replay Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={handleReplay}
            className="magic-button text-primary-foreground group"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 group-hover:rotate-[-360deg] transition-transform duration-500" />
              Replay Celebration
            </span>
          </motion.button>
        </div>

        {/* Background glow effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-birthday-pink/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-birthday-purple/20 rounded-full blur-[100px]"
          />
        </div>
      </div>
    </PageTransition>
  );
}
