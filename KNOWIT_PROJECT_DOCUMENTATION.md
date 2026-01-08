# 📚 KnowIt - Documentation Projet Complète

> **Documentation optimisée pour Claude AI**  
> Version 1.0 | Dernière mise à jour: Janvier 2026

---

## 🎯 CONTEXTE & OBJECTIF DU PROJET

### Vue d'ensemble
**KnowIt** est une application mobile de mémorisation et d'apprentissage qui révolutionne le concept des flashcards traditionnelles en utilisant l'IA et l'enregistrement vocal.

### Proposition de valeur
- **Apprentissage actif** : L'utilisateur parle pour expliquer un concept (au lieu de simplement lire)
- **Feedback IA en temps réel** : Analyse automatique de la réponse avec points forts, corrections et éléments manquants
- **Rétention améliorée** : La verbalisation active + feedback immédiat renforce la mémorisation

### Fonctionnalités principales
1. **Gestion de Topics** : Organisation par thèmes (ex: "Java OOP", "Anatomie Humaine")
2. **Sessions vocales** : Enregistrement audio de l'utilisateur expliquant un concept
3. **Analyse IA** : Transcription (STT via Whisper) + Analyse sémantique (LLM via GPT-4)
4. **Historique** : Suivi des sessions avec progression visible
5. **Design immersif** : Interface glassmorphism avec effets LED/néon réactifs

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack technologique

#### Frontend Mobile
```yaml
Framework: React Native (Expo SDK 52)
Language: TypeScript (strict mode)
Navigation: Expo Router (file-based)
State Management: Zustand (global state)
Styling: StyleSheet + React Native (pas de styled-components)
UI Pattern: MVVM avec Custom Hooks
Animations: react-native-reanimated + Skia
Icons: lucide-react-native
Storage: AsyncStorage (@react-native-async-storage)
Audio: expo-av
```

#### Backend/IA (à intégrer)
```yaml
STT (Speech-to-Text): OpenAI Whisper API
LLM (Analyse): OpenAI GPT-4 / Claude API
```

### Principes architecturaux OBLIGATOIRES

#### 1. Separation of Concerns (SoC)
```
Vue (.tsx)         → UI pure, zéro logique
Hook (.ts)         → Logique métier, états, handlers
Service (.ts)      → Appels API, I/O
Repository (.ts)   → Abstraction data layer
Store (Zustand)    → État global partagé
Styles (.styles.ts)→ Styles isolés important le theme
```

#### 2. MVVM Pattern (Mandatory)
- **Model** : Types TypeScript dans `/types`
- **View** : Composants `.tsx` purement déclaratifs
- **ViewModel** : Custom Hooks `useNomDuComposant.ts`

**RÈGLE CRITIQUE** : Un composant complexe `.tsx` NE DOIT JAMAIS contenir :
- `useEffect` avec logique métier
- `useState` pour états complexes
- Appels API directs
- Logique conditionnelle métier (> 5 lignes)

✅ **BON EXEMPLE**
```tsx
// features/topics/screens/TopicsScreen.tsx
export function TopicsScreen() {
  const { topics, isLoading, handleAddTopic, handleDeleteTopic } = useTopics();
  
  return (
    <GlassView>
      {topics.map(topic => (
        <TopicCard key={topic.id} topic={topic} onDelete={handleDeleteTopic} />
      ))}
    </GlassView>
  );
}
```

❌ **MAUVAIS EXEMPLE**
```tsx
// ❌ NE JAMAIS FAIRE ÇA
export function TopicsScreen() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetch('/api/topics'); // ❌ Appel direct
      setTopics(data); // ❌ Logique dans la vue
      setLoading(false);
    }
    load();
  }, []);
  
  // ❌ Logique métier dans la vue
  const handleAdd = () => {
    const newTopic = { id: Date.now(), title: 'New' };
    setTopics([...topics, newTopic]);
    AsyncStorage.setItem('topics', JSON.stringify([...topics, newTopic]));
  };
  
  return <View>...</View>;
}
```

