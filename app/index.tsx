import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInUser } from './firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      await signInUser(email, password);
      console.log('Login realizado com sucesso');
      router.push('/dashboard' as any);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', `Erro ao fazer login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo e Título */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      </View>

      {/* Formulário */}
      <View style={styles.formContainer}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing in...' : 'Log In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Link para registro */}
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>
          Don't have an account?{' '}
          {/* @ts-ignore */}
          <Link href="/register">
            <Text style={styles.linkHighlight}>Sign up</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    backgroundColor: '#1a1a2e',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logo: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  noteContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  noteText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4B5563',
    color: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#00b4d8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linksContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  linkText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  linkHighlight: {
    color: '#00b4d8',
    textDecorationLine: 'underline',
  },
  backLink: {
    color: '#00b4d8',
    fontSize: 14,
    marginTop: 16,
  },
});
