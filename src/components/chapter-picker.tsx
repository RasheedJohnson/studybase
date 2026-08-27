import { useState } from 'react';
import { Platform, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

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
import {
  chapterHeading,
  type Chapter,
  type ContentLanguage,
} from '@/library/catalog';
import { cn } from '@/lib/utils';

type ChapterPickerProps = {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (chapterId: string) => void;
  /** Content language for bilingual chapter titles (defaults to English). */
  language?: ContentLanguage;
};

/**
 * Chapter selector backed by the shared catalog.
 * Uses a Reusables Dropdown Menu (radio group) so one control replaces the old chip row
 * without changing the chapters / selectedId / onSelect contract.
 * Headings follow `language` so EN/DE switches update labels without resetting selection.
 */
export function ChapterPicker({
  chapters,
  selectedId,
  onSelect,
  language = 'en',
}: ChapterPickerProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = chapters.find((chapter) => chapter.id === selectedId);
  const selectedLabel = selected
    ? chapterHeading(selected, language)
    : 'No chapter selected';

  if (chapters.length === 0) {
    return (
      <View
        accessibilityRole="summary"
        accessibilityLiveRegion="polite"
        className={cn('gap-2 p-4', surfacePlateClassName)}>
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
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Chapter ${selectedLabel}`}
            accessibilityHint="Opens the chapter list"
            accessibilityState={{ expanded: menuOpen }}
            className={cn(
              'min-h-12 w-full flex-row items-center gap-2 px-3 py-2 focus:border-primary',
              surfacePlateClassName
            )}>
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
              className="text-muted-foreground shrink-0"
              accessibilityElementsHidden
            />
          </PressableScale>
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
              language={language}
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
                language={language}
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
  language,
}: {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (chapterId: string) => void;
  language: ContentLanguage;
}) {
  return (
    <DropdownMenuRadioGroup value={selectedId} onValueChange={onSelect} className="p-1">
      {chapters.map((chapter) => {
        const heading = chapterHeading(chapter, language);
        const selected = chapter.id === selectedId;
        return (
          <DropdownMenuRadioItem
            key={chapter.id}
            value={chapter.id}
            accessibilityLabel={heading}
            className={cn('min-h-12 py-3', selected && 'bg-accent')}
            // Close on press so selecting a chapter dismisses the portal immediately.
            closeOnPress>
            <Text
              className={cn(
                'min-w-0 flex-1 text-base leading-5',
                selected ? 'font-medium text-primary' : 'text-muted-foreground'
              )}
              numberOfLines={2}>
              {heading}
            </Text>
          </DropdownMenuRadioItem>
        );
      })}
    </DropdownMenuRadioGroup>
  );
}
