import SimpleScrollView from '@/components/simple-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';


interface ScheduleEvent {
  name: string;
  time: string;
  type: 'start' | 'lunch' | 'end';
  isActive: boolean;
}

export default function ScheduleScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilNext, setTimeUntilNext] = useState('');

  const schedule: ScheduleEvent[] = [
    { name: 'Начало смены', time: '09:00', type: 'start', isActive: false },
    { name: 'Обед', time: '13:00', type: 'lunch', isActive: false },
    { name: 'Конец смены', time: '18:00', type: 'end', isActive: false }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
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
          <ThemedText>• Время прихода: 08:55 ✅</ThemedText>
          <ThemedText>• Обед: 13:00-14:00 ✅</ThemedText>
          <ThemedText>• QR-пропуски: 3 сканирования</ThemedText>
          <ThemedText>• Штрафные баллы: 0 ✅</ThemedText>
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