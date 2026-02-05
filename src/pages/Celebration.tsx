import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Heart, Quote, X, Play, Pause, SkipForward, SkipBack, Volume2, ChevronDown, Send, Loader2, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMainMessage, useWishes, usePhotos, useSongs, useSettings, Photo, Song } from '@/hooks/useBirthdayData';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AudioVisualizer from '@/components/ui/AudioVisualizer';
import GalleryView from '@/components/gallery/GalleryView';
import SectionTransition, { SectionDivider, ParallaxBackground } from '@/components/ui/SectionTransition';
import CelebrationBackground3D from '@/components/three/CelebrationBackground3D';
import FloatingHearts from '@/components/ui/FloatingHearts';
import { useConfetti } from '@/components/ui/Confetti';
import zuhaCutout from '@/assets/zuha-cutout.png';
import defaultSongCover from '@/assets/default-song-cover.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Typewriter effect for message
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-muted-foreground">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5" />
      )}
    </p>
  );
}

// Equalizer bars for music
function EqualizerBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={isPlaying ? {
            height: ['8px', '16px', '8px', '12px', '8px'],
          } : { height: '4px' }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Section wrapper with scroll animation
function Section({ 
  id, 
  children, 
  className = '' 
}: { 
  id: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <section id={id} className={`min-h-screen py-20 px-4 ${className}`}>
      {children}
    </section>
  );
}

// Floating cutout with gentle float + pulse glow effect
function FloatingCutout({ customImageUrl }: { customImageUrl?: string | null }) {
  const imageSrc = customImageUrl || zuhaCutout;
  
  return (
    <motion.div
      className="fixed z-30 pointer-events-none right-2 bottom-24 md:right-8 md:bottom-32"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <motion.div
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      >
        {/* Pulsing glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.img 
          src={imageSrc} 
          alt="" 
          className="relative w-20 sm:w-24 md:w-32 lg:w-44 h-auto"
          style={{
            mixBlendMode: 'multiply',
            filter: 'brightness(1.35) contrast(1.1)',
          }}
          animate={{
            filter: [
              'brightness(1.35) contrast(1.1) drop-shadow(0 0 15px hsl(var(--primary) / 0.5))',
              'brightness(1.4) contrast(1.1) drop-shadow(0 0 30px hsl(var(--primary) / 0.7))',
              'brightness(1.35) contrast(1.1) drop-shadow(0 0 15px hsl(var(--primary) / 0.5))',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Celebration() {
  const { data: mainMessage, isLoading: loadingMain } = useMainMessage();
  const { data: wishes, isLoading: loadingWishes } = useWishes();
  const { data: photos, isLoading: loadingPhotos } = usePhotos();
  const { data: songs, isLoading: loadingSongs } = useSongs();
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { toast } = useToast();
  const { fireConfetti, fireHearts } = useConfetti();
  
  const [showMessage, setShowMessage] = useState(false);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const memoriesSectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayed = useRef(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const handleRevealMessage = () => {
    setShowMessage(true);
    fireConfetti();
    setTimeout(() => fireHearts(), 300);
  };
  
  // Visual effect settings
  const showScrollAnimations = settings?.show_scroll_animations ?? true;
  const showAudioVisualizer = settings?.show_audio_visualizer ?? true;
  const showFloatingImage = (settings as any)?.show_floating_image ?? true;
  const floatingImageUrl = (settings as any)?.floating_image_url || null;
  const backgroundWord = (settings as any)?.background_word || 'LOVE';

  // Send message to admin via Telegram
  const handleSendMessage = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Message is empty",
        description: "Please write something before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram', {
        body: {
          message: replyMessage,
          senderName: settings?.birthday_name || 'Birthday Girl',
        },
      });

      if (error) throw error;

      toast({
        title: "Message sent! 💌",
        description: "Your message has been delivered.",
      });
      setReplyMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast({
        title: "Couldn't send message",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Initialize first song on mount (so the "Now Playing" bar always shows)
  // If an audio URL exists, we attempt autoplay; otherwise we just select the first song.
  useEffect(() => {
    if (!hasAutoPlayed.current && songs && songs.length > 0) {
      hasAutoPlayed.current = true;

      const firstSongId = songs[0].id;
      setCurrentSong(firstSongId);

      const firstPlayableSong = songs.find(s => s.audio_url);
      if (firstPlayableSong) {
        setCurrentSong(firstPlayableSong.id);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  }, [songs]);

  // Create persistent audio element once on mount (required for visualizer to work)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous'; // Required for audio context
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle audio playback - change source when song changes
  useEffect(() => {
    if (!currentSong || !songs || !audioRef.current) return;

    const song = songs.find(s => s.id === currentSong);
    const audio = audioRef.current;

    // If there's no audio for this track, stop playback
    if (!song?.audio_url) {
      audio.pause();
      audio.src = '';
      if (isPlaying) setIsPlaying(false);
      return;
    }

    // Only change source if it's different
    if (audio.src !== song.audio_url) {
      audio.src = song.audio_url;
      audio.load();
      
      // Auto-play when source changes
      audio.play().catch((err) => {
        console.warn('Autoplay blocked:', err);
        setIsPlaying(false);
      });
    }

    // Handle song end - play next playable song
    const handleEnded = () => {
      const currentIndex = songs.findIndex(s => s.id === currentSong);
      const nextSong = songs.slice(currentIndex + 1).find(s => s.audio_url);
      if (nextSong) {
        setCurrentSong(nextSong.id);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, songs]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Track current time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef.current]);

  // Format time as mm:ss
  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlayPause = (songId: string) => {
    if (!songs) return;

    const song = songs.find(s => s.id === songId);
    const canPlay = Boolean(song?.audio_url);

    // Always allow selecting a song so UI updates, even if it's not playable yet.
    if (currentSong !== songId) setCurrentSong(songId);

    if (!canPlay) {
      setIsPlaying(false);
      return;
    }

    if (currentSong === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePrevSong = () => {
    if (!songs || songs.length === 0) return;
    const activeId = currentSong ?? songs[0].id;

    const currentIndex = songs.findIndex(s => s.id === activeId);
    if (currentIndex <= 0) return;

    const prevPlayable = songs.slice(0, currentIndex).reverse().find(s => s.audio_url);
    if (prevPlayable) {
      setCurrentSong(prevPlayable.id);
      setIsPlaying(true);
    } else {
      setCurrentSong(songs[currentIndex - 1].id);
      setIsPlaying(false);
    }
  };

  const handleNextSong = () => {
    if (!songs || songs.length === 0) return;
    const activeId = currentSong ?? songs[0].id;

    const currentIndex = songs.findIndex(s => s.id === activeId);
    if (currentIndex < 0 || currentIndex >= songs.length - 1) return;

    const nextPlayable = songs.slice(currentIndex + 1).find(s => s.audio_url);
    if (nextPlayable) {
      setCurrentSong(nextPlayable.id);
      setIsPlaying(true);
    } else {
      setCurrentSong(songs[currentIndex + 1].id);
      setIsPlaying(false);
    }
  };

  const scrollToMemories = () => {
    memoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isLoading = loadingMain || loadingWishes || loadingPhotos || loadingSongs || loadingSettings;

  const nowPlayingSongId = currentSong ?? (songs?.[0]?.id ?? null);
  const nowPlayingSong = nowPlayingSongId ? songs?.find(s => s.id === nowPlayingSongId) : undefined;
  // Simple fade in while loading - no spinner animation
  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0612]" />;
  }

  return (
    <div className="relative overflow-hidden">
      {/* 3D Background */}
      <CelebrationBackground3D word={backgroundWord} />
      
      {/* Floating Hearts Background */}
      <FloatingHearts count={12} />
      
      {/* Floating Zuha cutout with parallax - Desktop: right side, Mobile: bottom right */}
      {showFloatingImage && <FloatingCutout customImageUrl={floatingImageUrl} />}
      
      {/* Memory Game Link */}
      {photos && photos.length >= 4 && (
        <Link
          to="/memory-game"
          className="fixed left-4 bottom-24 md:left-8 md:bottom-32 z-30 group"
        >
          <motion.div
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:inline">Play Memory Game</span>
          </motion.div>
        </Link>
      )}
      
      {/* MESSAGE SECTION */}
      <Section id="message" className="flex flex-col items-center justify-center relative">
        <ParallaxBackground intensity={0.2}>
          <div className="container mx-auto max-w-4xl">

            {/* Header with sparkle-in effect */}
            <SectionTransition type="sparkle-in">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center mb-12"
              >
                <motion.h1 
                  className="text-4xl md:text-6xl font-display gradient-text glow-text mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  A Special Message
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Words from the heart, just for you 💌
                </motion.p>
              </motion.div>
            </SectionTransition>

            {/* Main Message Card with wave reveal */}
            <SectionTransition type="wave-reveal">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
              >
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
                      onClick={handleRevealMessage}
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
                    <TypewriterText text={mainMessage?.content || ''} />
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
            </SectionTransition>

            {/* Wishes Section with fade-scale */}
            {wishes && wishes.length > 0 && (
              <SectionTransition type="fade-scale">
                <ScrollReveal enabled={showScrollAnimations} delay={0.2}>
                  <h2 className="text-2xl md:text-3xl font-display text-center mb-8 gradient-text">
                    Birthday Wishes
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {wishes.map((wish, index) => (
                      <ScrollReveal 
                        key={wish.id} 
                        enabled={showScrollAnimations}
                        delay={index * 0.1}
                      >
                        <motion.div
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
                      </ScrollReveal>
                    ))}
                  </div>
                </ScrollReveal>
              </SectionTransition>
            )}

            {/* Scroll indicator */}
            <motion.button
              onClick={scrollToMemories}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ 
                opacity: { delay: 1 },
                y: { repeat: Infinity, duration: 2 }
              }}
              className="mx-auto block text-center text-muted-foreground hover:text-primary transition-colors"
            >
              <p className="text-sm mb-2">Scroll to see memories</p>
              <ChevronDown className="w-6 h-6 mx-auto" />
            </motion.button>
          </div>
        </ParallaxBackground>
      </Section>

      {/* Section Divider */}
      <SectionDivider variant="hearts" />

      {/* MEMORIES SECTION */}
      <Section id="memories" className="relative">
        <ParallaxBackground intensity={0.15}>
          <section ref={memoriesSectionRef} className="container mx-auto max-w-6xl">
            {/* Header with curtain reveal */}
            <SectionTransition type="curtain">
              <ScrollReveal enabled={showScrollAnimations} className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.h1 
                    className="text-4xl md:text-6xl font-display gradient-text glow-text mb-4"
                    initial={{ opacity: 0, y: 30, rotateX: 20 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  >
                    Cherished Memories
                  </motion.h1>
                  <motion.p 
                    className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    A collection of beautiful moments and precious memories 💝
                  </motion.p>
                </motion.div>
              </ScrollReveal>
            </SectionTransition>

            {/* Photo Gallery with view options */}
            {photos && photos.length > 0 && (
              <SectionTransition type="parallax-zoom">
                <ScrollReveal enabled={showScrollAnimations} delay={0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <GalleryView 
                      photos={photos} 
                      className="mb-16"
                    />
                  </motion.div>
                </ScrollReveal>
              </SectionTransition>
            )}

            {/* Section Divider before playlist */}
            <SectionDivider variant="sparkles" />

            {/* PLAYLIST SECTION with slide-rotate */}
            {songs && songs.length > 0 && (
              <SectionTransition type="slide-rotate">
                <ScrollReveal enabled={showScrollAnimations} className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -2 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <h2 className="text-3xl md:text-4xl font-display text-center gradient-text glow-text mb-4">
                      Birthday Playlist
                    </h2>
                    <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-4">
                      A curated collection of songs to celebrate this special day 🎵
                    </p>
                  </motion.div>
                  
                  {/* Audio Visualizer */}
                  {showAudioVisualizer && (
                    <div className="mb-8 p-4 glass-card rounded-2xl">
                      <AudioVisualizer 
                        audioElement={audioRef.current} 
                        isPlaying={isPlaying}
                        barCount={48}
                      />
                    </div>
                  )}

                  {/* Song List */}
                  <div className="space-y-3 pb-8">
                    {songs.map((song, index) => {
                      const isCurrentSong = currentSong === song.id;
                      const isSongPlaying = isCurrentSong && isPlaying;

                      return (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, x: -30, y: 20 }}
                          whileInView={{ opacity: 1, x: 0, y: 0 }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ 
                            delay: index * 0.08, 
                            duration: 0.5,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                          whileHover={{ x: 8, scale: 1.02 }}
                          className={`glass-card p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                            isCurrentSong ? 'ring-2 ring-primary glow-box' : ''
                          }`}
                          onClick={() => handlePlayPause(song.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <motion.div 
                                className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden"
                                whileHover={{ rotate: 3 }}
                              >
                                <img 
                                  src={song.cover_url || defaultSongCover} 
                                  alt={song.title} 
                                  className="w-full h-full object-cover" 
                                />
                              </motion.div>
                              {isSongPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                                  <EqualizerBars isPlaying={isSongPlaying} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold truncate ${isCurrentSong ? 'text-primary' : ''}`}>
                                {song.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-3 rounded-full transition-colors ${
                                isCurrentSong 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted hover:bg-primary/20'
                              }`}
                            >
                              {isSongPlaying ? (
                                <Pause className="w-5 h-5" fill="currentColor" />
                              ) : (
                                <Play className="w-5 h-5" fill="currentColor" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollReveal>
              </SectionTransition>
            )}

            {/* Section Divider before message */}
            <SectionDivider variant="stars" />

            {/* Send a Reply Section with fade-up */}
            <SectionTransition type="fade-up">
              <ScrollReveal enabled={showScrollAnimations} className="max-w-2xl mx-auto mt-16">
                <motion.div 
                  className="glass-card rounded-3xl p-8 text-center"
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.h2 
                    className="text-2xl md:text-3xl font-display gradient-text mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Send a Message 💌
                  </motion.h2>
                  <motion.p 
                    className="text-muted-foreground mb-6"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Want to say something back? Send a message and it'll reach me instantly!
                  </motion.p>
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                      maxLength={1000}
                    />
                    <div className="flex justify-end">
                      <motion.button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !replyMessage.trim()}
                        className="magic-button text-primary-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSendingMessage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            </SectionTransition>

            {/* Footer */}
            <div className="text-center py-12 mt-8 pb-32">
              <p className="text-lg text-muted-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Made with 🎮 by Murphy (you're welcome, noob)
              </p>
            </div>
          </section>
        </ParallaxBackground>
      </Section>


      {/* Now Playing Bar */}
      <AnimatePresence>
        {nowPlayingSongId && songs && songs.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/30 z-40"
          >
            {/* Seek Bar - Full Width at Top */}
            <div 
              ref={seekBarRef}
              onClick={handleSeek}
              className="w-full h-1.5 bg-muted cursor-pointer group hover:h-2 transition-all"
            >
              <div 
                className="h-full bg-primary rounded-r-full relative"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>

            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                {/* Song Info with Cover */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shadow-lg relative"
                    animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img
                      src={nowPlayingSong?.cover_url || defaultSongCover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-background/40 flex items-center justify-center rounded-xl">
                        <EqualizerBars isPlaying={isPlaying} />
                      </div>
                    )}
                  </motion.div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-primary">
                      {nowPlayingSong?.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {nowPlayingSong?.artist}
                    </p>
                    {nowPlayingSong?.audio_url && (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </p>
                    )}
                    {!nowPlayingSong?.audio_url && (
                      <p className="text-xs text-muted-foreground truncate">
                        Upload an MP3 to enable playback
                      </p>
                    )}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSong}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    disabled={!nowPlayingSong?.audio_url}
                    onClick={() => {
                      if (!nowPlayingSong?.audio_url) return;
                      if (!currentSong) setCurrentSong(nowPlayingSongId);
                      setIsPlaying(!isPlaying);
                    }}
                    className={`p-3 rounded-full transition-colors ${
                      nowPlayingSong?.audio_url
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" fill="currentColor" />
                    ) : (
                      <Play className="w-6 h-6" fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={handleNextSong}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume (desktop only) */}
                <div className="hidden md:flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div className="w-24 h-1 bg-muted rounded-full">
                    <div className="w-3/4 h-full bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
