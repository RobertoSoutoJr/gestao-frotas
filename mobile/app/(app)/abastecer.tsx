import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComingSoon } from '../../src/components/ComingSoon';
import { colors } from '../../src/lib/theme';

export default function AbastecerScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ComingSoon
          icon="water-outline"
          title="Abastecimento"
          description="Registro rápido de abastecimento: caminhão, litros, valor, km e posto. Chega na próxima etapa."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
});
