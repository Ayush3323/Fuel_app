import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpProfile() {
  const router = useRouter();
  const { currentUser, pumps, logout } = useApp();
  const pump = pumps.find((p) => p.id === currentUser?.pumpId);

  return (
    <Screen style={styles.screen}>
      <Header title="Settings & Profile" showBack={false} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Decorative Background Element */}
        <View style={styles.topShape} />
        
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInnerRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{currentUser?.name?.charAt(0)}</Text>
              </View>
            </View>
            <View style={styles.activeBadge} />
          </View>
          
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Verified Pump Owner</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="STATION DETAILS" style={styles.sectionTitle} />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="business" size={20} color={FuelColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Station Name</Text>
                <Text style={styles.val}>{pump?.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="location" size={20} color={FuelColors.success} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Operating Address</Text>
                <Text style={styles.val}>{pump?.address || 'Not specified'}</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="ACCOUNT ACCESS" style={styles.sectionTitle} />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="person-circle" size={20} color={FuelColors.danger} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Login Identity</Text>
                <Text style={styles.val}>{currentUser?.loginId}</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="QUICK ACTIONS" style={styles.sectionTitle} />
          <View style={styles.actionGrid}>
            <Pressable style={styles.actionItem}>
              <Card style={styles.actionCard}>
                <Ionicons name="shield-checkmark-outline" size={24} color={FuelColors.primary} />
                <Text style={styles.actionLabel}>Security</Text>
              </Card>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <Card style={styles.actionCard}>
                <Ionicons name="help-buoy-outline" size={24} color={FuelColors.success} />
                <Text style={styles.actionLabel}>Support</Text>
              </Card>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <Card style={styles.actionCard}>
                <Ionicons name="document-text-outline" size={24} color={FuelColors.warning} />
                <Text style={styles.actionLabel}>Terms</Text>
              </Card>
            </Pressable>
          </View>
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          style={styles.signOutBtn}
          onPress={() => {
            logout();
            router.replace(href('/login'));
          }}
        />
        
        <Text style={styles.version}>Fuel Credit v1.2.0 • Build 150</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: FuelColors.background },
  scrollContent: { paddingBottom: 40 },
  topShape: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: FuelColors.primaryMuted,
    opacity: 0.4,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarInnerRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: FuelColors.success,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: FuelColors.text,
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: FuelColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: FuelColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  label: { 
    fontSize: 11, 
    color: FuelColors.textSecondary, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: { 
    fontSize: 16, 
    color: FuelColors.text, 
    marginTop: 2, 
    fontWeight: '700' 
  },
  divider: {
    height: 1,
    backgroundColor: FuelColors.background,
    marginLeft: 76,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
  },
  actionCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 0,
    backgroundColor: '#fff',
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: FuelColors.textSecondary,
  },
  signOutBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 18,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    color: FuelColors.textMuted,
    fontWeight: '600',
  },
});
