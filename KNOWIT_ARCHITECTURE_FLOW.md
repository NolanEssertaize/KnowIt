# 🗺️ KnowIt - Architecture & Data Flow

> **Guide visuel de l'architecture pour Claude AI**  
> Comprendre en un coup d'œil comment les données circulent

---

## 📊 ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────────┐
│                          KNOWIT APPLICATION                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐          ┌────────▼────────┐
            │   FRONTEND     │          │    BACKEND      │
            │  React Native  │          │   (API Tiers)   │
            │     (Expo)     │          │                 │
            └───────┬────────┘          └────────┬────────┘
                    │                            │
    ┌───────────────┼────────────────┐          │
    │               │                │          │
┌───▼────┐   ┌─────▼──────┐   ┌────▼─────┐    │
│  VIEW  │   │  VIEWMODEL │   │  MODEL   │    │
│ (.tsx) │───│   (Hooks)  │───│ (Types)  │    │
└────────┘   └─────┬──────┘   └──────────┘    │
                   │                           │
            ┌──────┴───────┐                  │
            │              │                  │
      ┌─────▼─────┐  ┌────▼──────┐          │
      │  SERVICES │  │   STORE   │          │
      │  (API/IO) │  │ (Zustand) │          │
      └─────┬─────┘  └───────────┘          │
            │                                │
            └────────────────────────────────┘
                  (OpenAI Whisper + GPT-4)
```

---

## 🔄 FLUX DE DONNÉES COMPLET

### Flux 1 : Ajout d'un nouveau Topic

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                       │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│ TopicsScreen.tsx                                                     │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ <AddButton onPress={handleAddTopic} />                         │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   │ (1) User presses button
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ useTopics.ts (Custom Hook)                                           │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ const handleAddTopic = useCallback((title: string) => {        │  │
│ │   addTopic(title); // Appelle l'action du store               │  │
│ │ }, [addTopic]);                                                │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   │ (2) Hook calls store action
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ useStore.ts (Zustand Store)                                          │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ addTopic: (title: string) => {                                 │  │
│ │   const newTopic = { id: uuidv4(), title, sessions: [] };     │  │
│ │   const newTopics = [...get().topics, newTopic];              │  │
│ │   set({ topics: newTopics });                                 │  │
│ │   StorageService.saveTopics(newTopics);                       │  │
│ │ }                                                              │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   │ (3) Store persists data
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ StorageService.ts                                                    │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ async saveTopics(topics: Topic[]): Promise<void> {             │  │
│ │   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(...));│  │
│ │ }                                                              │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   │ (4) UI re-renders automatically
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ TopicsScreen.tsx (Auto-rerenders)                                    │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ const { topics } = useTopics();                                │  │
│ │ // topics array now includes the new topic                    │  │
│ │ {topics.map(t => <TopicCard key={t.id} topic={t} />)}         │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Flux 2 : Session d'enregistrement complète

```
┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DÉMARRAGE ENREGISTREMENT                                   │
└──────────────────────────────────────────────────────────────────────┘

User clicks Record Button
         │
         ▼
SessionScreen.tsx
         │
         │ (calls)
         ▼
useSessionWithAudio.ts
         │
         │ const { toggleRecording } = useAudioRecording();
         │
         ▼
useAudioRecording.ts
         │
         │ (1) Demande permission
         │     await Audio.requestPermissionsAsync()
         │
         │ (2) Configure audio mode
         │     await Audio.setAudioModeAsync({...})
         │
         │ (3) Démarre enregistrement
         │     recording = await Audio.Recording.createAsync(...)
         │
         │ (4) Met à jour state
         │     setIsRecording(true)
         │
         ▼
SessionScreen re-renders
   (shows pulsing visualizer)

┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ARRÊT ENREGISTREMENT                                        │
└──────────────────────────────────────────────────────────────────────┘

User clicks Stop Button
         │
         ▼
useAudioRecording.stopRecording()
         │
         │ (1) Arrête l'enregistrement
         │     await recording.stopAndUnloadAsync()
         │
         │ (2) Récupère l'URI du fichier
         │     const uri = recording.getURI()
         │
         │ (3) Retourne l'URI
         │     return uri
         │
         ▼
useSessionWithAudio.toggleRecording()
         │
         │ (receives uri from useAudioRecording)
         │
         │ setIsAnalyzing(true) // UI shows loading
         │
         ▼

┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ANALYSE IA                                                  │
└──────────────────────────────────────────────────────────────────────┘

useSessionWithAudio continues...
         │
         │ (1) Transcription (STT)
         │     const transcription = await LLMService.transcribeAudio(uri)
         │
         ▼
LLMService.transcribeAudio()
         │
         │ (makes API call to OpenAI Whisper)
         │ POST https://api.openai.com/v1/audio/transcriptions
         │ {
         │   file: audioFile,
         │   model: "whisper-1"
         │ }
         │
         ▼
Returns text transcription
         │
         ▼
useSessionWithAudio continues...
         │
         │ (2) Analyse sémantique (LLM)
         │     const analysis = await LLMService.analyzeText(
         │       transcription,
         │       topic.title
         │     )
         │
         ▼
