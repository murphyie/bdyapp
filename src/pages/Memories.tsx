import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { usePhotos, useSettings } from '@/hooks/useBirthdayData';
import GalleryView from '@/components/gallery/GalleryView';

export default function Memories() {
  const { data: photos, isLoading: photosLoading } = usePhotos();
  const { data: settings, isLoading: settingsLoading } = useSettings();

  const isLoading = photosLoading || settingsLoading;
  const showPhotos = settings?.show_photos ?? true;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!showPhotos) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Photos are hidden for now 📸</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Check back later!</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-display gradient-text glow-text mb-4">
              Cherished Memories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your favorite way to explore our beautiful moments 💝
            </p>
          </motion.div>

          {/* Gallery with Switcher */}
          <GalleryView photos={photos || []} />
        </div>
      </div>
    </PageTransition>
  );
}
