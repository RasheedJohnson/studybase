import { colorScheme as nativewindColorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ScrollView,
  Text,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { PressableScale } from '@/lib/press-scale';
import { cn } from '@/lib/utils';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

const PREFERENCE_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

function applyPreference(preference: ThemePreference) {
  // NativeWind dark: variants and React Native Appearance stay in sync through this call.
  nativewindColorScheme.set(preference);
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    applyPreference(preference);
  }, [preference]);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
  }

  function cyclePreference() {
    setPreferenceState((current) => {
      const index = PREFERENCE_ORDER.indexOf(current);
      return PREFERENCE_ORDER[(index + 1) % PREFERENCE_ORDER.length];
    });
  }

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference, cyclePreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return context;
}

/** Shared plate class for Card and study shells (hairline edge, no elevation). */
export const surfacePlateClassName =
  'rounded-card border-hairline border-border bg-surface dark:border-border-dark dark:bg-surface-dark';

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
  /** When true, wraps children in a vertical ScrollView. */
  scroll?: boolean;
  /** Extra bottom inset for native tab bars. */
  bottomInset?: number;
  /**
   * When false, skip top safe-area padding (use under a Stack header that already
   * owns the status bar inset). Defaults to true for headerless tab screens.
   */
  safeTop?: boolean;
};

/**
 * Full-bleed page shell with safe areas, a capped content width, and theme-aware background.
 * Content fades in once on mount; FlatList rows are not animated here.
 */
export function Screen({
  children,
  className,
  scroll = false,
  bottomInset = 0,
  safeTop = true,
  style,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingStyle = {
    paddingTop: (safeTop ? insets.top : 0) + Spacing.three,
    paddingBottom: insets.bottom + bottomInset + Spacing.three,
    paddingLeft: Math.max(insets.left, Spacing.four),
    paddingRight: Math.max(insets.right, Spacing.four),
  };

  const body = (
    <Animated.View
      entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
      className={cn('w-full self-center gap-4', className)}
      style={[{ maxWidth: MaxContentWidth }, style]}
      {...rest}>
      {children}
    </Animated.View>
  );

  if (scroll) {
    return (
      <ScrollView
        className="flex-1 bg-background dark:bg-background-dark"
        contentContainerStyle={[paddingStyle, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled">
        {body}
      </ScrollView>
    );
  }

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark"
      style={paddingStyle}>
      {body}
    </View>
  );
}

type CardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

/** Flat hairline plate for interactive groupings (study-style cards, no elevation). */
export function Card({ children, className, style, ...rest }: CardProps) {
  return (
    <View
      className={cn('w-full gap-3 overflow-hidden p-4', surfacePlateClassName, className)}
      style={style}
      {...rest}>
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary border-primary',
  secondary:
    'border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
  ghost: 'border-transparent bg-transparent',
};

const buttonLabelVariants: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground dark:text-foreground-dark',
  ghost: 'text-foreground dark:text-foreground-dark',
};

/**
 * Accessible pressable with a 48dp minimum hit target.
 * Uses shared PressableScale so press feedback stays cheap and reduce-motion aware.
 */
export function Button({
  label,
  variant = 'primary',
  className,
  textClassName,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        'min-h-12 min-w-12 items-center justify-center rounded-card border-hairline px-4 py-3 focus:border-primary',
        buttonVariants[variant],
        className
      )}
      style={style}
      {...rest}>
      <Text
        className={cn(
          'text-center text-base font-medium',
          buttonLabelVariants[variant],
          textClassName
        )}
        numberOfLines={2}>
        {label}
      </Text>
    </PressableScale>
  );
}

const preferenceLabel: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** Icon matches the stored preference (system / light / dark), not the resolved Appearance. */
const preferenceIcon: Record<ThemePreference, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

type ThemeToggleProps = {
  className?: string;
};

/**
 * Cycles system -> light -> dark. Icon and accessibility label announce the active preference,
 * not the resolved OS look. Quiet icon-primary chrome for shared header / tab bar placement.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { preference, cyclePreference } = useThemePreference();
  const next =
    PREFERENCE_ORDER[(PREFERENCE_ORDER.indexOf(preference) + 1) % PREFERENCE_ORDER.length];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Color theme ${preferenceLabel[preference]}. Activate to switch to ${preferenceLabel[next]}.`}
      accessibilityHint="Cycles between system, light, and dark themes"
      onPress={cyclePreference}
      className={cn(
        'min-h-12 min-w-12 items-center justify-center rounded-card border border-transparent focus:border-primary',
        className
      )}>
      <View accessibilityElementsHidden importantForAccessibility="no">
        <Icon
          as={preferenceIcon[preference]}
          size={22}
          className="text-foreground dark:text-foreground-dark"
        />
      </View>
    </PressableScale>
  );
}

type FoundationTextProps = TextProps & {
  className?: string;
};

/** Theme-aware body text helper for foundation screens. */
export function FoundationText({ className, ...rest }: FoundationTextProps) {
  return (
    <Text
      className={cn('text-base text-foreground dark:text-foreground-dark', className)}
      {...rest}
    />
  );
}
