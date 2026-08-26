import { View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ChapterPicker } from '@/components/chapter-picker';
import { Button, FoundationText, Screen } from '@/components/foundation';
import { StudyTabs } from '@/components/study-tabs';
import {
  getTextbook,
  setSelectedChapterId,
  useSelectedChapterId,
} from '@/library/psychology/psychology-2022-13thedition';

function paramValue(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return '';
}

/**
 * Textbook study shell: metadata, shared chapter picker, and in-screen study tabs.
 * Chapter lives in the session store (not the URL) so tab switches and back navigation
 * keep the same selection without remounting this route.
 */
export default function TextbookScreen() {
  const params = useLocalSearchParams<{ id: string; chapter?: string }>();
  const textbookId = paramValue(params.id);
  const chapterParam = paramValue(params.chapter);
  const textbook = textbookId ? getTextbook(textbookId) : null;

  // Seed the shared store during render so SSR and first paint honor ?chapter=.
  // Invalid ids are ignored by the store; identical writes no-op (no render loop).
  if (textbook && chapterParam) {
    setSelectedChapterId(textbook.id, chapterParam);
  }

  const { chapterId, setChapterId, chapters } = useSelectedChapterId(textbookId);

  if (!textbookId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Textbook' }} />
        <Screen safeTop={false} className="gap-4">
          <FoundationText
            accessibilityRole="header"
            className="text-2xl font-semibold">
            Loading textbook
          </FoundationText>
          <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
            Resolving this route from the local catalog.
          </FoundationText>
        </Screen>
      </>
    );
  }

  if (!textbook) {
    return (
      <>
        <Stack.Screen options={{ title: 'Unavailable' }} />
        <Screen safeTop={false} className="gap-4">
          <FoundationText
            accessibilityRole="header"
            className="text-2xl font-semibold">
            Textbook unavailable
          </FoundationText>
          <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
            This textbook id is not in the local catalog.
          </FoundationText>
          <Button
            label="Back to Home"
            onPress={() => router.replace('/(tabs)/index')}
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: textbook.title }} />
      <Screen safeTop={false} className="min-h-0 flex-1 gap-4">
        <View className="gap-1">
          <FoundationText
            accessibilityRole="header"
            className="text-2xl font-semibold"
            numberOfLines={2}>
            {textbook.title}
          </FoundationText>
          <FoundationText
            className="text-base text-foreground-muted dark:text-foreground-muted-dark"
            numberOfLines={1}>
            {`${textbook.editionLabel}, ${textbook.year}`}
          </FoundationText>
          <FoundationText
            className="text-sm text-foreground-muted dark:text-foreground-muted-dark"
            numberOfLines={3}>
            {textbook.description}
          </FoundationText>
        </View>

        <ChapterPicker
          chapters={chapters}
          selectedId={chapterId}
          onSelect={setChapterId}
        />

        {chapters.length === 0 || !chapterId ? (
          <View
            accessibilityRole="summary"
            accessibilityLiveRegion="polite"
            className="rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
            <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
              Study content is unavailable until a chapter can be selected.
            </FoundationText>
          </View>
        ) : (
          <StudyTabs chapterId={chapterId} />
        )}
      </Screen>
    </>
  );
}
