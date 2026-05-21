import React, { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle-outline" size={56} color="#f59e0b" />
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            Ocorreu um erro inesperado no aplicativo.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorText} numberOfLines={6}>
              {this.state.error.toString()}
            </Text>
          )}
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 300,
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5E6AD2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
