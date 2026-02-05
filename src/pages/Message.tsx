import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Quote, Loader2 } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { useMainMessage, useWishes } from '@/hooks/useBirthdayData';

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <p className="text-lg leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5" />
      )}
    </p>
  );
}

export default function Message() {
  const { data: mainMessage, isLoading: loadingMain } = useMainMessage();
  const { data: wishes, isLoading: loadingWishes } = useWishes();
  const [showMessage, setShowMessage] = useState(false);

  if (loadingMain || loadingWishes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-display gradient-text glow-text mb-4">
              A Special Message
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Words from the heart, just for you 💌
            </p>
          </motion.div>

          {/* Main Message Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
          >
            {/* Decorative quote */}
            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20" />
            <Quote className="absolute bottom-6 right-6 w-12 h-12 text-primary/20 rotate-180" />
            
            {!showMessage ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-display text-primary mb-4">
                  A Heartfelt Message Awaits
                </h2>
                <p className="text-muted-foreground mb-8">
                  Click to reveal words written just for you
                </p>
                <button
                  onClick={() => setShowMessage(true)}
                  className="magic-button text-primary-foreground"
                >
                  Reveal Message
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10"
              >
                <div className="text-muted-foreground">
                  <TypewriterText text={mainMessage?.content || ''} />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (mainMessage?.content?.length || 0) * 0.02 + 0.5 }}
                  className="mt-8 pt-6 border-t border-border"
                >
                  <p className="font-display text-2xl text-primary text-right">
                    With all my love ❤️
                  </p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Wishes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-display text-center mb-8 gradient-text">
              Birthday Wishes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishes?.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                      💜
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">{wish.author_name || 'Friend'}</h3>
                      <p className="text-muted-foreground text-sm">{wish.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
