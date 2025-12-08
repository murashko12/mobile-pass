import SimpleScrollView from '@/components/simple-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { API_BASE_URL } from '../(utils)/api_id';

import { useAuth } from '@/app/contexts/auth-context';


interface ScheduleEvent {
  name: string;
  time: string;
  type: 'start' | 'lunch' | 'end';
  isActive: boolean;
}

interface ScanResult {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    position: string;
    department: string;
  };
  qrCode: string;
  qrType: string;
  timestamp: string; // ISO-строка
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  result: string; // Например: "Приход на работу в 09:44"
}

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

export default function ScheduleScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilNext, setTimeUntilNext] = useState('');

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [scansError, setScansError] = useState<string | null>(null);

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
        const generatedSchedule: ScheduleEvent[] = [
          { name: 'Начало смены', time: data.shiftStart, type: 'start', isActive: false },
          { name: 'Обед', time: data.lunchStart, type: 'lunch', isActive: false },
          { name: 'Конец смены', time: data.shiftEnd, type: 'end', isActive: false }
        ]
        setSchedule(generatedSchedule);
        console.log('Data Fetched!');
      } catch (err: any) {
        console.error('Ошибка загрузки данных сотрудника:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    }, [user?.userId]); // ← зависимость от userId

  const fetchScans = useCallback(async () => {
    if (!user?.userId) {
      setScansError('Пользователь не авторизован');
      setScansLoading(false);
      return;
    }

    try {
      setScansLoading(true);
      setScansError(null);

      const response = await fetch(`${API_BASE_URL}/scans/employee/${user.userId}/today`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const scanData: ScanResult[] = await response.json();
      setScans(scanData);
    } catch (err: any) {
      console.error('Ошибка загрузки сканирований:', err);
      setScansError(err.message || 'Не удалось загрузить сканирования');
    } finally {
      setScansLoading(false);
    }
  }, [user?.userId]);

  const scanStats = useMemo(() => {
    let checkInTime: string | null = null;
    let lunchStart: string | null = null;
    let lunchEnd: string | null = null;
    const totalScans = scans.length;
    let penalties = 0;

    // Пример: вытаскиваем время прихода из result
    const checkInScan = scans.find(scan =>
      scan.result.includes('Приход на работу')
    );
    if (checkInScan) {
      // "Приход на работу в 09:44" → извлекаем "09:44"
      const match = checkInScan.result.match(/в (\d{2}:\d{2})/);
      checkInTime = match ? match[1] : null;
    }

    // Аналогично можно обрабатывать обед, если есть такие записи:
    // Например: "Начало обеда в 13:00", "Конец обеда в 14:00"
    const lunchStartScan = scans.find(scan => scan.result.includes('Начало обеда'));
    const lunchEndScan = scans.find(scan => scan.result.includes('Конец обеда'));

    if (lunchStartScan) {
      const match = lunchStartScan.result.match(/в (\d{2}:\d{2})/);
      lunchStart = match ? match[1] : null;
    }
    if (lunchEndScan) {
      const match = lunchEndScan.result.match(/в (\d{2}:\d{2})/);
      lunchEnd = match ? match[1] : null;
    }

    // Если в будущем штрафы будут возвращаться отдельно — обновите логику
    // Сейчас используем из employeeData (если есть)
    const penaltyCount = employeeData?.penalties ?? 0;

    return {
      checkInTime,
      lunchStart,
      lunchEnd,
      totalScans,
      penalties: penaltyCount,
    };
  }, [scans, employeeData]);

  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchEmployeeData();
      fetchScans();
      updateActiveEvents();
      calculateTimeUntilNext();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateActiveEvents = () => {
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    schedule.forEach(event => {
      const [eventHours, eventMinutes] = event.time.split(':').map(Number);
      const eventTotalMinutes = eventHours * 60 + eventMinutes;
      
      // Событие активно за 15 минут до начала
      event.isActive = Math.abs(eventTotalMinutes - currentTotalMinutes) <= 15;
    });
  };

  const calculateTimeUntilNext = () => {
    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (const event of schedule) {
      const [eventHours, eventMinutes] = event.time.split(':').map(Number);
      const eventTotalMinutes = eventHours * 60 + eventMinutes;
      
      if (eventTotalMinutes > currentTotalMinutes) {
        const minutesLeft = eventTotalMinutes - currentTotalMinutes;
        const hours = Math.floor(minutesLeft / 60);
        const minutes = minutesLeft % 60;
        setTimeUntilNext(`${hours}ч ${minutes}м до ${event.name.toLowerCase()}`);
        return;
      }
    }
    
    setTimeUntilNext('Смена завершена');
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'start': return '#4CAF50';
      case 'lunch': return '#FF9800';
      case 'end': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <SimpleScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Мое расписание</ThemedText>
          <ThemedText style={styles.currentTime}>
            {currentTime.toLocaleTimeString()}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.nextEvent}>
          <ThemedText style={styles.nextEventText}>{timeUntilNext}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.schedule}>
          {schedule.map((event, index) => (
            <ThemedView 
              key={index} 
              style={[
                styles.eventCard,
                event.isActive && styles.activeEventCard
              ]}
            >
              <ThemedView style={styles.eventHeader}>
                <ThemedText 
                  style={[
                    styles.eventName,
                    { color: getEventColor(event.type) }
                  ]}
                >
                  {event.name}
                </ThemedText>
                <ThemedText style={styles.eventTime}>{event.time}</ThemedText>
              </ThemedView>
              
              {event.isActive && (
                <ThemedView style={styles.notification}>
                  <ThemedText style={styles.notificationText}>
                    ⚡ Скоро начало события!
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.stats}>
          <ThemedText style={styles.statsTitle}>Статистика за сегодня:</ThemedText>
          {scanStats.checkInTime ? (
            <ThemedText>• Время прихода: {scanStats.checkInTime} ✅</ThemedText>
          ) : (
            <ThemedText>• Время прихода: не зафиксировано</ThemedText>
          )}
          {scanStats.lunchStart && scanStats.lunchEnd ? (
            <ThemedText>• Обед: {scanStats.lunchStart}–{scanStats.lunchEnd} ✅</ThemedText>
          ) : scanStats.lunchStart ? (
            <ThemedText>• Обед: начат в {scanStats.lunchStart}</ThemedText>
          ) : (
            <ThemedText>• Обед: не начат</ThemedText>
          )}
          <ThemedText>• Всего отскарированно за сегодня: {scanStats.totalScans} сканирований</ThemedText>
          <ThemedText>• Штрафные баллы: {scanStats.penalties} {scanStats.penalties === 0 ? '✅' : '⚠️'}</ThemedText>
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  currentTime: {
    fontSize: 18,
    marginTop: 8,
    fontWeight: 'bold',
  },
  nextEvent: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  nextEventText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  schedule: {
    marginBottom: 20,
  },
  eventCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeEventCard: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notification: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFECB3',
    borderRadius: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#FF6F00',
    textAlign: 'center',
  },
  stats: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
});