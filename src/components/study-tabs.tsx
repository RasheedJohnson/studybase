import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Card, FoundationText } from '@/components/foundation';
import { FlipCard } from '@/components/flip-card';
import {
  getDefinitionsByChapter,
  getQuestionsByChapter,
  type DefinitionCard,
  type Question,
} from '@/library/psychology/psychology-2022-13thedition';

type StudyTab = 'questions' | 'definitions';

type StudyTabsProps = {
  chapterId: string;
};

const TABS: { id: StudyTab; label: string }[] = [
  { id: 'questions', label: 'Questions' },
  { id: 'definitions', label: 'Definitions' },
];

/**
 * In-screen Questions / Definitions tabs.
 * Tab state is local so switching panels never touches shared chapter selection.
 * Each list item is a FlipCard bound to the selected chapter's offline rows.
 */
export function StudyTabs({ chapterId }: StudyTabsProps) {
  const [activeTab, setActiveTab] = useState<StudyTab>('questions');
  const questions = getQuestionsByChapter(chapterId);
  const definitions = getDefinitionsByChapter(chapterId);
  const isQuestions = activeTab === 'questions';
  const emptyMessage = isQuestions
    ? 'No questions for this chapter yet.'
    : 'No definitions for this chapter yet.';

  return (
    <View className="min-h-0 flex-1 gap-3">
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Study content"
        className="flex-row flex-wrap gap-2">
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              onPress={() => setActiveTab(tab.id)}
              className={
                selected
                  ? 'min-h-12 min-w-0 flex-1 items-center justify-center rounded-card border border-primary bg-primary px-4 py-3'
                  : 'min-h-12 min-w-0 flex-1 items-center justify-center rounded-card border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark'
              }
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
              <FoundationText
                accessibilityElementsHidden
                importantForAccessibility="no"
                className={
                  selected
                    ? 'text-base font-medium text-primary-foreground'
                    : 'text-base font-medium'
                }
                numberOfLines={1}>
                {tab.label}
              </FoundationText>
            </Pressable>
          );
        })}
      </View>

      <View
        accessibilityLabel={isQuestions ? 'Questions panel' : 'Definitions panel'}
        className="min-h-0 flex-1">
        {isQuestions ? (
          <FlatList
            data={questions}
            keyExtractor={(item) => `q-${item.id}`}
            renderItem={({ item }) => <QuestionFlip item={item} />}
            ListEmptyComponent={<EmptyState message={emptyMessage} />}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            windowSize={7}
          />
        ) : (
          <FlatList
            data={definitions}
            keyExtractor={(item) => `d-${item.id}`}
            renderItem={({ item }) => <DefinitionFlip item={item} />}
            ListEmptyComponent={<EmptyState message={emptyMessage} />}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            windowSize={7}
          />
        )}
      </View>
    </View>
  );
}

function ListGap() {
  return <View className="h-3" />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card accessibilityRole="text" accessibilityLiveRegion="polite">
      <FoundationText className="text-center text-base text-foreground-muted dark:text-foreground-muted-dark">
        {message}
      </FoundationText>
    </Card>
  );
}

function QuestionFlip({ item }: { item: Question }) {
  return (
    <FlipCard
      frontAccessibilityLabel={`Question: ${item.question}`}
      backAccessibilityLabel={`Answer: ${item.answer}`}
      front={
        <View className="gap-2">
          <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
            Question
          </FoundationText>
          <FoundationText className="text-base font-medium">{item.question}</FoundationText>
        </View>
      }
      back={
        <View className="gap-2">
          <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
            Answer
          </FoundationText>
          <FoundationText className="text-base leading-6">{item.answer}</FoundationText>
        </View>
      }
    />
  );
}

function DefinitionFlip({ item }: { item: DefinitionCard }) {
  const backLabel = [
    'Definition',
    `English: ${item.definitionEn}`,
    `German term: ${item.termDe}`,
    `German: ${item.definitionDe}`,
  ].join('. ');

  return (
    <FlipCard
      frontAccessibilityLabel={`Term: ${item.termEn}. German: ${item.termDe}`}
      backAccessibilityLabel={backLabel}
      front={
        <View className="gap-2">
          <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
            Term
          </FoundationText>
          <FoundationText className="text-base font-medium">{item.termEn}</FoundationText>
          <FoundationText className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
            {item.termDe}
          </FoundationText>
        </View>
      }
      back={
        <View className="gap-3">
          <View className="gap-1">
            <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
              English
            </FoundationText>
            <FoundationText className="text-base leading-6">{item.definitionEn}</FoundationText>
          </View>
          <View className="gap-1">
            <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
              German
            </FoundationText>
            <FoundationText className="text-base font-medium">{item.termDe}</FoundationText>
            <FoundationText className="text-base leading-6">{item.definitionDe}</FoundationText>
          </View>
        </View>
      }
    />
  );
}
