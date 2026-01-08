# 📖 Guide d'Utilisation - Documentation KnowIt pour Claude AI

> **Comment utiliser cette documentation pour maximiser l'efficacité de Claude**  
> Instructions pour l'humain et pour Claude

---

## 🎯 OBJECTIF DE CES DOCUMENTS

Cette suite documentaire a été créée pour **optimiser les interactions** entre vous (développeur) et Claude AI lors du développement de l'application KnowIt. Elle garantit que :

1. **Claude comprend instantanément** le contexte du projet
2. **Les réponses sont cohérentes** avec l'architecture existante
3. **Le code généré respecte** tous les patterns et conventions
4. **Vous gagnez du temps** en évitant les va-et-vient de clarification

---

## 📚 LES 4 DOCUMENTS

### 1. **KNOWIT_PROJECT_DOCUMENTATION.md** (Référence complète)
- **Quand l'utiliser** : Première découverte du projet, onboarding
- **Contenu** : Architecture détaillée, stack technique, règles de codage
- **Pour Claude** : Contexte global à charger au début d'une session
- **Pour vous** : Documentation de référence pour comprendre le projet

### 2. **KNOWIT_QUICK_REFERENCE.md** (Cheat sheet)
- **Quand l'utiliser** : Codage quotidien, besoin de templates rapides
- **Contenu** : Règles strictes, templates de code, patterns
- **Pour Claude** : Rappel des contraintes avant de générer du code
- **Pour vous** : Antisèche pour coder sans chercher dans les fichiers

### 3. **KNOWIT_ARCHITECTURE_FLOW.md** (Diagrammes visuels)
- **Quand l'utiliser** : Comprendre le flux de données, debugger
- **Contenu** : Schémas ASCII, flux complets, couches architecturales
- **Pour Claude** : Visualisation des dépendances entre composants
- **Pour vous** : Carte mentale pour naviguer dans le code

### 4. **Ce fichier** (Guide d'utilisation)
- **Quand l'utiliser** : Première utilisation, formation d'un nouveau dev
- **Contenu** : Instructions pour structurer vos prompts efficacement

---

## 🚀 COMMENT UTILISER AVEC CLAUDE

### Étape 1 : Chargement initial (Projet Knowledge)

Ces documents sont déjà dans le **Project Knowledge de Claude**. Lors de votre première interaction, Claude va automatiquement :

1. Scanner les 4 fichiers
2. Construire une carte mentale du projet
3. Mémoriser les règles et patterns

**Vous n'avez rien à faire** — Claude est déjà contextualisé !

---

### Étape 2 : Structurer vos prompts

#### ✅ **BON PROMPT** (Clair, contextualisé, actionnable)

```
Crée une nouvelle feature "favorites" qui permet à l'utilisateur de marquer 
des topics comme favoris.

Contraintes :
- Ajouter un champ `isFavorite: boolean` au type Topic
- Créer un toggle dans TopicCard pour marquer/démarquer
- Filtrer la liste pour afficher les favoris en premier
- Persister dans AsyncStorage via StorageService

Respecte le pattern MVVM et les règles du projet.
```

**Pourquoi c'est bon** :
- ✅ Fonctionnalité claire
- ✅ Contraintes techniques explicites
- ✅ Rappel du pattern à respecter
- ✅ Mention de la persistance

#### ❌ **MAUVAIS PROMPT** (Vague, sans contexte)

```
Ajoute une fonctionnalité de favoris
```

**Pourquoi c'est mauvais** :
- ❌ Trop vague (favoris où ? comment ?)
- ❌ Pas de contraintes techniques
- ❌ Claude devra deviner l'implémentation
- ❌ Risque de non-respect des patterns

---

### Étape 3 : Itération et précision

Si la réponse de Claude ne convient pas à 100% :

#### ✅ **BONNE ITÉRATION**

