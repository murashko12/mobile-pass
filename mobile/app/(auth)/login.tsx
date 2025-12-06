import SimpleScrollView from '@/components/simple-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';


const API_BASE_URL = 'http://172.20.10.2:3001';

export default function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Ошибка', 'Введите логин и пароль');
      return;
    }

    setIsLoading(true);
    
    // Имитация аутентификации
    /*setTimeout(() => {
      setIsLoading(false);
      if (login === 'test1' && password === 'test2') {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Ошибка', 'Неверный логин или пароль');
      }
    }, 1000);*/
    setIsLoading(true);
    try {
      Alert.alert(JSON.stringify({ login, password }))
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });
      Alert.alert("Here we fucking go!!!!")

      // Проверяем, успешен ли сам HTTP-запрос (статус 2xx)
      if (!response.ok) {
        // Например, 500 Internal Server Error
        throw new Error(`Сервер ответил с ошибкой: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Авторизация успешна
        router.replace('/(tabs)');
      } else {
        Alert.alert('Ошибка', result.message || 'Неверный логин или пароль');
      }
    } catch (error: any) {
      console.error('Ошибка сети или парсинга:', error);
      let errorMessage = 'Не удалось подключиться к серверу';
      if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SimpleScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Мобильный пропуск</ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedText style={styles.label}>Логин:</ThemedText>
          <ThemedTextInput
            style={styles.input}
            value={login}
            onChangeText={setLogin}
            placeholder="Введите ваш логин"
            autoCapitalize="none"
          />

          <ThemedText style={styles.label}>Пароль:</ThemedText>
          <ThemedTextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Введите ваш пароль"
            secureTextEntry
          />

          <ThemedView style={styles.button} onTouchEnd={handleLogin}>
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Вход...' : 'Войти'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SimpleScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  demoText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
});