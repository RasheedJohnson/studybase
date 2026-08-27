import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { Card, FoundationText, Screen } from '@/components/foundation';
import { BottomTabInset } from '@/constants/theme';
import { PressableScale } from '@/lib/press-scale';
import {
  getSubjects,
  getTextbooksForSubject,
  type TextbookMetadata,
} from '@/library/catalog';
import { cn } from '@/lib/utils';

const SUBJECTS = getSubjects();

function subjectName(subjectId: string): string {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.name ?? subjectId;
}

function TextbookCard({ book }: { book: TextbookMetadata }) {
  const label = `${book.title}, ${book.editionLabel}, ${book.year}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens this textbook"
      onPress={() =>
        router.push({ pathname: '/textbook/[id]', params: { id: book.id } })
      }>
      <Card importantForAccessibility="no-hide-descendants">
        <FoundationText className="text-lg font-semibold" numberOfLines={2}>
          {book.title}
        </FoundationText>
        <FoundationText
          className="text-sm text-foreground-muted dark:text-foreground-muted-dark"
          numberOfLines={1}>
          {`${book.editionLabel}, ${book.year}`}
        </FoundationText>
        <FoundationText
          className="text-sm text-foreground-muted dark:text-foreground-muted-dark"
          numberOfLines={3}>
          {book.description}
        </FoundationText>
      </Card>
    </PressableScale>
  );
}

function SubjectFilters({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Subject"
      className="flex-row flex-wrap gap-2">
      {SUBJECTS.map((subject) => {
        const selected = subject.id === selectedId;
        return (
          <PressableScale
            key={subject.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={subject.name}
            onPress={() => onSelect(subject.id)}
            className={cn(
              'min-h-12 items-center justify-center rounded-card border-hairline px-4 py-3',
              selected
                ? 'border-primary/30 bg-surface-selected dark:bg-surface-selected-dark'
                : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
            )}>
            <FoundationText
              accessibilityElementsHidden
              importantForAccessibility="no"
              className={
                selected
                  ? 'text-base font-medium text-primary'
                  : 'text-base font-medium text-foreground-muted dark:text-foreground-muted-dark'
              }
              numberOfLines={1}>
              {subject.name}
            </FoundationText>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const initialSubjectId = SUBJECTS[0]?.id ?? '';
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const textbooks = selectedSubjectId
    ? getTextbooksForSubject(selectedSubjectId)
    : [];

  return (
    <Screen scroll bottomInset={BottomTabInset} className="gap-6">
      {/* pr-14 keeps brand copy clear of the shared Stack header ThemeToggle on native. */}
      <View className="gap-1 pr-14">
        <FoundationText
          accessibilityRole="header"
          className="text-3xl font-semibold"
          numberOfLines={1}>
          Studybase
        </FoundationText>
        <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
          Choose a subject, then open a textbook to study offline.
        </FoundationText>
      </View>

      {SUBJECTS.length > 0 ? (
        <View className="gap-2">
          <FoundationText className="text-sm font-medium text-primary">
            Subject
          </FoundationText>
          <SubjectFilters
            selectedId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
        </View>
      ) : null}

      <View className="gap-3">
        <FoundationText
          accessibilityRole="header"
          className="text-lg font-semibold">
          {selectedSubjectId
            ? `Textbooks (${subjectName(selectedSubjectId)})`
            : 'Textbooks'}
        </FoundationText>

        {textbooks.length === 0 ? (
          <Card accessibilityRole="text" accessibilityLiveRegion="polite">
            <FoundationText className="text-center text-base text-foreground-muted dark:text-foreground-muted-dark">
              No textbooks match this subject.
            </FoundationText>
          </Card>
        ) : (
          textbooks.map((book) => <TextbookCard key={book.id} book={book} />)
        )}
      </View>
    </Screen>
  );
}
