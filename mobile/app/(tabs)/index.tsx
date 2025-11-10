import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import SimpleScrollView from '@/components/simple-scroll-view'
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours()
  
  let greeting = 'Добро пожаловать'
  if (currentHour < 12) greeting = 'Доброе утро'
  else if (currentHour < 18) greeting = 'Добрый день'
  else greeting = 'Добрый вечер'

  return (
    <SimpleScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{greeting}</ThemedText>
          <ThemedText style={styles.subtitle}>Петр Мурашко</ThemedText>
          <ThemedText style={styles.role}>Разработчик • Отдел IT</ThemedText>
        </ThemedView>

        <ThemedView style={styles.todayStatus}>
          <ThemedText style={styles.sectionTitle}>Статус на сегодня</ThemedText>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="checkmark.circle.fill" color="#4CAF50" style={styles.icon} />
              <ThemedText style={styles.iconText}>Присутствие подтверждено</ThemedText>
            </ThemedView>
            <ThemedText style={styles.statusTime}>08:55</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="clock.fill" color="#FF9800" style={styles.icon} />
              <ThemedText style={styles.iconText}>Обед ожидается</ThemedText>
            </ThemedView>
            <ThemedText style={styles.statusTime}>13:00-14:00</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="list.bullet" color="#2196F3" style={styles.icon} />
              <ThemedText style={styles.iconText}>Выполнено задач</ThemedText>
            </ThemedView>
            <ThemedText style={styles.statusTime}>3/5</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.notifications}>
          <ThemedText style={styles.sectionTitle}>Уведомления</ThemedText>
          <ThemedView style={styles.notificationItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="bell.fill" color="#FF5722" style={styles.icon} />
              <ThemedText style={styles.iconText}>Следующее сканирование через 2 часа</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.notificationItem}>
            <ThemedView style={styles.iconTextRow}>
              <IconSymbol size={20} name="star.fill" color="#FFC107" style={styles.icon} />
              <ThemedText style={styles.iconText}>Ваш рейтинг: 98/100 баллов</ThemedText>
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