```
Le code généré ne respecte pas le pattern MVVM :
- La logique du toggle est dans TopicCard.tsx (la vue)
- Il devrait y avoir un hook useTopicCard.ts

Peux-tu refactoriser en :
1. Créant useTopicCard.ts avec la logique du toggle
2. Simplifiant TopicCard.tsx pour qu'il soit purement déclaratif
```

#### ❌ **MAUVAISE ITÉRATION**

```
Ça marche pas, refais
```

---

## 🎓 EXEMPLES DE PROMPTS PAR SCÉNARIO

### Scénario 1 : Nouvelle feature complète

```
Crée une feature "reminders" pour que l'utilisateur puisse programmer des 
rappels pour réviser un topic.

Structure attendue :
- features/reminders/
  - components/ReminderModal/
  - hooks/useReminders.ts
  - screens/RemindersScreen.tsx (optionnel si intégré dans TopicDetail)

Fonctionnalités :
1. Sélectionner un topic
2. Choisir une date/heure via DateTimePicker
3. Enregistrer le rappel (AsyncStorage)
4. Afficher la liste des rappels dans TopicDetailScreen
5. Supprimer un rappel

Contraintes techniques :
- Utiliser expo-notifications pour les notifications locales
- Type ReminderType : { id, topicId, scheduledDate, notificationId }
- Ajouter `reminders: Reminder[]` au type Topic
- Pattern MVVM strict
- Style glassmorphism cohérent

Génère d'abord la structure des fichiers, puis je te demanderai le code 
de chaque fichier individuellement.
```

### Scénario 2 : Bugfix ciblé

```
Bug identifié dans useAudioRecording.ts :

Symptôme :
- Quand l'utilisateur clique sur "Stop" trop rapidement après "Start" (< 1s),
  l'URI retournée est null et l'app crash.

Analyse attendue :
1. Identifier la cause (probablement recording pas encore initialisée)
2. Proposer une solution (guard clause, minimum duration, ...)
3. Ajouter des logs pour tracer le problème
4. Gérer l'erreur gracieusement (message utilisateur)

Fournis le code corrigé avec les changements commentés.
```

### Scénario 3 : Refactoring

```
Le fichier SessionScreen.tsx est devenu trop long (300+ lignes).

Objectif :
Découper en composants plus petits tout en respectant le pattern MVVM.

Proposition de découpage :
1. SessionHeader (titre du topic, bouton close)
2. AudioVisualizer (déjà existant, vérifier s'il est bien isolé)
3. RecordButton (déjà existant)
4. SessionControls (boutons secondaires : pause, delete)
5. SessionStatus (durée, état)

Pour chaque composant :
- Créer le dossier features/session/components/NomDuComposant/
- Créer NomDuComposant.tsx (vue pure)
- Créer NomDuComposant.styles.ts
- Props typées strictement
- Mémoïsation avec React.memo

Commence par proposer la liste des props pour chaque composant, 
puis je validerai avant que tu génères le code.
```

### Scénario 4 : Intégration API

```
Implémente l'appel réel à l'API OpenAI Whisper dans LLMService.ts.

Remplace le mock actuel de `transcribeAudio(uri: string)` par :

1. Lecture du fichier audio depuis l'URI
2. Création d'un FormData avec le fichier
3. Appel POST à https://api.openai.com/v1/audio/transcriptions
4. Headers requis :
   - Authorization: Bearer ${OPENAI_API_KEY}
   - Content-Type: multipart/form-data
5. Paramètres :
   - file: fichier audio
   - model: "whisper-1"
   - language: "fr" (français)

Contraintes :
- La clé API doit être récupérée via Expo Constants (process.env.OPENAI_API_KEY)
- Gestion d'erreur robuste (network, timeout, API errors)
- Logging avec préfixe [LLMService]
- Typage strict du retour
- Timeout de 30s

Fournis aussi un exemple de configuration dans app.json pour la clé API.
```

### Scénario 5 : Tests et validation

