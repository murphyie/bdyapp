import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export default function AudioVisualizer({ 
  audioElement, 
  isPlaying, 
  barCount = 32,
  className = ''
}: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(new Array(barCount).fill(4));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setBars(new Array(barCount).fill(4));
  }, [barCount]);

  const startAnimation = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateBars = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const step = Math.max(1, Math.floor(dataArray.length / barCount));
      const newBars: number[] = [];
      
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[Math.min(i * step, dataArray.length - 1)] || 0;
        const height = Math.max(4, (value / 255) * 100);
        newBars.push(height);
      }
      
      setBars(newBars);
      animationRef.current = requestAnimationFrame(updateBars);
    };

    updateBars();
  }, [barCount]);

  // Setup audio context and connect to audio element
  useEffect(() => {
    // If no audio element or different element, we need to reconnect
    if (!audioElement) {
      stopAnimation();
      return;
    }

    // Skip if already connected to this audio element
    if (connectedAudioRef.current === audioElement && analyserRef.current) {
      return;
    }

    // Create AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Create analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Try to create source - if already connected, reuse
    try {
      // Check if this audio element already has a source node
      // We can't create multiple sources from the same audio element
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceNodeRef.current = source;
      connectedAudioRef.current = audioElement;
    } catch (e) {
      // Audio element already connected to a context
      // This happens when the audio element changes but was already connected
      console.warn('Audio element already connected, visualizer may not work for this track');
    }

    return () => {
      stopAnimation();
    };
  }, [audioElement, stopAnimation]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioElement || !analyserRef.current) {
      stopAnimation();
      return;
    }

    // Resume audio context if suspended (required for autoplay policies)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [isPlaying, audioElement, startAnimation, stopAnimation]);

  return (
    <div className={`flex items-end justify-center gap-[2px] h-16 ${className}`}>
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full bg-gradient-to-t from-primary via-primary to-primary/60"
          animate={{ 
            height: isPlaying ? `${height}%` : '4px',
          }}
          transition={{ 
            duration: 0.05,
            ease: 'linear'
          }}
          style={{
            minHeight: '4px',
            boxShadow: isPlaying ? '0 0 8px hsl(var(--primary) / 0.5)' : 'none'
          }}
        />
      ))}
    </div>
  );
}
