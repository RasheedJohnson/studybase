import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, ChevronDown, CircleHelp, Lightbulb, type LucideIcon } from 'lucide-react-native';

import { Card, FoundationText, surfacePlateClassName } from '@/components/foundation';
import { FlipCard } from '@/components/flip-card';
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
  getConceptsByChapter,
  getDefaultStudyMode,
  getDefinitionsByChapter,
  getQuestionsByChapter,
  type ConceptCard,
  type DefinitionCard,
  type Question,
  type StudyModeId,
} from '@/library/catalog';

type StudyTabsProps = {
  textbookId: string;
  chapterId: string;
};

const MODE_META: Record<
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

const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_DEFINITIONS: DefinitionCard[] = [];
const EMPTY_CONCEPTS: ConceptCard[] = [];

/**
 * In-screen study mode picker + flip-card lists.
 * Mode state is local so switching panels never touches shared chapter selection.
 * Dropdown options come only from modes the textbook package exposes.
 */
export function StudyTabs({ textbookId, chapterId }: StudyTabsProps) {
  const insets = useSafeAreaInsets();
  const availableModes = useMemo(
    () => getAvailableStudyModes(textbookId),
    [textbookId]
  );
  const defaultMode = availableModes[0] ?? null;

  // Open on the first available mode for this textbook (not hardcoded to Questions).
  const [activeTab, setActiveTab] = useState<StudyModeId | null>(() =>
    getDefaultStudyMode(textbookId)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep selection valid if offered modes change; chapter switches do not reset mode.
  const resolvedTab: StudyModeId | null =
    activeTab && availableModes.includes(activeTab) ? activeTab : defaultMode;

  const activeMeta = resolvedTab ? MODE_META[resolvedTab] : null;
  const activeLabel = activeMeta?.label ?? 'Study mode';
  const ActiveIcon = activeMeta?.icon ?? CircleHelp;

  // Only materialize the active mode's rows to keep chapter switches cheap.
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
        ? getConceptsByChapter(textbookId, chapterId)
        : EMPTY_CONCEPTS,
    [chapterId, resolvedTab, textbookId]
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

  const onModeChange = useCallback(
    (value: string) => {
      if (
        (value === 'questions' || value === 'definitions' || value === 'concepts') &&
        availableModes.includes(value)
      ) {
        setActiveTab(value);
      }
    },
    [availableModes]
  );

  // Keep the portal menu clear of notches and home indicators on native.
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
    <View className="min-h-0 flex-1 gap-3">
      <View className="gap-2">
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
                className="text-primary shrink-0"
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
                className="text-muted-foreground shrink-0"
                accessibilityElementsHidden
              />
            </PressableScale>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            insets={contentInsets}
            // Cap width so the menu stays readable on narrow screens.
            className="w-80 max-w-[90vw] overflow-hidden p-0">
            <DropdownMenuLabel className="px-3 pt-2">Study mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={resolvedTab}
              onValueChange={onModeChange}
              className="p-1">
              {availableModes.map((modeId) => {
                const tab = MODE_META[modeId];
                const selected = resolvedTab === modeId;
                return (
                  <DropdownMenuRadioItem
                    key={modeId}
                    value={modeId}
                    accessibilityLabel={tab.label}
                    className={cn('min-h-12 py-3', selected && 'bg-accent')}
                    // Close on press so selecting a mode dismisses the portal immediately.
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
  return (
    <FlipCard
      frontAccessibilityLabel={`Concept: ${item.concept}`}
      backAccessibilityLabel={`Explanation: ${item.explanation}`}
      front={
        <View className="gap-2">
          <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
            Concept
          </FoundationText>
          <FoundationText className="text-base font-medium">{item.concept}</FoundationText>
        </View>
      }
      back={
        <View className="gap-2">
          <FoundationText className="text-xs font-medium uppercase text-foreground-muted dark:text-foreground-muted-dark">
            Explanation
          </FoundationText>
          <FoundationText className="text-base leading-6">{item.explanation}</FoundationText>
        </View>
      }
    />
  );
});
