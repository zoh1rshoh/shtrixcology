import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/lib/api';
import { REGIONS } from '../../src/data/regions';

// ============================================
// TYPES
// ============================================
type MainTab = 'battles' | 'teams';
type BattlesSubTab = 'active' | 'upcoming' | 'discover' | 'my' | 'history';
type TeamsSubTab = 'my' | 'discover' | 'rankings' | 'invitations';

interface Reward {
  id: string;
  imageBase64: string;
  name: string;
}

const BATTLE_TYPES = [
  { id: 'team', label: 'Team', icon: 'people' as const, desc: 'Jamoa va jamoa' },
  { id: 'school', label: 'School', icon: 'school' as const, desc: 'Maktab va maktab' },
  { id: 'city', label: 'City', icon: 'business' as const, desc: 'Shahar va tuman' },
  { id: 'quick', label: 'Quick', icon: 'flash' as const, desc: '24 soat · 72 soat' },
  { id: 'country', label: 'Country', icon: 'globe' as const, desc: 'Mamlakatlar' },
  { id: 'other', label: 'Other', icon: 'sparkles' as const, desc: 'Universitet, ko\'cha' },
];

const GOALS = [
  { key: 'eco_points', label: 'Eco Points', icon: 'sparkles' as const },
  { key: 'packages', label: 'Qadoqlar', icon: 'cube' as const },
  { key: 'weight', label: 'Vazn', icon: 'scale' as const },
  { key: 'co2', label: 'CO₂', icon: 'leaf' as const },
];

const DURATIONS = [
  { key: '1', label: '24 soat' },
  { key: '3', label: '3 kun' },
  { key: '7', label: '7 kun' },
  { key: 'custom', label: 'Boshqa' },
];

const ENTRIES = [
  { key: 'open', label: 'Ochiq' },
  { key: 'closed', label: 'Yopiq' },
  { key: 'invite', label: 'Taklif' },
];

// ============================================
// TOAST
// ============================================
function useToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  const show = (
    message: string,
    type: 'error' | 'success' | 'info' = 'info'
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  };

  return { toast, show };
}

