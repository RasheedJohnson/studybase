import { Pressable, ScrollView, View } from 'react-native';

import { FoundationText } from '@/components/foundation';
import {
  chapterHeading,
  chapterShortLabel,
  type Chapter,
} from '@/library/psychology/psychology-2022-13thedition';

type ChapterPickerProps = {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (chapterId: string) => void;
};

/**
 * Horizontal chapter radios backed by the shared chapter catalog.
 * Short labels keep narrow widths usable; full titles stay on the accessibility label.
 */
export function ChapterPicker({ chapters, selectedId, onSelect }: ChapterPickerProps) {
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

  return (
    <View className="gap-2">
      <FoundationText className="text-sm font-medium text-primary">Chapter</FoundationText>
      <FoundationText
        accessibilityLiveRegion="polite"
        className="text-base font-semibold"
        numberOfLines={2}>
        {selectedLabel}
      </FoundationText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Chapter">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-row gap-2 py-1">
          {chapters.map((chapter) => {
            const selectedChapter = chapter.id === selectedId;
            const heading = chapterHeading(chapter);
            return (
              <Pressable
                key={chapter.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedChapter }}
                accessibilityLabel={heading}
                accessibilityHint="Selects this chapter for questions and definitions"
                onPress={() => onSelect(chapter.id)}
                className={
                  selectedChapter
                    ? 'min-h-12 min-w-12 items-center justify-center rounded-card border border-primary bg-primary px-3'
                    : 'min-h-12 min-w-12 items-center justify-center rounded-card border border-border bg-surface px-3 dark:border-border-dark dark:bg-surface-dark'
                }
                // Opacity-only press keeps chip width stable while scrolling the row.
                style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
                <FoundationText
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  className={
                    selectedChapter
                      ? 'text-base font-medium text-primary-foreground'
                      : 'text-base font-medium'
                  }
                  numberOfLines={1}>
                  {chapterShortLabel(chapter)}
                </FoundationText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
