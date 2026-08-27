import { Stack, router, useLocalSearchParams } from "expo-router";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { ChapterPicker } from "@/components/chapter-picker";
import { ContentLanguagePicker } from "@/components/content-language-picker";
import {
  Button,
  FoundationText,
  Screen,
  surfacePlateClassName,
} from "@/components/foundation";
import {
  StudyModePicker,
  useStudyModeSelection,
} from "@/components/study-mode-picker";
import { StudyTabs } from "@/components/study-tabs";
import { TextbookInfoDialog } from "@/components/textbook-info-dialog";
import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/lib/press-scale";
import { cn } from "@/lib/utils";
import {
  getTextbook,
  setSelectedChapterId,
  useSelectedChapterId,
  useSelectedContentLanguage,
} from "@/library/catalog";

function paramValue(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return "";
}

/**
 * Textbook study shell: metadata, shared chapter picker, and in-screen study mode.
 * Chapter lives in the session store (not the URL) so mode switches and back navigation
 * keep the same selection without remounting this route.
 */
export default function TextbookScreen() {
  const params = useLocalSearchParams<{ id: string; chapter?: string }>();
  const textbookId = paramValue(params.id);
  const chapterParam = paramValue(params.chapter);
  const textbook = textbookId ? getTextbook(textbookId) : null;
  const [infoOpen, setInfoOpen] = useState(false);

  // Seed the shared store during render so SSR and first paint honor ?chapter=.
  // Invalid ids are ignored by the store; identical writes no-op (no render loop).
  if (textbook && chapterParam) {
    setSelectedChapterId(textbook.id, chapterParam);
  }

  const { chapterId, setChapterId, chapters } =
    useSelectedChapterId(textbookId);
  const { language, setLanguage, bilingual } =
    useSelectedContentLanguage(textbookId);
  const { availableModes, activeMode, setActiveMode } =
    useStudyModeSelection(textbookId);

  const showStudyModePicker = availableModes.length > 0;
  const showPickerRow = bilingual || showStudyModePicker;
  const halfWidthClass = "min-w-0 flex-1 basis-0";

  if (!textbookId) {
    return (
      <>
        <Stack.Screen options={{ title: "Textbook" }} />
        <Screen safeTop={false} className="gap-4">
          <FoundationText
            accessibilityRole="header"
            className="text-2xl font-semibold"
          >
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
        <Stack.Screen options={{ title: "Unavailable" }} />
        <Screen safeTop={false} className="gap-4">
          <FoundationText
            accessibilityRole="header"
            className="text-2xl font-semibold"
          >
            Textbook unavailable
          </FoundationText>
          <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
            This textbook id is not in the local catalog.
          </FoundationText>
          <Button label="Back to Home" onPress={() => router.replace("/")} />
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
            numberOfLines={2}
          >
            {textbook.title}
          </FoundationText>

          <View className="flex-row items-center gap-2">
            <FoundationText
              className="min-w-0 flex-1 text-base text-foreground-muted dark:text-foreground-muted-dark"
              numberOfLines={1}
            >
              {`${textbook.editionLabel}, ${textbook.year}`}
            </FoundationText>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="About this textbook"
              accessibilityHint="Opens the textbook description dialog"
              onPress={() => setInfoOpen(true)}
              className="min-h-12 min-w-12 flex-row items-center justify-center gap-2 rounded-lg border border-muted px-4 py-2 focus:border-primary"
            >
              <Icon as={Info} size={20} className="text-primary" />
              <FoundationText className="text-sm font-medium text-primary">
                Information
              </FoundationText>
            </PressableScale>
          </View>
        </View>

        <TextbookInfoDialog
          textbook={textbook}
          open={infoOpen}
          onOpenChange={setInfoOpen}
        />

        <ChapterPicker
          chapters={chapters}
          selectedId={chapterId}
          onSelect={setChapterId}
          language={language}
        />

        {showPickerRow ? (
          <View className="flex-row gap-3">
            {bilingual ? (
              <ContentLanguagePicker
                language={language}
                onSelect={setLanguage}
                className={
                  showStudyModePicker ? halfWidthClass : "w-full flex-1"
                }
              />
            ) : null}
            {showStudyModePicker ? (
              <StudyModePicker
                textbookId={textbook.id}
                value={activeMode}
                onChange={setActiveMode}
                className={bilingual ? halfWidthClass : "w-full flex-1"}
              />
            ) : null}
          </View>
        ) : null}

        {chapters.length === 0 || !chapterId ? (
          <View
            accessibilityRole="summary"
            accessibilityLiveRegion="polite"
            className={cn("p-4", surfacePlateClassName)}
          >
            <FoundationText className="text-base text-foreground-muted dark:text-foreground-muted-dark">
              Study content is unavailable until a chapter can be selected.
            </FoundationText>
          </View>
        ) : (
          <StudyTabs
            textbookId={textbook.id}
            chapterId={chapterId}
            language={language}
            activeMode={activeMode}
          />
        )}
      </Screen>
    </>
  );
}