```
Je veux vérifier que le pattern MVVM est bien respecté dans la feature "session".

Analyse les fichiers suivants et indique les violations éventuelles :
- features/session/screens/SessionScreen.tsx
- features/session/hooks/useSessionWithAudio.ts
- features/session/components/RecordButton/RecordButton.tsx

Pour chaque violation :
1. Localiser précisément (fichier, ligne)
2. Expliquer pourquoi c'est une violation
3. Proposer le refactoring correct

Format de réponse attendu :
❌ Violation trouvée dans SessionScreen.tsx:45
   → Code : const [isRecording, setIsRecording] = useState(false);
   → Problème : État géré dans la vue au lieu du hook
   → Solution : Déplacer dans useSession.ts
```

---

## 🧠 TIPS POUR TRAVAILLER EFFICACEMENT AVEC CLAUDE

### 1. **Découpage des tâches**

Si votre demande est complexe (> 500 lignes de code attendues) :

✅ **FAIRE** :
```
Étape 1 : Donne-moi la structure des fichiers à créer
Étape 2 : Génère le hook useReminders.ts
Étape 3 : Génère le composant ReminderModal.tsx
...
```

❌ **ÉVITER** :
```
Crée toute la feature reminders d'un coup
(résultat : code trop long, illisible, difficile à valider)
```

### 2. **Validation incrémentale**

Après chaque génération de code :

```
1. Lire le code généré
2. Vérifier qu'il respecte les patterns
3. Tester (copier-coller dans votre projet)
4. Valider ou demander corrections
5. Passer à l'étape suivante
```

### 3. **Utilisation des mots-clés**

Ces mots déclenchent chez Claude une attention particulière :

- **"Pattern MVVM"** → Claude va séparer Vue/Hook/Service
- **"Style glassmorphism"** → Claude va utiliser les bons tokens du theme
- **"Typage strict"** → Claude évitera les `any`
- **"Respect des règles du projet"** → Claude va relire la doc avant de coder
- **"Avec logs"** → Claude ajoutera des console.log préfixés
- **"Optimisé performance"** → Claude ajoutera memo, useCallback, useMemo

### 4. **Demander des explications**

N'hésitez pas à demander :

```
Explique-moi le choix de cette architecture
Pourquoi as-tu utilisé useCallback ici ?
Quelles sont les alternatives à cette approche ?
```

Claude peut justifier ses choix et vous aider à apprendre.

---

## 🔄 WORKFLOW RECOMMANDÉ

### Phase 1 : Planification (avec Claude)

```
Prompt :
"Je veux ajouter une feature X. Peux-tu :
1. Analyser l'impact sur l'architecture existante
2. Proposer une structure de fichiers
3. Lister les types TypeScript à créer/modifier
4. Identifier les dépendances (stores, services, hooks)"
```

→ Vous obtenez un **plan d'implémentation** validé

### Phase 2 : Implémentation (itérative)

```
Prompt :
"Génère le code du fichier Y en respectant le plan"
```

→ Copier-coller dans votre IDE → Tester → Valider

### Phase 3 : Revue (avec Claude)

```
Prompt :
"Analyse ce code que j'ai écrit et vérifie qu'il respecte les règles :
[coller votre code]"
```

→ Claude identifie les violations potentielles

### Phase 4 : Documentation (optionnelle)

```
Prompt :
"Génère un README.md pour la feature X qui explique :
- À quoi elle sert
- Comment l'utiliser
- L'architecture technique"
```

---

## 📊 MÉTRIQUES DE QUALITÉ

Utilisez ces critères pour évaluer le code généré par Claude :

```
✅ Respect du pattern MVVM (Vue/Hook/Service séparés)
✅ Typage TypeScript strict (zéro `any`)
✅ Styles dans fichier .styles.ts séparé
✅ Imports organisés (React → Libs → Local)
✅ Mémoïsation appropriée (memo, useCallback, useMemo)
✅ Gestion d'erreur robuste (try/catch + user feedback)
✅ Logging avec préfixes [ComponentName]
✅ Noms de variables/fonctions explicites
✅ Commentaires JSDoc sur la complexité métier uniquement
✅ Cohérence avec le design system (colors, typography, spacing)
```