#### 3. Styling Pattern
- **INTERDIT** : Styles inline `style={{...}}`
- **INTERDIT** : `StyleSheet.create` dans le fichier `.tsx`
- **OBLIGATOIRE** : Fichier adjacent `.styles.ts` important les tokens du theme

```typescript
// features/topics/components/TopicCard/TopicCard.styles.ts
import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, Typography } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: GlassColors.surface.light,
    borderRadius: 16,
  },
  title: {
    ...Typography.heading.h3,
    color: GlassColors.text.primary,
  },
});
```

#### 4. Data Layer
```
UI Component (.tsx)
     ↓ appelle
Custom Hook (.ts)
     ↓ appelle
Service/Repository (.ts)
     ↓ appelle
API externe / AsyncStorage
```

**JAMAIS de saut de couche** : une vue ne doit pas appeler directement un Service.

---

## 📁 STRUCTURE DES DOSSIERS

```
knowit/
├── app/                          # Expo Router (Navigation)
│   ├── _layout.tsx              # Root Layout (Welcome + Stack Navigator)
│   ├── index.tsx                # Home Screen (Liste des topics)
│   ├── [topicId]/
│   │   ├── index.tsx            # Topic Detail (Historique sessions)
│   │   ├── session.tsx          # Session Recording (Modal)
│   │   └── result.tsx           # Analyse Result (Modal)
│
├── features/                     # Feature-based modules (Screaming Architecture)
│   ├── app-shell/               # Shell principal (Welcome flow)
│   │   ├── hooks/
│   │   │   └── useAppShell.ts
│   │   └── index.ts
│   │
│   ├── welcome/                 # Écran d'accueil animé
│   │   ├── components/
│   │   │   └── LedOrb/
│   │   ├── screens/
│   │   │   └── WelcomeScreen.tsx
│   │   └── hooks/
│   │       └── useWelcome.ts
│   │
│   ├── topics/                  # Gestion des topics
│   │   ├── components/
│   │   │   ├── TopicCard/
│   │   │   │   ├── TopicCard.tsx
│   │   │   │   └── TopicCard.styles.ts
│   │   │   └── AddTopicModal/
│   │   ├── screens/
│   │   │   └── TopicsScreen.tsx
│   │   └── hooks/
│   │       └── useTopics.ts
│   │
│   ├── topic-detail/            # Détail d'un topic + historique
│   │   ├── components/
│   │   │   └── SessionCard/
│   │   ├── screens/
│   │   │   └── TopicDetailScreen.tsx
│   │   └── hooks/
│   │       └── useTopicDetail.ts
│   │
│   ├── session/                 # Enregistrement vocal
│   │   ├── components/
│   │   │   ├── RecordButton/
│   │   │   └── AudioVisualizer/
│   │   ├── screens/
│   │   │   └── SessionScreen.tsx
│   │   └── hooks/
│   │       ├── useSession.ts
│   │       ├── useSessionWithAudio.ts  # Version avec audio réel
│   │       └── useAudioRecording.ts     # Gestion expo-av
│   │
│   ├── result/                  # Affichage résultats analyse
│   │   ├── components/
│   │   │   └── AnalysisSection/
│   │   ├── screens/
│   │   │   └── ResultScreen.tsx
│   │   └── hooks/
│   │       └── useResult.ts
│   │
│   └── index.ts                 # Barrel export de toutes les features
│
├── shared/                      # Code partagé réutilisable
│   ├── components/              # Composants UI génériques
│   │   ├── GlassView/
│   │   │   ├── GlassView.tsx
│   │   │   └── GlassView.styles.ts
│   │   ├── IconButton/
│   │   └── index.ts
│   │
│   ├── services/                # Services métier (API, I/O)
│   │   ├── LLMService.ts       # Whisper STT + GPT-4 Analysis
│   │   ├── StorageService.ts   # AsyncStorage wrapper
│   │   └── RecordingService.ts # [À créer] Gestion enregistrement
│   │
│   └── hooks/                   # Hooks utilitaires
│       └── useAnimatedValue.ts
│
├── store/                       # État global (Zustand)
│   └── useStore.ts             # Store unique pour Topics + Sessions
│
├── types/                       # Définitions TypeScript
│   ├── topic.types.ts
│   ├── session.types.ts
│   └── index.ts
│
├── theme/                       # Design System
│   ├── colors.ts               # Palette glassmorphism
│   ├── typography.ts           # Styles de texte
│   ├── spacing.ts              # Échelle d'espacement
│   └── index.ts
│
├── assets/                      # Images, fonts, audio
│   ├── fonts/
│   └── images/
│
└── app.json                     # Config Expo
```

