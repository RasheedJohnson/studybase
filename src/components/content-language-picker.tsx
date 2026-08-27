import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

import { FoundationText, surfacePlateClassName } from '@/components/foundation';
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
import {
  contentLanguageLabel,
  type ContentLanguage,
} from '@/library/catalog';
import { cn } from '@/lib/utils';

const LANGUAGE_OPTIONS: readonly ContentLanguage[] = ['en', 'de'];

type ContentLanguagePickerProps = {
  language: ContentLanguage;
  onSelect: (language: ContentLanguage) => void;
  /** Shell applies flex-1 / full-width classes when composing the picker row. */
  className?: string;
};

/**
 * EN/DE content-language selector for bilingual textbooks.
 * Mirrors ChapterPicker / StudyTabs Reusables Dropdown Menu patterns.
 * Shown only when the textbook opts into bilingualContent (shell wires visibility).
 */
export function ContentLanguagePicker({
  language,
  onSelect,
  className,
}: ContentLanguagePickerProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedLabel = contentLanguageLabel(language);

  // Keep the portal menu clear of notches and home indicators on native.
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  function onLanguageChange(value: string) {
    if (value === 'en' || value === 'de') {
      onSelect(value);
    }
  }

  return (
    <View className={cn('min-w-0 gap-2', className)}>
      <FoundationText className="text-sm font-medium text-primary">Language</FoundationText>
      <DropdownMenu onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Language ${selectedLabel}`}
            accessibilityHint="Opens the language list"
            accessibilityState={{ expanded: menuOpen }}
            className={cn(
              'min-h-12 w-full flex-row items-center gap-2 px-3 py-2 focus:border-primary',
              surfacePlateClassName
            )}>
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              className="min-w-0 flex-1 text-base font-semibold text-foreground"
              numberOfLines={1}>
              {selectedLabel}
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
          <DropdownMenuLabel className="px-3 pt-2">Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={onLanguageChange}
            className="p-1">
            {LANGUAGE_OPTIONS.map((option) => {
              const label = contentLanguageLabel(option);
              const selected = language === option;
              return (
                <DropdownMenuRadioItem
                  key={option}
                  value={option}
                  accessibilityLabel={label}
                  className={cn('min-h-12 py-3', selected && 'bg-accent')}
                  // Close on press so selecting a language dismisses the portal immediately.
                  closeOnPress>
                  <Text
                    className={cn(
                      'min-w-0 flex-1 text-base leading-5',
                      selected ? 'font-medium text-primary' : 'text-muted-foreground'
                    )}
                    numberOfLines={1}>
                    {label}
                  </Text>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}