Si 8/10 ou moins → Demander une révision ciblée

---

## ⚠️ PIÈGES À ÉVITER

### Piège 1 : Prompt trop vague

**Symptôme** : Claude génère du code générique qui ne colle pas au projet

**Solution** : Toujours mentionner "Respecte les règles du projet KnowIt"

### Piège 2 : Oublier le contexte

**Symptôme** : Claude ignore les fichiers existants et crée des doublons

**Solution** : Mentionner les fichiers concernés (ex: "Modifie useStore.ts en ajoutant...")

### Piège 3 : Accepter du code non typé

**Symptôme** : Des `any` se glissent dans le code

**Solution** : Systématiquement demander "Peux-tu typer strictement cette fonction ?"

### Piège 4 : Demander trop d'un coup

**Symptôme** : Réponse tronquée, code incomplet

**Solution** : Découper en petites tâches (1 fichier = 1 prompt)

---

## 🎯 CHECKLIST PRÉ-PROMPT

Avant de demander du code à Claude, vérifiez :

```
[ ] J'ai clairement défini l'objectif
[ ] J'ai listé les contraintes techniques
[ ] J'ai mentionné les fichiers concernés
[ ] J'ai rappelé le pattern à respecter (MVVM)
[ ] J'ai précisé si je veux tout d'un coup ou étape par étape
[ ] J'ai vérifié que Claude a accès au Project Knowledge
```

---

## 📞 FAQ

### Q1 : Claude ne respecte pas les règles, que faire ?

**R** : Ajoutez explicitement dans votre prompt :
```
IMPORTANT : Respecte strictement les règles définies dans 
KNOWIT_QUICK_REFERENCE.md, notamment :
- Pattern MVVM
- Styles dans fichier .styles.ts
- Typage strict
```

### Q2 : Le code généré est trop long pour être affiché

**R** : Demandez par morceaux :
```
Génère uniquement la partie [X] du fichier, 
je demanderai le reste après
```

### Q3 : Comment faire réviser du code existant ?

**R** :
```
Analyse ce fichier et indique les violations des règles :
[coller le code]

Fournis ensuite une version corrigée.
```

### Q4 : Claude hallucine des fonctionnalités inexistantes

**R** : Soyez plus précis sur ce qui existe :
```
Le fichier LLMService.ts existe déjà avec ces fonctions :
- transcribeAudio()
- analyzeText()

Ajoute UNIQUEMENT une nouvelle fonction generateSummary()
```

### Q5 : Comment demander du code optimisé ?

**R** :
```
Génère ce composant en l'optimisant pour :
1. Performance (memo, useCallback, useMemo)
2. Lisibilité (fonctions courtes, noms explicites)
3. Maintenabilité (commentaires sur la complexité)
```

---

## 🚦 PROCHAINES ÉTAPES

Maintenant que vous avez lu ce guide :

1. **Testez avec un prompt simple** :
   ```
   Crée un composant Button réutilisable dans shared/components/
   avec le style glassmorphism du projet
   ```

2. **Validez que Claude suit les règles** (voir le code généré)

3. **Itérez** si nécessaire avec les techniques de ce guide

4. **Augmentez progressivement la complexité** des prompts

---

## 📚 RESSOURCES COMPLÉMENTAIRES

- **KNOWIT_PROJECT_DOCUMENTATION.md** → Contexte global
- **KNOWIT_QUICK_REFERENCE.md** → Templates de code
- **KNOWIT_ARCHITECTURE_FLOW.md** → Diagrammes visuels

---

## 💡 PHILOSOPHIE

Cette documentation n'est pas figée. Si vous identifiez :
- Une règle manquante
- Un pattern répétitif non documenté
- Une meilleure façon de structurer les prompts

→ **Mettez à jour ces fichiers** et Claude s'adaptera automatiquement !

---

**Bon développement avec Claude ! 🚀**

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Auteur** : KnowIt Team