function Toast({
  toast,
}: {
  toast: { visible: boolean; message: string; type: string };
}) {
  if (!toast.visible) return null;
  const bg =
    toast.type === 'error'
      ? '#E5484D'
      : toast.type === 'success'
      ? '#36B37E'
      : '#111111';
  return (
    <View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 999,
      }}
      pointerEvents="none"
    >
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <Ionicons
          name={
            toast.type === 'error'
              ? 'alert-circle'
              : toast.type === 'success'
              ? 'checkmark-circle'
              : 'information-circle'
          }
          size={20}
          color="#FFFFFF"
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
            flex: 1,
          }}
        >
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// MAIN
// ============================================
export default function Battles() {
  const { toast, show: showToast } = useToast();

  const [mainTab, setMainTab] = useState<MainTab>('battles');
  const [battlesSub, setBattlesSub] = useState<BattlesSubTab>('active');
  const [teamsSub, setTeamsSub] = useState<TeamsSubTab>('my');

  const [myTeam, setMyTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);
  const [createBattleVisible, setCreateBattleVisible] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const [meData, listData] = await Promise.all([
        api.teams.me(),
        api.teams.list(),
      ]);
      setMyTeam(meData.team);
      setTeams(listData.teams ?? []);
    } catch (e) {
      console.log('Teams load error:', e);
    }
  }, []);

  const loadBattles = useCallback(async (filter: string) => {
    try {
      const data = await api.battles.list(filter);
      setBattles(data.battles ?? []);
    } catch (e) {
      console.log('Battles load error:', e);
      setBattles([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await loadTeams();
        await loadBattles(battlesSub);
        setLoading(false);
      })();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (mainTab === 'battles') loadBattles(battlesSub);
    }, [battlesSub, mainTab, loadBattles])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    await loadBattles(battlesSub);
    setRefreshing(false);
  };

  if (loading && teams.length === 0) {
    return (
      <View className="flex-1 bg-eco items-center justify-center">
        <ActivityIndicator color="#111111" />
      </View>
    );
  }

  const activeBattlesCount = battles.filter((b) => b.status === 'active').length;

  return (
    <View className="flex-1 bg-eco">
      <Toast toast={toast} />

      {/* ============ HERO HEADER ============ */}
      <View
        style={{
          backgroundColor: '#111111',
          paddingTop: 56,
          paddingBottom: 0,
        }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Live indicator */}
          <View className="flex-row items-center mb-2">
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#B8FF3D',
                marginRight: 6,
              }}
            />
            <Text
              style={{
                color: '#B8FF3D',
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Eco Battle
            </Text>
          </View>

          {/* Title + Action */}
          <View className="flex-row items-center justify-between mb-1">
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              Musobaqa
            </Text>
            <Pressable
              onPress={() => setCreateBattleVisible(true)}
              style={{
                backgroundColor: '#B8FF3D',
                borderRadius: 999,
                paddingLeft: 10,
                paddingRight: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={18} color="#111111" />
              <Text
                style={{
                  color: '#111111',
                  fontSize: 12,
                  fontWeight: '800',
                  marginLeft: 4,
                }}
              >
                Battle
              </Text>
            </Pressable>
          </View>

          {/* Subtitle */}
          <Text
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {activeBattlesCount > 0
              ? `${activeBattlesCount} ta faol battle`
              : "Yangi battle yarating va raqib toping"}
          </Text>

          {/* MAIN TABS */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 4,
            }}
          >
            <Pressable
              onPress={() => setMainTab('battles')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor:
                  mainTab === 'battles' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Ionicons
                name="trophy"
                size={14}
                color={mainTab === 'battles' ? '#111111' : '#FFFFFF80'}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  marginLeft: 6,
                  color: mainTab === 'battles' ? '#111111' : 'rgba(255,255,255,0.7)',
                }}
              >
                Battles
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMainTab('teams')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: mainTab === 'teams' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Ionicons
                name="people"
                size={14}
                color={mainTab === 'teams' ? '#111111' : '#FFFFFF80'}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  marginLeft: 6,
                  color: mainTab === 'teams' ? '#111111' : 'rgba(255,255,255,0.7)',
                }}
              >
                Teams
              </Text>
            </Pressable>
          </View>

          {/* Curved bottom */}
          <View style={{ height: 16 }} />
        </View>
      </View>

      {/* ============ SUB-TABS ============ */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#ECEFE9',
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {(mainTab === 'battles'
            ? [
                { key: 'active', label: 'Faol' },
                { key: 'upcoming', label: 'Kutilmoqda' },
                { key: 'discover', label: 'Topish' },
                { key: 'my', label: 'Mening' },
                { key: 'history', label: 'Tarix' },
              ]
            : [
                { key: 'my', label: 'Mening' },
                { key: 'discover', label: 'Topish' },
                { key: 'rankings', label: 'Reyting' },
                { key: 'invitations', label: 'Takliflar' },
              ]
          ).map((tab: any) => {
            const isActive =
              mainTab === 'battles'
                ? battlesSub === tab.key
                : teamsSub === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() =>
                  mainTab === 'battles'
                    ? setBattlesSub(tab.key)
                    : setTeamsSub(tab.key)
                }
                style={{
                  paddingHorizontal: 12,
                  paddingTop: 14,
                  paddingBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '800' : '500',
                    color: isActive ? '#111111' : '#8A9187',
                  }}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    style={{
                      height: 2.5,
                      backgroundColor: '#B8FF3D',
                      borderRadius: 2,
                      marginTop: 8,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {mainTab === 'battles' ? (
          <BattlesListTab
            sub={battlesSub}
            battles={battles}
            myTeam={myTeam}
            teams={teams}
            showToast={showToast}
            onCreateBattle={() => setCreateBattleVisible(true)}
            onReload={() => loadBattles(battlesSub)}
          />
        ) : (
          <TeamsTab
            sub={teamsSub}
            myTeam={myTeam}
            teams={teams}
            onLoad={loadTeams}
            showToast={showToast}
            onCreateTeam={() => setCreateTeamVisible(true)}
          />
        )}
      </ScrollView>

      <CreateTeamModal
        visible={createTeamVisible}
        onClose={() => setCreateTeamVisible(false)}
        onSuccess={async () => {
          setCreateTeamVisible(false);
          await loadTeams();
        }}
        showToast={showToast}
      />

      <CreateBattleModal
        visible={createBattleVisible}
        myTeam={myTeam}
        teams={teams}
        onClose={() => setCreateBattleVisible(false)}
        onCreateTeam={() => {
          setCreateBattleVisible(false);
          setCreateTeamVisible(true);
        }}
        onSuccess={async () => {
          setCreateBattleVisible(false);
          await loadBattles(battlesSub);
          setBattlesSub('upcoming');
          showToast('Battle yaratildi', 'success');
        }}
        showToast={showToast}
      />
    </View>
  );
}

// ============================================
// BATTLES LIST TAB
// ============================================
function BattlesListTab({
  sub,
  battles,
  myTeam,
  teams,
  showToast,
  onCreateBattle,
  onReload,
}: {
  sub: BattlesSubTab;
  battles: any[];
  myTeam: any;
  teams: any[];
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
  onCreateBattle: () => void;
  onReload: () => void;
}) {
  if (battles.length === 0) {
    const emptyMessages: Record<BattlesSubTab, any> = {
      active: {
        icon: 'flash-outline',
        title: "Faol janglar yo'q",
        subtitle: "Hozir davom etayotgan battle yo'q",
        cta: 'Battle yaratish',
        onCta: onCreateBattle,
      },
      upcoming: {
        icon: 'time-outline',
        title: "Kutilayotgan janglar yo'q",
        subtitle: "Yaratilgan battles shu yerda ko'rinadi",
        cta: 'Battle yaratish',
        onCta: onCreateBattle,
      },
      discover: {
        icon: 'compass-outline',
        title: "Ochiq musobaqalar yo'q",
        subtitle: "Boshqa jamoalarning ochiq battles shu yerda",
        cta: 'Battle yaratish',
        onCta: onCreateBattle,
      },
      my: {
        icon: 'person-outline',
        title: "Sizda janglar yo'q",
        subtitle: "Battle'ga qo'shiling va bu yerda ko'ring",
      },
      history: {
        icon: 'document-text-outline',
        title: "Tarix bo'sh",
        subtitle: "Yakunlangan battles shu yerda saqlanadi",
      },
    };
    const msg = emptyMessages[sub];
    return (
      <EmptyState
        icon={msg.icon}
        title={msg.title}
        subtitle={msg.subtitle}
        ctaLabel={msg.cta}
        onCta={msg.onCta}
      />
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* Section label */}
      <View className="flex-row items-center mb-3">
        <View
          style={{
            width: 3,
            height: 14,
            backgroundColor: '#B8FF3D',
            borderRadius: 2,
            marginRight: 8,
          }}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: '800',
            color: '#4B5148',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {battles.length} ta battle
        </Text>
      </View>

      {battles.map((b) => (
        <BattleCard
          key={b.id}
          battle={b}
          myTeam={myTeam}
          teams={teams}
          showToast={showToast}
          onReload={onReload}
        />
      ))}
    </View>
  );
}

// ============================================
// BATTLE CARD — PREMIUM
// ============================================
function BattleCard({
  battle,
  myTeam,
  teams,
  showToast,
  onReload,
}: {
  battle: any;
  myTeam: any;
  teams: any[];
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
  onReload: () => void;
}) {
  const [joining, setJoining] = useState(false);

  const participants = Array.isArray(battle.participants)
    ? battle.participants
    : [];

  const participantTeams = participants
    .map((tid: string) => teams.find((t) => t.id === tid))
    .filter(Boolean);

  const isMyTeamJoined = myTeam ? participants.includes(myTeam.id) : false;

  const isOpen = battle.entry === 'open';
  const isUpcoming = battle.status === 'upcoming';
  const isActive = battle.status === 'active';

  const statusColor = isUpcoming
    ? '#F4B740'
    : isActive
    ? '#36B37E'
    : '#8A9187';

  const statusLabel = isUpcoming
    ? 'Kutilmoqda'
    : isActive
    ? 'Faol'
    : 'Yakunlangan';

  const goalLabel =
    battle.goal === 'eco_points'
      ? 'Eco Points'
      : battle.goal === 'packages'
      ? 'Qadoqlar'
      : battle.goal === 'weight'
      ? 'Vazn'
      : 'CO₂';

  const goalIcon =
    battle.goal === 'eco_points'
      ? 'sparkles'
      : battle.goal === 'packages'
      ? 'cube'
      : battle.goal === 'weight'
      ? 'scale'
      : 'leaf';

  const handleJoin = async () => {
    if (!myTeam) {
      showToast('Avval jamoa yaratish kerak', 'error');
      return;
    }
    setJoining(true);
    try {
      await api.battles.join(battle.id);
      showToast("Battle'ga qo'shildingiz", 'success');
      onReload();
    } catch (e: any) {
      showToast(e.message ?? 'Xato', 'error');
    } finally {
      setJoining(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((s: string) => s.charAt(0).toUpperCase())
      .join('');

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#ECEFE9',
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {/* ============ TOP STRIP ============ */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
        }}
      >
        <View className="flex-row items-center">
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusColor,
              marginRight: 6,
            }}
          />
          <Text
            style={{
              color: statusColor,
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {statusLabel}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#111111',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: '#B8FF3D',
              fontSize: 9,
              fontWeight: '800',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {battle.type}
          </Text>
        </View>
      </View>

      {/* ============ TITLE ============ */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#111111',
            lineHeight: 24,
            letterSpacing: -0.3,
          }}
          numberOfLines={2}
        >
          {battle.title}
        </Text>
      </View>

      {/* ============ HERO REWARD ============ */}
      {Array.isArray(battle.rewards) && battle.rewards.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F6F7F4',
              borderRadius: 18,
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: battle.rewards[0].imageBase64 }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 14,
                backgroundColor: '#ECEFE9',
              }}
              resizeMode="cover"
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <Ionicons name="gift" size={11} color="#8A9187" />
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '800',
                    color: '#8A9187',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    marginLeft: 4,
                  }}
                >
                  {battle.rewards.length === 1
                    ? 'Mukofot'
                    : `${battle.rewards.length} dona`}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#111111',
                  lineHeight: 17,
                }}
                numberOfLines={2}
              >
                {battle.rewards[0].name}
              </Text>

              {battle.rewards.length > 1 && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 6,
                    alignItems: 'center',
                  }}
                >
                  {battle.rewards.slice(1, 4).map((r: any, i: number) => (
                    <Image
                      key={i}
                      source={{ uri: r.imageBase64 }}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        marginRight: 4,
                        backgroundColor: '#ECEFE9',
                      }}
                      resizeMode="cover"
                    />
                  ))}
                  {battle.rewards.length > 4 && (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        backgroundColor: '#111111',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: '#B8FF3D',
                        }}
                      >
                        +{battle.rewards.length - 4}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ============ STATS ROW ============ */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: '#ECEFE9',
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
      >
        <StatBlock
          icon={goalIcon as any}
          label="MAQSAD"
          value={goalLabel}
        />
        <StatDivider />
        <StatBlock
          icon="time-outline"
          label="MUDDAT"
          value={`${battle.durationDays} kun`}
        />
        <StatDivider />
        <StatBlock
          icon="people-outline"
          label="JAMOA"
          value={`${participants.length} ta`}
        />
      </View>

      {/* ============ PARTICIPANTS ============ */}
      {participantTeams.length > 0 && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: '#ECEFE9',
            paddingTop: 14,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Text
              style={{
                fontSize: 9,
                fontWeight: '800',
                color: '#8A9187',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                flex: 1,
              }}
            >
              ISHTIROKCHILAR
            </Text>

            {/* Avatar stack */}
            <View style={{ flexDirection: 'row-reverse' }}>
              {participantTeams.slice(0, 4).map((t: any, i: number) => {
                const isMine = myTeam?.id === t.id;
                return (
                  <View
                    key={t.id}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: isMine ? '#B8FF3D' : '#111111',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      marginLeft: i > 0 ? -10 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: isMine ? '#111111' : '#B8FF3D',
                      }}
                    >
                      {initials(t.name)}
                    </Text>
                  </View>
                );
              })}
              {participantTeams.length > 4 && (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: '#ECEFE9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    marginLeft: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: '#111111',
                    }}
                  >
                    +{participantTeams.length - 4}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Team chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {participantTeams.slice(0, 6).map((t: any) => {
              const isMine = myTeam?.id === t.id;
              return (
                <View
                  key={t.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isMine ? '#B8FF3D' : '#F6F7F4',
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginRight: 6,
                    marginBottom: 4,
                  }}
                >
                  {isMine && (
                    <Ionicons
                      name="star"
                      size={9}
                      color="#111111"
                      style={{ marginRight: 3 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#111111',
                    }}
                    numberOfLines={1}
                  >
                    {t.name}
                  </Text>
                </View>
              );
            })}
            {participantTeams.length > 6 && (
              <View
                style={{
                  backgroundColor: '#F6F7F4',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#8A9187',
                  }}
                >
                  +{participantTeams.length - 6}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ============ ACTION ============ */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 4,
        }}
      >
        {isMyTeamJoined ? (
          <View
            style={{
              backgroundColor: '#B8FF3D',
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color="#111111" />
            <Text
              style={{
                color: '#111111',
                fontWeight: '800',
                fontSize: 13,
                marginLeft: 6,
              }}
            >
              Siz qatnashyapsiz
            </Text>
          </View>
        ) : !isOpen ? (
          <View
            style={{
              backgroundColor: '#F6F7F4',
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="lock-closed" size={14} color="#8A9187" />
            <Text
              style={{
                color: '#8A9187',
                fontWeight: '800',
                fontSize: 13,
                marginLeft: 6,
              }}
            >
              Yopiq battle
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleJoin}
            disabled={joining}
            style={{
              backgroundColor: '#111111',
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {joining ? (
              <ActivityIndicator color="#B8FF3D" size="small" />
            ) : (
              <>
                <Text
                  style={{
                    color: '#B8FF3D',
                    fontWeight: '800',
                    fontSize: 13,
                  }}
                >
                  Battle'ga qo'shilish
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#B8FF3D"
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Ionicons name={icon} size={11} color="#8A9187" />
        <Text
          style={{
            fontSize: 9,
            fontWeight: '800',
            color: '#8A9187',
            letterSpacing: 1,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: '#111111',
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function StatDivider() {
  return (
    <View
      style={{
        width: 1,
        backgroundColor: '#ECEFE9',
        marginVertical: 6,
      }}
    />
  );
}

// ============================================
// TEAMS TAB
// ============================================
function TeamsTab({
  sub,
  myTeam,
  teams,
  onLoad,
  showToast,
  onCreateTeam,
}: {
  sub: TeamsSubTab;
  myTeam: any;
  teams: any[];
  onLoad: () => Promise<void>;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
  onCreateTeam: () => void;
}) {
  if (sub === 'my') {
    if (!myTeam) {
      return (
        <EmptyState
          icon="people-outline"
          title="Jamoangiz yo'q"
          subtitle="Jamoa yarating yoki mavjudiga qo'shiling"
          ctaLabel="Jamoa yaratish"
          onCta={onCreateTeam}
        />
      );
    }
    return <MyTeamCard team={myTeam} showToast={showToast} />;
  }

  if (sub === 'discover') {
    if (teams.length === 0) {
      return (
        <EmptyState
          icon="compass-outline"
          title="Jamoalar topilmadi"
          subtitle="Birinchi bo'lib jamoa yarating"
          ctaLabel="Jamoa yaratish"
          onCta={onCreateTeam}
        />
      );
    }
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {teams.map((team) => (
          <TeamListItem
            key={team.id}
            team={team}
            onLoad={onLoad}
            showToast={showToast}
          />
        ))}
      </View>
    );
  }

  if (sub === 'rankings') {
    if (teams.length === 0) {
      return (
        <EmptyState
          icon="trophy-outline"
          title="Reyting bo'sh"
          subtitle="Jamoalar ball yig'ganda reyting paydo bo'ladi"
        />
      );
    }
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {teams.slice(0, 20).map((team, idx) => (
          <View
            key={team.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#ECEFE9',
              padding: 14,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: idx < 3 ? '#B8FF3D' : '#ECEFE9',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: '#111111',
                }}
              >
                {idx + 1}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#111111',
                }}
                numberOfLines={1}
              >
                {team.name}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: '#8A9187',
                  marginTop: 2,
                }}
              >
                {team.memberCount} a'zo
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '800',
                color: '#111111',
              }}
            >
              {team.weeklyScore}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <EmptyState
      icon="mail-outline"
      title="Takliflar yo'q"
      subtitle="Jamoaga takliflar shu yerda ko'rinadi"
    />
  );
}

// ============================================
// EMPTY STATE — PREMIUM
// ============================================
function EmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: '#ECEFE9',
          paddingVertical: 40,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        {/* Layered icon */}
        <View
          style={{
            width: 96,
            height: 96,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {/* Outer ring */}
          <View
            style={{
              position: 'absolute',
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 1,
              borderColor: '#ECEFE9',
            }}
          />
          {/* Middle ring */}
          <View
            style={{
              position: 'absolute',
              width: 76,
              height: 76,
              borderRadius: 38,
              borderWidth: 1,
              borderColor: '#ECEFE9',
              opacity: 0.6,
            }}
          />
          {/* Lime circle */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#B8FF3D',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={26} color="#111111" />
          </View>
        </View>

        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            color: '#111111',
            textAlign: 'center',
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#8A9187',
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 19,
            paddingHorizontal: 8,
          }}
        >
          {subtitle}
        </Text>

        {ctaLabel && onCta && (
          <Pressable
            onPress={onCta}
            style={{
              backgroundColor: '#111111',
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 14,
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={16} color="#B8FF3D" />
            <Text
              style={{
                color: '#B8FF3D',
                fontWeight: '800',
                fontSize: 13,
                marginLeft: 6,
              }}
            >
              {ctaLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ============================================
// MY TEAM CARD
// ============================================
function MyTeamCard({
  team,
  showToast,
}: {
  team: any;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await api.teams.leave();
      setConfirmVisible(false);
      showToast('Jamoadan chiqdingiz', 'success');
    } catch (e: any) {
      showToast(e.message ?? 'Xato', 'error');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* TEAM HERO */}
      <View
        style={{
          backgroundColor: '#111111',
          borderRadius: 24,
          padding: 20,
        }}
      >
        <View className="flex-row items-center justify-between mb-5">
          <View
            style={{
              backgroundColor: '#B8FF3D',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: '#111111',
                letterSpacing: 0.3,
              }}
            >
              #{team.rank} O'RIN
            </Text>
          </View>
          {team.myRole === 'captain' && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="star" size={10} color="#B8FF3D" />
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '800',
                  color: '#B8FF3D',
                  marginLeft: 4,
                  letterSpacing: 0.5,
                }}
              >
                KAPITAN
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.3,
          }}
        >
          {team.name}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {team.city} · {team.memberCount} a'zo
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 18, gap: 8 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 9,
                fontWeight: '800',
                letterSpacing: 1,
              }}
            >
              HAFTALIK
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {team.weeklyScore}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#B8FF3D',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: 'rgba(0,0,0,0.6)',
                fontSize: 9,
                fontWeight: '800',
                letterSpacing: 1,
              }}
            >
              SIZNING
            </Text>
            <Text
              style={{
                color: '#111111',
                fontSize: 22,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {team.myContribution}
            </Text>
          </View>
        </View>
      </View>

      {/* MEMBERS */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: '#111111',
          marginTop: 20,
          marginBottom: 10,
          letterSpacing: -0.2,
        }}
      >
        Eng faol a'zolar
      </Text>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#ECEFE9',
          overflow: 'hidden',
        }}
      >
        {team.topMembers.slice(0, 5).map((m: any, idx: number) => (
          <View key={m.id}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: idx === 0 ? '#B8FF3D' : '#ECEFE9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: '#111111',
                  }}
                >
                  {idx + 1}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: '#111111',
                  fontWeight: '600',
                }}
                numberOfLines={1}
              >
                {m.fullName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: '#111111',
                }}
              >
                {m.weeklyContribution}
              </Text>
            </View>
            {idx < team.topMembers.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: '#ECEFE9',
                  marginLeft: 54,
                }}
              />
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => setConfirmVisible(true)}
        disabled={leaving}
        style={{
          marginTop: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(229,72,77,0.2)',
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#E5484D',
            fontWeight: '800',
            fontSize: 13,
          }}
        >
          Jamoadan chiqish
        </Text>
      </Pressable>

      {/* CONFIRM MODAL */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#111111',
                textAlign: 'center',
              }}
            >
              Jamoadan chiqish?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#8A9187',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Bu amalni qaytarib bo'lmaydi
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#F6F7F4',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#111111',
                    fontWeight: '800',
                    fontSize: 13,
                  }}
                >
                  Bekor
                </Text>
              </Pressable>
              <Pressable
                onPress={handleLeave}
                disabled={leaving}
                style={{
                  flex: 1,
                  backgroundColor: '#E5484D',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                {leaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: 13,
                    }}
                  >
                    Chiqish
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// TEAM LIST ITEM
// ============================================
function TeamListItem({
  team,
  onLoad,
  showToast,
}: {
  team: any;
  onLoad: () => Promise<void>;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
}) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await api.teams.join(team.id);
      await onLoad();
      showToast("Qo'shildingiz", 'success');
    } catch (e: any) {
      showToast(e.message ?? 'Xato', 'error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ECEFE9',
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: '#ECEFE9',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '800',
            color: '#111111',
          }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#111111',
          }}
          numberOfLines={1}
        >
          {team.name}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: '#8A9187',
            marginTop: 2,
          }}
        >
          {team.memberCount} a'zo · {team.weeklyScore} SHT
        </Text>
      </View>
      <Pressable
        onPress={handleJoin}
        disabled={joining}
        style={{
          backgroundColor: '#B8FF3D',
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        {joining ? (
          <ActivityIndicator color="#111111" size="small" />
        ) : (
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: '#111111',
            }}
          >
            Qo'shilish
          </Text>
        )}
      </Pressable>
    </View>
  );
}

