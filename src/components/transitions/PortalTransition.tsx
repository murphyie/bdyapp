import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

interface PortalTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function PortalTransition({ isActive, onComplete }: PortalTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'particles' | 'complete'>('idle');
  const hasStarted = useRef(false);
  const onCompleteRef = useRef(onComplete);
  
  // Keep onComplete ref updated
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isActive && !hasStarted.current) {
      hasStarted.current = true;
      setPhase('expanding');
      
      // Phase 2: particles burst
      const particleTimer = setTimeout(() => {
        setPhase('particles');
      }, 600);
      
      // Phase 3: complete and navigate
      const completeTimer = setTimeout(() => {
        setPhase('complete');
        onCompleteRef.current();
      }, 1800);

      return () => {
        clearTimeout(particleTimer);
        clearTimeout(completeTimer);
      };
    }
    
    // Reset when deactivated
    if (!isActive) {
      hasStarted.current = false;
      setPhase('idle');
    }
  }, [isActive]);

  if (!isActive && phase === 'idle') return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0a0612]"
        >
          {/* Central portal ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: phase === 'expanding' ? [0, 1, 1.5] : [1.5, 50],
              opacity: phase === 'particles' ? [1, 0] : 1,
            }}
            transition={{ 
              duration: phase === 'expanding' ? 0.6 : 1.2,
              ease: 'easeInOut'
            }}
            className="absolute w-40 h-40 rounded-full border-4 border-primary"
            style={{
              boxShadow: '0 0 60px hsl(330, 85%, 65%), 0 0 120px hsl(330, 85%, 65%), inset 0 0 60px hsl(330, 85%, 65%)',
            }}
          />

          {/* Second ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: phase === 'expanding' ? [0, 0.8, 1.2] : [1.2, 40],
              opacity: phase === 'particles' ? [1, 0] : [0, 1],
            }}
            transition={{ 
              duration: phase === 'expanding' ? 0.6 : 1.2,
              delay: 0.1,
              ease: 'easeInOut'
            }}
            className="absolute w-40 h-40 rounded-full border-2 border-primary"
            style={{
              boxShadow: '0 0 40px hsl(330, 85%, 65%)',
            }}
          />

          {/* Third ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              scale: phase === 'expanding' ? [0, 0.6, 0.9] : [0.9, 35],
              opacity: phase === 'particles' ? [1, 0] : [0, 0.8],
              rotate: 180,
            }}
            transition={{ 
              duration: phase === 'expanding' ? 0.6 : 1.2,
              delay: 0.2,
              ease: 'easeInOut'
            }}
            className="absolute w-40 h-40 rounded-full border border-accent"
            style={{
              boxShadow: '0 0 30px hsl(45, 100%, 60%)',
            }}
          />

          {/* Center heart */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: phase === 'expanding' ? [0, 1.2, 1] : [1, 0],
              rotate: 0,
            }}
            transition={{ 
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
            }}
            className="absolute text-primary z-10"
          >
            <Heart className="w-12 h-12" fill="currentColor" />
          </motion.div>

          {/* Particle burst */}
          {phase !== 'idle' && [...Array(24)].map((_, i) => {
            const angle = (i / 24) * 360;
            const delay = i * 0.02;
            const distance = 400 + Math.random() * 200;
            
            return (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0, 
                  opacity: 0 
                }}
                animate={{ 
                  x: Math.cos(angle * Math.PI / 180) * distance,
                  y: Math.sin(angle * Math.PI / 180) * distance,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 1.2,
                  delay: 0.4 + delay,
                  ease: 'easeOut'
                }}
                className="absolute"
              >
                {i % 3 === 0 ? (
                  <Heart className="w-4 h-4 text-primary" fill="currentColor" />
                ) : i % 3 === 1 ? (
                  <Sparkles className="w-4 h-4 text-accent" />
                ) : (
                  <Star className="w-4 h-4 text-primary" fill="currentColor" />
                )}
              </motion.div>
            );
          })}

          {/* Sparkle trails */}
          {phase !== 'idle' && [...Array(40)].map((_, i) => {
            const angle = Math.random() * 360;
            const distance = 100 + Math.random() * 500;
            const size = 2 + Math.random() * 4;
            
            return (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 0,
                }}
                animate={{ 
                  x: Math.cos(angle * Math.PI / 180) * distance,
                  y: Math.sin(angle * Math.PI / 180) * distance,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 1 + Math.random() * 0.5,
                  delay: 0.3 + Math.random() * 0.5,
                  ease: 'easeOut'
                }}
                className="absolute rounded-full bg-primary"
                style={{ 
                  width: size, 
                  height: size,
                  boxShadow: `0 0 ${size * 2}px hsl(330, 85%, 65%)`,
                }}
              />
            );
          })}

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
            transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}
            className="absolute bottom-1/4 text-lg font-display text-accent"
          >
            ✨ Opening your surprise... ✨
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
