import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import {
  Card,
  FoundationText,
  Screen,
  ThemeToggle,
} from '@/components/foundation';
import { BottomTabInset } from '@/constants/theme';
import { getSubjects, getTextbooksForSubject } from '@/library/catalog';
import type { TextbookMetadata } from '@/library/psychology/psychology-2022-13thedition';

const SUBJECTS = getSubjects();

function subjectName(subjectId: string): string {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.name ?? subjectId;
}

function TextbookCard({ book }: { book: TextbookMetadata }) {
  const label = `${book.title}, ${book.editionLabel}, ${book.year}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens this textbook"
      onPress={() =>
        router.push({ pathname: '/textbook/[id]', params: { id: book.id } })
      }
      // Opacity-only press feedback keeps the card layout stable while pressed.
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
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
    </Pressable>
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
          <Pressable
            key={subject.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={subject.name}
            onPress={() => onSelect(subject.id)}
            className={
              selected
                ? 'min-h-12 items-center justify-center rounded-card border border-primary bg-primary px-4 py-3'
                : 'min-h-12 items-center justify-center rounded-card border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark'
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
              {subject.name}
            </FoundationText>
          </Pressable>
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
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
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
        <ThemeToggle />
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
