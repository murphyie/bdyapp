import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCelebrationAccess } from '@/hooks/useCelebrationAccess';
import Countdown from '@/components/ui/Countdown';

export default function Early() {
  const navigate = useNavigate();
  const { birthdayDate, settings, hasAccess } = useCelebrationAccess();
  const birthdayName = settings?.birthday_name || 'Someone Special';

  // If they have access, redirect to home
  if (hasAccess) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      
      {/* Subtle animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-lg mx-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-5xl font-display gradient-text mb-4"
        >
          Not Yet!
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-8"
        >
          {birthdayName}'s birthday celebration isn't ready yet.
          <br />
          <span className="text-primary">Come back on the special day!</span>
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Time remaining
          </p>
          <Countdown targetDate={birthdayDate} />
        </motion.div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </motion.button>
      </motion.div>
    </div>
  );
}
