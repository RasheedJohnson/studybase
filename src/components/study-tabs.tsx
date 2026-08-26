import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, ChevronDown, CircleHelp, type LucideIcon } from 'lucide-react-native';

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
  getDefinitionsByChapter,
  getQuestionsByChapter,
  type DefinitionCard,
  type Question,
} from '@/library/psychology/psychology-2022-13thedition';

type StudyTab = 'questions' | 'definitions';

type StudyTabsProps = {
  chapterId: string;
};

const TABS: { id: StudyTab; label: string; icon: LucideIcon }[] = [
  { id: 'questions', label: 'Questions', icon: CircleHelp },
  { id: 'definitions', label: 'Definitions', icon: BookOpen },
];

const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_DEFINITIONS: DefinitionCard[] = [];

/**
 * In-screen Questions / Definitions study mode.
 * Mode state is local so switching panels never touches shared chapter selection.
 * Each list item is a FlipCard bound to the selected chapter's offline rows.
 */
export function StudyTabs({ chapterId }: StudyTabsProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StudyTab>('questions');
  const [menuOpen, setMenuOpen] = useState(false);
  const isQuestions = activeTab === 'questions';
  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const activeLabel = activeTabMeta.label;
  const ActiveIcon = activeTabMeta.icon;

  // Only materialize the active mode's rows to keep chapter switches cheap.
  const questions = useMemo(
    () => (isQuestions ? getQuestionsByChapter(chapterId) : EMPTY_QUESTIONS),
    [chapterId, isQuestions]
  );
  const definitions = useMemo(
    () => (!isQuestions ? getDefinitionsByChapter(chapterId) : EMPTY_DEFINITIONS),
    [chapterId, isQuestions]
  );

  const emptyMessage = isQuestions
    ? 'No questions for this chapter yet.'
    : 'No definitions for this chapter yet.';

  const renderQuestion = useCallback(
    ({ item }: { item: Question }) => <QuestionFlip item={item} />,
    []
  );
  const renderDefinition = useCallback(
    ({ item }: { item: DefinitionCard }) => <DefinitionFlip item={item} />,
    []
  );

  const onModeChange = useCallback((value: string) => {
    if (value === 'questions' || value === 'definitions') {
      setActiveTab(value);
    }
  }, []);

  // Keep the portal menu clear of notches and home indicators on native.
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
            // Two short options; cap width only so the menu stays readable on narrow screens.
            className="w-80 max-w-[90vw] overflow-hidden p-0">
            <DropdownMenuLabel className="px-3 pt-2">Study mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={activeTab}
              onValueChange={onModeChange}
              className="p-1">
              {TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <DropdownMenuRadioItem
                    key={tab.id}
                    value={tab.id}
                    accessibilityLabel={tab.label}
                    className={cn(
                      'min-h-12 py-3',
                      selected && 'bg-accent'
                    )}
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

      <View
        accessibilityLabel={isQuestions ? 'Questions panel' : 'Definitions panel'}
        className="min-h-0 flex-1">
        {isQuestions ? (
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
        ) : (
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
