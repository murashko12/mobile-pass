import { ScrollView, type ScrollViewProps } from 'react-native';
import { ThemedView } from './themed-view';

interface SimpleScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export default function SimpleScrollView({ children, ...props }: SimpleScrollViewProps) {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView {...props} style={[{ flex: 1 }, props.style]}>
        {children}
      </ScrollView>
    </ThemedView>
  );
}