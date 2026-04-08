import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComingSoon } from '../../src/components/ComingSoon';
import { colors } from '../../src/lib/theme';

export default function ViagensScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ComingSoon
          icon="map-outline"
          title="Viagens"
          description="Lista, início e finalização de viagens com captura de GPS. Chega na próxima etapa."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
});