LLMService.analyzeText()
         │
         │ (makes API call to OpenAI GPT-4)
         │ POST https://api.openai.com/v1/chat/completions
         │ {
         │   model: "gpt-4",
         │   messages: [
         │     { role: "system", content: ANALYSIS_PROMPT },
         │     { role: "user", content: transcription }
         │   ],
         │   response_format: { type: "json_object" }
         │ }
         │
         ▼
Returns { valid: [...], corrections: [...], missing: [...] }
         │
         ▼

┌──────────────────────────────────────────────────────────────────────┐
│ PHASE 4: SAUVEGARDE & NAVIGATION                                     │
└──────────────────────────────────────────────────────────────────────┘

useSessionWithAudio continues...
         │
         │ (3) Crée l'objet Session
         │     const newSession = {
         │       id: uuidv4(),
         │       date: new Date().toISOString(),
         │       audioUri: uri,
         │       transcription: transcription,
         │       analysis: analysis
         │     }
         │
         │ (4) Ajoute au store
         │     addSessionToTopic(topicId, newSession)
         │
         ▼
useStore.addSessionToTopic()
         │
         │ (updates topic in Zustand store)
         │ const newTopics = topics.map(t =>
         │   t.id === topicId
         │     ? { ...t, sessions: [newSession, ...t.sessions] }
         │     : t
         │ )
         │ set({ topics: newTopics })
         │ StorageService.saveTopics(newTopics)
         │
         ▼
Data persisted in AsyncStorage
         │
         ▼
useSessionWithAudio continues...
         │
         │ (5) Navigation vers l'écran de résultats
         │     router.replace({
         │       pathname: `/${topicId}/result`,
         │       params: { sessionId: newSession.id }
         │     })
         │
         ▼
ResultScreen.tsx displays analysis
```

---

## 🏗️ COUCHES ARCHITECTURALES

### Couche 1 : Presentation (UI)
```
Responsabilité : Affichage et interactions utilisateur
Technologies : React Native, Expo Router
Règles strictes :
  ✅ PEUT : Appeler des hooks
  ✅ PEUT : Gérer l'UI (styles, animations)
  ❌ NE PEUT PAS : Contenir de logique métier
  ❌ NE PEUT PAS : Appeler directement des Services
  ❌ NE PEUT PAS : Gérer des états complexes

Fichiers :
  - features/*/screens/*.tsx
  - features/*/components/*/*.tsx
  - shared/components/*/*.tsx
```

### Couche 2 : Business Logic (ViewModels)
```
Responsabilité : Logique métier et orchestration
Technologies : Custom Hooks React
Règles strictes :
  ✅ PEUT : Utiliser useEffect, useState, useCallback
  ✅ PEUT : Appeler des Services
  ✅ PEUT : Lire/écrire dans le Store
  ✅ PEUT : Gérer des états locaux
  ❌ NE PEUT PAS : Contenir du JSX/TSX
  ❌ NE PEUT PAS : Importer des composants UI

