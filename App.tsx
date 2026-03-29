import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GRADIENT_COLORS = [
  '#969681',
  '#8b9184',
  '#7f8d89',
  '#76888a',
  '#6f8083',
  '#66767b',
  '#5f686d',
  '#575b60',
  '#4c4e52',
  '#423f43',
  '#393539',
  '#2d2a2d',
];

function SplashScreen() {
  return (
    <SafeAreaView style={styles.splashSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2d2a2d" />
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}
        style={styles.splashScreen}>
        <View style={styles.splashOrbOne} />
        <View style={styles.splashOrbTwo} />
        <View style={styles.splashContent}>
          <View style={styles.splashMark}>
            <Text style={styles.splashMarkText}>GZ</Text>
          </View>
          <Text style={styles.splashTitle}>Gen Z Arena</Text>
          <Text style={styles.splashSubtitle}>
            Create, connect, and grow in one place.
          </Text>
          <View style={styles.splashLoaderRow}>
            <View style={styles.splashLoaderTrack}>
              <LinearGradient
                colors={['#ffffff', 'rgba(255,255,255,0.55)']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={styles.splashLoaderFill}
              />
            </View>
            <Text style={styles.splashLoaderText}>Loading experience</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function AuthScreen({
  mode,
  onToggleMode,
}: {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = () => {
    if (isRegister && !fullName.trim()) {
      Alert.alert('Missing field', 'Please enter your full name.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Missing fields',
        'Please enter your email and password.',
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        isRegister ? 'Register demo' : 'Login demo',
        isRegister ? `Account created for ${email}` : `Signed in as ${email}`,
      );
    }, 900);
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google login',
      'Google sign-in button is ready. Next we can connect the real Google auth flow.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.screen}>
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 0}}
            style={styles.loginHero}>
            <View style={styles.loginHeroBadge}>
              <Text style={styles.loginHeroBadgeText}>
                {isRegister ? 'Register' : 'Sign In'}
              </Text>
            </View>
            <Text style={styles.loginHeroTitle}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.loginHeroSubtitle}>
              {isRegister
                ? 'Join Gen Z Arena and start your experience with a fresh account.'
                : 'Continue your Gen Z Arena experience with secure access to your workspace.'}
            </Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <View>
                <Text style={styles.formTitle}>
                  {isRegister ? 'Register details' : 'Login details'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isRegister
                    ? 'Create your profile with the details below.'
                    : 'Use your registered email and password.'}
                </Text>
              </View>
              <View style={styles.formHeaderDot} />
            </View>

            {isRegister ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8a867f"
                  style={styles.input}
                  value={fullName}
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#8a867f"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8a867f"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <Pressable onPress={handleSubmit} style={styles.buttonWrap}>
              <LinearGradient
                colors={GRADIENT_COLORS}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                style={styles.button}>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRegister ? 'Register' : 'Login'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleGoogleLogin} style={styles.googleButton}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </Text>
              <Pressable onPress={onToggleMode}>
                <Text style={styles.switchLink}>
                  {isRegister ? 'Login' : 'Register'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(loginOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setShowSplash(false);
        }
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [loginOpacity, splashOpacity]);

  return (
    <View style={styles.appContainer}>
      {showSplash ? (
        <Animated.View style={[styles.overlayScreen, {opacity: splashOpacity}]}>
          <SplashScreen />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.overlayScreen, {opacity: loginOpacity}]}>
        <AuthScreen
          mode={authMode}
          onToggleMode={() =>
            setAuthMode(current => (current === 'login' ? 'register' : 'login'))
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  overlayScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  splashSafeArea: {
    flex: 1,
    backgroundColor: '#2d2a2d',
  },
  splashScreen: {
    flex: 1,
    overflow: 'hidden',
  },
  splashOrbOne: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  splashOrbTwo: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  splashMark: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: 24,
  },
  splashMarkText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  splashTitle: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 10,
  },
  splashSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 42,
  },
  splashLoaderRow: {
    width: '100%',
    alignItems: 'center',
  },
  splashLoaderTrack: {
    width: 180,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 12,
  },
  splashLoaderFill: {
    width: '78%',
    height: '100%',
    borderRadius: 999,
  },
  splashLoaderText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  loginHero: {
    borderRadius: 30,
    minHeight: 220,
    padding: 24,
    marginBottom: 26,
    justifyContent: 'flex-end',
  },
  loginHeroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  loginHeroBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  loginHeroTitle: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 10,
  },
  loginHeroSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ebe4dd',
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#201d1f',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 7,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  formTitle: {
    color: '#1f1c1d',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  formSubtitle: {
    color: '#635f5a',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 220,
  },
  formHeaderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5f686d',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#2d2a2d',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#faf7f3',
    borderColor: '#e5ddd6',
    borderRadius: 16,
    borderWidth: 1,
    color: '#1f1c1d',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  buttonWrap: {
    marginTop: 8,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5ddd6',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 14,
  },
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f3efea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconText: {
    color: '#2d2a2d',
    fontSize: 14,
    fontWeight: '800',
  },
  googleButtonText: {
    color: '#2d2a2d',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  switchText: {
    color: '#6a6560',
    fontSize: 14,
    marginRight: 6,
  },
  switchLink: {
    color: '#353135',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default App;
