import React, {useEffect, useMemo, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8003/api'
    : 'http://localhost:8003/api';
const AUTH_STORAGE_KEY = 'ref-mobile-auth-token';

type AuthFlow =
  | 'login'
  | 'register'
  | 'verify-registration-otp'
  | 'forgot-password'
  | 'verify-reset-otp'
  | 'reset-password'
  | 'dashboard';

type AuthResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type RegisteredUser = {
  _id: string;
  email: string;
  fullName: string;
  role?: string;
  isActive?: boolean;
};

type LoginPayload = {
  token: string;
  user: {
    _id: string;
    email: string;
    fullName: string;
    role?: string;
  };
};

type StoredSession = LoginPayload;

type RequestState = {
  loading: boolean;
  error: string;
};

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

async function apiRequest<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, string>,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Unable to reach backend at ${API_BASE_URL}`);
  }

  const payload = (await response.json().catch(() => null)) as AuthResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload.data;
}

function DashboardScreen({
  userName,
  userEmail,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.screen}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 0}}
          style={styles.loginHero}>
          <View style={styles.dashboardTopRow}>
            <View style={styles.loginHeroBadge}>
              <Text style={styles.loginHeroBadgeText}>Authenticated</Text>
            </View>
            <Pressable onPress={onLogout} style={styles.heroLogoutButton}>
              <Text style={styles.heroLogoutButtonText}>Logout</Text>
            </Pressable>
          </View>
          <Text style={styles.loginHeroTitle}>You are signed in</Text>
          <Text style={styles.loginHeroSubtitle}>
            Your mobile app is now connected to the backend auth flow.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome, {userName}</Text>
          <Text style={styles.formSubtitle}>{userEmail}</Text>
          <Text style={styles.helpText}>
            Registration, OTP verification, resend OTP, forgot password, and
            reset password are all wired to your backend now.
          </Text>

          <Pressable onPress={onLogout} style={styles.buttonWrap}>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen({
  flow,
  requestState,
  email,
  password,
  fullName,
  otp,
  newPassword,
  onChangeEmail,
  onChangePassword,
  onChangeFullName,
  onChangeOtp,
  onChangeNewPassword,
  onLogin,
  onRegister,
  onVerifyRegistrationOtp,
  onForgotPassword,
  onVerifyResetOtp,
  onResetPassword,
  onResendOtp,
  onSwitchToRegister,
  onSwitchToLogin,
  onOpenForgotPassword,
  onBackToLogin,
}: {
  flow: AuthFlow;
  requestState: RequestState;
  email: string;
  password: string;
  fullName: string;
  otp: string;
  newPassword: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeFullName: (value: string) => void;
  onChangeOtp: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onVerifyRegistrationOtp: () => void;
  onForgotPassword: () => void;
  onVerifyResetOtp: () => void;
  onResetPassword: () => void;
  onResendOtp: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
  onOpenForgotPassword: () => void;
  onBackToLogin: () => void;
}) {
  const isLoading = requestState.loading;

  const screenCopy = useMemo(() => {
    switch (flow) {
      case 'register':
        return {
          badge: 'Register',
          heroTitle: 'Create your account',
          heroSubtitle:
            'Sign up with your details and verify your account with the static OTP for now.',
          formTitle: 'Register details',
          formSubtitle: 'Create your profile with the details below.',
        };
      case 'verify-registration-otp':
        return {
          badge: 'Verify OTP',
          heroTitle: 'Verify your email',
          heroSubtitle:
            'Enter the OTP sent for registration. For now the OTP is static: 1234.',
          formTitle: 'Registration verification',
          formSubtitle: 'Use the code and activate your account.',
        };
      case 'forgot-password':
        return {
          badge: 'Forgot Password',
          heroTitle: 'Reset your password',
          heroSubtitle:
            'Request a static OTP for your account so you can reset your password.',
          formTitle: 'Forgot password',
          formSubtitle: 'Enter your email to receive the OTP.',
        };
      case 'verify-reset-otp':
        return {
          badge: 'Verify OTP',
          heroTitle: 'Verify reset code',
          heroSubtitle:
            'Confirm the OTP before setting a new password. The static OTP is 1234.',
          formTitle: 'Reset verification',
          formSubtitle: 'Check the code and continue.',
        };
      case 'reset-password':
        return {
          badge: 'New Password',
          heroTitle: 'Choose a new password',
          heroSubtitle:
            'Set your new password using the same OTP and email combination.',
          formTitle: 'Reset password',
          formSubtitle: 'Enter the new password to complete the flow.',
        };
      case 'login':
      default:
        return {
          badge: 'Sign In',
          heroTitle: 'Welcome back',
          heroSubtitle:
            'Continue your Gen Z Arena experience with secure access to your workspace.',
          formTitle: 'Login details',
          formSubtitle: 'Use your registered email and password.',
        };
    }
  }, [flow]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.screen}>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              style={styles.loginHero}>
              <View style={styles.loginHeroBadge}>
                <Text style={styles.loginHeroBadgeText}>{screenCopy.badge}</Text>
              </View>
              <Text style={styles.loginHeroTitle}>{screenCopy.heroTitle}</Text>
              <Text style={styles.loginHeroSubtitle}>
                {screenCopy.heroSubtitle}
              </Text>
            </LinearGradient>

            <View style={styles.formCard}>
              <View style={styles.formHeaderRow}>
                <View>
                  <Text style={styles.formTitle}>{screenCopy.formTitle}</Text>
                  <Text style={styles.formSubtitle}>
                    {screenCopy.formSubtitle}
                  </Text>
                </View>
                <View style={styles.formHeaderDot} />
              </View>

              {flow === 'register' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    onChangeText={onChangeFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8a867f"
                    style={styles.input}
                    value={fullName}
                  />
                </View>
              ) : null}

              {flow !== 'dashboard' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={onChangeEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#8a867f"
                    style={styles.input}
                    value={email}
                  />
                </View>
              ) : null}

              {flow === 'login' || flow === 'register' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={onChangePassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#8a867f"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                  />
                </View>
              ) : null}

              {flow === 'verify-registration-otp' || flow === 'verify-reset-otp' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>OTP</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={onChangeOtp}
                    placeholder="1234"
                    placeholderTextColor="#8a867f"
                    style={styles.input}
                    value={otp}
                  />
                </View>
              ) : null}

              {flow === 'reset-password' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>OTP</Text>
                    <TextInput
                      keyboardType="number-pad"
                      onChangeText={onChangeOtp}
                      placeholder="1234"
                      placeholderTextColor="#8a867f"
                      style={styles.input}
                      value={otp}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                      autoCapitalize="none"
                      onChangeText={onChangeNewPassword}
                      placeholder="Enter your new password"
                      placeholderTextColor="#8a867f"
                      secureTextEntry
                      style={styles.input}
                      value={newPassword}
                    />
                  </View>
                </>
              ) : null}

              <Text style={styles.helpText}>
                Static OTP for current testing: <Text style={styles.helpStrong}>1234</Text>
              </Text>

              {requestState.error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{requestState.error}</Text>
                </View>
              ) : null}

              {flow === 'login' ? (
                <>
                  <Pressable onPress={onLogin} style={styles.buttonWrap}>
                    <LinearGradient
                      colors={GRADIENT_COLORS}
                      start={{x: 0, y: 1}}
                      end={{x: 1, y: 0}}
                      style={styles.button}>
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Login</Text>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={onOpenForgotPassword}>
                    <Text style={styles.secondaryLink}>Forgot password?</Text>
                  </Pressable>
                </>
              ) : null}

              {flow === 'register' ? (
                <Pressable onPress={onRegister} style={styles.buttonWrap}>
                  <LinearGradient
                    colors={GRADIENT_COLORS}
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    style={styles.button}>
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Register</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              ) : null}

              {flow === 'verify-registration-otp' ? (
                <>
                  <Pressable
                    onPress={onVerifyRegistrationOtp}
                    style={styles.buttonWrap}>
                    <LinearGradient
                      colors={GRADIENT_COLORS}
                      start={{x: 0, y: 1}}
                      end={{x: 1, y: 0}}
                      style={styles.button}>
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                  <Pressable onPress={onResendOtp}>
                    <Text style={styles.secondaryLink}>Resend OTP</Text>
                  </Pressable>
                </>
              ) : null}

              {flow === 'forgot-password' ? (
                <Pressable onPress={onForgotPassword} style={styles.buttonWrap}>
                  <LinearGradient
                    colors={GRADIENT_COLORS}
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    style={styles.button}>
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              ) : null}

              {flow === 'verify-reset-otp' ? (
                <>
                  <Pressable
                    onPress={onVerifyResetOtp}
                    style={styles.buttonWrap}>
                    <LinearGradient
                      colors={GRADIENT_COLORS}
                      start={{x: 0, y: 1}}
                      end={{x: 1, y: 0}}
                      style={styles.button}>
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Verify reset OTP</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                  <Pressable onPress={onResendOtp}>
                    <Text style={styles.secondaryLink}>Resend OTP</Text>
                  </Pressable>
                </>
              ) : null}

              {flow === 'reset-password' ? (
                <Pressable onPress={onResetPassword} style={styles.buttonWrap}>
                  <LinearGradient
                    colors={GRADIENT_COLORS}
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    style={styles.button}>
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Reset password</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              ) : null}

              <View style={styles.switchRow}>
                {flow === 'login' ? (
                  <>
                    <Text style={styles.switchText}>Don&apos;t have an account?</Text>
                    <Pressable onPress={onSwitchToRegister}>
                      <Text style={styles.switchLink}>Register</Text>
                    </Pressable>
                  </>
                ) : null}

                {flow === 'register' ? (
                  <>
                    <Text style={styles.switchText}>Already have an account?</Text>
                    <Pressable onPress={onSwitchToLogin}>
                      <Text style={styles.switchLink}>Login</Text>
                    </Pressable>
                  </>
                ) : null}

                {flow !== 'login' && flow !== 'register' ? (
                  <Pressable onPress={onBackToLogin}>
                    <Text style={styles.switchLink}>Back to Login</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [flow, setFlow] = useState<AuthFlow>('login');
  const [requestState, setRequestState] = useState<RequestState>({
    loading: false,
    error: '',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<LoginPayload['user'] | null>(null);
  const [hydratingSession, setHydratingSession] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const rawValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!rawValue || !active) {
          return;
        }

        const storedSession = JSON.parse(rawValue) as StoredSession;
        if (storedSession?.token && storedSession?.user) {
          setCurrentUser(storedSession.user);
          setEmail(storedSession.user.email);
          setFlow('dashboard');
        }
      } catch {
        if (active) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } finally {
        if (active) {
          setHydratingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

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

  function resetError() {
    setRequestState(current => ({...current, error: ''}));
  }

  async function withRequest(action: () => Promise<void>) {
    setRequestState({loading: true, error: ''});
    try {
      await action();
      setRequestState({loading: false, error: ''});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';

      if (message.toLowerCase().includes('verify your otp first')) {
        setFlow('verify-registration-otp');
      }

      setRequestState({
        loading: false,
        error: message,
      });
    }
  }

  function validateEmail() {
    if (!email.trim()) {
      throw new Error('Please enter your email.');
    }
  }

  function validateOtp() {
    if (!otp.trim()) {
      throw new Error('Please enter the OTP.');
    }
  }

  function handleLogin() {
    withRequest(async () => {
      validateEmail();
      if (!password.trim()) {
        throw new Error('Please enter your password.');
      }

      const data = await apiRequest<LoginPayload>('/auth/login', 'POST', {
        email: email.trim(),
        password,
      });

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      setCurrentUser(data.user);
      setFlow('dashboard');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setFullName('');
    });
  }

  function handleRegister() {
    withRequest(async () => {
      if (!fullName.trim()) {
        throw new Error('Please enter your full name.');
      }
      validateEmail();
      if (!password.trim()) {
        throw new Error('Please enter your password.');
      }

      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentUser(null);

      await apiRequest<RegisteredUser>('/auth/register', 'POST', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setFlow('verify-registration-otp');
      setOtp('');
      setNewPassword('');
      Alert.alert(
        'Registration created',
        'Your account was created. Enter the static OTP 1234 to verify it.',
      );
    });
  }

  function handleVerifyRegistrationOtp() {
    withRequest(async () => {
      validateEmail();
      validateOtp();

      await apiRequest<boolean>('/auth/verify-otp', 'POST', {
        email: email.trim(),
        otp: otp.trim(),
      });

      setFlow('login');
      setOtp('');
      setPassword('');
      Alert.alert(
        'Account verified',
        'Your email is verified. You can now login.',
      );
    });
  }

  function handleForgotPassword() {
    withRequest(async () => {
      validateEmail();

      await apiRequest<boolean>('/auth/forgot-password', 'POST', {
        email: email.trim(),
      });

      setFlow('verify-reset-otp');
      setOtp('');
      Alert.alert(
        'OTP sent',
        'Use the static OTP 1234 to continue the forgot password flow.',
      );
    });
  }

  function handleVerifyResetOtp() {
    withRequest(async () => {
      validateEmail();
      validateOtp();

      await apiRequest<boolean>('/auth/verify-otp', 'POST', {
        email: email.trim(),
        otp: otp.trim(),
      });

      setFlow('reset-password');
      Alert.alert(
        'OTP verified',
        'Now enter your new password to finish resetting your account.',
      );
    });
  }

  function handleResetPassword() {
    withRequest(async () => {
      validateEmail();
      validateOtp();
      if (!newPassword.trim()) {
        throw new Error('Please enter your new password.');
      }

      await apiRequest<boolean>('/auth/reset-password', 'POST', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setFlow('login');
      setOtp('');
      setPassword('');
      setNewPassword('');
      Alert.alert(
        'Password updated',
        'Your password has been reset. Please login with the new password.',
      );
    });
  }

  function handleResendOtp() {
    withRequest(async () => {
      validateEmail();

      await apiRequest<boolean>('/auth/resend-otp', 'POST', {
        email: email.trim(),
      });

      Alert.alert('OTP resent', 'Use the static OTP 1234 to continue.');
    });
  }

  function goToLogin() {
    resetError();
    setFlow('login');
    setOtp('');
    setNewPassword('');
  }

  if (!showSplash && flow === 'dashboard' && currentUser) {
    return (
      <DashboardScreen
        userName={currentUser.fullName}
        userEmail={currentUser.email}
        onLogout={async () => {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setCurrentUser(null);
          setOtp('');
          setEmail('');
          setPassword('');
          setFlow('login');
        }}
      />
    );
  }

  if (!showSplash && hydratingSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator color="#2d2a2d" size="large" />
          <Text style={styles.loadingText}>Restoring your session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.appContainer}>
      {showSplash ? (
        <Animated.View style={[styles.overlayScreen, {opacity: splashOpacity}]}>
          <SplashScreen />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.overlayScreen, {opacity: loginOpacity}]}>
        <AuthScreen
          flow={flow}
          requestState={requestState}
          email={email}
          password={password}
          fullName={fullName}
          otp={otp}
          newPassword={newPassword}
          onChangeEmail={value => {
            resetError();
            setEmail(value);
          }}
          onChangePassword={value => {
            resetError();
            setPassword(value);
          }}
          onChangeFullName={value => {
            resetError();
            setFullName(value);
          }}
          onChangeOtp={value => {
            resetError();
            setOtp(value);
          }}
          onChangeNewPassword={value => {
            resetError();
            setNewPassword(value);
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onVerifyRegistrationOtp={handleVerifyRegistrationOtp}
          onForgotPassword={handleForgotPassword}
          onVerifyResetOtp={handleVerifyResetOtp}
          onResetPassword={handleResetPassword}
          onResendOtp={handleResendOtp}
          onSwitchToRegister={() => {
            resetError();
            setCurrentUser(null);
            setPassword('');
            setOtp('');
            setNewPassword('');
            setFlow('register');
          }}
          onSwitchToLogin={goToLogin}
          onOpenForgotPassword={() => {
            resetError();
            setOtp('');
            setNewPassword('');
            setFlow('forgot-password');
          }}
          onBackToLogin={goToLogin}
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
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: '#4c4e52',
    fontSize: 15,
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flexGrow: 1,
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
  dashboardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroLogoutButton: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  heroLogoutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  helpText: {
    color: '#6a6560',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  helpStrong: {
    color: '#353135',
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#fff0f1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  errorText: {
    color: '#cc425d',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonWrap: {
    marginTop: 14,
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
  secondaryLink: {
    color: '#353135',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
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
