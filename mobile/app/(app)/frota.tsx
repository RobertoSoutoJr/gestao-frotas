import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComingSoon } from '../../src/components/ComingSoon';
import { colors } from '../../src/lib/theme';

export default function FrotaScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ComingSoon
          icon="bus-outline"
          title="Frota"
          description="Visualização de caminhões, motoristas e manutenções. Foco do MVP é motorista, gestor vem em seguida."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
});
