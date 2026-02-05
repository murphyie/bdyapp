import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useMemo } from 'react';

interface FloatingHeartsProps {
  count?: number;
}

export default function FloatingHearts({ count = 15 }: FloatingHeartsProps) {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20,
      size: 12 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.2,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-primary"
          style={{
            left: `${heart.x}%`,
            opacity: heart.opacity,
          }}
          initial={{ y: '110vh', rotate: 0 }}
          animate={{
            y: '-10vh',
            rotate: [0, 10, -10, 0],
            x: [0, 20, -20, 0],
          }}
          transition={{
            y: {
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: 'linear',
            },
            rotate: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            x: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <Heart
            size={heart.size}
            fill="currentColor"
            className="drop-shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}
