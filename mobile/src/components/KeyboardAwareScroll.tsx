import { useCallback, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface Props extends ScrollViewProps {
  /** Extra bottom offset when scrolling to focused input (default: 140) */
  extraScrollHeight?: number;
  /** Style for the outer KeyboardAvoidingView */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * A ScrollView that automatically scrolls to the focused TextInput
 * when the keyboard appears. Wraps content in KeyboardAvoidingView.
 *
 * Usage: Replace `<KeyboardAvoidingView><ScrollView>` combo with just
 * `<KeyboardAwareScroll>`.
 *
 * Inputs inside will auto-scroll into view when focused thanks to
 * `automaticallyAdjustKeyboardInsets` on iOS and behavior="height" on Android.
 */
export function KeyboardAwareScroll({
  children,
  extraScrollHeight = 140,
  containerStyle,
  contentContainerStyle,
  ...scrollProps
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const layoutY = useRef(0);

  const handleScrollToInput = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      const target = event?.nativeEvent?.target;
      if (!target || !scrollRef.current) return;

      // Delay to let keyboard fully open
      setTimeout(() => {
        (event.target as any)?.measureLayout?.(
          scrollRef.current as any,
          (_x: number, y: number) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, y - extraScrollHeight),
              animated: true,
            });
          },
          () => {},
        );
      }, 300);
    },
    [extraScrollHeight],
  );

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={contentContainerStyle}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
