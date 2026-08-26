import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Button, FoundationText, Screen } from '@/components/foundation';
import { getTextbook } from '@/library/psychology/psychology-2022-13thedition';

/**
 * Minimal textbook destination so Home can navigate today.
 * Full chapter picker and study tabs land in a later prompt.
 */
export default function TextbookPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const textbookId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const textbook = textbookId ? getTextbook(textbookId) : null;

  return (
    <>
      <Stack.Screen options={{ title: textbook?.title ?? 'Textbook' }} />
      <Screen className="gap-4">
        {textbook ? (
          <>
            <FoundationText
              accessibilityRole="header"
              className="text-2xl font-semibold"
              numberOfLines={2}>
              {textbook.title}
            </FoundationText>
            <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
              {`${textbook.editionLabel}, ${textbook.year}`}
            </FoundationText>
            <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
              Study content for this textbook will appear here.
            </FoundationText>
          </>
        ) : (
          <>
            <FoundationText
              accessibilityRole="header"
              className="text-2xl font-semibold">
              Textbook not found
            </FoundationText>
            <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
              This textbook id is not in the local catalog.
            </FoundationText>
            <Button
              label="Back to Home"
              onPress={() => router.replace('/(tabs)/index')}
            />
          </>
        )}
      </Screen>
    </>
  );
}
