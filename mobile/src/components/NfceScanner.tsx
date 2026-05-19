import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { type Colors, fontSize, radius, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';
import { useHaptics } from '../hooks/useHaptics';

interface NfceScannerProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (result: { uri: string; qrData?: string }) => void;
}

export function NfceScanner({ visible, onClose, onCapture }: NfceScannerProps) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const haptics = useHaptics();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [qrDetected, setQrDetected] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleBarcodeScan = (result: BarcodeScanningResult) => {
    if (qrDetected) return; // already detected
    const data = result.data;
    // Check if it looks like an NFC-e QR code (contains SEFAZ URL or 44-digit key)
    if (data && (data.includes('nfce') || data.includes('NFe') || /\d{44}/.test(data))) {
      setQrDetected(data);
      haptics.success();
    }
  };

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    haptics.light();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      if (photo?.uri) {
        onCapture({ uri: photo.uri, qrData: qrDetected ?? undefined });
      }
    } catch (err) {
      console.error('[NfceScanner] Capture error:', err);
    } finally {
      setCapturing(false);
      setQrDetected(null);
    }
  };

  const handleClose = () => {
    setQrDetected(null);
    setCapturing(false);
    onClose();
  };

  if (!visible) return null;

  // Permission not yet determined
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </Modal>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.permTitle}>Permissão necessária</Text>
          <Text style={styles.permText}>
            Precisamos da câmera para ler o cupom fiscal.
          </Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Permitir Câmera</Text>
          </Pressable>
          <Pressable style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarcodeScan}
        />

        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={handleClose} style={styles.topBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.topTitle}>Escanear NFC-e</Text>
          <View style={styles.topBtn} />
        </View>

        {/* QR detected indicator */}
        {qrDetected && (
          <View style={styles.qrBadge}>
            <Ionicons name="qr-code" size={16} color="#fff" />
            <Text style={styles.qrBadgeText}>QR Code detectado!</Text>
          </View>
        )}

        {/* Guide overlay */}
        <View style={styles.guide}>
          <Text style={styles.guideText}>
            Aponte para o cupom fiscal{'\n'}e toque no botão para fotografar
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            style={styles.captureBtn}
          >
            {capturing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    permTitle: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: c.text,
      marginTop: spacing.md,
    },
    permText: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      textAlign: 'center',
      maxWidth: 280,
    },
    permBtn: {
      backgroundColor: c.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.md,
    },
    permBtnText: {
      color: '#fff',
      fontSize: fontSize.base,
      fontWeight: '600',
    },
    closeBtn: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
    },
    closeBtnText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
    cameraContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    camera: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    topBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topTitle: {
      color: '#fff',
      fontSize: fontSize.lg,
      fontWeight: '600',
    },
    qrBadge: {
      position: 'absolute',
      top: 110,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: '#22c55e',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
    },
    qrBadgeText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    guide: {
      position: 'absolute',
      bottom: 140,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    guideText: {
      color: '#fff',
      fontSize: fontSize.sm,
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      overflow: 'hidden',
      lineHeight: 22,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    captureBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 4,
      borderColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#fff',
    },
  });