### Conventions de nommage

#### Fichiers
- **Composants** : `PascalCase.tsx` (ex: `TopicCard.tsx`)
- **Hooks** : `useCamelCase.ts` (ex: `useTopics.ts`)
- **Services** : `PascalCaseService.ts` (ex: `LLMService.ts`)
- **Styles** : `PascalCase.styles.ts` (ex: `TopicCard.styles.ts`)
- **Types** : `kebab-case.types.ts` (ex: `session.types.ts`)

#### Code
- **Composants** : `PascalCase` (ex: `TopicCard`)
- **Fonctions/Variables** : `camelCase` (ex: `handleAddTopic`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `MAX_RECORDING_TIME`)
- **Types/Interfaces** : `PascalCase` (ex: `Topic`, `UseTopicsReturn`)

---

## 🎨 DESIGN SYSTEM

### Theme Colors (Glassmorphism)
```typescript
// theme/colors.ts
export const GlassColors = {
  // Gradients de fond
  gradient: {
    start: '#0a0a1f',    // Bleu nuit très sombre
    middle: '#1a1a3e',   // Bleu nuit
    end: '#2a1a4e',      // Violet profond
  },
  
  // Surfaces glass
  surface: {
    light: 'rgba(255, 255, 255, 0.08)',    // Glass clair
    medium: 'rgba(255, 255, 255, 0.12)',   // Glass moyen
    dark: 'rgba(0, 0, 0, 0.2)',            // Glass sombre
  },
  
  // Textes
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Accents (effets néon)
  accent: {
    primary: '#00D9FF',      // Cyan électrique
    secondary: '#B84DFF',    // Violet néon
    tertiary: '#FF6B9D',     // Rose néon
  },
  
  // États sémantiques
  status: {
    success: '#00FF88',      // Vert néon
    warning: '#FFD700',      // Or
    error: '#FF4757',        // Rouge néon
    info: '#00D9FF',
  },
};
```

### Typography
```typescript
export const Typography = {
  heading: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  },
  body: {
    large: { fontSize: 18, fontWeight: '400', lineHeight: 26 },
    medium: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    small: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  },
};
```

### Spacing
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 📦 TYPES PRINCIPAUX

### Topic
```typescript
export interface Topic {
  readonly id: string;          // UUID v4
  readonly title: string;       // Ex: "Polymorphisme en Java"
  readonly sessions: Session[]; // Historique des tentatives
}
```

### Session
```typescript
export interface Session {
  readonly id: string;                  // UUID v4
  readonly date: string;                // ISO 8601
  readonly audioUri?: string;           // Chemin local fichier .m4a
  readonly transcription?: string;      // Texte STT (Whisper)
  readonly analysis: AnalysisResult;
}
```

### AnalysisResult
```typescript
export interface AnalysisResult {
  readonly valid: string[];        // Points corrects
  readonly corrections: string[];  // Erreurs à corriger
  readonly missing: string[];      // Concepts oubliés
}
```

### RecordingState
```typescript
export type RecordingState = 'idle' | 'recording' | 'analyzing' | 'complete';
```

---

## 🔧 SERVICES CRITIQUES

### LLMService (API IA)

**Responsabilité** : Interface avec les APIs OpenAI (Whisper + GPT-4)

