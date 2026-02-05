import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface FilmstripGalleryProps {
  photos: Photo[];
}

export default function FilmstripGallery({ photos }: FilmstripGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!photos || photos.length === 0) return null;

  // Create sprocket holes pattern
  const SprocketHoles = ({ side }: { side: 'top' | 'bottom' }) => (
    <div className={`absolute ${side === 'top' ? 'top-1' : 'bottom-1'} left-0 right-0 flex justify-around px-4`}>
      {Array.from({ length: Math.max(photos.length * 3, 20) }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-sm bg-background/80 flex-shrink-0"
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Film Strip Container */}
        <div className="relative bg-zinc-900 rounded-lg py-6 overflow-hidden">
          <SprocketHoles side="top" />
          <SprocketHoles side="bottom" />

          {/* Photos Strip */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedPhoto(photo)}
                className="relative flex-shrink-0 cursor-pointer group"
              >
                {/* Film Frame */}
                <div className="bg-zinc-800 p-1 rounded">
                  <div className="w-48 aspect-[3/2] overflow-hidden rounded-sm">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Memory'}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:saturate-150"
                    />
                  </div>
                  
                  {/* Frame Number */}
                  <div className="absolute bottom-0 right-1 text-[10px] font-mono text-amber-500/70">
                    {String(index + 1).padStart(2, '0')}A
                  </div>
                </div>

                {/* Caption on Hover */}
                <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-muted-foreground truncate px-1">
                    {photo.caption || 'Memory'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 p-3 rounded-full bg-card hover:bg-muted transition-colors z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Memory'}
                  className="max-w-full max-h-[70vh] object-contain"
                />
                <div className="p-4 text-center">
                  <p className="text-lg font-medium">{selectedPhoto.caption || 'A beautiful memory'}</p>
                  {selectedPhoto.year && <p className="text-sm text-muted-foreground">{selectedPhoto.year}</p>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
