import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, ChevronDown, CircleHelp, Lightbulb, type LucideIcon } from 'lucide-react-native';

import { FoundationText, surfacePlateClassName } from '@/components/foundation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PressableScale } from '@/lib/press-scale';
import { cn } from '@/lib/utils';
import {
  getAvailableStudyModes,
  getDefaultStudyMode,
  type StudyModeId,
} from '@/library/catalog';

export const MODE_META: Record<
  StudyModeId,
  { label: string; icon: LucideIcon; emptyMessage: string; panelLabel: string }
> = {
  questions: {
    label: 'Questions',
    icon: CircleHelp,
    emptyMessage: 'No questions for this chapter yet.',
    panelLabel: 'Questions panel',
  },
  definitions: {
    label: 'Definitions',
    icon: BookOpen,
    emptyMessage: 'No definitions for this chapter yet.',
    panelLabel: 'Definitions panel',
  },
  concepts: {
    label: 'Concepts',
    icon: Lightbulb,
    emptyMessage: 'No concepts for this chapter yet.',
    panelLabel: 'Concepts panel',
  },
};

/**
 * Local study mode state for one textbook. Not persisted in the URL or session store
 * so chapter selection and back navigation stay stable across mode switches.
 */
export function useStudyModeSelection(textbookId: string): {
  availableModes: StudyModeId[];
  activeMode: StudyModeId | null;
  setActiveMode: (mode: StudyModeId) => void;
} {
  const availableModes = useMemo(
    () => getAvailableStudyModes(textbookId),
    [textbookId]
  );
  const defaultMode = availableModes[0] ?? null;

  const [activeTab, setActiveTab] = useState<StudyModeId | null>(() =>
    getDefaultStudyMode(textbookId)
  );

  const activeMode: StudyModeId | null =
    activeTab && availableModes.includes(activeTab) ? activeTab : defaultMode;

  const setActiveMode = useCallback(
    (mode: StudyModeId) => {
      if (availableModes.includes(mode)) {
        setActiveTab(mode);
      }
    },
    [availableModes]
  );

  return { availableModes, activeMode, setActiveMode };
}

type StudyModePickerProps = {
  textbookId: string;
  value: StudyModeId | null;
  onChange: (mode: StudyModeId) => void;
  /** Shell applies flex-1 / full-width classes when composing the picker row. */
  className?: string;
};

/**
 * Reusables Dropdown Menu for in-screen study mode selection.
 * Rendered on the textbook shell beside ContentLanguagePicker when both are visible.
 */
export function StudyModePicker({
  textbookId,
  value,
  onChange,
  className,
}: StudyModePickerProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const availableModes = useMemo(
    () => getAvailableStudyModes(textbookId),
    [textbookId]
  );

  const resolvedMode = value && availableModes.includes(value) ? value : availableModes[0] ?? null;
  const activeMeta = resolvedMode ? MODE_META[resolvedMode] : null;
  const activeLabel = activeMeta?.label ?? 'Study mode';
  const ActiveIcon = activeMeta?.icon ?? CircleHelp;

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  function onModeChange(next: string) {
    if (
      (next === 'questions' || next === 'definitions' || next === 'concepts') &&
      availableModes.includes(next)
    ) {
      onChange(next);
    }
  }

  if (!resolvedMode || availableModes.length === 0) {
    return null;
  }

  return (
    <View className={cn('min-w-0 gap-2', className)}>
      <FoundationText className="text-sm font-medium text-primary">Study mode</FoundationText>
      <DropdownMenu onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Study mode ${activeLabel}`}
            accessibilityHint="Opens the study mode list"
            accessibilityState={{ expanded: menuOpen }}
            className={cn(
              'min-h-12 w-full flex-row items-center gap-2 px-3 py-2 focus:border-primary',
              surfacePlateClassName
            )}>
            <Icon
              as={ActiveIcon}
              size={18}
              className="shrink-0 text-primary"
              accessibilityElementsHidden
            />
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              className="min-w-0 flex-1 text-base font-semibold text-foreground"
              numberOfLines={1}>
              {activeLabel}
            </Text>
            <Icon
              as={ChevronDown}
              size={18}
              className="shrink-0 text-muted-foreground"
              accessibilityElementsHidden
            />
          </PressableScale>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          insets={contentInsets}
          className="w-80 max-w-[90vw] overflow-hidden p-0">
          <DropdownMenuLabel className="px-3 pt-2">Study mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={resolvedMode}
            onValueChange={onModeChange}
            className="p-1">
            {availableModes.map((modeId) => {
              const tab = MODE_META[modeId];
              const selected = resolvedMode === modeId;
              return (
                <DropdownMenuRadioItem
                  key={modeId}
                  value={modeId}
                  accessibilityLabel={tab.label}
                  className={cn('min-h-12 py-3', selected && 'bg-accent')}
                  closeOnPress>
                  <Icon
                    as={tab.icon}
                    size={18}
                    className={cn(
                      'shrink-0',
                      selected ? 'text-primary' : 'text-muted-foreground'
                    )}
                    accessibilityElementsHidden
                  />
                  <Text
                    className={cn(
                      'min-w-0 flex-1 text-base leading-5',
                      selected ? 'font-medium text-primary' : 'text-muted-foreground'
                    )}
                    numberOfLines={1}>
                    {tab.label}
                  </Text>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}
