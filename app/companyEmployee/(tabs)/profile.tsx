import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function EmployeeProfile() {
  const { currentUser, getCompany, logout, updateMyProfile } = useApp();
  const company = getCompany(currentUser?.companyId ?? '');

  const unlinked =
    currentUser?.role === 'employee' && !currentUser?.companyId;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateMyProfile({ name: name.trim() });
      setOpen(false);
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <Screen>
      <Header title="My Profile" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FuelColors.primary} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.role}>Employee Account</Text>
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <InfoRow label="Company" value={company?.name} />
          <Divider />
          <InfoRow label="Email" value={currentUser?.email} />
          <Divider />
          <InfoRow label="Role" value={currentUser?.role} />
        </Card>

        {unlinked && (
          <Text style={styles.warn}>
            Not linked to company. Ask admin to add you.
          </Text>
        )}

        {/* Actions */}
        {/* <Button
          title="Update Profile"
          onPress={() => {
            setName(currentUser?.name ?? '');
            setError('');
            setOpen(true);
          }}
          style={styles.primaryBtn}
        /> */}

        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
        />

        <Text style={styles.version}>FuelFlow v1.0.0</Text>
      </ScrollView>

      {/* -------- Modal (FIXED) -------- */}
      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
          style={styles.modalContainer}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Profile</Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Input
                label="Display name"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError('');
                }}
                editable={!saving}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setOpen(false)}
                  disabled={saving}
                  style={styles.flex}
                />
                <Button
                  title="Save"
                  onPress={onSave}
                  loading={saving}
                  disabled={saving}
                  style={styles.flex}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

/* ---------- Small Components ---------- */

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '---'}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarTxt: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: FuelColors.text,
  },

  role: {
    fontSize: 13,
    color: FuelColors.textSecondary,
  },

  infoCard: {
    marginBottom: 20,
  },

  infoRow: {
    padding: 14,
  },

  label: {
    fontSize: 12,
    color: FuelColors.textSecondary,
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    color: FuelColors.text,
  },

  divider: {
    height: 1,
    backgroundColor: FuelColors.border,
    marginHorizontal: 12,
  },

  warn: {
    color: FuelColors.warning,
    textAlign: 'center',
    marginBottom: 12,
  },

  primaryBtn: {
    marginBottom: 10,
  },

  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
    color: FuelColors.textMuted,
  },

  /* -------- MODAL FIX -------- */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: FuelColors.surface,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    color: FuelColors.text,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  flex: {
    flex: 1,
  },

  error: {
    color: FuelColors.danger,
    marginTop: 6,
  },
});