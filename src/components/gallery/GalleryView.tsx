import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Layers, Grid3X3, GalleryHorizontal, Film, Clock, Box } from 'lucide-react';
import { Photo } from '@/hooks/useBirthdayData';
import PolaroidStack from '@/components/ui/PolaroidStack';
import MasonryGrid from './MasonryGrid';
import ClassicGrid from './ClassicGrid';
import CarouselGallery from './CarouselGallery';
import FilmstripGallery from './FilmstripGallery';
import TimelineGallery from './TimelineGallery';
import CoverflowGallery from './CoverflowGallery';

type GalleryType = 'polaroid' | 'masonry' | 'classic' | 'carousel' | 'filmstrip' | 'timeline' | 'coverflow';

interface GalleryViewProps {
  photos: Photo[];
  className?: string;
}

const galleryOptions: { type: GalleryType; label: string; icon: typeof LayoutGrid; description: string }[] = [
  { type: 'polaroid', label: 'Polaroid', icon: Layers, description: 'Scattered photos like real polaroids' },
  { type: 'masonry', label: 'Masonry', icon: LayoutGrid, description: 'Pinterest-style staggered layout' },
  { type: 'classic', label: 'Grid', icon: Grid3X3, description: 'Clean uniform grid' },
  { type: 'carousel', label: 'Carousel', icon: GalleryHorizontal, description: 'Horizontal scrolling cards' },
  { type: 'filmstrip', label: 'Filmstrip', icon: Film, description: 'Retro film reel aesthetic' },
  { type: 'timeline', label: 'Timeline', icon: Clock, description: 'Chronological journey through memories' },
  { type: 'coverflow', label: '3D Flow', icon: Box, description: 'Interactive 3D coverflow effect' },
];

export default function GalleryView({ photos, className = '' }: GalleryViewProps) {
  const [galleryType, setGalleryType] = useState<GalleryType>('timeline');

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No memories added yet</p>
      </div>
    );
  }

  const renderGallery = () => {
    switch (galleryType) {
      case 'polaroid':
        return <PolaroidStack photos={photos} />;
      case 'masonry':
        return <MasonryGrid photos={photos} />;
      case 'classic':
        return <ClassicGrid photos={photos} />;
      case 'carousel':
        return <CarouselGallery photos={photos} />;
      case 'filmstrip':
        return <FilmstripGallery photos={photos} />;
      case 'timeline':
        return <TimelineGallery photos={photos} />;
      case 'coverflow':
        return <CoverflowGallery photos={photos} />;
      default:
        return <PolaroidStack photos={photos} />;
    }
  };

  return (
    <div className={className}>
      {/* Gallery Type Switcher */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {galleryOptions.map((option) => {
          const Icon = option.icon;
          const isActive = galleryType === option.type;
          
          return (
            <motion.button
              key={option.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGalleryType(option.type)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card hover:bg-muted text-foreground'
              }`}
              title={option.description}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{option.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeGallery"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`desc-${galleryType}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-center text-sm text-muted-foreground mb-6"
        >
          {galleryOptions.find(o => o.type === galleryType)?.description}
        </motion.p>
      </AnimatePresence>

      {/* Gallery Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`gallery-${galleryType}`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {renderGallery()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
