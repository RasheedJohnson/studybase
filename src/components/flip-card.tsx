import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const HALF_FLIP_MS = 160;

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  /** Spoken when the front face is showing. */
  frontAccessibilityLabel: string;
  /** Spoken when the back face is showing. */
  backAccessibilityLabel: string;
  /** Optional override; defaults depend on expanded state. */
  accessibilityHint?: string;
  className?: string;
};

/**
 * Pressable study card that flips between front and back.
 * Uses a scaleX hinge (shrink, swap face, expand) instead of rotateY so the
 * shell height always follows the visible copy. Long answers never depend on
 * measuring a hidden absolute face, which is easy to get wrong in lists.
 * Rapid taps are ignored while a flip is in flight.
 */
export function FlipCard({
  front,
  back,
  frontAccessibilityLabel,
  backAccessibilityLabel,
  accessibilityHint,
  className,
}: FlipCardProps) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const busyRef = useRef(false);
  const hinge = useSharedValue(1);

  const releaseBusy = useCallback(() => {
    busyRef.current = false;
  }, []);

  const openHinge = useCallback(() => {
    hinge.value = withTiming(
      1,
      {
        duration: HALF_FLIP_MS,
        easing: Easing.out(Easing.ease),
        reduceMotion: ReduceMotion.System,
      },
      () => {
        'worklet';
        // Always clear the lock (including interrupted runs) so the card stays tappable.
        scheduleOnRN(releaseBusy);
      }
    );
  }, [hinge, releaseBusy]);

  const swapFace = useCallback(
    (next: boolean) => {
      setFlipped(next);
      openHinge();
    },
    [openHinge]
  );

  const toggle = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    const next = !flipped;

    // Respect OS reduce-motion: swap faces immediately with no hinge animation.
    if (reduceMotion) {
      hinge.value = 1;
      setFlipped(next);
      return;
    }

    busyRef.current = true;
    hinge.value = withTiming(
      0,
      {
        duration: HALF_FLIP_MS,
        easing: Easing.in(Easing.ease),
        reduceMotion: ReduceMotion.System,
      },
      (finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(swapFace, next);
        } else {
          scheduleOnRN(releaseBusy);
        }
      }
    );
  }, [flipped, hinge, reduceMotion, releaseBusy, swapFace]);

  const hingeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: hinge.value }],
  }));

  const hint =
    accessibilityHint ??
    (flipped
      ? 'Hides the answer and shows the prompt again'
      : 'Reveals the answer on the back of the card');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={flipped ? backAccessibilityLabel : frontAccessibilityLabel}
      accessibilityHint={hint}
      accessibilityState={{ expanded: flipped }}
      accessibilityLiveRegion="polite"
      onPress={toggle}
      className={[
        'w-full min-h-12 rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
      <Animated.View style={hingeStyle}>
        {/*
          Only the active face mounts, so AT trees and layout height stay in sync
          with what the user sees (no hidden back-face still exposed to readers).
        */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          {flipped ? back : front}
        </View>
      </Animated.View>
    </Pressable>
  );
}
