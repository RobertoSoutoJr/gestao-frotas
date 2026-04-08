import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComingSoon } from '../../src/components/ComingSoon';
import { colors } from '../../src/lib/theme';

export default function RelatoriosScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ComingSoon
          icon="bar-chart-outline"
          title="Relatórios"
          description="KPIs, exportações e gráficos da frota. Para uma visão completa use o painel web."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
});
