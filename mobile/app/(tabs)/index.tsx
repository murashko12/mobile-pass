import { StyleSheet } from 'react-native';

import SimpleScrollView from '@/components/simple-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { getNextScanInfo } from '@/app/(utils)/shift';
import { useAuth } from '@/app/contexts/auth-context';
import { useCallback, useEffect, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import { API_BASE_URL } from '../(utils)/api_id';

interface EmployeeData {
  name: string;
  position: string;
  department: string;
  status: string;
  currentLocation: string;
  workStatus: string;
  lastCheckIn: string;
  rating: number;
  penalties: number;
  shiftStart: string;
  shiftEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeData = useCallback(async () => {
    if (!user?.userId) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/employees/${user.userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: EmployeeData = await response.json();
      setEmployeeData(data);
      console.log('Data Fetched!');
    } catch (err: any) {
      console.error('Ошибка загрузки данных сотрудника:', err);
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]); // ← зависимость от userId

  useEffect(() => {
    if (!user?.userId) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    fetchEmployeeData();
  }, [user?.userId]);

  useFocusEffect(
  useCallback(() => {
    if (user?.userId) {
      fetchEmployeeData();
    }
  }, [user?.userId])
);

  if (loading) {
    return (
      <SimpleScrollView>
        <ThemedView style={styles.container}>
          <ThemedText>Загрузка...</ThemedText>
        </ThemedView>
      </SimpleScrollView>
    );
  }

  if (error) {
    return (
      <SimpleScrollView>
        <ThemedView style={styles.container}>
          <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
        </ThemedView>
      </SimpleScrollView>
    );
  }

  if (!employeeData) {
    return (
      <SimpleScrollView>
        <ThemedView style={styles.container}>
          <ThemedText>Нет данных</ThemedText>
        </ThemedView>
      </SimpleScrollView>
    );
  }
  

  function formatDateTime(isoString: string): string {
    const date = new Date(isoString);

    // Получаем компоненты даты
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  const formated_date = employeeData.lastCheckIn ? formatDateTime(employeeData.lastCheckIn) : "Нет данных";

  const currentTime = new Date();
  const currentHour = currentTime.getHours()
  
  let greeting = 'Добро пожаловать'
  if (currentHour < 12) greeting = 'Доброе утро'
  else if (currentHour < 18) greeting = 'Добрый день'
  else greeting = 'Добрый вечер'

  const { nextEvent, timeUntil } = getNextScanInfo(
    employeeData.shiftStart,
    employeeData.lunchStart,
    employeeData.lunchEnd,
    employeeData.shiftEnd
  );


  return (
    <SimpleScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{greeting}</ThemedText>
          <ThemedText style={styles.subtitle}>{employeeData.name}</ThemedText>
          <ThemedText style={styles.role}>{employeeData.department}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.todayStatus}>
          <ThemedText style={styles.sectionTitle}>Статус на сегодня</ThemedText>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="checkmark.circle.fill" color="#4CAF50" style={styles.icon} />
              <ThemedText style={styles.iconText}>{employeeData.currentLocation}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.statusTime}>{formated_date}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="clock.fill" color="#FF9800" style={styles.icon} />
              <ThemedText style={styles.iconText}>Обед ожидается</ThemedText>
            </ThemedView>
            <ThemedText style={styles.statusTime}>{employeeData.lunchStart}-{employeeData.lunchEnd}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.notifications}>
          <ThemedText style={styles.sectionTitle}>Уведомления</ThemedText>
          <ThemedView style={styles.notificationItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="bell.fill" color="#FF5722" style={styles.icon} />
              <ThemedText style={styles.iconText}>Следующее сканирование через {timeUntil[0]} ч</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.notificationItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="star.fill" color="#FFC107" style={styles.icon} />
              <ThemedText style={styles.iconText}>Ваш рейтинг: {employeeData.rating}/100 баллов</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SimpleScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    fontWeight: '600',
  },
  role: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  todayStatus: {
    marginBottom: 25,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusTime: {
    fontWeight: '600',
    opacity: 0.7,
  },
  notifications: {
    marginBottom: 20,
  },
  notificationItem: {
    padding: 12,
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: 6,
    marginBottom: 8
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent'
  },
  icon: {
    marginRight: 8,
  },
  iconText: {
    flex: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})