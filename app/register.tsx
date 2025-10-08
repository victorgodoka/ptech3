import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUser } from './firebase/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleRegister = async () => {
    
    if (!name || !email || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await createUser(email, password);
      alert('Conta criada com sucesso!');
      router.replace('/dashboard' as any);
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      alert(`Erro ao criar conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.appTitle}>cashapp.exe</Text>
        <Text style={styles.pageTitle}>Sign up</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account?{' '}
          <Link href="/">
            <Text style={styles.linkPrimary}>Log in</Text>
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
  appTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -24,
    marginBottom: 8,
  },
  pageTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  noteContainer: {
    width: '100%',
    maxWidth: 384,
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
    maxWidth: 384,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4b5563',
    color: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#00b4d8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  linkContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  linkText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  linkPrimary: {
    color: '#00b4d8',
    textDecorationLine: 'underline',
  },
  backLink: {
    color: '#00b4d8',
    fontSize: 14,
    marginTop: 16,
  },
});