Fichiers :
  - features/*/hooks/use*.ts
  - shared/hooks/use*.ts
```

### Couche 3 : Data Layer (Services & Store)
```
Responsabilité : I/O, APIs, persistance
Technologies : Zustand, AsyncStorage, fetch/axios
Règles strictes :
  ✅ PEUT : Appeler des APIs externes
  ✅ PEUT : Lire/écrire AsyncStorage
  ✅ PEUT : Transformer des données
  ❌ NE PEUT PAS : Gérer de l'UI
  ❌ NE PEUT PAS : Utiliser des hooks React (sauf dans le store)

Fichiers :
  - shared/services/*.ts
  - store/useStore.ts
```

### Couche 4 : Types & Constants
```
Responsabilité : Définitions TypeScript
Règles strictes :
  ✅ Immutabilité (readonly)
  ✅ Types stricts (pas de any)
  ✅ Exports centralisés

Fichiers :
  - types/*.types.ts
  - types/index.ts
  - theme/*.ts
```

---

## 🔐 RÈGLES DE COMMUNICATION ENTRE COUCHES

```
┌────────────┐
│    VIEW    │  Ne peut appeler QUE ──────┐
└────────────┘                            │
                                          ▼
                                  ┌────────────┐
                                  │  VIEWMODEL │
                                  └────────────┘
                                          │
                                          │ Peut appeler
                                          │
                          ┌───────────────┴───────────────┐
                          ▼                               ▼
                  ┌────────────┐                  ┌────────────┐
                  │  SERVICES  │                  │   STORE    │
                  └────────────┘                  └────────────┘
                          │                               │
                          └───────────┬───────────────────┘
                                      ▼
                              ┌────────────┐
                              │ ASYNC I/O  │
                              │ (API, DB)  │
                              └────────────┘
```

**Communication interdite** :
- ❌ VIEW → SERVICE (direct)
- ❌ VIEW → STORE (direct write, sauf lecture via hooks)
- ❌ SERVICE → VIEW
- ❌ STORE → VIEW (sauf via subscription hooks)

**Communication autorisée** :
- ✅ VIEW → VIEWMODEL (hooks)
- ✅ VIEWMODEL → SERVICE
- ✅ VIEWMODEL → STORE (actions)
- ✅ SERVICE → API
- ✅ STORE → SERVICE (dans les actions)

---

## 📱 NAVIGATION FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                       APP NAVIGATION TREE                            │
└─────────────────────────────────────────────────────────────────────┘

app/_layout.tsx (Root)
     │
     ├─ WelcomeScreen (conditional, first launch)
     │
     └─ Stack Navigator
           │
           ├─ index.tsx (Home)
           │     └─ TopicsScreen
           │           └─ Liste des Topics
           │
           ├─ [topicId]/index.tsx (Detail)
           │     └─ TopicDetailScreen
           │           └─ Historique des Sessions
           │
           ├─ [topicId]/session.tsx (Modal)
           │     └─ SessionScreen
           │           └─ Enregistrement audio
           │
           └─ [topicId]/result.tsx (Modal)
                 └─ ResultScreen
                       └─ Affichage de l'analyse

Navigation Patterns:
1. Home → Topic Detail
   router.push(`/${topicId}`)

2. Topic Detail → Recording Session (Modal)
   router.push(`/${topicId}/session`)

3. Recording Session → Result (Replace, no back)
   router.replace({ pathname: `/${topicId}/result`, params: {...} })

4. Result → Topic Detail (Back)
   router.back()
```

---

## 🎨 DESIGN PATTERNS UTILISÉS

### 1. MVVM (Model-View-ViewModel)
```
Model (Types)
   ↕
ViewModel (Hooks)  ← Orchestration
   ↕
View (Components)  ← UI Pure
```

### 2. Repository Pattern
```
Component → Hook → Service → API
                    ↓
              StorageService → AsyncStorage
```

### 3. Observer Pattern (Zustand)
```
Store (Subject)
   ↓ subscribe
Components (Observers)
   ↓ auto re-render on state change
```

### 4. Dependency Injection
```
Service as const object
   ↓ imported
Hook uses Service
   ↓ injected
Component uses Hook
```

---

## 🔄 STATE MANAGEMENT STRATEGY

### État Local (useState)
```
Utiliser quand :
- État spécifique à un composant
- Pas besoin de partage
- Durée de vie = durée du composant

Exemples :
- isModalOpen
- inputValue (formulaire local)
- currentStep (wizard)
```

### État Partagé (Zustand)
```
Utiliser quand :
- État partagé entre plusieurs écrans
- Besoin de persistence
- Données métier centrales

Exemples :
- topics (liste globale)
- currentUser
- appSettings
```

### Props Drilling (éviter)
```
❌ BAD:
Parent → Child1 → Child2 → Child3 (prop forwarding)

✅ GOOD:
Parent → Zustand Store ← Child3 (direct access)
```

---

## 🚦 GESTION DES ERREURS

```
┌─────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING LAYERS                                                │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Service (API Call)
   ↓
   try {
     const response = await fetch(...)
     if (!response.ok) throw new Error('API Error')
     return await response.json()
   } catch (error) {
     console.error('[ServiceName] method error:', error)
     throw error  // Re-throw pour la couche supérieure
   }

Layer 2: Hook (Business Logic)
   ↓
   try {
     setIsLoading(true)
     setError(null)
     const data = await Service.method()
     setData(data)
   } catch (error) {
     setError(error instanceof Error ? error.message : 'Unknown error')
   } finally {
     setIsLoading(false)
   }

Layer 3: View (UI Display)
   ↓
   if (isLoading) return <LoadingView />
   if (error) return <ErrorView message={error} />
   return <SuccessView data={data} />
```

---

## 📊 PERFORMANCE OPTIMIZATION CHECKLIST

```
✅ React.memo sur les composants de liste
✅ useCallback sur les handlers passés en props
✅ useMemo sur les calculs coûteux (sorts, filters)
✅ FlatList avec keyExtractor optimisé
✅ Zustand selectors pour éviter re-renders inutiles
✅ Lazy loading des écrans (déjà fait par Expo Router)
✅ Image optimization (expo-image avec cache)
✅ Debounce sur les inputs de recherche
✅ Throttle sur les scroll listeners
✅ removeClippedSubviews sur les longues listes
```

---

## 🎯 POINTS CRITIQUES À RETENIR

1. **Séparation stricte** : Vue ≠ Logique ≠ Data
2. **Typage strict** : Zéro `any`, toujours `readonly` sur les props
3. **Single Responsibility** : 1 fichier = 1 responsabilité
4. **Immutabilité** : Jamais muter le state directement
5. **DRY** : Si copié 3 fois → extraire dans shared/
6. **KISS** : Si trop complexe → découper en sous-fonctions
7. **Performance** : Mémoïser ce qui coûte cher
8. **Logging** : Toujours préfixer `[ComponentName]`

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Complément de** : KNOWIT_PROJECT_DOCUMENTATION.md + KNOWIT_QUICK_REFERENCE.md
