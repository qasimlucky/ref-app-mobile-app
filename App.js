import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
  '#f1dfc7',
  '#e7d0b3',
  '#dbbc9c',
  '#cfa78a',
  '#c19f81',
  '#9a765f',
  '#7d6151',
  '#634c42',
  '#4b3933',
  '#372925',
  '#241a18',
  '#17100f',
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TOP_SCREEN_SPACING = 54;
const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8003/api'
    : 'http://localhost:8003/api';
const AUTH_STORAGE_KEY = 'ref-mobile-auth-token';

async function apiRequest(path, method, body, token) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Unable to reach backend at ${API_BASE_URL}`);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload.data;
}

async function getStoredAuthSession() {
  const rawValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

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

function AuthScreen({mode, onToggleMode, onAuthSuccess}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async () => {
    if (isRegister && !fullName.trim()) {
      Alert.alert('Missing field', 'Please enter your full name.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        await apiRequest('/auth/register', 'POST', {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });

        Alert.alert(
          'Registration created',
          'Your account was created. Please verify OTP before login. Static OTP: 1234',
        );
      } else {
        const loginData = await apiRequest('/auth/login', 'POST', {
          email: email.trim(),
          password,
        });

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loginData));
        onAuthSuccess(loginData);
      }
    } catch (error) {
      Alert.alert(
        isRegister ? 'Registration failed' : 'Login failed',
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google login',
      'Google sign-in is not linked yet. Please use email and password.',
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
                  {isRegister ? 'Register' : 'Login'}
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

function PostFeedScreen() {
  const posts = [
    {
      id: '1',
      author: 'Maya Khan',
      role: 'Creator',
      title: 'New campaign moodboard',
      body:
        'Sharing a fresh direction for this week. Clean visuals, stronger copy, and a more lifestyle-driven tone.',
      likes: '1.2k',
      comments: '148',
    },
    {
      id: '2',
      author: 'Zain Ali',
      role: 'Growth Lead',
      title: 'Launch day notes',
      body:
        'Engagement is climbing well after the first hour. Reels are outperforming static content by a solid margin.',
      likes: '824',
      comments: '62',
    },
  ];

  return (
    <ScrollView
      style={styles.feedScroll}
      contentContainerStyle={styles.feedContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.feedHeader}>
        <Text style={styles.feedBrand}>Gen Z Arena</Text>
        <View style={styles.feedHeaderActions}>
          <Pressable style={styles.feedIconButton}>
            <Text style={styles.feedIconText}>♡</Text>
            <View style={styles.feedIconBadge} />
          </Pressable>
          <Pressable style={styles.feedIconButton}>
            <Text style={styles.feedIconText}>🔔</Text>
            <View style={styles.feedIconBadge} />
          </Pressable>
        </View>
      </View>

      {posts.map(post => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postAvatar}>
              <Text style={styles.postAvatarText}>{post.author[0]}</Text>
            </View>
            <View style={styles.postHeaderMeta}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postRole}>{post.role}</Text>
            </View>
            <Text style={styles.postMore}>...</Text>
          </View>

          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 0}}
            style={styles.postMedia}>
            <Text style={styles.postMediaBadge}>Featured Post</Text>
          </LinearGradient>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.body}</Text>

          <View style={styles.postStats}>
            <Text style={styles.postStat}>Like {post.likes}</Text>
            <Text style={styles.postStat}>Comment {post.comments}</Text>
            <Text style={styles.postStat}>Share</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function SimpleScreen({title, description}) {
  return (
    <View style={styles.simpleScreen}>
      <Text style={styles.simpleTitle}>{title}</Text>
      <Text style={styles.simpleDescription}>{description}</Text>
    </View>
  );
}

function LeaderboardScreen() {
  const earningLeaders = [
    {
      rank: 1,
      name: 'Maya Khan',
      handle: '@mayak',
      earnings: '$12.4k',
    },
    {
      rank: 2,
      name: 'Zain Ali',
      handle: '@zainvision',
      earnings: '$10.1k',
    },
    {
      rank: 3,
      name: 'Sara Noor',
      handle: '@saranoor',
      earnings: '$8.9k',
    },
    {
      rank: 4,
      name: 'Areeb Ahmed',
      handle: '@areebx',
      earnings: '$7.8k',
    },
  ];

  const predictionLeaders = [
    {
      rank: 1,
      name: 'Noah Zed',
      handle: '@noahzed',
      predictions: '94%',
    },
    {
      rank: 2,
      name: 'Maya Khan',
      handle: '@mayak',
      predictions: '92%',
    },
    {
      rank: 3,
      name: 'Zain Ali',
      handle: '@zainvision',
      predictions: '90%',
    },
    {
      rank: 4,
      name: 'Sara Noor',
      handle: '@saranoor',
      predictions: '88%',
    },
  ];

  return (
    <ScrollView
      style={styles.leaderboardScroll}
      contentContainerStyle={styles.leaderboardContent}
      showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}
        style={styles.leaderboardHero}>
        <Text style={styles.leaderboardHeroEyebrow}>Top Performers</Text>
        <Text style={styles.leaderboardHeroTitle}>Leaderboard</Text>
        <Text style={styles.leaderboardHeroSubtitle}>
          Track the strongest creators by earnings and prediction accuracy.
        </Text>
      </LinearGradient>

      <View style={styles.leaderboardSummaryRow}>
        <View style={styles.leaderboardSummaryCard}>
          <Text style={styles.leaderboardSummaryValue}>$39.2k</Text>
          <Text style={styles.leaderboardSummaryLabel}>Earning pool</Text>
        </View>
        <View style={styles.leaderboardSummaryCard}>
          <Text style={styles.leaderboardSummaryValue}>90%</Text>
          <Text style={styles.leaderboardSummaryLabel}>Prediction avg</Text>
        </View>
      </View>

      <View style={styles.leaderboardSectionHeader}>
        <Text style={styles.leaderboardSectionTitle}>Earning Leaderboard</Text>
        <Text style={styles.leaderboardSectionMeta}>Top creators by revenue</Text>
      </View>

      {earningLeaders.map(leader => (
        <View key={`earn-${leader.rank}`} style={styles.leaderCard}>
          <View style={styles.leaderLeft}>
            <View style={styles.leaderRank}>
              <Text style={styles.leaderRankText}>#{leader.rank}</Text>
            </View>
            <View>
              <Text style={styles.leaderName}>{leader.name}</Text>
              <Text style={styles.leaderHandle}>{leader.handle}</Text>
            </View>
          </View>

          <View style={styles.leaderRight}>
            <View style={styles.leaderMetric}>
              <Text style={styles.leaderMetricValue}>{leader.earnings}</Text>
              <Text style={styles.leaderMetricLabel}>Earning</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.leaderboardSectionHeader}>
        <Text style={styles.leaderboardSectionTitle}>Prediction Leaderboard</Text>
        <Text style={styles.leaderboardSectionMeta}>Top creators by accuracy</Text>
      </View>

      {predictionLeaders.map(leader => (
        <View key={`pred-${leader.rank}`} style={styles.leaderCard}>
          <View style={styles.leaderLeft}>
            <View style={styles.leaderRank}>
              <Text style={styles.leaderRankText}>#{leader.rank}</Text>
            </View>
            <View>
              <Text style={styles.leaderName}>{leader.name}</Text>
              <Text style={styles.leaderHandle}>{leader.handle}</Text>
            </View>
          </View>

          <View style={styles.leaderRight}>
            <View style={styles.leaderMetric}>
              <Text style={styles.leaderMetricValue}>{leader.predictions}</Text>
              <Text style={styles.leaderMetricLabel}>Prediction</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function PredictionScreen() {
  const [selectedPrediction, setSelectedPrediction] = useState('All');
  const [votes, setVotes] = useState({});

  const predictionTypes = ['All', 'Creators', 'Campaigns', 'Sports'];
  const predictionItems = [
    {
      id: '1',
      category: 'Creators',
      title: 'Will Maya Khan cross 50k followers this week?',
      detail: 'Current growth rate suggests a strong chance before Sunday night.',
      confidence: '89%',
      pool: '$12.4k',
    },
    {
      id: '2',
      category: 'Campaigns',
      title: 'Will the launch campaign engagement cross 12% by Friday?',
      detail: 'The last two creator pushes have already lifted saves and shares.',
      confidence: '84%',
      pool: '$8.1k',
    },
    {
      id: '3',
      category: 'Sports',
      title: 'Will Team Falcon win the featured match this weekend?',
      detail: 'Match analytics show stronger attacking momentum and cleaner finishing.',
      confidence: '74%',
      pool: '$6.8k',
    },
    {
      id: '4',
      category: 'Creators',
      title: 'Will the new reel hit 100k views in 48 hours?',
      detail: 'Early watch time is above average and audience retention is climbing.',
      confidence: '91%',
      pool: '$10.7k',
    },
  ];

  const visiblePredictions =
    selectedPrediction === 'All'
      ? predictionItems
      : predictionItems.filter(item => item.category === selectedPrediction);

  const handleVote = (id, choice) => {
    setVotes(current => ({
      ...current,
      [id]: choice,
    }));
  };

  const activeCount =
    selectedPrediction === 'All'
      ? predictionItems.length
      : visiblePredictions.length;

  return (
    <ScrollView
      style={styles.predictionScroll}
      contentContainerStyle={styles.predictionContent}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.predictionTitle}>Prediction</Text>
      <Text style={styles.predictionSubtitle}>
        Browse live prediction markets and place your pick on each one.
      </Text>

      <View style={styles.predictionTabs}>
        {predictionTypes.map(type => {
          const isActive = type === selectedPrediction;
          return (
            <Pressable
              key={type}
              onPress={() => setSelectedPrediction(type)}
              style={[
                styles.predictionTab,
                isActive && styles.predictionTabActive,
              ]}>
              <Text
                style={[
                  styles.predictionTabText,
                  isActive && styles.predictionTabTextActive,
                ]}>
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}
        style={styles.predictionHero}>
        <Text style={styles.predictionHeroLabel}>Open markets</Text>
        <Text style={styles.predictionHeroValue}>{activeCount}</Text>
        <Text style={styles.predictionHeroMeta}>
          Select a market below and submit your prediction.
        </Text>
      </LinearGradient>

      <View style={styles.predictionListHeader}>
        <Text style={styles.predictionListTitle}>Prediction markets</Text>
        <Text style={styles.predictionListMeta}>Choose yes or no</Text>
      </View>

      {visiblePredictions.map(item => {
        const selectedVote = votes[item.id];

        return (
          <View key={item.id} style={styles.predictionListCard}>
            <View style={styles.predictionListTopRow}>
              <Text style={styles.predictionListCardTitle}>{item.title}</Text>
              <Text style={styles.predictionListConfidence}>{item.confidence}</Text>
            </View>
            <Text style={styles.predictionListDetail}>{item.detail}</Text>

            <View style={styles.predictionMetaRow}>
              <Text style={styles.predictionMetaChip}>{item.category}</Text>
              <Text style={styles.predictionMetaText}>Pool {item.pool}</Text>
            </View>

            <View style={styles.predictionActionRow}>
              <Pressable
                onPress={() => handleVote(item.id, 'yes')}
                style={[
                  styles.predictionChoiceButton,
                  selectedVote === 'yes' && styles.predictionChoiceButtonActive,
                ]}>
                <Text
                  style={[
                    styles.predictionChoiceText,
                    selectedVote === 'yes' && styles.predictionChoiceTextActive,
                  ]}>
                  Predict Yes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleVote(item.id, 'no')}
                style={[
                  styles.predictionChoiceButton,
                  selectedVote === 'no' && styles.predictionChoiceButtonActive,
                ]}>
                <Text
                  style={[
                    styles.predictionChoiceText,
                    selectedVote === 'no' && styles.predictionChoiceTextActive,
                  ]}>
                  Predict No
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ProfileScreen() {
  const profileTiles = [
    {id: '1', label: 'Post', tone: '#f1dfc7'},
    {id: '2', label: 'Reel', tone: '#e7d0b3'},
    {id: '3', label: 'Post', tone: '#dbbc9c'},
    {id: '4', label: 'Reel', tone: '#cfa78a'},
    {id: '5', label: 'Post', tone: '#c19f81'},
    {id: '6', label: 'Reel', tone: '#9a765f'},
  ];

  return (
    <ScrollView
      style={styles.profileScroll}
      contentContainerStyle={styles.profileContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarLarge}>
          <Text style={styles.profileAvatarLargeText}>GZ</Text>
        </View>
        <View style={styles.profileHeaderInfo}>
          <Text style={styles.profileName}>Gen Z Arena</Text>
          <Text style={styles.profileHandle}>@genzarena</Text>
          <Text style={styles.profileBio}>
            Creator ecosystem for posts, reels, predictions, and community
            growth.
          </Text>
        </View>
      </View>

      <View style={styles.profileStatsRow}>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatValue}>128</Text>
          <Text style={styles.profileStatLabel}>Posts</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatValue}>42k</Text>
          <Text style={styles.profileStatLabel}>Followers</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatValue}>386</Text>
          <Text style={styles.profileStatLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.profileActionsRow}>
        <Pressable style={styles.profilePrimaryAction}>
          <Text style={styles.profilePrimaryActionText}>Create Post</Text>
        </Pressable>
        <Pressable style={styles.profileSecondaryAction}>
          <Text style={styles.profileSecondaryActionText}>Create Reel</Text>
        </Pressable>
      </View>

      <View style={styles.profileSectionHeader}>
        <Text style={styles.profileSectionTitle}>Your content</Text>
        <Text style={styles.profileSectionMeta}>Posts and reels preview</Text>
      </View>

      <View style={styles.profileGrid}>
        {profileTiles.map(tile => (
          <View key={tile.id} style={styles.profileTile}>
            <LinearGradient
              colors={[tile.tone, '#17100f']}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              style={styles.profileTileMedia}>
              <Text style={styles.profileTileTag}>{tile.label}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function TournamentScreen() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [joinForm, setJoinForm] = useState({
    paymentProofUrl: '',
    refundMethod: '',
    refundAccount: '',
  });

  const loadTournaments = async () => {
    const session = await getStoredAuthSession();

    if (!session?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest('/tournaments', 'GET', undefined, session.token);
      setTournaments(data);
    } catch (error) {
      Alert.alert(
        'Tournament error',
        error instanceof Error ? error.message : 'Unable to load tournaments.',
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentDetail = async tournamentId => {
    const session = await getStoredAuthSession();

    if (!session?.token || !tournamentId) {
      return;
    }

    try {
      const detail = await apiRequest(
        `/tournaments/${tournamentId}`,
        'GET',
        undefined,
        session.token,
      );
      setSelectedTournament(detail);
      setJoinForm(current => ({
        ...current,
        refundMethod: detail?.myJoinRequest?.refundDetails?.method || '',
        refundAccount: detail?.myJoinRequest?.refundDetails?.account || '',
      }));
    } catch (error) {
      Alert.alert(
        'Tournament error',
        error instanceof Error ? error.message : 'Unable to load tournament.',
      );
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      loadTournamentDetail(selectedTournamentId);
    }
  }, [selectedTournamentId]);

  const submitJoinRequest = async () => {
    const session = await getStoredAuthSession();

    if (!session?.token || !selectedTournament) {
      return;
    }

    try {
      setBusy(true);
      await apiRequest(
        `/tournaments/${selectedTournament._id}/join`,
        'POST',
        {
          paymentProofUrl: joinForm.paymentProofUrl,
          refundDetails: {
            method: joinForm.refundMethod || null,
            account: joinForm.refundAccount,
          },
        },
        session.token,
      );
      setJoinForm(current => ({...current, paymentProofUrl: ''}));
      await loadTournaments();
      await loadTournamentDetail(selectedTournament._id);
      Alert.alert('Submitted', 'Your payment proof is waiting for approval.');
    } catch (error) {
      Alert.alert(
        'Join failed',
        error instanceof Error ? error.message : 'Unable to submit join request.',
      );
    } finally {
      setBusy(false);
    }
  };

  const updateRefundDetails = async () => {
    const session = await getStoredAuthSession();

    if (!session?.token || !selectedTournament) {
      return;
    }

    try {
      setBusy(true);
      await apiRequest(
        `/tournaments/${selectedTournament._id}/refund-details`,
        'PATCH',
        {
          refundDetails: {
            method: joinForm.refundMethod || null,
            account: joinForm.refundAccount,
          },
        },
        session.token,
      );
      await loadTournamentDetail(selectedTournament._id);
      Alert.alert('Updated', 'Refund details updated successfully.');
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error ? error.message : 'Unable to update refund details.',
      );
    } finally {
      setBusy(false);
    }
  };

  const selectTeam = async teamId => {
    const session = await getStoredAuthSession();

    if (!session?.token || !selectedTournament) {
      return;
    }

    try {
      setBusy(true);
      await apiRequest(
        `/tournaments/${selectedTournament._id}/select-team`,
        'POST',
        {teamId},
        session.token,
      );
      await loadTournaments();
      await loadTournamentDetail(selectedTournament._id);
      Alert.alert('Team selected', 'Your tournament team is now reserved.');
    } catch (error) {
      Alert.alert(
        'Team selection failed',
        error instanceof Error ? error.message : 'Unable to select team.',
      );
    } finally {
      setBusy(false);
    }
  };

  const joinRequest = selectedTournament?.myJoinRequest;

  return (
    <ScrollView
      style={styles.tournamentScroll}
      contentContainerStyle={styles.tournamentContent}
      showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}
        style={styles.tournamentHero}>
        <Text style={styles.tournamentHeroEyebrow}>Tournament Module</Text>
        <Text style={styles.tournamentHeroTitle}>PUBG Mobile</Text>
        <Text style={styles.tournamentHeroSubtitle}>
          This is an added module. The rest of the app stays the same while
          tournament enrollment, approvals, refunds, and team selection run here.
        </Text>
      </LinearGradient>

      <View style={styles.tournamentHeaderRow}>
        {selectedTournament ? (
          <>
            <Pressable
              onPress={() => {
                setSelectedTournament(null);
                setSelectedTournamentId('');
              }}
              style={styles.tournamentBackButton}>
              <Text style={styles.tournamentBackButtonText}>Back</Text>
            </Pressable>
            <Pressable onPress={loadTournaments} style={styles.tournamentRefreshButton}>
              <Text style={styles.tournamentRefreshButtonText}>Refresh</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.tournamentSectionTitle}>Available tournaments</Text>
            <Pressable onPress={loadTournaments} style={styles.tournamentRefreshButton}>
              <Text style={styles.tournamentRefreshButtonText}>Refresh</Text>
            </Pressable>
          </>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#17100f" style={{marginTop: 24}} />
      ) : !selectedTournament ? (
        <View style={styles.tournamentStack}>
          {tournaments.map(tournament => (
            <Pressable
              key={tournament._id}
              onPress={async () => {
                setSelectedTournamentId(tournament._id);
                await loadTournamentDetail(tournament._id);
              }}
              style={styles.tournamentListCard}>
              <View style={styles.tournamentListCardHeader}>
                <View style={styles.tournamentListCardBadge}>
                  <Text style={styles.tournamentListCardBadgeText}>🏆</Text>
                </View>
                <View style={styles.tournamentListCardInfo}>
                  <Text style={styles.tournamentListCardTitle}>{tournament.title}</Text>
                  <Text style={styles.tournamentListCardBody}>
                    {tournament.description || 'Tap to see tournament details.'}
                  </Text>
                </View>
              </View>
              <View style={styles.tournamentListMetaRow}>
                <Text style={styles.tournamentListMetaText}>
                  {tournament.filledSlots}/{tournament.totalSlots} filled
                </Text>
                <Text
                  style={[
                    styles.tournamentListStatus,
                    tournament.enrollmentStatus === 'closed' &&
                      styles.tournamentListStatusClosed,
                  ]}>
                  {tournament.enrollmentStatus === 'open' ? 'Open' : 'Full'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.tournamentDetailCard}>
          <Text style={styles.tournamentDetailTitle}>
            {selectedTournament.title}
          </Text>
          <Text style={styles.tournamentDetailBody}>
            {selectedTournament.description || 'No extra tournament details added yet.'}
          </Text>
          <Text style={styles.tournamentDetailMeta}>
            Teams {selectedTournament.maxTeams} • Team Size {selectedTournament.teamSize}
          </Text>
          <Text style={styles.tournamentDetailMeta}>
            Filled {selectedTournament.filledSlots}/{selectedTournament.totalSlots} •
            Remaining {selectedTournament.remainingSlots}
          </Text>

          <View style={styles.tournamentInfoCard}>
            <Text style={styles.tournamentInfoTitle}>Payment Details</Text>
            <Text style={styles.tournamentInfoText}>
              Bank Name: {selectedTournament.paymentDetails?.bankName || 'Not provided'}
            </Text>
            <Text style={styles.tournamentInfoText}>
              Account Title:{' '}
              {selectedTournament.paymentDetails?.accountTitle || 'Not provided'}
            </Text>
            <Text style={styles.tournamentInfoText}>
              Account Number:{' '}
              {selectedTournament.paymentDetails?.accountNumber || 'Not provided'}
            </Text>
          </View>

          {joinRequest ? (
            <View style={styles.tournamentInfoCard}>
              <Text style={styles.tournamentInfoTitle}>
                {joinRequest.status === 'pending'
                  ? 'Waiting for Approval ⏳'
                  : joinRequest.status === 'approved'
                  ? joinRequest.teamId
                    ? `Assigned to ${joinRequest.teamId.name} ✅`
                    : 'Select Team ✅'
                  : joinRequest.status === 'rejected_refund'
                  ? 'Refund Initiated 💸'
                  : 'Rejected ❌'}
              </Text>
              <Text style={styles.tournamentInfoText}>
                Payment proof: {joinRequest.paymentProofUrl}
              </Text>
              {joinRequest.refundDetails?.method ? (
                <Text style={styles.tournamentInfoText}>
                  Refund: {joinRequest.refundDetails.method} /{' '}
                  {joinRequest.refundDetails.account}
                </Text>
              ) : null}
              {joinRequest.refundProofUrl ? (
                <Text style={styles.tournamentInfoText}>
                  Refund proof: {joinRequest.refundProofUrl}
                </Text>
              ) : null}
            </View>
          ) : selectedTournament.enrollmentStatus === 'open' ? (
            <View style={styles.tournamentInfoCard}>
              <Text style={styles.tournamentInfoTitle}>Join Tournament</Text>
              <TextInput
                value={joinForm.paymentProofUrl}
                onChangeText={value =>
                  setJoinForm(current => ({...current, paymentProofUrl: value}))
                }
                placeholder="Payment proof URL"
                placeholderTextColor="#8a867f"
                style={styles.input}
              />
              <TextInput
                value={joinForm.refundMethod}
                onChangeText={value =>
                  setJoinForm(current => ({...current, refundMethod: value}))
                }
                placeholder="Refund method: JazzCash / EasyPaisa / Bank"
                placeholderTextColor="#8a867f"
                style={styles.input}
              />
              <TextInput
                value={joinForm.refundAccount}
                onChangeText={value =>
                  setJoinForm(current => ({...current, refundAccount: value}))
                }
                placeholder="Refund account / wallet / IBAN"
                placeholderTextColor="#8a867f"
                style={styles.input}
              />
              <Pressable onPress={submitJoinRequest} style={styles.buttonWrap}>
                <LinearGradient
                  colors={GRADIENT_COLORS}
                  start={{x: 0, y: 1}}
                  end={{x: 1, y: 0}}
                  style={styles.button}>
                  {busy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Submit Payment Proof</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={styles.tournamentInfoCard}>
              <Text style={styles.tournamentInfoTitle}>Tournament Full ❌</Text>
              <Text style={styles.tournamentInfoText}>
                Enrollment is closed because all slots are already approved.
              </Text>
            </View>
          )}

          {joinRequest &&
          (joinRequest.status === 'pending' ||
            joinRequest.status === 'rejected' ||
            joinRequest.status === 'rejected_refund') ? (
            <View style={styles.tournamentInfoCard}>
              <Text style={styles.tournamentInfoTitle}>Refund details</Text>
              <TextInput
                value={joinForm.refundMethod}
                onChangeText={value =>
                  setJoinForm(current => ({...current, refundMethod: value}))
                }
                placeholder="Refund method"
                placeholderTextColor="#8a867f"
                style={styles.input}
              />
              <TextInput
                value={joinForm.refundAccount}
                onChangeText={value =>
                  setJoinForm(current => ({...current, refundAccount: value}))
                }
                placeholder="Refund account"
                placeholderTextColor="#8a867f"
                style={styles.input}
              />
              <Pressable onPress={updateRefundDetails} style={styles.tournamentRefundButton}>
                <Text style={styles.tournamentRefundButtonText}>Update Refund Details</Text>
              </Pressable>
            </View>
          ) : null}

          {selectedTournament.canSelectTeam ? (
            <View style={styles.tournamentInfoCard}>
              <Text style={styles.tournamentInfoTitle}>Select Team ✅</Text>
              {selectedTournament.teams.map(team => (
                <Pressable
                  key={team._id}
                  disabled={team.isFull || busy}
                  onPress={() => selectTeam(team._id)}
                  style={[
                    styles.tournamentTeamButton,
                    team.isFull && styles.tournamentTeamButtonDisabled,
                  ]}>
                  <Text style={styles.tournamentTeamButtonTitle}>{team.name}</Text>
                  <Text style={styles.tournamentTeamButtonMeta}>
                    {team.memberCount}/{selectedTournament.teamSize} players
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

function SettingsScreen({onLogout}) {
  const settingsRows = [
    'Account settings',
    'Privacy controls',
    'Notification preferences',
    'Help and support',
  ];

  return (
    <ScrollView
      style={styles.settingsScroll}
      contentContainerStyle={styles.settingsContent}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.settingsTitle}>Settings</Text>
      <Text style={styles.settingsSubtitle}>
        Manage your account, preferences, and support options.
      </Text>

      {settingsRows.map(row => (
        <View key={row} style={styles.settingsRow}>
          <Text style={styles.settingsRowText}>{row}</Text>
          <Text style={styles.settingsRowArrow}>{'>'}</Text>
        </View>
      ))}

      <Pressable onPress={onLogout} style={styles.settingsLogoutButton}>
        <Text style={styles.settingsLogoutButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function MainApp({onLogout}) {
  const [activeTab, setActiveTab] = useState('post');

  const tabs = [
    {key: 'profile', label: 'Profile', icon: 'PR'},
    {key: 'prediction', label: 'Prediction', icon: 'AI'},
    {key: 'leaderboard', label: 'Leaders', icon: 'LB'},
    {key: 'post', label: 'Post', icon: 'PO'},
    {key: 'tournament', label: 'Tournament', icon: '🏆'},
    {key: 'settings', label: 'Settings', icon: 'ST'},
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileScreen />;
      case 'prediction':
        return <PredictionScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'tournament':
        return <TournamentScreen />;
      case 'settings':
        return <SettingsScreen onLogout={onLogout} />;
      case 'post':
      default:
        return <PostFeedScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.mainSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.mainScreen}>
        <View style={styles.mainContent}>{renderActiveScreen()}</View>
        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabItem}>
                <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                  <Text style={[styles.tabIconText, isActive && styles.tabIconTextActive]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [hydratingSession, setHydratingSession] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const authSlider = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const rawValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (rawValue && active) {
          setIsAuthenticated(true);
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

  const handleToggleMode = () => {
    const nextMode = authMode === 'login' ? 'register' : 'login';
    setAuthMode(nextMode);
    Animated.timing(authSlider, {
      toValue: nextMode === 'login' ? 0 : 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.appContainer}>
      {showSplash ? (
        <Animated.View style={[styles.overlayScreen, {opacity: splashOpacity}]}>
          <SplashScreen />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.overlayScreen, {opacity: loginOpacity}]}>
        {isAuthenticated ? (
          <MainApp
            onLogout={async () => {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              setIsAuthenticated(false);
            }}
          />
        ) : (
          <Animated.View
            style={[
              styles.authTrack,
              {
                transform: [
                  {
                    translateX: authSlider.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -SCREEN_WIDTH],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.authSlide}>
              <AuthScreen
                mode="login"
                onToggleMode={handleToggleMode}
                onAuthSuccess={() => setIsAuthenticated(true)}
              />
            </View>
            <View style={styles.authSlide}>
              <AuthScreen
                mode="register"
                onToggleMode={handleToggleMode}
                onAuthSuccess={() => setIsAuthenticated(true)}
              />
            </View>
          </Animated.View>
        )}
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
  authTrack: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
  },
  authSlide: {
    width: SCREEN_WIDTH,
  },
  mainSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 140,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedBrand: {
    color: '#17100f',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginTop: 12,
  },
  feedHeaderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  feedIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5efe9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 8,
  },
  feedIconText: {
    color: '#17100f',
    fontSize: 16,
    fontWeight: '700',
  },
  feedIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9a765f',
  },
  postCard: {
    backgroundColor: '#fffdfb',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ece4dc',
    marginTop: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1dfc7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    color: '#17100f',
    fontSize: 18,
    fontWeight: '800',
  },
  postHeaderMeta: {
    flex: 1,
  },
  postAuthor: {
    color: '#17100f',
    fontSize: 15,
    fontWeight: '800',
  },
  postRole: {
    color: '#7a736d',
    fontSize: 12,
    marginTop: 2,
  },
  postMore: {
    color: '#7a736d',
    fontSize: 22,
    fontWeight: '700',
  },
  postMedia: {
    height: 220,
    borderRadius: 22,
    marginBottom: 14,
    padding: 16,
    justifyContent: 'flex-end',
  },
  postMediaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postTitle: {
    color: '#17100f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  postBody: {
    color: '#5d5751',
    fontSize: 14,
    lineHeight: 21,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  postStat: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '700',
  },
  simpleScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  simpleTitle: {
    color: '#17100f',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  simpleDescription: {
    color: '#635b56',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  leaderboardScroll: {
    flex: 1,
  },
  leaderboardContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 170,
  },
  leaderboardHero: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  leaderboardHeroEyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  leaderboardHeroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  leaderboardHeroSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 260,
  },
  leaderboardSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  leaderboardSectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  leaderboardSectionTitle: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  leaderboardSectionMeta: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '600',
  },
  leaderboardSummaryCard: {
    flex: 1,
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  leaderboardSummaryValue: {
    color: '#17100f',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  leaderboardSummaryLabel: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '600',
  },
  leaderCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  leaderRank: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#f1dfc7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leaderRankText: {
    color: '#17100f',
    fontSize: 16,
    fontWeight: '800',
  },
  leaderName: {
    color: '#17100f',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  leaderHandle: {
    color: '#746c66',
    fontSize: 13,
    fontWeight: '600',
  },
  leaderRight: {
    alignItems: 'flex-end',
  },
  leaderMetric: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  leaderMetricValue: {
    color: '#17100f',
    fontSize: 15,
    fontWeight: '800',
  },
  leaderMetricLabel: {
    color: '#746c66',
    fontSize: 12,
    fontWeight: '600',
  },
  predictionScroll: {
    flex: 1,
  },
  predictionContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 130,
  },
  predictionTitle: {
    color: '#17100f',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  predictionSubtitle: {
    color: '#635b56',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: 300,
  },
  predictionTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  predictionTab: {
    backgroundColor: '#f4eee7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  predictionTabActive: {
    backgroundColor: '#17100f',
  },
  predictionTabText: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '700',
  },
  predictionTabTextActive: {
    color: '#ffffff',
  },
  predictionHero: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 18,
  },
  predictionHeroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  predictionHeroValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  predictionHeroMeta: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  chartTitle: {
    color: '#17100f',
    fontSize: 18,
    fontWeight: '800',
  },
  chartValue: {
    color: '#7d6151',
    fontSize: 14,
    fontWeight: '800',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 220,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartTrack: {
    width: 24,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#f4eee7',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 10,
  },
  chartBar: {
    width: '100%',
    borderRadius: 999,
  },
  chartLabel: {
    color: '#746c66',
    fontSize: 12,
    fontWeight: '700',
  },
  predictionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  predictionMetaChip: {
    backgroundColor: '#f4eee7',
    color: '#17100f',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  predictionMetaText: {
    color: '#746c66',
    fontSize: 12,
    fontWeight: '700',
  },
  predictionActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  predictionChoiceButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5ddd6',
    backgroundColor: '#fffdfb',
    alignItems: 'center',
    paddingVertical: 13,
  },
  predictionChoiceButtonActive: {
    backgroundColor: '#17100f',
    borderColor: '#17100f',
  },
  predictionChoiceText: {
    color: '#17100f',
    fontSize: 14,
    fontWeight: '800',
  },
  predictionChoiceTextActive: {
    color: '#ffffff',
  },
  predictionListHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  predictionListTitle: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  predictionListMeta: {
    color: '#746c66',
    fontSize: 13,
    fontWeight: '600',
  },
  predictionListCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  predictionListTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  predictionListCardTitle: {
    color: '#17100f',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  predictionListConfidence: {
    color: '#7d6151',
    fontSize: 13,
    fontWeight: '800',
  },
  predictionListDetail: {
    color: '#635b56',
    fontSize: 14,
    lineHeight: 21,
  },
  profileScroll: {
    flex: 1,
  },
  profileContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 130,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileAvatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#f1dfc7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarLargeText: {
    color: '#17100f',
    fontSize: 26,
    fontWeight: '800',
  },
  profileHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    color: '#17100f',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileHandle: {
    color: '#7a736d',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  profileBio: {
    color: '#5f5853',
    fontSize: 14,
    lineHeight: 21,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#ece4dc',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
  },
  profileStatValue: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileStatLabel: {
    color: '#746c66',
    fontSize: 12,
    fontWeight: '600',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  profilePrimaryAction: {
    flex: 1,
    backgroundColor: '#17100f',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  profilePrimaryActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  profileSecondaryAction: {
    flex: 1,
    backgroundColor: '#f3ede7',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  profileSecondaryActionText: {
    color: '#17100f',
    fontSize: 15,
    fontWeight: '800',
  },
  profileSectionHeader: {
    marginBottom: 14,
  },
  profileSectionTitle: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileSectionMeta: {
    color: '#746c66',
    fontSize: 13,
    fontWeight: '600',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileTile: {
    width: '31%',
    marginBottom: 12,
  },
  profileTileMedia: {
    aspectRatio: 0.78,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 10,
  },
  profileTileTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tournamentScroll: {
    flex: 1,
  },
  tournamentContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 130,
  },
  tournamentHero: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  tournamentHeroEyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  tournamentHeroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  tournamentHeroSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 21,
  },
  tournamentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentBackButton: {
    backgroundColor: '#f3ede7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tournamentBackButtonText: {
    color: '#17100f',
    fontSize: 13,
    fontWeight: '800',
  },
  tournamentSectionTitle: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
  },
  tournamentRefreshButton: {
    backgroundColor: '#f3ede7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tournamentRefreshButtonText: {
    color: '#17100f',
    fontSize: 13,
    fontWeight: '800',
  },
  tournamentList: {
    marginBottom: 16,
  },
  tournamentStack: {
    gap: 14,
  },
  tournamentListCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  tournamentListCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tournamentListCardBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f3ede7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentListCardBadgeText: {
    fontSize: 20,
  },
  tournamentListCardInfo: {
    flex: 1,
  },
  tournamentListCardTitle: {
    color: '#17100f',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  tournamentListCardBody: {
    color: '#635b56',
    fontSize: 14,
    lineHeight: 20,
  },
  tournamentListMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  tournamentListMetaText: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '700',
  },
  tournamentListStatus: {
    backgroundColor: '#eef6ef',
    color: '#136b37',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tournamentListStatusClosed: {
    backgroundColor: '#f8d9d4',
    color: '#9f2f20',
  },
  tournamentCard: {
    width: 220,
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginRight: 12,
  },
  tournamentCardActive: {
    borderColor: '#7d6151',
    backgroundColor: '#f8f1ea',
  },
  tournamentCardTitle: {
    color: '#17100f',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  tournamentCardMeta: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  tournamentCardStatus: {
    alignSelf: 'flex-start',
    backgroundColor: '#f4eee7',
    color: '#17100f',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tournamentCardStatusClosed: {
    backgroundColor: '#f8d9d4',
    color: '#9f2f20',
  },
  tournamentDetailCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#ece4dc',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  tournamentDetailTitle: {
    color: '#17100f',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  tournamentDetailBody: {
    color: '#635b56',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  tournamentDetailMeta: {
    color: '#6d655f',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  tournamentInfoCard: {
    marginTop: 16,
    backgroundColor: '#f7f2ec',
    borderRadius: 20,
    padding: 16,
  },
  tournamentInfoTitle: {
    color: '#17100f',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  tournamentInfoText: {
    color: '#5f5853',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  tournamentRefundButton: {
    marginTop: 8,
    backgroundColor: '#17100f',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tournamentRefundButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  tournamentTeamButton: {
    marginTop: 10,
    backgroundColor: '#17100f',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  tournamentTeamButtonDisabled: {
    backgroundColor: '#a59b93',
  },
  tournamentTeamButtonTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  tournamentTeamButtonMeta: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  settingsScroll: {
    flex: 1,
  },
  settingsContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: TOP_SCREEN_SPACING,
    paddingBottom: 130,
  },
  settingsTitle: {
    color: '#17100f',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  settingsSubtitle: {
    color: '#635b56',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 280,
  },
  settingsRow: {
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#ece4dc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsRowText: {
    color: '#17100f',
    fontSize: 15,
    fontWeight: '700',
  },
  settingsRowArrow: {
    color: '#746c66',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsLogoutButton: {
    marginTop: 10,
    backgroundColor: '#17100f',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsLogoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fffdfb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#ece4dc',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5efe9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tabIconWrapActive: {
    backgroundColor: '#17100f',
  },
  tabIconText: {
    color: '#6c635d',
    fontSize: 11,
    fontWeight: '800',
  },
  tabIconTextActive: {
    color: '#ffffff',
  },
  tabLabel: {
    color: '#6c635d',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#17100f',
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
    minHeight: 420,
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
    marginBottom: 0,
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
