import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface ClassicGridProps {
  photos: Photo[];
}

export default function ClassicGrid({ photos }: ClassicGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedPhoto(photo)}
            className="relative group cursor-pointer"
          >
            <div className="aspect-square overflow-hidden rounded-xl glass-card">
              <img
                src={photo.url}
                alt={photo.caption || 'Memory'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium text-foreground truncate">{photo.caption}</p>
                  {photo.year && <p className="text-xs text-muted-foreground">{photo.year}</p>}
                </div>
              </div>

              {/* Heart */}
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-primary/80 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="w-3 h-3" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>
        ))}
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