// ============================================
// CREATE TEAM MODAL
// ============================================
function CreateTeamModal({
  visible,
  onClose,
  onSuccess,
  showToast,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
}) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [creating, setCreating] = useState(false);

  const [regionModal, setRegionModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);

  const selectedRegion = REGIONS.find((r) => r.id === region);
  const districts = selectedRegion?.districts ?? [];

  const reset = () => {
    setName('');
    setTag('');
    setRegion(null);
    setDistrict(null);
    setAgeConfirmed(false);
  };

  const handleCreate = async () => {
    if (name.length < 2) return showToast('Jamoa nomini kiriting', 'error');
    if (!region) return showToast('Viloyatni tanlang', 'error');
    if (!district) return showToast('Tumanni tanlang', 'error');
    if (!ageConfirmed) return showToast('Yoshni tasdiqlang', 'error');

    setCreating(true);
    try {
      await api.teams.create({
        name,
        type: 'office',
        city: `${selectedRegion?.name}, ${district}`,
      });
      reset();
      showToast('Jamoa yaratildi', 'success');
      onSuccess();
    } catch (e: any) {
      showToast(e.message ?? 'Xato', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: '92%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#ECEFE9',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#111111',
                    letterSpacing: -0.3,
                  }}
                >
                  Yangi jamoa
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8A9187',
                    marginTop: 2,
                  }}
                >
                  Ma'lumotlarni to'ldiring
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  reset();
                  onClose();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#F6F7F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#111111" />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
              <FormField label="Jamoa nomi" required>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Masalan: IT Park Frontend"
                  placeholderTextColor="#8A9187"
                  maxLength={50}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    height: 52,
                    fontSize: 15,
                    color: '#111111',
                  }}
                />
              </FormField>

              <FormField label="Qisqa nom (tag)">
                <TextInput
                  value={tag}
                  onChangeText={(t) =>
                    setTag(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))
                  }
                  placeholder="ITP"
                  placeholderTextColor="#8A9187"
                  maxLength={4}
                  autoCapitalize="characters"
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    height: 52,
                    fontSize: 15,
                    color: '#111111',
                    letterSpacing: 2,
                  }}
                />
              </FormField>

              <FormField label="Viloyat" required>
                <Pressable
                  onPress={() => setRegionModal(true)}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: region ? '#111111' : '#8A9187',
                    }}
                  >
                    {selectedRegion?.name ?? 'Viloyatni tanlang'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#8A9187" />
                </Pressable>
              </FormField>

              <FormField label="Tuman / shahar" required>
                <Pressable
                  onPress={() => {
                    if (!region) {
                      return showToast('Avval viloyatni tanlang', 'error');
                    }
                    setDistrictModal(true);
                  }}
                  style={{
                    backgroundColor: region ? '#F6F7F4' : '#ECEFE9',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: region ? 1 : 0.5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: district ? '#111111' : '#8A9187',
                    }}
                  >
                    {district ?? 'Tumanni tanlang'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#8A9187" />
                </Pressable>
              </FormField>

              <Pressable
                onPress={() => setAgeConfirmed(!ageConfirmed)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  padding: 16,
                  backgroundColor: '#F6F7F4',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#ECEFE9',
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: ageConfirmed ? '#B8FF3D' : '#DDE1D9',
                    backgroundColor: ageConfirmed ? '#B8FF3D' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {ageConfirmed && (
                    <Ionicons name="checkmark" size={16} color="#111111" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#111111',
                    }}
                  >
                    Yoshimni tasdiqlayman
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8A9187',
                      marginTop: 2,
                    }}
                  >
                    Men 14 yoshdan katta va qoidalarga roziman
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleCreate}
                disabled={creating}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: 16,
                  height: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 24,
                }}
              >
                {creating ? (
                  <ActivityIndicator color="#B8FF3D" />
                ) : (
                  <Text
                    style={{
                      color: '#B8FF3D',
                      fontWeight: '800',
                      fontSize: 15,
                    }}
                  >
                    Jamoa yaratish
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      <PickerModal
        visible={regionModal}
        title="Viloyatni tanlang"
        items={REGIONS.map((r) => ({ id: r.id, label: r.name }))}
        onSelect={(id) => {
          setRegion(id);
          setDistrict(null);
          setRegionModal(false);
        }}
        onClose={() => setRegionModal(false)}
      />

      <PickerModal
        visible={districtModal}
        title={selectedRegion?.name ?? 'Tumanni tanlang'}
        items={districts.map((d) => ({ id: d, label: d }))}
        onSelect={(id) => {
          setDistrict(id);
          setDistrictModal(false);
        }}
        onClose={() => setDistrictModal(false)}
      />
    </Modal>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: '#4B5148',
          marginBottom: 8,
        }}
      >
        {label} {required && <Text style={{ color: '#E5484D' }}>*</Text>}
      </Text>
      {children}
    </View>
  );
}

