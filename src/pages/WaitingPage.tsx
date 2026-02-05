import { motion } from 'framer-motion';
import { Gamepad2, Clock, Lock, Skull, Heart, Sparkles, Star } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Countdown from '@/components/ui/Countdown';
import FloatingText3D from '@/components/three/FloatingText3D';
import { Settings } from '@/hooks/useBirthdayData';

interface WaitingPageProps {
  birthdayDate: Date;
  settings?: Settings | null;
}

export default function WaitingPage({ birthdayDate, settings }: WaitingPageProps) {
  const themeType = settings?.theme_type || 'brotherly';
  const birthdayName = settings?.birthday_name || 'Someone';
  const landingPageWord = settings?.landing_page_word || 'ZUHA';
  const isSisterly = themeType === 'sisterly';
  const isSimple = themeType === 'brotherly-simple';

  // Theme-based messages
  const sarcasticMessages = isSisterly
    ? [
        "Patience, beautiful! Good things take time ✨",
        "Almost there! The magic is brewing 💖",
        "Not yet, but it'll be worth the wait! 🌸",
        "Hang tight, something special is coming! 💫",
      ]
    : isSimple
    ? [
        "Coming soon! Just a little longer.",
        "The countdown is on!",
        "Almost there, hang tight!",
        "Good things come to those who wait.",
      ]
    : [
        "Trying to peek early? Classic you. 🙄",
        "Nope, not yet. Go touch some grass. 🌿",
        "Patience isn't your strong suit, is it? 😏",
        "The anticipation is killing you, huh? Good. 💀",
        "Come back when it's actually your birthday, noob. 🎮",
      ];

  const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0612]">
        {/* 3D Background */}
        <FloatingText3D word={landingPageWord} />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612] via-transparent to-[#0a0612]/80 pointer-events-none z-[1]" />
        
        {/* Gaming-style glitch particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Lock icon with gaming flair */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.3)',
                    '0 0 40px hsl(var(--primary) / 0.6)',
                    '0 0 20px hsl(var(--primary) / 0.3)',
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 rounded-2xl bg-card/80 border border-border flex items-center justify-center"
              >
                <Lock className="w-12 h-12 text-primary" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="absolute -top-2 -right-2"
              >
                {isSisterly ? (
                  <Heart className="w-8 h-8 text-accent" />
                ) : (
                  <Gamepad2 className="w-8 h-8 text-accent" />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display gradient-text glow-text mb-4"
          >
            {isSisterly ? 'Not Quite Yet, Beautiful' : isSimple ? 'Coming Soon' : 'Access Denied, Bro'}
          </motion.h1>

          {/* Sarcastic subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-2"
          >
            {randomMessage}
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 my-8"
          >
            <div className="h-px w-16 md:w-32 bg-gradient-to-r from-transparent to-primary" />
            {isSisterly ? (
              <Sparkles className="w-6 h-6 text-primary" />
            ) : (
              <Skull className="w-6 h-6 text-primary" />
            )}
            <div className="h-px w-16 md:w-32 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>

          {/* Countdown section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <p className="text-sm text-primary/80 mb-4 uppercase tracking-[0.3em] font-medium flex items-center justify-center gap-2">
              {isSisterly ? (
                <>
                  <Star className="w-4 h-4" />
                  Magic Countdown
                  <Star className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  {isSimple ? 'Countdown' : 'Respawn Timer'}
                  {isSimple ? <Clock className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
                </>
              )}
            </p>
            <Countdown targetDate={birthdayDate} />
          </motion.div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="glass-card rounded-xl p-6 max-w-md mx-auto"
          >
            <p className="text-muted-foreground">
              {isSisterly 
                ? `This page unlocks on your birthday, ${birthdayName}! The wait will be worth it, I promise! 💖`
                : isSimple
                ? `This page unlocks on your birthday. See you soon!`
                : `This page unlocks on your birthday. Until then, maybe go practice your gaming skills or something.`}
              <span className="text-primary">
                {isSisterly ? ' See you soon, beautiful! ✨' : isSimple ? ' 🎂' : ' See you soon, loser! 😎'}
              </span>
            </p>
          </motion.div>

          {/* Floating emojis - theme based */}
          <div className="mt-12">
            {(isSisterly ? ['💖', '✨', '🌸', '💫', '🎀'] : isSimple ? ['🎂', '🎁', '🎉', '🎈', '⭐'] : ['🎮', '💀', '🔥', '⚡', '🏆']).map((emoji, i) => (
              <motion.span
                key={i}
                className="inline-block text-2xl md:text-3xl mx-2"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + i * 0.3,
                  delay: i * 0.2,
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