```typescript
// shared/services/LLMService.ts

export const LLMService = {
  /**
   * Transcrit un fichier audio en texte (Whisper API)
   * @param uri - Chemin local du fichier audio (.m4a)
   * @returns Transcription textuelle
   */
  async transcribeAudio(uri: string): Promise<string> {
    // TODO: Implémenter l'appel réel à Whisper
    // const formData = new FormData();
    // formData.append('file', { uri, type: 'audio/m4a', name: 'recording.m4a' });
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    //   body: formData,
    // });
    // return response.json().text;
  },

  /**
   * Analyse une transcription et retourne les points forts/faibles
   * @param text - Transcription à analyser
   * @param topicTitle - Sujet de référence
   * @returns Analyse structurée (valid, corrections, missing)
   */
  async analyzeText(text: string, topicTitle: string): Promise<AnalysisResult> {
    // TODO: Implémenter l'appel réel à GPT-4
    // const SYSTEM_PROMPT = `
    //   Tu es un expert technique rigoureux. Analyse la réponse de l'utilisateur 
    //   sur le sujet : "${topicTitle}".
    //   Retourne un JSON strict avec :
    //   1. valid: points techniquement corrects (array de strings).
    //   2. corrections: erreurs factuelles ou imprécisions (array de strings).
    //   3. missing: concepts clés du sujet oubliés (array de strings).
    // `;
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [
    //       { role: 'system', content: SYSTEM_PROMPT },
    //       { role: 'user', content: text },
    //     ],
    //     response_format: { type: 'json_object' },
    //   }),
    // });
    // return JSON.parse(response.json().choices[0].message.content);
  },
};
```

**Prompt système recommandé pour l'analyse** :
```
Tu es un expert technique rigoureux et pédagogue. 
Analyse la réponse de l'utilisateur sur le sujet : "{topicTitle}".

Retourne UNIQUEMENT un JSON au format strict suivant (sans markdown) :
{
  "valid": ["Point 1 correct", "Point 2 correct"],
  "corrections": ["Erreur 1 à corriger", "Imprécision 2"],
  "missing": ["Concept clé 1 oublié", "Concept 2 non mentionné"]
}

Règles :
1. Sois factuel et précis (pas de phrases vagues).
2. Dans "corrections", cite l'erreur ET la bonne réponse.
3. Dans "missing", liste les concepts importants non abordés.
4. Limite chaque tableau à 5 éléments maximum pour rester digeste.
```

### StorageService (Persistance locale)

**Responsabilité** : Abstraction d'AsyncStorage pour les Topics

```typescript
// shared/services/StorageService.ts

const STORAGE_KEY = '@knowit_topics';