// ============================================
// CREATE BATTLE MODAL — 3 STEP WIZARD
// ============================================
function CreateBattleModal({
  visible,
  myTeam,
  teams,
  onClose,
  onCreateTeam,
  onSuccess,
  showToast,
}: {
  visible: boolean;
  myTeam: any;
  teams: any[];
  onClose: () => void;
  onCreateTeam: () => void;
  onSuccess: () => void;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [battleType, setBattleType] = useState<string | null>(null);
  const [useMyTeam, setUseMyTeam] = useState(true);
  const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const [goal, setGoal] = useState('eco_points');
  const [duration, setDuration] = useState('7');
  const [customDuration, setCustomDuration] = useState('');
  const [entry, setEntry] = useState('open');

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardFormVisible, setRewardFormVisible] = useState(false);
  const [rewardViewVisible, setRewardViewVisible] = useState(false);

  const availableOpponents = teams.filter((t) => t.id !== myTeam?.id);

  const reset = () => {
    setStep(1);
    setBattleType(null);
    setUseMyTeam(true);
    setSelectedOpponents([]);
    setGoal('eco_points');
    setDuration('7');
    setCustomDuration('');
    setEntry('open');
    setRewards([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleOpponent = (id: string) => {
    setSelectedOpponents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canProceedStep2 = useMyTeam ? selectedOpponents.length >= 1 : false;

  const handleCreateBattle = async () => {
    if (!battleType) return showToast('Battle turini tanlang', 'error');
    if (rewards.length === 0)
      return showToast("Kamida 1 ta mukofot qo'shing", 'error');

    const dur =
      duration === 'custom'
        ? parseInt(customDuration || '0', 10)
        : parseInt(duration, 10);

    if (!dur || dur <= 0)
      return showToast("Muddatni to'g'ri kiriting", 'error');

    setCreating(true);
    try {
      const teamName = myTeam?.name ?? 'Battle';
      await api.battles.create({
        title: `${teamName} — ${battleType}`,
        type: battleType,
        goal,
        durationDays: dur,
        entry,
        rewards,
        participants: myTeam
          ? [myTeam.id, ...selectedOpponents]
          : selectedOpponents,
      });
      reset();
      onSuccess();
    } catch (e: any) {
      showToast(e.message ?? 'Xato', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '92%',
          }}
        >
          {/* HEADER */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#ECEFE9',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: '#8A9187',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {step} / 3 qadam
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#111111',
                    marginTop: 2,
                    letterSpacing: -0.3,
                  }}
                >
                  Battle yaratish
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#F6F7F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#111111" />
              </Pressable>
            </View>

            {/* PROGRESS BAR */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: s <= step ? '#B8FF3D' : '#ECEFE9',
                  }}
                />
              ))}
            </View>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {/* ============ STEP 1 ============ */}
            {step === 1 && (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#4B5148',
                    marginBottom: 12,
                  }}
                >
                  Battle turini tanlang
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginRight: -8,
                  }}
                >
                  {BATTLE_TYPES.map((t) => {
                    const selected = battleType === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => {
                          setBattleType(t.id);
                          setStep(2);
                        }}
                        style={{
                          width: '48%',
                          marginRight: '2%',
                          marginBottom: 10,
                          backgroundColor: selected ? '#111111' : '#FFFFFF',
                          borderWidth: 1.5,
                          borderColor: selected ? '#111111' : '#ECEFE9',
                          borderRadius: 18,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: selected ? '#B8FF3D' : '#F6F7F4',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                          }}
                        >
                          <Ionicons
                            name={t.icon}
                            size={20}
                            color="#111111"
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '800',
                            color: selected ? '#B8FF3D' : '#111111',
                          }}
                        >
                          {t.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: selected
                              ? 'rgba(255,255,255,0.5)'
                              : '#8A9187',
                            marginTop: 2,
                          }}
                          numberOfLines={2}
                        >
                          {t.desc}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* ============ STEP 2 ============ */}
            {step === 2 && (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#4B5148',
                    marginBottom: 12,
                  }}
                >
                  Ishtirokchilarni tanlang
                </Text>

                {!myTeam ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(184,255,61,0.15)',
                      borderRadius: 20,
                      padding: 20,
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="people-outline" size={32} color="#111111" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: '#111111',
                        marginTop: 12,
                      }}
                    >
                      Avval jamoa yarating
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#4B5148',
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                    >
                      Team Battle uchun jamoa kerak
                    </Text>
                    <Pressable
                      onPress={onCreateTeam}
                      style={{
                        backgroundColor: '#111111',
                        borderRadius: 12,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        marginTop: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: '#B8FF3D',
                          fontWeight: '800',
                          fontSize: 13,
                        }}
                      >
                        Jamoa yaratish
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '800',
                        color: '#8A9187',
                        letterSpacing: 1.2,
                        marginBottom: 8,
                      }}
                    >
                      SIZNING JAMOANGIZ
                    </Text>
                    <Pressable
                      onPress={() => setUseMyTeam(!useMyTeam)}
                      style={{
                        backgroundColor: useMyTeam ? '#B8FF3D' : '#FFFFFF',
                        borderWidth: 1.5,
                        borderColor: useMyTeam ? '#B8FF3D' : '#ECEFE9',
                        borderRadius: 18,
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#111111',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '800',
                            color: '#B8FF3D',
                          }}
                        >
                          {myTeam.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '800',
                            color: '#111111',
                          }}
                        >
                          {myTeam.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: 'rgba(0,0,0,0.5)',
                            marginTop: 2,
                          }}
                        >
                          {myTeam.memberCount} a'zo
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: '#111111',
                          backgroundColor: useMyTeam ? '#111111' : '#FFFFFF',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {useMyTeam && (
                          <Ionicons name="checkmark" size={16} color="#B8FF3D" />
                        )}
                      </View>
                    </Pressable>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: '#8A9187',
                          letterSpacing: 1.2,
                        }}
                      >
                        RAQIBLAR
                      </Text>
                      {selectedOpponents.length > 0 && (
                        <View
                          style={{
                            backgroundColor: '#111111',
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '800',
                              color: '#B8FF3D',
                            }}
                          >
                            {selectedOpponents.length} tanlandi
                          </Text>
                        </View>
                      )}
                    </View>

                    {availableOpponents.length === 0 ? (
                      <View
                        style={{
                          backgroundColor: '#F6F7F4',
                          borderRadius: 18,
                          padding: 20,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#ECEFE9',
                        }}
                      >
                        <Ionicons
                          name="search-outline"
                          size={24}
                          color="#8A9187"
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: '#111111',
                            marginTop: 8,
                            textAlign: 'center',
                          }}
                        >
                          Boshqa jamoalar yo'q
                        </Text>
                      </View>
                    ) : (
                      availableOpponents.map((team) => {
                        const selected = selectedOpponents.includes(team.id);
                        return (
                          <Pressable
                            key={team.id}
                            onPress={() => toggleOpponent(team.id)}
                            style={{
                              backgroundColor: selected ? '#111111' : '#FFFFFF',
                              borderWidth: 1.5,
                              borderColor: selected ? '#111111' : '#ECEFE9',
                              borderRadius: 16,
                              padding: 14,
                              marginBottom: 8,
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: selected
                                  ? '#B8FF3D'
                                  : '#ECEFE9',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '800',
                                  color: '#111111',
                                }}
                              >
                                {team.name.slice(0, 2).toUpperCase()}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '800',
                                  color: selected ? '#FFFFFF' : '#111111',
                                }}
                                numberOfLines={1}
                              >
                                {team.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: selected
                                    ? 'rgba(255,255,255,0.5)'
                                    : '#8A9187',
                                  marginTop: 2,
                                }}
                              >
                                {team.memberCount} a'zo · {team.weeklyScore} SHT
                              </Text>
                            </View>
                            <View
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 7,
                                borderWidth: 2,
                                borderColor: selected ? '#B8FF3D' : '#DDE1D9',
                                backgroundColor: selected
                                  ? '#B8FF3D'
                                  : '#FFFFFF',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {selected && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color="#111111"
                                />
                              )}
                            </View>
                          </Pressable>
                        );
                      })
                    )}

                    <Pressable
                      onPress={() => {
                        if (!canProceedStep2) {
                          showToast('Kamida 1 ta raqib tanlang', 'error');
                          return;
                        }
                        setStep(3);
                      }}
                      disabled={!canProceedStep2}
                      style={{
                        backgroundColor: canProceedStep2
                          ? '#111111'
                          : '#ECEFE9',
                        borderRadius: 16,
                        height: 56,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 20,
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '800',
                          color: canProceedStep2 ? '#B8FF3D' : '#8A9187',
                        }}
                      >
                        Keyingi qadam
                      </Text>
                      {canProceedStep2 && (
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color="#B8FF3D"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </Pressable>
                  </>
                )}
              </>
            )}

            {/* ============ STEP 3 ============ */}
            {step === 3 && (
              <>
                {/* MAQSAD */}
                <FormField label="Battle maqsadi">
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginRight: -8,
                    }}
                  >
                    {GOALS.map((g) => {
                      const active = goal === g.key;
                      return (
                        <Pressable
                          key={g.key}
                          onPress={() => setGoal(g.key)}
                          style={{
                            marginRight: 8,
                            marginBottom: 8,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: active ? '#111111' : '#ECEFE9',
                            backgroundColor: active ? '#111111' : '#FFFFFF',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Ionicons
                            name={g.icon}
                            size={14}
                            color={active ? '#B8FF3D' : '#111111'}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '800',
                              color: active ? '#B8FF3D' : '#111111',
                              marginLeft: 6,
                            }}
                          >
                            {g.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </FormField>

                {/* MUDDAT */}
                <FormField label="Muddat">
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {DURATIONS.map((d) => {
                      const active = duration === d.key;
                      return (
                        <Pressable
                          key={d.key}
                          onPress={() => setDuration(d.key)}
                          style={{
                            marginRight: 8,
                            marginBottom: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: active ? '#111111' : '#ECEFE9',
                            backgroundColor: active ? '#111111' : '#FFFFFF',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '800',
                              color: active ? '#B8FF3D' : '#111111',
                            }}
                          >
                            {d.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {duration === 'custom' && (
                    <View
                      style={{
                        backgroundColor: '#F6F7F4',
                        borderWidth: 1,
                        borderColor: '#ECEFE9',
                        borderRadius: 14,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 52,
                        marginTop: 8,
                      }}
                    >
                      <TextInput
                        value={customDuration}
                        onChangeText={(t) =>
                          setCustomDuration(
                            t.replace(/[^0-9]/g, '').slice(0, 3)
                          )
                        }
                        placeholder="Necha kun?"
                        placeholderTextColor="#8A9187"
                        keyboardType="number-pad"
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: '#111111',
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#8A9187',
                          fontWeight: '600',
                        }}
                      >
                        kun
                      </Text>
                    </View>
                  )}
                </FormField>

                {/* KIRISH */}
                <FormField label="Kirish turi">
                  <View style={{ flexDirection: 'row' }}>
                    {ENTRIES.map((e) => {
                      const active = entry === e.key;
                      return (
                        <Pressable
                          key={e.key}
                          onPress={() => setEntry(e.key)}
                          style={{
                            marginRight: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: active ? '#111111' : '#ECEFE9',
                            backgroundColor: active ? '#111111' : '#FFFFFF',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '800',
                              color: active ? '#B8FF3D' : '#111111',
                            }}
                          >
                            {e.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </FormField>

                {/* MUKOFOTLAR */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#4B5148',
                    }}
                  >
                    Mukofotlar
                  </Text>
                  {rewards.length > 0 && (
                    <View
                      style={{
                        backgroundColor: '#B8FF3D',
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color: '#111111',
                        }}
                      >
                        {rewards.length} dona
                      </Text>
                    </View>
                  )}
                </View>

                {rewards.length === 0 ? (
                  <Pressable
                    onPress={() => setRewardFormVisible(true)}
                    style={{
                      backgroundColor: '#F6F7F4',
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      borderColor: '#DDE1D9',
                      borderRadius: 20,
                      paddingVertical: 32,
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#B8FF3D',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <Ionicons name="add" size={24} color="#111111" />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: '#111111',
                      }}
                    >
                      Mukofot qo'shish
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8A9187',
                        marginTop: 4,
                      }}
                    >
                      Rasm va nom kiriting
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#ECEFE9',
                        borderRadius: 18,
                        overflow: 'hidden',
                      }}
                    >
                      {rewards.map((r, idx) => (
                        <View key={r.id}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 12,
                            }}
                          >
                            <Image
                              source={{ uri: r.imageBase64 }}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 12,
                                backgroundColor: '#ECEFE9',
                              }}
                              resizeMode="cover"
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '800',
                                  color: '#111111',
                                }}
                                numberOfLines={1}
                              >
                                {r.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: '#8A9187',
                                  marginTop: 2,
                                }}
                              >
                                Mukofot #{idx + 1}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() =>
                                setRewards((prev) =>
                                  prev.filter((x) => x.id !== r.id)
                                )
                              }
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: 'rgba(229,72,77,0.1)',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={15}
                                color="#E5484D"
                              />
                            </Pressable>
                          </View>
                          {idx < rewards.length - 1 && (
                            <View
                              style={{
                                height: 1,
                                backgroundColor: '#ECEFE9',
                                marginLeft: 74,
                              }}
                            />
                          )}
                        </View>
                      ))}
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <Pressable
                        onPress={() => setRewardFormVisible(true)}
                        style={{
                          flex: 1,
                          backgroundColor: '#F6F7F4',
                          borderWidth: 1,
                          borderColor: '#ECEFE9',
                          borderRadius: 14,
                          paddingVertical: 12,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="add" size={16} color="#111111" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '800',
                            color: '#111111',
                            marginLeft: 4,
                          }}
                        >
                          Qo'shish
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setRewardViewVisible(true)}
                        style={{
                          flex: 1,
                          backgroundColor: '#111111',
                          borderRadius: 14,
                          paddingVertical: 12,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="eye" size={15} color="#B8FF3D" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '800',
                            color: '#B8FF3D',
                            marginLeft: 6,
                          }}
                        >
                          Ko'rish
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}

                {/* ISHTIROKCHILAR */}
                {selectedOpponents.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: '#4B5148',
                        marginBottom: 8,
                      }}
                    >
                      Ishtirokchilar
                    </Text>
                    <View
                      style={{
                        backgroundColor: '#F6F7F4',
                        borderRadius: 14,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: '#ECEFE9',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#B8FF3D',
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: '#111111',
                            flex: 1,
                            fontWeight: '600',
                          }}
                        >
                          {myTeam?.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '800',
                            color: '#8A9187',
                            letterSpacing: 1,
                          }}
                        >
                          SIZ
                        </Text>
                      </View>
                      {selectedOpponents.map((id) => {
                        const t = teams.find((x) => x.id === id);
                        if (!t) return null;
                        return (
                          <View
                            key={id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 4,
                            }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#111111',
                                marginRight: 8,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                color: '#111111',
                                flex: 1,
                              }}
                            >
                              {t.name}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* CREATE BATTLE */}
                <Pressable
                  onPress={handleCreateBattle}
                  disabled={creating}
                  style={{
                    backgroundColor: '#111111',
                    borderRadius: 16,
                    height: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 24,
                  }}
                >
                  {creating ? (
                    <ActivityIndicator color="#B8FF3D" />
                  ) : (
                    <Text
                      style={{
                        color: '#B8FF3D',
                        fontWeight: '800',
                        fontSize: 15,
                      }}
                    >
                      Battle yaratish
                    </Text>
                  )}
                </Pressable>
              </>
            )}

            {step > 1 && (
              <Pressable
                onPress={() => setStep((step - 1) as 1 | 2 | 3)}
                style={{
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#8A9187',
                    fontWeight: '600',
                  }}
                >
                  ← Orqaga
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>

      <RewardFormModal
        visible={rewardFormVisible}
        onClose={() => setRewardFormVisible(false)}
        onSave={(reward) => {
          setRewards((prev) => [...prev, reward]);
          setRewardFormVisible(false);
          showToast("Mukofot qo'shildi", 'success');
        }}
        showToast={showToast}
      />

      <RewardViewModal
        visible={rewardViewVisible}
        rewards={rewards}
        onClose={() => setRewardViewVisible(false)}
      />
    </Modal>
  );
}

