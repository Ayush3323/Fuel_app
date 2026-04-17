import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Dynamic Background Glowing Orbs */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify().damping(12)}>
          <Text style={styles.title}>Fuel App</Text>
          <Text style={styles.subtitle}>Ignite your journey today and discover new possibilities.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(12)} style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  circle: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Subtle blue glow
  },
  circleTopRight: {
    top: -width * 0.4,
    right: -width * 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)', // Subtle purple glow
  },
  circleBottomLeft: {
    bottom: -width * 0.3,
    left: -width * 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: height * 0.2,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#A1A1AA',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: height * 0.1,
  },
  button: {
    backgroundColor: '#3B82F6', // Vibrant Blue
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
