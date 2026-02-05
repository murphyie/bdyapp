import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, RotateCcw } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface PolaroidStackProps {
  photos: Photo[];
  className?: string;
}

// Generate consistent random values for each photo
function generatePolaroidStyles(photos: Photo[]) {
  return photos.map((photo, index) => {
    // Use photo id to generate consistent "random" values
    const seed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1) + index;
    const rotation = ((seed * 7) % 30) - 15; // -15 to 15 degrees
    const offsetX = ((seed * 11) % 60) - 30; // -30 to 30px
    const offsetY = ((seed * 13) % 40) - 20; // -20 to 20px
    const zIndex = photos.length - index;
    
    return {
      rotation,
      offsetX,
      offsetY,
      zIndex,
    };
  });
}

export default function PolaroidStack({ photos, className = '' }: PolaroidStackProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewedPhotos, setViewedPhotos] = useState<Set<string>>(new Set());
  const [stackKey, setStackKey] = useState(0);

  const polaroidStyles = useMemo(() => generatePolaroidStyles(photos), [photos, stackKey]);

  // Get photos that haven't been "picked up" yet
  const visiblePhotos = useMemo(() => {
    return photos.filter(photo => !viewedPhotos.has(photo.id));
  }, [photos, viewedPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewedPhotos(prev => new Set([...prev, photo.id]));
  };

  const handleReset = () => {
    setViewedPhotos(new Set());
    setStackKey(prev => prev + 1);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Stack Container */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center">
          {/* Scattered Polaroids */}
          <AnimatePresence mode="popLayout">
            {visiblePhotos.map((photo, displayIndex) => {
              const originalIndex = photos.findIndex(p => p.id === photo.id);
              const style = polaroidStyles[originalIndex];
              
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: style.rotation - 10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: style.rotation,
                    x: style.offsetX,
                    y: style.offsetY,
                    zIndex: style.zIndex,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.1,
                    y: -100,
                    rotate: style.rotation + 20,
                    transition: { duration: 0.4, ease: 'easeOut' }
                  }}
                  whileHover={{
                    scale: 1.08,
                    rotate: 0,
                    zIndex: 100,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: displayIndex * 0.05,
                  }}
                  onClick={() => handlePhotoClick(photo)}
                  className="absolute cursor-pointer group"
                  style={{ zIndex: style.zIndex }}
                >
                  {/* Polaroid Frame */}
                  <div className="bg-card p-3 pb-12 rounded-sm shadow-xl hover:shadow-2xl transition-shadow">
                    {/* Photo */}
                    <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Memory'}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    
                    {/* Caption Area */}
                    <div className="absolute bottom-2 left-3 right-3 text-center">
                      <p className="text-xs sm:text-sm font-handwriting text-muted-foreground truncate">
                        {photo.caption || photo.year || '♥'}
                      </p>
                    </div>

                    {/* Hover Heart */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-5 right-5 p-1.5 rounded-full bg-primary/80 text-primary-foreground"
                    >
                      <Heart className="w-3 h-3" fill="currentColor" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {visiblePhotos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-4">You've seen all the memories! 💝</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Shuffle Again
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Photo Counter */}
        {visiblePhotos.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">{photos.length - viewedPhotos.size}</span>
              {' '}/{' '}{photos.length} photos remaining
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click a photo to pick it up
            </p>
          </div>
        )}

        {/* Reset Button */}
        {viewedPhotos.size > 0 && visiblePhotos.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="absolute bottom-0 right-0 p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
            title="Reset stack"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      {/* Lightbox Modal */}
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
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-card hover:bg-muted transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large Polaroid */}
              <div className="bg-card p-4 pb-16 sm:p-6 sm:pb-20 rounded-sm shadow-2xl">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Memory'}
                  className="max-w-full max-h-[60vh] object-contain"
                />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-center">
                  <p className="text-lg sm:text-xl font-handwriting text-foreground">
                    {selectedPhoto.caption || 'A beautiful memory'}
                  </p>
                  {selectedPhoto.year && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedPhoto.year}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
