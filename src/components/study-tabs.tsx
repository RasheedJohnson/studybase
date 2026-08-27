import { memo, useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';

import { Card, FoundationText } from '@/components/foundation';
import { FlipCard } from '@/components/flip-card';
import { MODE_META } from '@/components/study-mode-picker';
import { cn } from '@/lib/utils';
import {
  getAvailableStudyModes,
  getConceptsByChapter,
  getDefinitionsByChapter,
  getQuestionsByChapter,
  type ConceptCard,
  type ContentLanguage,
  type DefinitionCard,
  type Question,
  type StudyModeId,
} from '@/library/catalog';

type StudyTabsProps = {
  textbookId: string;
  chapterId: string;
  /** Active content language for bilingual Concepts copy. */
  language?: ContentLanguage;
  /** Current study mode from the shell picker row. */
  activeMode: StudyModeId | null;
};

const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_DEFINITIONS: DefinitionCard[] = [];
const EMPTY_CONCEPTS: ConceptCard[] = [];

/**
 * Flip-card lists for the active study mode.
 * Mode selection lives on the textbook shell; this component renders lists only.
 */
export function StudyTabs({
  textbookId,
  chapterId,
  language = 'en',
  activeMode,
}: StudyTabsProps) {
  const availableModes = useMemo(
    () => getAvailableStudyModes(textbookId),
    [textbookId]
  );

  const resolvedTab: StudyModeId | null =
    activeMode && availableModes.includes(activeMode)
      ? activeMode
      : availableModes[0] ?? null;

  const activeMeta = resolvedTab ? MODE_META[resolvedTab] : null;

  const questions = useMemo(
    () =>
      resolvedTab === 'questions'
        ? getQuestionsByChapter(textbookId, chapterId)
        : EMPTY_QUESTIONS,
    [chapterId, resolvedTab, textbookId]
  );
  const definitions = useMemo(
    () =>
      resolvedTab === 'definitions'
        ? getDefinitionsByChapter(textbookId, chapterId)
        : EMPTY_DEFINITIONS,
    [chapterId, resolvedTab, textbookId]
  );
  const concepts = useMemo(
    () =>
      resolvedTab === 'concepts'
        ? getConceptsByChapter(textbookId, chapterId, language)
        : EMPTY_CONCEPTS,
    [chapterId, language, resolvedTab, textbookId]
  );

  const emptyMessage = activeMeta?.emptyMessage ?? 'No study cards for this chapter yet.';

  const renderQuestion = useCallback(
    ({ item }: { item: Question }) => <QuestionFlip item={item} />,
    []
  );
  const renderDefinition = useCallback(
    ({ item }: { item: DefinitionCard }) => <DefinitionFlip item={item} />,
    []
  );
  const renderConcept = useCallback(
    ({ item }: { item: ConceptCard }) => <ConceptFlip item={item} />,
    []
  );

  if (availableModes.length === 0 || !resolvedTab || !activeMeta) {
    return (
      <Card accessibilityRole="text" accessibilityLiveRegion="polite">
        <FoundationText className="text-center text-base text-foreground-muted dark:text-foreground-muted-dark">
          No study modes are available for this textbook yet.
        </FoundationText>
      </Card>
    );
  }

  return (
    <View className="min-h-0 flex-1">
      <View accessibilityLabel={activeMeta.panelLabel} className="min-h-0 flex-1">
        {resolvedTab === 'questions' ? (
          <FlatList
            key={`q-${chapterId}`}
            data={questions}
            keyExtractor={questionKey}
            renderItem={renderQuestion}
            ListEmptyComponent={<EmptyState message={emptyMessage} />}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
          />
        ) : resolvedTab === 'definitions' ? (
          <FlatList
            key={`d-${chapterId}`}
            data={definitions}
            keyExtractor={definitionKey}
            renderItem={renderDefinition}
            ListEmptyComponent={<EmptyState message={emptyMessage} />}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
          />
        ) : (
          <FlatList
            key={`c-${chapterId}`}
            data={concepts}
            keyExtractor={conceptKey}
            renderItem={renderConcept}
            ListEmptyComponent={<EmptyState message={emptyMessage} />}
            ItemSeparatorComponent={ListGap}
            contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
          />
        )}
      </View>
    </View>
  );
}

function questionKey(item: Question) {
  return `q-${item.id}`;
}

function definitionKey(item: DefinitionCard) {
  return `d-${item.id}`;
}

function conceptKey(item: ConceptCard) {
  return `c-${item.id}`;
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

const QuestionFlip = memo(function QuestionFlip({ item }: { item: Question }) {
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
});

const DefinitionFlip = memo(function DefinitionFlip({ item }: { item: DefinitionCard }) {
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
});

const ConceptFlip = memo(function ConceptFlip({ item }: { item: ConceptCard }) {
  const isSummary = item.kind === 'summary';
  const frontLabel = isSummary
    ? `Summary: ${item.sectionTitle ?? item.concept}`
    : `Concept: ${item.concept}`;
  const backLabel = isSummary
    ? `Summary body: ${item.explanation}`
    : `Explanation: ${item.explanation}`;

  return (
    <FlipCard
      frontAccessibilityLabel={frontLabel}
      backAccessibilityLabel={backLabel}
      className={
        isSummary
          ? 'border-amber-500/70 bg-surface-selected dark:border-amber-400/60 dark:bg-surface-selected-dark'
          : undefined
      }
      front={
        <View className="gap-2">
          <FoundationText
            className={cn(
              'text-xs font-medium uppercase',
              isSummary
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-foreground-muted dark:text-foreground-muted-dark'
            )}>
            {isSummary ? 'Summary' : 'Concept'}
          </FoundationText>
          <FoundationText className="text-base font-medium">{item.concept}</FoundationText>
        </View>
      }
      back={
        <View className="gap-2">
          <FoundationText
            className={cn(
              'text-xs font-medium uppercase',
              isSummary
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-foreground-muted dark:text-foreground-muted-dark'
            )}>
            {isSummary ? 'Section summary' : 'Explanation'}
          </FoundationText>
          <FoundationText className="text-base leading-6">{item.explanation}</FoundationText>
        </View>
      }
    />
  );
});