// ============================================
// REWARD FORM MODAL
// ============================================
function RewardFormModal({
  visible,
  onClose,
  onSave,
  showToast,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (reward: Reward) => void;
  showToast: (m: string, t?: 'error' | 'success' | 'info') => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');

  const reset = () => {
    setImage(null);
    setName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Galereyaga ruxsat bering', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!result.canceled && result.assets[0]?.base64) {
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleSave = () => {
    if (!image) return showToast('Rasm yuklang', 'error');
    if (name.length < 2) return showToast('Mukofot nomini kiriting', 'error');
    onSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      imageBase64: image,
      name,
    });
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 420,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#ECEFE9',
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: '#111111',
                }}
              >
                Mukofot qo'shish
              </Text>
              <Pressable
                onPress={handleClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F6F7F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#111111" />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#4B5148',
                  marginBottom: 8,
                }}
              >
                Mukofot rasmi
              </Text>
              <Pressable
                onPress={pickImage}
                style={{
                  backgroundColor: '#F6F7F4',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#DDE1D9',
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  height: 180,
                  overflow: 'hidden',
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#B8FF3D',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name="image" size={26} color="#111111" />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: '#111111',
                      }}
                    >
                      Rasm tanlash
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8A9187',
                        marginTop: 4,
                      }}
                    >
                      Galereyadan
                    </Text>
                  </>
                )}
              </Pressable>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#4B5148',
                  marginBottom: 8,
                }}
              >
                Mukofot nomi
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder='Masalan: MacBook Air 15" 256GB Silver'
                placeholderTextColor="#8A9187"
                maxLength={100}
                multiline
                style={{
                  backgroundColor: '#F6F7F4',
                  borderWidth: 1,
                  borderColor: '#ECEFE9',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: '#111111',
                  minHeight: 52,
                }}
              />

              <Pressable
                onPress={handleSave}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: 14,
                  height: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    color: '#B8FF3D',
                    fontWeight: '800',
                    fontSize: 14,
                  }}
                >
                  Qo'shish
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// REWARD VIEW MODAL
// ============================================
function RewardViewModal({
  visible,
  rewards,
  onClose,
}: {
  visible: boolean;
  rewards: Reward[];
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '85%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#ECEFE9',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#111111',
                  letterSpacing: -0.3,
                }}
              >
                Mukofotlar
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: '#8A9187',
                  marginTop: 2,
                }}
              >
                {rewards.length} dona
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F6F7F4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={20} color="#111111" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            {rewards.map((r, idx) => (
              <View
                key={r.id}
                style={{
                  backgroundColor: '#F6F7F4',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#ECEFE9',
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <Image
                  source={{ uri: r.imageBase64 }}
                  style={{ width: '100%', height: 220 }}
                  resizeMode="cover"
                />
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: '#8A9187',
                      letterSpacing: 1.2,
                    }}
                  >
                    MUKOFOT #{idx + 1}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: '#111111',
                      marginTop: 4,
                    }}
                  >
                    {r.name}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// PICKER MODAL
// ============================================
function PickerModal({
  visible,
  title,
  items,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: { id: string; label: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '80%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#111111',
                letterSpacing: -0.3,
              }}
            >
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F6F7F4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color="#111111" />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <View
              style={{
                backgroundColor: '#F6F7F4',
                borderWidth: 1,
                borderColor: '#ECEFE9',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                height: 44,
              }}
            >
              <Ionicons name="search" size={18} color="#8A9187" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Qidirish..."
                placeholderTextColor="#8A9187"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 15,
                  color: '#111111',
                }}
              />
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item.id);
                  setSearch('');
                }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: '#111111',
                    flex: 1,
                  }}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#8A9187" />
              </Pressable>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: '#ECEFE9',
                  marginLeft: 20,
                }}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ fontSize: 13, color: '#8A9187' }}>
                  Hech narsa topilmadi
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}