export const StorageService = {
  async getTopics(): Promise<Topic[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  },

  async saveTopics(topics: Topic[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
```

### RecordingService (À créer)

**Responsabilité** : Gestion de l'enregistrement audio avec expo-av

```typescript
// shared/services/RecordingService.ts (À IMPLÉMENTER)

import { Audio } from 'expo-av';

export const RecordingService = {
  recording: null as Audio.Recording | null,

  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  },

  async startRecording(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    this.recording = recording;
  },

  async stopRecording(): Promise<string> {
    if (!this.recording) throw new Error('No active recording');
    
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;
    
    return uri || '';
  },

  async getStatus() {
    return this.recording?.getStatusAsync();
  },
};
```

---

## 🎣 HOOKS PATTERNS

### Hook de Feature (useTopics)
```typescript
// features/topics/hooks/useTopics.ts

export interface UseTopicsReturn {
  // Data
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  
  // Methods
  handleAddTopic: (title: string) => void;
  handleDeleteTopic: (topicId: string) => void;
  handleUpdateTitle: (topicId: string, newTitle: string) => void;
}

export function useTopics(): UseTopicsReturn {
  const topics = useStore(selectTopics);
  const isLoading = useStore(selectIsLoading);
  const error = useStore(selectError);
  const addTopic = useStore((state) => state.addTopic);
  const deleteTopic = useStore((state) => state.deleteTopic);
  const updateTopicTitle = useStore((state) => state.updateTopicTitle);

  const handleAddTopic = useCallback((title: string) => {
    if (!title.trim()) return;
    addTopic(title);
  }, [addTopic]);

  const handleDeleteTopic = useCallback((topicId: string) => {
    deleteTopic(topicId);
  }, [deleteTopic]);

  const handleUpdateTitle = useCallback((topicId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    updateTopicTitle(topicId, newTitle);
  }, [updateTopicTitle]);

  return {
    topics,
    isLoading,
    error,
    handleAddTopic,
    handleDeleteTopic,
    handleUpdateTitle,
  };
}
```

**Utilisation dans la vue** :
```tsx
export function TopicsScreen() {
  const { topics, handleAddTopic, handleDeleteTopic } = useTopics();
  // Vue purement déclarative, zéro logique
  return <View>...</View>;
}
```

---

## 🚀 PROCESSUS DE DÉVELOPPEMENT

### Workflow pour une nouvelle feature

1. **Créer la structure** :
   ```
   features/ma-feature/
   ├── components/
   ├── screens/
   ├── hooks/
   └── index.ts
   ```

2. **Définir les types** dans `/types`

3. **Créer le Hook logique** :
   - Inputs (props, params)
   - Outputs (data, methods)
   - Logique métier isolée

4. **Créer la Vue** :
   - Import du Hook
   - UI déclarative pure
   - Zéro `useEffect` / `useState` complexe

5. **Créer les Styles** :
   - Fichier `.styles.ts` adjacent
   - Import des tokens du theme

6. **Tester** :
   - Vérifier le typage TypeScript (`npm run tsc`)
   - Tester sur iOS et Android

### Checklist avant commit

- [ ] Aucun `any` dans le code
- [ ] Pas de styles inline
- [ ] Pas de logique dans les `.tsx`
- [ ] Tous les types exportés dans `/types/index.ts`
- [ ] JSDoc sur les fonctions complexes uniquement
- [ ] Imports organisés (React → Libraries → Local)
- [ ] Noms de variables/fonctions explicites

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

### 1. Performance
- **React.memo** sur tous les composants de liste
- **useMemo** pour les calculs coûteux
- **useCallback** pour les handlers passés en props
- Éviter les re-renders inutiles (vérifier avec React DevTools)

### 2. Sécurité
- **JAMAIS** commiter les API keys (utiliser `@env` ou Expo Constants)
- Valider toutes les entrées utilisateur
- Nettoyer les fichiers audio temporaires après usage

### 3. Accessibilité
- `accessibilityLabel` sur tous les boutons interactifs
- Contraste de couleurs conforme (WCAG AA minimum)
- Support du mode sombre (à implémenter)

### 4. Gestion d'erreur
- Try/catch sur tous les appels async
- Messages d'erreur utilisateur clairs (pas de stacktrace brute)
- Logging structuré avec préfixes `[ServiceName]`

### 5. États de chargement
- Toujours afficher un état "loading" pendant les appels API
- Désactiver les boutons pendant les actions asynchrones
- Feedback visuel immédiat sur les actions utilisateur

---

## 📝 EXEMPLES DE CODE COMPLETS

### Exemple 1 : Composant avec Hook

**Hook** :
```typescript
// features/session/hooks/useAudioRecording.ts

export interface UseAudioRecordingReturn {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingRef.current = recording;
    setIsRecording(true);
    setDuration(0);

    // Simuler le niveau audio (à remplacer par vraie détection)
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
      setAudioLevel(Math.random());
    }, 100);
  }, [hasPermission, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    setIsRecording(false);
    setAudioLevel(0);

    return uri;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
  };
}
```

**Vue** :
```tsx
// features/session/screens/SessionScreen.tsx

export function SessionScreen() {
  const { 
    isRecording, 
    audioLevel, 
    duration,
    startRecording, 
    stopRecording 
  } = useAudioRecording();
  
  return (
    <View style={styles.container}>
      <AudioVisualizer audioLevel={audioLevel} isActive={isRecording} />
      
      <Text style={styles.duration}>
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </Text>
      
      <RecordButton
        isRecording={isRecording}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
}
```

### Exemple 2 : Store Zustand

```typescript
// store/useStore.ts

interface TopicsState {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
}

interface TopicsActions {
  loadTopics: () => Promise<void>;
  addTopic: (title: string) => void;
  deleteTopic: (topicId: string) => void;
  updateTopicTitle: (topicId: string, newTitle: string) => void;
  addSessionToTopic: (topicId: string, session: Session) => void;
  getTopicById: (topicId: string) => Topic | undefined;
}

type Store = TopicsState & TopicsActions;

export const useStore = create<Store>((set, get) => ({
  // State
  topics: [],
  isLoading: false,
  error: null,

  // Actions
  loadTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const loaded = await StorageService.getTopics();
      set({ topics: loaded, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de chargement',
        isLoading: false,
      });
    }
  },

  addTopic: (title: string) => {
    const newTopic: Topic = {
      id: uuidv4(),
      title: title.trim(),
      sessions: [],
    };
    const newTopics = [...get().topics, newTopic];
    set({ topics: newTopics });
    StorageService.saveTopics(newTopics);
  },

  // ... autres actions
}));

