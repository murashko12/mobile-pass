import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Alert, Dimensions, Platform, View } from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SimpleScrollView from '@/components/simple-scroll-view';

const { width } = Dimensions.get('window') 

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  // Запрос разрешения на использование камеры
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      // Если разрешение окончательно отказано
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
    ]
    
    return expoPatterns.some(pattern => pattern.test(data));
  }

  // Обработка сканирования QR-кода
const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
  if (!scanned && isActive) {
    console.log('Scanned data:', data);
    
    // Игнорируем Expo QR-коды
    if (isExpoQRCode(data)) {
      console.log('Ignoring Expo QR code:', data);
      return;
    }

    setScanned(true);
    
    // Имитация отправки на сервер
    const scanData = {
      employeeId: '12345', // В реальном приложении из контекста пользователя
      qrCode: data,
      timestamp: new Date().toISOString(),
      location: 'Офис Company N'
    }
    
    console.log('Sending scan data to server:', scanData);
    
    Alert.alert(
      'Пропуск отсканирован! ✅',
      `Код: ${data}\nВремя: ${new Date().toLocaleTimeString()}\n\nДанные отправлены на сервер`,
      [
        {
          text: 'Сканировать еще',
          style: 'default',
          onPress: () => {
            setScanned(false);
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        }
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
          <ThemedText>Loading camera permissions...</ThemedText>
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
            <ThemedText>Camera Permission Required</ThemedText>
            <ThemedText style={styles.instruction}>
              This app needs camera access to scan QR codes. 
              Please grant camera permissions in your device settings.
            </ThemedText>
            {permission.canAskAgain && (
              <ThemedView style={styles.buttonContainer}>
                <ThemedView style={styles.button}>
                  <ThemedText 
                    style={styles.buttonText}
                    onPress={requestPermission}
                  >
                    Grant Permission
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {!permission.canAskAgain && (
              <ThemedText style={styles.errorText}>
                Permission permanently denied. Please enable camera access in device settings.
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
          Наведите камеру на QR-код, чтобы отсканировать его
        </ThemedText>

        {/* <ThemedText style={styles.note}>
          Development QR codes are automatically ignored
        </ThemedText> */}

        <ThemedView style={styles.cameraWrapper}>
          {isActive && (
            <ThemedView style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'pdf417', 'ean13', 'upc_e'],
                }}
                enableTorch={false}
              />
              <View style={styles.overlay}>
                <View style={styles.scanFrame} />
                {/* <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} /> */}
              </View>
            </ThemedView>
          )}

          {!isActive && (
            <ThemedView style={styles.cameraPlaceholder}>
              <ThemedText>Camera inactive</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {scanned && (
          <ThemedView style={styles.scanResult}>
            <ThemedText>Scanning paused. Tap "Scan Again" to continue.</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.tips}>
          <ThemedText style={styles.tipsTitle}>Советы по улучшению сканирования:</ThemedText>
          <ThemedText>• Обеспечьте хорошие условия освещения</ThemedText>
          <ThemedText>• Держите устройство устойчиво</ThemedText>
          <ThemedText>• Разместите QR-код в рамке</ThemedText>
          <ThemedText>• Соблюдайте соответствующую дистанцию</ThemedText>
        </ThemedView>
        
      </ThemedView>
    </SimpleScrollView>
  )
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
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  note: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
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
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#00FF00',
  },
  // cornerTL: {
  //   top: '50%',
  //   left: '50%',
  //   marginTop: -100,
  //   marginLeft: -100,
  //   borderTopWidth: 4,
  //   borderLeftWidth: 4,
  // },
  // cornerTR: {
  //   top: '50%',
  //   left: '50%',
  //   marginTop: -100,
  //   marginLeft: 75,
  //   borderTopWidth: 4,
  //   borderRightWidth: 4,
  // },
  // cornerBL: {
  //   top: '50%',
  //   left: '50%',
  //   marginTop: 75,
  //   marginLeft: -100,
  //   borderBottomWidth: 4,
  //   borderLeftWidth: 4,
  // },
  // cornerBR: {
  //   top: '50%',
  //   left: '50%',
  //   marginTop: 75,
  //   marginLeft: 75,
  //   borderBottomWidth: 4,
  //   borderRightWidth: 4,
  // },
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
    marginBottom: 16,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  debugInfo: {
    width: '100%',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
});