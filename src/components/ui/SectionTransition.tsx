import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, ReactNode } from 'react';

type TransitionType = 
  | 'fade-up' 
  | 'fade-scale' 
  | 'slide-rotate' 
  | 'parallax-zoom' 
  | 'wave-reveal'
  | 'sparkle-in'
  | 'curtain';

interface SectionTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  className?: string;
  delay?: number;
}

export default function SectionTransition({ 
  children, 
  type = 'fade-up',
  className = '',
  delay = 0
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Smooth spring physics for scroll animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Different transform values based on transition type
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.9]);
  const rotate = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [-5, 0, 0, 5]);
  const x = useTransform(smoothProgress, [0, 0.3], [-50, 0]);

  const getTransitionStyle = () => {
    switch (type) {
      case 'fade-up':
        return { opacity, y };
      
      case 'fade-scale':
        return { opacity, scale };
      
      case 'slide-rotate':
        return { opacity, x, rotate };
      
      case 'parallax-zoom':
        return { 
          opacity, 
          scale,
          y: useTransform(smoothProgress, [0, 0.5, 1], [150, 0, -150])
        };
      
      case 'wave-reveal':
        return { 
          opacity,
          y: useTransform(smoothProgress, [0, 0.3], [80, 0]),
          rotateX: useTransform(smoothProgress, [0, 0.3], [15, 0])
        };
      
      case 'sparkle-in':
        return {
          opacity,
          scale: useTransform(smoothProgress, [0, 0.15, 0.3], [0.5, 1.05, 1]),
          filter: useTransform(
            smoothProgress, 
            [0, 0.3], 
            ['blur(10px)', 'blur(0px)']
          )
        };
      
      case 'curtain':
        return {
          opacity,
          clipPath: useTransform(
            smoothProgress,
            [0, 0.3],
            ['inset(50% 0 50% 0)', 'inset(0% 0 0% 0)']
          )
        };
      
      default:
        return { opacity, y };
    }
  };

  return (
    <motion.div
      ref={ref}
      style={getTransitionStyle()}
      className={className}
      initial={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}

// Divider component with animated particles
export function SectionDivider({ variant = 'stars' }: { variant?: 'stars' | 'hearts' | 'sparkles' }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const width = useTransform(scrollYProgress, [0, 0.5], ['0%', '100%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const icons = {
    stars: '✨',
    hearts: '💕',
    sparkles: '🌟'
  };

  return (
    <motion.div 
      ref={ref}
      className="relative py-16 flex items-center justify-center"
      style={{ opacity }}
    >
      {/* Animated line */}
      <div className="absolute inset-x-0 top-1/2 flex items-center">
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto"
          style={{ width }}
        />
      </div>
      
      {/* Center icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 text-3xl bg-background px-4"
      >
        {icons[variant]}
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-sm"
            initial={{ 
              x: `${15 + i * 14}%`, 
              y: '100%',
              opacity: 0 
            }}
            whileInView={{ 
              y: '-20%',
              opacity: [0, 1, 1, 0]
            }}
            viewport={{ once: true }}
            transition={{ 
              duration: 2,
              delay: i * 0.2,
              ease: 'easeOut'
            }}
          >
            {icons[variant]}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// Parallax background effect for sections
export function ParallaxBackground({ 
  children,
  intensity = 0.3 
}: { 
  children: ReactNode;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-intensity * 100}%`, `${intensity * 100}%`]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 -z-10"
        style={{ y }}
      >
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </motion.div>
      {children}
    </div>
  );
}

// Staggered reveal for groups of items
export function StaggerReveal({ 
  children,
  staggerDelay = 0.1,
  className = ''
}: { 
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            delay: index * staggerDelay,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
