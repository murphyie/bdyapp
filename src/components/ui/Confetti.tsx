import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // First burst - center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#c44569', '#ff8a5c', '#ffd93d', '#6c5ce7', '#a29bfe'],
    });

    // Second burst - left side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b9d', '#ffd93d', '#6c5ce7'],
      });
    }, 150);

    // Third burst - right side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#c44569', '#ff8a5c', '#a29bfe'],
      });
    }, 300);

    // Star burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 360,
        startVelocity: 20,
        decay: 0.95,
        scalar: 1.2,
        shapes: ['star'],
        colors: ['#ffd93d', '#ff6b9d'],
        origin: { y: 0.5 },
      });
    }, 450);
  }, []);

  const fireHearts = useCallback(() => {
    const heart = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    });

    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6 },
      shapes: [heart],
      colors: ['#ff6b9d', '#c44569', '#ff8a5c'],
      scalar: 1.5,
    });
  }, []);

  return { fireConfetti, fireHearts };
}
