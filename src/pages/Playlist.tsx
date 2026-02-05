import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music2 } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

// Placeholder songs
const placeholderSongs = [
  { id: 1, title: 'Happy Birthday', artist: 'Birthday Classics', duration: '3:24', cover: '🎂' },
  { id: 2, title: 'Celebration', artist: 'Kool & The Gang', duration: '4:12', cover: '🎉' },
  { id: 3, title: 'Birthday', artist: 'The Beatles', duration: '2:42', cover: '🎈' },
  { id: 4, title: 'Good Times', artist: 'Chic', duration: '3:58', cover: '✨' },
  { id: 5, title: 'Dancing Queen', artist: 'ABBA', duration: '3:51', cover: '👑' },
  { id: 6, title: 'Uptown Funk', artist: 'Bruno Mars', duration: '4:30', cover: '🕺' },
  { id: 7, title: 'Happy', artist: 'Pharrell Williams', duration: '3:53', cover: '😊' },
  { id: 8, title: 'Best Day of My Life', artist: 'American Authors', duration: '3:14', cover: '🌟' },
];

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

export default function Playlist() {
  const [currentSong, setCurrentSong] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = (songId: number) => {
    if (currentSong === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(songId);
      setIsPlaying(true);
    }
  };

  const handlePlayAll = () => {
    setCurrentSong(placeholderSongs[0].id);
    setIsPlaying(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-32 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-display gradient-text glow-text mb-4">
              Birthday Playlist
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A curated collection of songs to celebrate this special day 🎵
            </p>
            
            <button
              onClick={handlePlayAll}
              className="magic-button text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" fill="currentColor" />
                Play All
              </span>
            </button>
          </motion.div>

          {/* Song List */}
          <div className="space-y-3">
            {placeholderSongs.map((song, index) => {
              const isCurrentSong = currentSong === song.id;
              const isSongPlaying = isCurrentSong && isPlaying;

              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 8 }}
                  className={`glass-card p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isCurrentSong ? 'ring-2 ring-primary glow-box' : ''
                  }`}
                  onClick={() => handlePlayPause(song.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Album Art / Emoji */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                        {song.cover}
                      </div>
                      {isSongPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                          <EqualizerBars isPlaying={isSongPlaying} />
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isCurrentSong ? 'text-primary' : ''}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>

                    {/* Duration */}
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {song.duration}
                    </span>

                    {/* Play/Pause Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
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
        </div>
      </div>

      {/* Now Playing Bar */}
      {currentSong && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/30"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Song Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                  {placeholderSongs.find(s => s.id === currentSong)?.cover}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate text-primary">
                    {placeholderSongs.find(s => s.id === currentSong)?.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {placeholderSongs.find(s => s.id === currentSong)?.artist}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-full bg-primary text-primary-foreground"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6" fill="currentColor" />
                  )}
                </button>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
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
    </PageTransition>
  );
}
