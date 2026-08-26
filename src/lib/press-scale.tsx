import {
  forwardRef,
  useCallback,
  useEffect,
  type ComponentRef,
  type ReactNode,
} from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PRESS_MS = 90;
const PRESS_SCALE = 0.985;
const PRESS_OPACITY = 0.88;
const DISABLED_OPACITY = 0.4;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
};

/**
 * Pressable with opacity + subtle scale feedback.
 * Scale is skipped when the OS asks for reduced motion so feedback stays calm.
 * Forwards ref so Slot/asChild triggers (chapter picker) still receive the host node.
 */
export const PressableScale = forwardRef<
  ComponentRef<typeof Pressable>,
  PressableScaleProps
>(function PressableScale(
  { onPressIn, onPressOut, style, disabled, children, ...rest },
  ref
) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? DISABLED_OPACITY : 1);

  useEffect(() => {
    opacity.value = disabled ? DISABLED_OPACITY : 1;
    scale.value = 1;
  }, [disabled, opacity, scale]);

  const animateTo = useCallback(
    (pressed: boolean) => {
      if (disabled) {
        return;
      }

      opacity.value = withTiming(pressed ? PRESS_OPACITY : 1, {
        duration: PRESS_MS,
        reduceMotion: ReduceMotion.System,
      });

      // Opacity-only when reduce-motion is on; scale stays at 1 to avoid layout thrash feel.
      if (reduceMotion) {
        scale.value = 1;
        return;
      }

      scale.value = withTiming(pressed ? PRESS_SCALE : 1, {
        duration: PRESS_MS,
        reduceMotion: ReduceMotion.System,
      });
    },
    [disabled, opacity, reduceMotion, scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(true);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(false);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, typeof style === 'function' ? undefined : style]}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
});
