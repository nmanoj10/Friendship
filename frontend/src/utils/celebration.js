import confetti from 'canvas-confetti';

export const CONFETTI_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#38bdf8', '#ffffff'];

const shapeCache = {};

async function emojiShape(emoji) {
  if (!shapeCache[emoji]) {
    try {
      shapeCache[emoji] = await confetti.shapeFromText({ text: emoji, scalar: 2 });
    } catch {
      shapeCache[emoji] = null;
    }
  }
  return shapeCache[emoji];
}

/**
 * Fires a layered celebration on the result page:
 * opening burst + side cannons → emoji rain → grand finale for high scorers.
 * Returns a cleanup function that cancels pending timed bursts.
 */
export function fireCelebration({ score, total }) {
  const cancelled = { current: false };
  const timers = [];
  const later = (fn, ms) =>
    timers.push(
      setTimeout(() => {
        if (!cancelled.current) fn();
      }, ms)
    );

  const ratio = total > 0 ? score / total : 0;

  // Opening burst — bigger for better scores
  confetti({
    particleCount: 80 + Math.round(ratio * 130),
    spread: 80,
    startVelocity: 42,
    origin: { y: 0.6 },
    colors: CONFETTI_COLORS,
  });

  // Side cannons
  confetti({ particleCount: 55, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors: CONFETTI_COLORS });
  confetti({ particleCount: 55, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors: CONFETTI_COLORS });

  // Emoji rain once things settle (any score above ~a third)
  if (ratio >= 0.34) {
    Promise.all(['🎉', '⭐', '💜'].map(emojiShape)).then((shapes) => {
      const valid = shapes.filter(Boolean);
      if (!valid.length || cancelled.current) return;
      later(
        () => confetti({ particleCount: 30, spread: 110, scalar: 2, shapes: valid, origin: { y: 0.35 }, colors: CONFETTI_COLORS }),
        600
      );
      later(
        () => confetti({ particleCount: 30, spread: 110, scalar: 2, shapes: valid, origin: { y: 0.35 }, colors: CONFETTI_COLORS }),
        1300
      );
      later(
        () => confetti({ particleCount: 30, spread: 110, scalar: 2, shapes: valid, origin: { y: 0.35 }, colors: CONFETTI_COLORS }),
        2000
      );
    });
  }

  // Grand finale for high scorers
  if (ratio >= 0.8) {
    later(() => {
      confetti({ particleCount: 170, spread: 130, startVelocity: 48, scalar: 1.1, origin: { y: 0.5 }, colors: CONFETTI_COLORS });
    }, 2400);
  }

  return () => {
    cancelled.current = true;
    timers.forEach(clearTimeout);
  };
}
