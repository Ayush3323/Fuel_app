import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';

export type SelectOption = {
  label: string;
  value: string | number;
};

type Props = {
  label: string;
  value: string | number;
  options: SelectOption[];
  onSelect: (value: any) => void;
  style?: ViewStyle;
};

export function Select({ label, value, options, onSelect, style }: Props) {
  const [open, setOpen] = useState(false);
  const [triggerPos, setTriggerPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const activeOption = options.find((o) => o.value === value);

  const openSelect = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setTriggerPos({ x: pageX, y: pageY, width, height });
      setOpen(true);
    });
  };

  const screenHeight = Dimensions.get('window').height;
  const dropdownTop = triggerPos.y + triggerPos.height + 4;
  const dropdownWidth = Math.max(200, triggerPos.width);
  
  // Decide if show above or below
  const showAbove = dropdownTop + options.length * 50 > screenHeight - 60;
  const finalTop = showAbove ? triggerPos.y - (options.length * 50) - 8 : dropdownTop;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={openSelect} style={styles.trigger}>
          <Text style={styles.triggerTxt} numberOfLines={1}>
            {activeOption ? activeOption.label : 'Select...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={FuelColors.textSecondary} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.popover,
              {
                top: finalTop,
                left: triggerPos.x,
                width: dropdownWidth,
              },
            ]}
          >
            <ScrollView style={styles.optionsList} bounces={false}>
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                    opt.value === value && styles.optionActive,
                  ]}
                >
                  <Text style={[styles.optionTxt, opt.value === value && styles.optionActiveTxt]}>
                    {opt.label}
                  </Text>
                  {opt.value === value && (
                    <Ionicons name="checkmark" size={18} color={FuelColors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FuelColors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  trigger: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: FuelColors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerTxt: { fontSize: 16, color: FuelColors.text, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popover: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: FuelColors.border,
    minHeight: 40,
    maxHeight: 300,
  },
  optionsList: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionPressed: { backgroundColor: FuelColors.background },
  optionActive: { backgroundColor: FuelColors.primaryMuted + '80' },
  optionTxt: { fontSize: 15, color: FuelColors.text, fontWeight: '600' },
  optionActiveTxt: { color: FuelColors.primary, fontWeight: '700' },
});