// Selectors optimisés
export const selectTopics = (state: Store) => state.topics;
export const selectIsLoading = (state: Store) => state.isLoading;
export const selectTopicById = (topicId: string) => (state: Store) =>
  state.topics.find((t) => t.id === topicId);
```

---

## 🔄 PROCHAINES ÉTAPES (Roadmap)

### Phase 1 : MVP Fonctionnel (En cours)
- [x] Architecture MVVM + Zustand
- [x] Gestion des Topics (CRUD)
- [x] Écran d'enregistrement avec visualiseur audio
- [x] Interface glassmorphism
- [ ] Intégration Whisper API (STT)
- [ ] Intégration GPT-4 API (Analyse)
- [ ] Historique des sessions
- [ ] Affichage des résultats d'analyse

### Phase 2 : Amélioration UX
- [ ] Animations de transition entre écrans
- [ ] Haptic feedback sur les actions
- [ ] Mode sombre / clair
- [ ] Onboarding interactif

### Phase 3 : Features avancées
- [ ] Statistiques de progression
- [ ] Système de rappels (spaced repetition)
- [ ] Export des sessions (PDF/JSON)
- [ ] Partage social des résultats
- [ ] Multi-langues (i18n)

---

## 💡 GUIDE D'UTILISATION POUR CLAUDE AI

### Comment utiliser cette documentation

#### Pour comprendre le projet
1. Lire "CONTEXTE & OBJECTIF" pour saisir la vision
2. Parcourir "ARCHITECTURE TECHNIQUE" pour les patterns
3. Consulter "STRUCTURE DES DOSSIERS" pour se repérer

#### Pour coder une feature
1. Identifier le module dans `/features`
2. Suivre le pattern MVVM (Hook → Vue → Styles)
3. Respecter les règles de Separation of Concerns
4. Utiliser les types existants dans `/types`

#### Pour résoudre un bug
1. Identifier la couche (Vue / Hook / Service / Store)
2. Vérifier les logs préfixés `[ServiceName]`
3. Isoler la logique dans le Hook pour tester
4. Ne jamais contourner le pattern MVVM

#### Questions fréquentes

**Q: Où mettre un nouvel appel API ?**  
R: Dans un Service (ex: `LLMService.ts`), jamais dans un Hook ou une Vue.

**Q: Comment partager une donnée entre 2 écrans ?**  
R: Via le Store Zustand (ex: `useStore`) ou via les paramètres de navigation.

**Q: Puis-je utiliser `useEffect` dans une Vue ?**  
R: Uniquement pour des effets simples (ex: focus input). La logique complexe va dans le Hook.

**Q: Comment styliser un nouveau composant ?**  
R: Créer un fichier `.styles.ts` adjacent qui importe les tokens du theme.

**Q: Où sont les mocks API actuellement ?**  
R: Dans `LLMService.ts` (fonctions `transcribeAudio` et `analyzeText`). Remplacer par vrais appels OpenAI.

---

## 📞 CONTACT & SUPPORT

Pour toute question sur l'architecture ou les choix techniques, consulter :
- Ce document (source de vérité)
- Les commentaires JSDoc dans le code
- Les types TypeScript (autodocumentés)

**Principe de base** : Si tu hésites sur où mettre du code, demande-toi :
1. Est-ce de la **Vue** (rendu UI) ? → `.tsx`
2. Est-ce de la **Logique** (état, handlers) ? → `use*.ts`
3. Est-ce de l'**I/O** (API, storage) ? → `*Service.ts`
4. Est-ce de l'**État global** ? → `store/useStore.ts`

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Auteur** : KnowIt Team  
**Licence** : Propriétaire
