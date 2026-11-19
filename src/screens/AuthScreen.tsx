import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { auth } from '../services/firebaseAuth';

function messageForAuthError(code: string) {
  if (code === 'auth/email-already-in-use') return 'Esse e-mail já tem uma conta. Entre com sua senha.';
  if (code === 'auth/invalid-email') return 'Digite um e-mail válido.';
  if (code === 'auth/weak-password') return 'A senha precisa ter pelo menos 6 caracteres.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'E-mail ou senha incorretos.';
  }
  if (code === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (code === 'auth/network-request-failed') return 'Confira sua conexão com a internet.';
  if (code === 'auth/operation-not-allowed') return 'Ative o acesso por e-mail e senha nas configurações do Firebase Authentication.';
  return 'Não foi possível acessar sua conta. Tente novamente.';
}

export default function AuthScreen() {
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (registering) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      setMessage(messageForAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameScreenLayout
      title={registering ? 'Criar conta' : 'Entrar'}
      subtitle="CONTA SUPER SENHA"
      showBack={false}
      footer={
        <>
          <MenuAction title={loading ? 'Aguarde…' : registering ? 'Criar conta' : 'Entrar'} onPress={() => void submit()} disabled={loading} />
          <Pressable accessibilityRole="button" onPress={() => { setRegistering((value) => !value); setMessage(''); }}>
            <PixelText kind="detail" style={styles.link}>
              {registering ? 'Já tem conta? Entrar' : 'Primeira vez? Criar conta'}
            </PixelText>
          </Pressable>
        </>
      }
    >
      <View style={gameStyles.section}>
        <PixelText kind="detail">Entre para acessar seus temas personalizados salvos.</PixelText>
        <TextInput
          accessibilityLabel="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor={ink.dim}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
          style={gameStyles.input}
        />
        <TextInput
          accessibilityLabel="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={ink.dim}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={registering ? 'new-password' : 'current-password'}
          editable={!loading}
          onSubmitEditing={() => void submit()}
          style={gameStyles.input}
        />
        {loading && <ActivityIndicator color={ink.white} />}
        {message ? <View style={gameStyles.panel}><PixelText>{message}</PixelText></View> : null}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({ link: { textAlign: 'center', paddingVertical: 8 } });
