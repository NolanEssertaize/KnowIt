# ⚡ KnowIt - Règles Strictes & Quick Reference

> **Guide de référence rapide pour Claude AI**  
> À consulter avant chaque prompt de codage

---

## 🚨 RÈGLES NON-NÉGOCIABLES

### 1. Pattern MVVM (Custom Hooks)

```
❌ INTERDIT DANS LES .TSX :
- useEffect avec logique métier
- useState pour états complexes
- Appels fetch/axios directs
- Logique conditionnelle > 5 lignes
- Calculs complexes

✅ OBLIGATOIRE :
- Tout composant logique a son useNomDuComposant.ts
- La vue .tsx ne fait QUE du rendu UI
- Hook retourne { data, methods } prêts à l'emploi
```

### 2. Styles (Separation of Concerns)

```
❌ INTERDIT :
- style={{...}} inline
- StyleSheet.create dans .tsx

✅ OBLIGATOIRE :
- Fichier adjacent Nom.styles.ts
- Import des tokens depuis /theme
```

### 3. Data Layer

```
❌ INTERDIT :
- Appels API directs dans UI
- Appels API dans les Hooks UI

✅ OBLIGATOIRE :
- Passer par Service/Repository
- Types stricts (pas de any)
```

---

## 📐 TEMPLATES DE CODE

### Template 1 : Nouveau Composant

```typescript
// features/ma-feature/components/MonComposant/MonComposant.tsx

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { styles } from './MonComposant.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MonComposantProps {
  readonly title: string;
  readonly onPress: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function MonComposantComponent({ 
  title, 
  onPress 
}: MonComposantProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export const MonComposant = memo(MonComposantComponent);
```

```typescript
// features/ma-feature/components/MonComposant/MonComposant.styles.ts

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

### Template 2 : Custom Hook

```typescript
// features/ma-feature/hooks/useMaFeature.ts

import { useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseMaFeatureReturn {
  // Data
  data: string[];
  isLoading: boolean;
  error: string | null;
  
  // Methods
  handleAction: () => void;
  handleRefresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useMaFeature(): UseMaFeatureReturn {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(() => {
    // Logique ici
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Appel au Service
      // const result = await MonService.getData();
      // setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    handleAction,
    handleRefresh,
  };
}
```

### Template 3 : Service

```typescript
// shared/services/MonService.ts

import type { MonType } from '@/types';

/**
 * Description du service
 */
export const MonService = {
  /**
   * Description de la méthode
   * @param param - Description du paramètre
   * @returns Description du retour
   */
  async getData(param: string): Promise<MonType[]> {
    try {
      const response = await fetch(`/api/endpoint/${param}`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.error('[MonService] getData error:', error);
      throw error;
    }
  },

  /**
   * Autre méthode
   */
  async postData(data: MonType): Promise<void> {
    // Implémentation
  },
} as const;
```

### Template 4 : Screen avec Hook

```typescript
// features/ma-feature/screens/MaScreen.tsx

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useMaFeature } from '../hooks/useMaFeature';
import { styles } from './MaScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MaScreen(): React.JSX.Element {
  const { data, isLoading, error, handleAction } = useMaFeature();

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      {data.map((item, index) => (
        <ItemCard key={index} item={item} onPress={handleAction} />
      ))}
    </ScrollView>
  );
}
```

---

## 🎯 PATTERNS CRITIQUES

### Pattern : Gestion d'état asynchrone

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAsyncAction = useCallback(async () => {
  setIsLoading(true);
  setError(null); // Reset error
  
  try {
    const result = await MonService.action();
    // Traiter le résultat
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    console.error('[Component] handleAsyncAction error:', err);
  } finally {
    setIsLoading(false);
  }
}, []);
```

### Pattern : Optimisation performance

```typescript
// ✅ Mémoïsation des composants lourds
const MemoizedList = memo(function List({ items }: ListProps) {
  return (
    <FlatList
      data={items}
      renderItem={renderItem} // Aussi mémoïsé
      keyExtractor={keyExtractor}
    />
  );
});

// ✅ Mémoïsation des callbacks
const handlePress = useCallback((id: string) => {
  console.log('Pressed:', id);
}, []);

// ✅ Mémoïsation des calculs
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.date.localeCompare(b.date));
}, [items]);
```

### Pattern : Zustand Store Actions

```typescript
// store/useStore.ts

export const useStore = create<Store>((set, get) => ({
  // State
  items: [],
  
  // Actions (toujours retourner void ou Promise<void>)
  addItem: (item: Item) => {
    const newItems = [...get().items, item];
    set({ items: newItems });
    StorageService.save(newItems); // Persist
  },
  
  deleteItem: (id: string) => {
    const newItems = get().items.filter(item => item.id !== id);
    set({ items: newItems });
    StorageService.save(newItems);
  },
  
  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await StorageService.load();
      set({ items, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Load failed',
        isLoading: false,
      });
    }
  },
}));

// Selectors (pour optimiser les re-renders)
export const selectItems = (state: Store) => state.items;
export const selectItemById = (id: string) => (state: Store) =>
  state.items.find(item => item.id === id);
```

---

## 🎨 DESIGN SYSTEM - Tokens

### Colors
```typescript
import { GlassColors } from '@/theme';

// Surfaces
GlassColors.surface.light    // rgba(255, 255, 255, 0.08)
GlassColors.surface.medium   // rgba(255, 255, 255, 0.12)
GlassColors.surface.dark     // rgba(0, 0, 0, 0.2)

// Text
GlassColors.text.primary     // #FFFFFF
GlassColors.text.secondary   // rgba(255, 255, 255, 0.7)
GlassColors.text.tertiary    // rgba(255, 255, 255, 0.5)

// Accents
GlassColors.accent.primary   // #00D9FF (cyan)
GlassColors.accent.secondary // #B84DFF (violet)
GlassColors.accent.tertiary  // #FF6B9D (rose)

// Status
GlassColors.status.success   // #00FF88 (vert néon)
GlassColors.status.error     // #FF4757 (rouge néon)
```

### Typography
```typescript
import { Typography } from '@/theme';

// Headings
...Typography.heading.h1  // 32px, 700
...Typography.heading.h2  // 24px, 600
...Typography.heading.h3  // 20px, 600

// Body
...Typography.body.large  // 18px, 400
...Typography.body.medium // 16px, 400
...Typography.body.small  // 14px, 400
```

### Spacing
```typescript
import { Spacing } from '@/theme';

padding: Spacing.xs   // 4
padding: Spacing.sm   // 8
padding: Spacing.md   // 16
padding: Spacing.lg   // 24
padding: Spacing.xl   // 32
padding: Spacing.xxl  // 48
```

---

## 🔍 CHECKLIST PRÉ-COMMIT

Avant de commiter du code, vérifier :

```
✅ Aucun `any` dans le code
✅ Pas de styles inline (`style={{...}}`)
✅ Pas de logique métier dans les .tsx
✅ Tous les types exportés dans /types/index.ts
✅ JSDoc uniquement sur la complexité métier
✅ Imports organisés (React → Libs → Local)
✅ Noms explicites (pas de `data`, `temp`, `x`)
✅ Console.log avec préfixes ([ServiceName])
✅ Try/catch sur tous les async
✅ Loading states pour toutes les actions async
✅ React.memo sur composants de liste
✅ useCallback sur handlers passés en props
✅ useMemo sur calculs coûteux
```

---

## 🚀 COMMANDES RAPIDES

### Navigation (Expo Router)
```typescript
import { useRouter, useLocalSearchParams } from 'expo-router';

// Navigation simple
router.push('/screen');

// Navigation avec paramètres
router.push({
  pathname: '/[id]/detail',
  params: { id: '123', title: 'Test' },
});

// Retour arrière
router.back();

// Replace (pas de retour possible)
router.replace('/home');

// Récupérer les params
const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
```

### Store (Zustand)
```typescript
// Lire le state
const topics = useStore(selectTopics);
const topic = useStore(selectTopicById('123'));

// Appeler une action
const addTopic = useStore((state) => state.addTopic);
addTopic('Nouveau topic');

// Optimisation : select uniquement ce qui est nécessaire
const title = useStore((state) => state.topics[0]?.title);
```

### AsyncStorage
```typescript
import { StorageService } from '@/shared/services/StorageService';

// Charger
const topics = await StorageService.getTopics();

// Sauvegarder
await StorageService.saveTopics(updatedTopics);

// Réinitialiser
await StorageService.clear();
```

---

## 📍 STRUCTURE DES IMPORTS

Toujours organiser les imports dans cet ordre :

```typescript
// 1. React / React Native
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Librairies externes
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

// 3. Alias @ (config, store, types, services)
import type { Topic, Session } from '@/types';
import { useStore, selectTopics } from '@/store/useStore';
import { LLMService } from '@/shared/services/LLMService';
import { GlassColors, Spacing } from '@/theme';

// 4. Imports relatifs (hooks, components locaux)
import { useTopics } from '../hooks/useTopics';
import { TopicCard } from '../components/TopicCard';
import { styles } from './Screen.styles';
```

---

## 🎓 EXEMPLES DE PROMPTS OPTIMAUX

### Prompt 1 : Nouvelle feature
```
Crée une feature "statistics" pour afficher les statistiques de progression de l'utilisateur.

Structure attendue :
- features/statistics/
  - components/StatCard/
  - screens/StatisticsScreen.tsx
  - hooks/useStatistics.ts

Le hook doit :
- Calculer le nombre total de sessions
- Calculer le taux de réussite moyen
- Retourner les données formatées pour l'UI

L'écran doit afficher :
- 3 cards avec les stats principales
- Un graphique de progression (utiliser une lib si nécessaire)
- Style glassmorphism cohérent avec le reste de l'app

Respecte le pattern MVVM et les règles du projet.
```

### Prompt 2 : Modification d'un service
```
Modifie le LLMService pour :
1. Remplacer le mock par un vrai appel à l'API OpenAI Whisper
2. Ajouter une gestion d'erreur robuste (timeout, network, API errors)
3. Logger les étapes avec le préfixe [LLMService]
4. Typer strictement les retours (pas de any)

La clé API doit être récupérée via Expo Constants (pas hardcodée).

Respecte la signature existante de `transcribeAudio(uri: string): Promise<string>`.
```

### Prompt 3 : Bugfix
```
Le bouton d'enregistrement ne se désactive pas pendant l'analyse.

Analyse et corrige :
1. Vérifie la logique dans useSessionWithAudio.ts
2. Assure que recordingState === 'analyzing' désactive le bouton
3. Vérifie la propagation de l'état jusqu'à RecordButton.tsx
4. Ajoute un log pour tracer les changements d'état

Ne modifie pas le pattern MVVM existant.
```

---

## 💡 ASTUCES POUR CLAUDE

### Quand tu reçois un prompt vague
1. **Demander des clarifications** sur :
   - Quel écran/feature est concerné ?
   - Quel est le comportement attendu ?
   - Y a-t-il des contraintes de design ?

2. **Proposer une approche** avant de coder :
   - "Je vais créer X dans Y avec Z pattern"
   - "Est-ce que tu veux que j'utilise le store ou juste un state local ?"

### Quand tu codes
1. **Toujours suivre les templates** de ce document
2. **Ne jamais** contourner les règles MVVM
3. **Typer strictement** (zéro `any`)
4. **Commenter** uniquement la complexité métier (pas le code évident)

### Quand tu debugs
1. **Identifier la couche** (Vue / Hook / Service / Store)
2. **Isoler** le problème (logs, console.error)
3. **Proposer une solution** qui respecte l'architecture

---

## 📞 QUESTIONS FRÉQUENTES

**Q: Où mettre une fonction utilitaire partagée ?**  
R: Si c'est React : `shared/hooks/`. Sinon : `shared/utils/` (à créer).

**Q: Comment partager des constantes entre composants ?**  
R: Dans `/shared/constants/` (ex: `constants.ts`) ou directement dans le fichier si usage local unique.

**Q: Puis-je utiliser une librairie externe non listée ?**  
R: Oui, mais demander confirmation et ajouter dans le package.json + cette doc.

**Q: Comment tester un composant isolé ?**  
R: Créer un écran temporaire dans `/app/test.tsx` et y importer ton composant.

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Complément de** : KNOWIT_PROJECT_DOCUMENTATION.md
