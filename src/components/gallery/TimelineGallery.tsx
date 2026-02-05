import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';

interface TimelineGalleryProps {
  photos: Photo[];
}

export default function TimelineGallery({ photos }: TimelineGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) return null;

  // Group photos by year
  const photosByYear = photos.reduce((acc, photo) => {
    const year = photo.year || 'Memories';
    if (!acc[year]) acc[year] = [];
    acc[year].push(photo);
    return acc;
  }, {} as Record<string | number, Photo[]>);

  // Sort years descending
  const sortedYears = Object.keys(photosByYear).sort((a, b) => {
    if (a === 'Memories') return 1;
    if (b === 'Memories') return -1;
    return Number(b) - Number(a);
  });

  return (
    <>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

        {/* Timeline Items */}
        <div className="space-y-12">
          {sortedYears.map((year, yearIndex) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: yearIndex * 0.15 }}
              className="relative"
            >
              {/* Year Marker */}
              <div className="flex items-center gap-4 mb-6 md:justify-center">
                <div className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold">{year}</span>
                </div>
              </div>

              {/* Photos for this year */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-10 md:pl-0">
                {photosByYear[year].map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: yearIndex * 0.15 + index * 0.05 }}
                    whileHover={{ y: -8, rotate: index % 2 === 0 ? 2 : -2 }}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative group cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden rounded-xl glass-card shadow-lg">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Memory'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-sm font-medium text-foreground truncate">{photo.caption}</p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative connector */}
                    <div className="hidden md:block absolute -left-4 top-1/2 w-4 h-0.5 bg-primary/30" />
                  </motion.div>
                ))}
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
