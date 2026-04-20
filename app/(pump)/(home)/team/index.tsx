import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Badge, Card, EmptyState, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpTeam() {
  const router = useRouter();
  const { users, currentUser } = useApp();
  const pumpId = currentUser?.pumpId;
  const team = users.filter((u) => u.pumpId === pumpId && u.role === 'employee');

  return (
    <Screen>
      <Header
        title="Our Team"
        right={
          <Pressable
            onPress={() => router.push(href('/(pump)/(home)/team/new'))}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />
      
      <View style={styles.headerRow}>
        <SectionTitle title="Pump Employees" style={styles.sectionTitle} />
        <Badge status="raised" label={`${team.length} Active`} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {team.map((u) => (
          <Pressable
            key={u.id}
            onPress={() => router.push(href(`/(pump)/(home)/team/${u.id}`))}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{u.name}</Text>
                  <View style={styles.loginRow}>
                    <Ionicons name="person-outline" size={12} color={FuelColors.textMuted} />
                    <Text style={styles.meta}>{u.loginId}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={FuelColors.textMuted} />
              </View>
            </Card>
          </Pressable>
        ))}
        {team.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState 
              title="No employees yet" 
              subtitle="Invite your team members to manage pump operations." 
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: FuelColors.primary,
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 0,
  },
  list: { 
    paddingHorizontal: 20, 
    paddingBottom: 40,
    paddingTop: 8,
  },
  card: { 
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: FuelColors.primary,
  },
  info: {
    flex: 1,
  },
  name: { 
    fontWeight: '800', 
    fontSize: 17, 
    color: FuelColors.text,
    letterSpacing: -0.3,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  meta: { 
    color: FuelColors.textSecondary, 
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 80,
  },
});
