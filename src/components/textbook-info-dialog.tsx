import { Image } from 'expo-image';
import { ScrollView } from 'react-native';

import { FoundationText } from '@/components/foundation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { TextbookMetadata } from '@/library/catalog';

type TextbookInfoDialogProps = {
  textbook: TextbookMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Full textbook description, edition line, and optional bundled cover image.
 * Portals above the Stack via the root PortalHost.
 */
export function TextbookInfoDialog({
  textbook,
  open,
  onOpenChange,
}: TextbookInfoDialogProps) {
  const editionLine = `${textbook.editionLabel}, ${textbook.year}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-md">
        {textbook.coverImage ? (
          <Image
            accessibilityLabel={`Cover image for ${textbook.title}`}
            source={textbook.coverImage}
            className="aspect-[2/3] w-full bg-muted"
            contentFit="cover"
          />
        ) : null}

        <ScrollView
          className="max-h-72"
          contentContainerClassName="gap-3 px-6 pb-6 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator>
          <DialogHeader className={cn('gap-1', textbook.coverImage ? 'pt-0' : 'pt-4')}>
            <DialogTitle className="text-left text-xl leading-snug">{textbook.title}</DialogTitle>
            <FoundationText className="text-left text-sm text-foreground-muted dark:text-foreground-muted-dark">
              {editionLine}
            </FoundationText>
          </DialogHeader>

          <DialogDescription asChild>
            <FoundationText className="text-left text-base leading-6 text-foreground">
              {textbook.description}
            </FoundationText>
          </DialogDescription>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
