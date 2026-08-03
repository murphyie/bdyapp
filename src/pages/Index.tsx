import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gamepad2, Star, Skull, Heart } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Countdown from '@/components/ui/Countdown';
import FloatingText3D from '@/components/three/FloatingText3D';
import PortalTransition from '@/components/transitions/PortalTransition';
import { useCelebrationAccess } from '@/hooks/useCelebrationAccess';

export default function Index() {
  const navigate = useNavigate();
  const { hasAccess, birthdayDate, isTestingMode, isLoading, settings } = useCelebrationAccess();
  
  const [showPortal, setShowPortal] = useState(false);

  const handleEnterCelebration = () => {
    if (!hasAccess) return;
    setShowPortal(true);
  };

  const handlePortalComplete = () => {
    navigate('/celebration');
  };

  // Show testing mode indicator only when date hasn't arrived but testing is on
  const showTestingIndicator = isTestingMode && new Date() < birthdayDate;

  // Get theme type and birthday name from settings
  const themeType = settings?.theme_type || 'brotherly';
  const birthdayName = settings?.birthday_name || 'Someone';
  const landingPageWord = settings?.landing_page_word || 'ZUHA';
  const isSisterly = themeType === 'sisterly';
  const isSimple = themeType === 'brotherly-simple';

  // Redirect to /early if no access (unless in testing mode)
  useEffect(() => {
    if (!isLoading && !hasAccess && !isTestingMode) {
      navigate('/early', { replace: true });
    }
  }, [isLoading, hasAccess, isTestingMode, navigate]);

  // Show loader while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0612]">
        {/* 3D Background with customizable text */}
        <FloatingText3D word={landingPageWord} />
        
        {/* Dark overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612] via-transparent to-[#0a0612]/80 pointer-events-none z-[1]" />
        
        {/* Animated sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-birthday-pink rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="text-center max-w-4xl mx-auto relative z-10 mt-32">
          {/* Personal greeting - theme-based style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 text-accent text-sm md:text-base tracking-widest uppercase font-medium">
              {isSisterly ? (
                <>
                  <Heart className="w-4 h-4" />
                  For My Bauni Bacchi
                  <Heart className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4" />
                  For My {isSimple ? 'Awesome' : 'Annoying Little'} Bro
                  <Gamepad2 className="w-4 h-4" />
                </>
              )}
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 100 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display leading-none">
              <span className="block text-foreground mb-2">Happy Birthday</span>
              <span className="gradient-text glow-text block text-7xl md:text-9xl lg:text-[10rem]">{birthdayName}!</span>
            </h1>
          </motion.div>

          {/* Decorative line - theme-based style */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            {isSisterly ? (
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            ) : (
              <Skull className="w-6 h-6 text-accent animate-pulse" />
            )}
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </motion.div>

          {/* Personal message - theme-based */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed"
          >
            {isSisterly 
              ? `Hey ${birthdayName}! ✨ I made this just for you — filled with memories, music, and all the love in the world. Happy birthday, beautiful! 💖`
              : isSimple
              ? `Hey ${birthdayName}! I put this together for you — memories, music, and good vibes. Happy birthday! 🎉`
              : `Yo ${birthdayName}! Yeah, I actually made this for you — don't let it go to your head though. Just some memories, bangers, and proof that I tolerate you. Happy birthday, noob! 🎮`}
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-10"
          >
            <p className="text-xs text-accent/80 mb-4 uppercase tracking-[0.25em] font-medium">
              {isSisterly ? '✨ The Magic Begins In ✨' : isSimple ? '🎂 Countdown 🎂' : '⚡ Level Up In ⚡'}
            </p>
            <Countdown targetDate={birthdayDate} />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={handleEnterCelebration}
              disabled={!hasAccess}
              className={`magic-button text-primary-foreground group flex items-center gap-3 text-lg transition-all duration-300 ${
                !hasAccess 
                  ? 'opacity-50 cursor-not-allowed grayscale' 
                  : 'hover:scale-105'
              }`}
            >
              {hasAccess ? (
                <>
                  {isSisterly ? (
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isSisterly ? 'Begin the Magic' : isSimple ? 'Open Your Gift' : 'Enter the Arena'}</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {isSisterly ? '✨' : isSimple ? '🎁' : '🔥'}
                  </motion.span>
                </>
              ) : (
                <>
                  {isSisterly ? (
                    <Star className="w-5 h-5" />
                  ) : (
                    <Skull className="w-5 h-5" />
                  )}
                  <span>{isSisterly ? 'Not Yet, Beautiful' : isSimple ? 'Coming Soon' : 'Not Yet, Noob'}</span>
                  <span>🔒</span>
                </>
              )}
            </button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-xs text-muted-foreground/70"
            >
              {hasAccess 
                ? isSisterly 
                  ? 'Click to unwrap your surprise! 💝' 
                  : isSimple 
                  ? 'Click to see your birthday surprise!'
                  : 'Click it already, what are you waiting for? 😏'
                : isSisterly 
                ? 'The magic unlocks on your birthday! ✨' 
                : isSimple
                ? 'Available on your birthday!'
                : 'Chill bro, it unlocks on your birthday! 🎮'}
            </motion.p>
            
            {/* Testing mode indicator */}
            {showTestingIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 px-3 py-1 rounded-full bg-birthday-gold/20 border border-birthday-gold/30 text-birthday-gold text-xs font-medium"
              >
                🧪 Testing Mode Active
              </motion.div>
            )}
          </motion.div>

          {/* Portal Transition */}
          <PortalTransition isActive={showPortal} onComplete={handlePortalComplete} />
        </div>

        {/* Floating emojis decoration - theme-based */}
        {(isSisterly ? ['💖', '✨', '🌸', '💫', '🎀'] : isSimple ? ['🎂', '🎁', '🎉', '🎈', '⭐'] : ['🎮', '💀', '🔥', '⚡', '🏆']).map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl md:text-4xl z-[3]"
            style={{
              left: `${10 + i * 20}%`,
              bottom: '5%',
            }}
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4 + i * 0.5, 
              ease: "easeInOut",
              delay: i * 0.3
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
