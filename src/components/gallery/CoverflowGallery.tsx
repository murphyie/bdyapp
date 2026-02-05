import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface CoverflowGalleryProps {
  photos: Photo[];
}

export default function CoverflowGallery({ photos }: CoverflowGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(photos.length / 2));
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) return null;

  const navigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (direction === 'next' && activeIndex < photos.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absD = Math.abs(diff);
    
    // Hide cards too far away
    if (absD > 3) {
      return {
        opacity: 0,
        x: diff * 120,
        scale: 0.5,
        rotateY: diff < 0 ? 45 : -45,
        zIndex: 0,
      };
    }

    return {
      opacity: absD === 0 ? 1 : Math.max(0.3, 1 - absD * 0.25),
      x: diff * (absD === 0 ? 0 : 100 + absD * 20),
      scale: absD === 0 ? 1 : 0.75 - absD * 0.08,
      rotateY: diff < 0 ? 35 : diff > 0 ? -35 : 0,
      zIndex: 10 - absD,
    };
  };

  return (
    <>
      <div className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={() => navigate('prev')}
          disabled={activeIndex === 0}
          className="absolute left-2 md:left-8 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate('next')}
          disabled={activeIndex === photos.length - 1}
          className="absolute right-2 md:right-8 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
          {photos.map((photo, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={photo.id}
                animate={style}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => isActive ? setSelectedPhoto(photo) : setActiveIndex(index)}
                className="absolute cursor-pointer"
                style={{ 
                  transformStyle: 'preserve-3d',
                  zIndex: style.zIndex,
                }}
              >
                <div 
                  className={`w-56 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ${
                    isActive ? 'ring-4 ring-primary/50' : ''
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Reflection effect for active card */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none" />
                  )}
                </div>

                {/* Caption - only show for active */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-16 left-0 right-0 text-center"
                  >
                    <p className="font-medium text-foreground">{photo.caption || 'Memory'}</p>
                    {photo.year && <p className="text-sm text-muted-foreground">{photo.year}</p>}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
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
              initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 30 }}
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
