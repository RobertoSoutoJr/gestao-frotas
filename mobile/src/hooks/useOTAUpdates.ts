import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Checks for OTA updates on app launch.
 * If an update is available, downloads it and prompts the user to restart.
 * Silent in development (Expo Go / dev client).
 */
export function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__) return; // skip in development

    async function checkForUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();

          Alert.alert(
            'Atualização disponível',
            'Uma nova versão do app foi baixada. Deseja reiniciar agora?',
            [
              { text: 'Depois', style: 'cancel' },
              {
                text: 'Reiniciar',
                onPress: () => Updates.reloadAsync(),
              },
            ],
          );
        }
      } catch (err) {
        // Silent fail — don't bother user if update check fails
        console.log('[OTA] Update check failed:', err);
      }
    }

    checkForUpdate();
  }, []);
}
