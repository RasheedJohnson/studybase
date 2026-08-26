import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

import { FoundationText } from '@/components/foundation';
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
import {
  chapterHeading,
  type Chapter,
} from '@/library/psychology/psychology-2022-13thedition';
import { cn } from '@/lib/utils';

type ChapterPickerProps = {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (chapterId: string) => void;
};

/**
 * Chapter selector backed by the shared catalog.
 * Uses a Reusables Dropdown Menu (radio group) so one control replaces the old chip row
 * without changing the chapters / selectedId / onSelect contract.
 */
export function ChapterPicker({ chapters, selectedId, onSelect }: ChapterPickerProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = chapters.find((chapter) => chapter.id === selectedId);
  const selectedLabel = selected ? chapterHeading(selected) : 'No chapter selected';

  if (chapters.length === 0) {
    return (
      <View
        accessibilityRole="summary"
        accessibilityLiveRegion="polite"
        className="gap-2 rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <FoundationText className="text-sm font-medium text-primary">Chapter</FoundationText>
        <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
          No chapters are available for this textbook.
        </FoundationText>
      </View>
    );
  }

  // Keep the portal menu clear of notches and home indicators on native.
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <View className="gap-2">
      <FoundationText className="text-sm font-medium text-primary">Chapter</FoundationText>
      <DropdownMenu onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Chapter ${selectedLabel}`}
            accessibilityHint="Opens the chapter list"
            accessibilityState={{ expanded: menuOpen }}
            className={cn(
              'min-h-12 w-full flex-row items-center gap-2 rounded-card border border-border bg-surface px-3 py-2 focus:border-primary dark:border-border-dark dark:bg-surface-dark'
            )}
            // Opacity-only press keeps the trigger width stable when the menu opens.
            style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              className="min-w-0 flex-1 text-base font-semibold text-foreground"
              numberOfLines={1}>
              {selectedLabel}
            </Text>
            <Icon
              as={ChevronDown}
              size={18}
              className="text-foreground shrink-0"
              accessibilityElementsHidden
            />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          insets={contentInsets}
          className={cn(
            // Cap width and height so long titles and 18 chapters stay on-screen.
            'w-80 max-w-[90vw] max-h-80 overflow-hidden p-0',
            Platform.OS === 'web' && 'overflow-y-auto'
          )}>
          <DropdownMenuLabel className="px-3 pt-2">Chapters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/*
            Gesture-handler ScrollView is required inside PortalHost on native so the
            menu list can scroll without fighting Reanimated overlay press handling.
            Web relies on CSS max-height overflow on DropdownMenuContent instead.
          */}
          {Platform.OS === 'web' ? (
            <ChapterRadioList
              chapters={chapters}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ) : (
            <ScrollView
              className="max-h-72"
              bounces={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled>
              <ChapterRadioList
                chapters={chapters}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </ScrollView>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}

function ChapterRadioList({
  chapters,
  selectedId,
  onSelect,
}: {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (chapterId: string) => void;
}) {
  return (
    <DropdownMenuRadioGroup value={selectedId} onValueChange={onSelect} className="p-1">
      {chapters.map((chapter) => {
        const heading = chapterHeading(chapter);
        return (
          <DropdownMenuRadioItem
            key={chapter.id}
            value={chapter.id}
            accessibilityLabel={heading}
            className="min-h-12 py-3"
            // Close on press so selecting a chapter dismisses the portal immediately.
            closeOnPress>
            <Text className="min-w-0 flex-1 text-base leading-5" numberOfLines={2}>
              {heading}
            </Text>
          </DropdownMenuRadioItem>
        );
      })}
    </DropdownMenuRadioGroup>
  );
}
