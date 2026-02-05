import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface CarouselGalleryProps {
  photos: Photo[];
}

export default function CarouselGallery({ photos }: CarouselGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!photos || photos.length === 0) return null;

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

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-8 py-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => setSelectedPhoto(photo)}
              className="relative flex-shrink-0 w-72 cursor-pointer snap-center group"
            >
              <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Caption */}
                <div className="p-4 bg-gradient-to-t from-card to-card/80">
                  <p className="font-medium text-foreground truncate">{photo.caption || 'Memory'}</p>
                  {photo.year && <p className="text-sm text-muted-foreground">{photo.year}</p>}
                </div>

                {/* Heart */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-primary/80 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
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
