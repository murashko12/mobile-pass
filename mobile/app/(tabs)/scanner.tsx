import SimpleScrollView from '@/components/simple-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Запрос разрешения на использование камеры
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      console.log('Camera permission permanently denied');
    }
  }, [permission]);

  // Обработчик фокуса на экране
  useFocusEffect(
    useCallback(() => {
      console.log('Scanner screen focused');
      setIsActive(true);
      setScanned(false);

      return () => {
        console.log('Scanner screen unfocused');
        setIsActive(false);
      };
    }, [])
  );

  // Функция для проверки Expo QR-кода
  const isExpoQRCode = (data: string): boolean => {
    const expoPatterns = [
      /^exp:\/\//,
      /^exps:\/\//,
      /172\.20\.10\.\d+/,
      /8081/,
      /192\.168\.\d+\.\d+/,
      /localhost/
    ];
    
    return expoPatterns.some(pattern => pattern.test(data));
  };

  // Функция для отправки данных сканирования на сервер
  const sendScanToServer = async (qrType: string, qrData: string) => {
    try {
      // В реальном приложении здесь будет запрос к вашему API
      const scanData = {
        employeeId: '12345', // В реальном приложении из контекста/хранилища
        qrCode: qrData,
        qrType: qrType,
        timestamp: new Date().toISOString(),
        location: 'Офис Company N'
      };

      console.log('Sending scan data to server:', scanData);

      // Имитация запроса к API
      const response = await fetch('http://localhost:3001/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData),
      });

      if (response.ok) {
        return { success: true, message: 'Данные успешно отправлены' };
      } else {
        return { success: false, message: 'Ошибка сервера' };
      }
    } catch (error) {
      console.error('Error sending scan data:', error);
      return { success: false, message: 'Ошибка сети' };
    }
  };

  // Обработка сканирования QR-кода
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanned && isActive) {
      console.log('Scanned data:', data);
      
      // Игнорируем Expo QR-коды
      if (isExpoQRCode(data)) {
        console.log('Ignoring Expo QR code:', data);
        return;
      }

      setScanned(true);

      let scanType = '';
      let alertMessage = '';

      // Определяем тип сканирования по содержимому QR-кода
      if (data === 'mobile-pass://checkin-out') {
        scanType = 'checkin-out';
        alertMessage = 'Сканирование входа/выхода\n\nОтправка данных на сервер...';
      } else if (data === 'mobile-pass://lunch-break') {
        scanType = 'lunch-break';
        alertMessage = 'Сканирование обеда\n\nОтправка данных на сервер...';
      } else {
        scanType = 'unknown';
        alertMessage = `Неизвестный QR-код: ${data}\n\nОтправка данных на сервер...`;
      }

      // Показываем уведомление о сканировании
      Alert.alert(
        'Пропуск отсканирован! ✅',
        alertMessage,
        [
          {
            text: 'Отмена',
            style: 'cancel',
            onPress: () => setScanned(false),
          },
          {
            text: 'Подтвердить',
            style: 'default',
            onPress: async () => {
              // Отправляем данные на сервер
              const result = await sendScanToServer(scanType, data);
              
              if (result.success) {
                Alert.alert(
                  'Успех!',
                  `Тип: ${scanType}\nВремя: ${new Date().toLocaleTimeString()}\n\n${result.message}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setScanned(false);
                        // Можно перейти на главный экран или обновить данные
                        // router.replace('/(tabs)');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Ошибка',
                  `Не удалось отправить данные: ${result.message}`,
                  [
                    {
                      text: 'Повторить',
                      onPress: () => setScanned(false),
                    },
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ]
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  // Если разрешения еще загружаются
  if (!permission) {
    return (
      <SimpleScrollView>
        <ThemedView style={styles.container}>
          <ThemedText>Загрузка разрешений камеры...</ThemedText>
        </ThemedView>
      </SimpleScrollView>
    );
  }

  // Если нет разрешения
  if (!permission.granted) {
    return (
      <SimpleScrollView>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.permissionContainer}>
            <ThemedText>Требуется доступ к камере</ThemedText>
            <ThemedText style={styles.instruction}>
              Это приложение требует доступ к камере для сканирования QR-кодов.
              Пожалуйста, предоставьте разрешение в настройках устройства.
            </ThemedText>
            {permission.canAskAgain && (
              <ThemedView style={styles.buttonContainer}>
                <ThemedView style={styles.button}>
                  <ThemedText 
                    style={styles.buttonText}
                    onPress={requestPermission}
                  >
                    Предоставить доступ
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {!permission.canAskAgain && (
              <ThemedText style={styles.errorText}>
                Доступ запрещен. Разрешите доступ к камере в настройках устройства.
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </SimpleScrollView>
    );
  }

  return (
    <SimpleScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">QR Сканер</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.instruction}>
          Наведите камеру на QR-код пропуска
        </ThemedText>

        <ThemedView style={styles.qrTypes}>
          <ThemedText style={styles.qrTypesTitle}>Типы QR-кодов:</ThemedText>
          <ThemedText>• <ThemedText style={styles.qrHighlight}>Вход/Выход</ThemedText> - mobile-pass://checkin-out</ThemedText>
          <ThemedText>• <ThemedText style={styles.qrHighlight}>Обед</ThemedText> - mobile-pass://lunch-break</ThemedText>
        </ThemedView>

        <ThemedView style={styles.cameraWrapper}>
          {isActive && (
            <ThemedView style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'pdf417'],
                }}
                enableTorch={false}
              />
              <View style={styles.overlay}>
                <View style={styles.scanFrame} />
              </View>
            </ThemedView>
          )}

          {!isActive && (
            <ThemedView style={styles.cameraPlaceholder}>
              <ThemedText>Камера неактивна</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {scanned && (
          <ThemedView style={styles.scanResult}>
            <ThemedText>Сканирование приостановлено. Нажмите "Сканировать еще" чтобы продолжить.</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.tips}>
          <ThemedText style={styles.tipsTitle}>Советы по сканированию:</ThemedText>
          <ThemedText>• Обеспечьте хорошее освещение</ThemedText>
          <ThemedText>• Держите устройство устойчиво</ThemedText>
          <ThemedText>• Разместите QR-код в рамке</ThemedText>
        </ThemedView>
      </ThemedView>
    </SimpleScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
    marginTop: 50,
    alignItems: 'center',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  qrTypes: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  qrTypesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  qrHighlight: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cameraWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    width: width - 32,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    width: width - 32,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanResult: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 20,
    alignItems: 'center',
  },
  permissionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  tips: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
});