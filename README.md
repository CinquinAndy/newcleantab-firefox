# New Clean Tab

Une extension Firefox qui redirige les nouveaux onglets vers votre page d'accueil, tout en tentant de maintenir une URL propre dans la barre d'adresse.

## Installation pour le développement

1. Clonez ce dépôt
2. Installez les dépendances de développement avec `npm install`
3. Installez l'extension temporairement dans Firefox:
   - Ouvrez Firefox
   - Naviguez vers `about:debugging`
   - Cliquez sur "Ce Firefox"
   - Cliquez sur "Charger un module complémentaire temporaire..."
   - Sélectionnez le fichier `manifest.json` de ce projet

## Tests E2E

Ce projet inclut un système de test end-to-end qui vous permet de vérifier le fonctionnement de l'extension.

### Prérequis pour les tests

1. NodeJS et NPM installés
2. Firefox installé (de préférence Firefox Developer Edition)
3. Geckodriver installé pour Selenium:
   ```
   npm install -g geckodriver
   ```

### Préparation des tests

1. Installez les dépendances si ce n'est pas déjà fait:

   ```
   npm install
   ```

2. Générez les icônes requises:
   ```
   npm install canvas  # Si pas déjà installé
   node icon-generator.js
   ```

### Exécution des tests

Lancez les tests E2E avec:

```
npm test
```

Le test va:

1. Créer un fichier zip de l'extension
2. Lancer Firefox en mode automatisé
3. Ouvrir un nouvel onglet
4. Vérifier si la redirection et le nettoyage d'URL fonctionnent
5. Enregistrer une capture d'écran pour vérification manuelle

### Cycle de développement

Pour un cycle de développement rapide:

1. Modifiez le code de l'extension (background.js, newcleantab.js, etc.)
2. Exécutez `npm test` pour tester vos modifications
3. Vérifiez la capture d'écran et les logs de console
4. Répétez jusqu'à obtenir le comportement désiré

### Nettoyage

Pour nettoyer les fichiers temporaires:

```
npm run clean
```

## Structure des fichiers

- `manifest.json`: Configuration de l'extension
- `newcleantab.html`: Page HTML pour le nouvel onglet
- `newcleantab.js`: Script principal de l'extension
- `background.js`: Script d'arrière-plan pour la manipulation de l'URL
- `test-e2e.js`: Script de test automatisé
- `icon-generator.js`: Générateur d'icônes pour les tests
- `icon48.png` & `icon96.png`: Icônes de l'extension

## Conseils pour déboguer l'extension

1. Utilisez `about:debugging` et "Inspecter" pour voir les logs du background script
2. Dans le test e2e, regardez la capture d'écran générée
3. Consultez les logs de la console du navigateur
4. Si l'URL n'est pas nettoyée, essayez d'autres approches dans `background.js`

## Alternatives pour nettoyer l'URL

Si le nettoyage d'URL après redirection ne fonctionne pas, vous pouvez envisager:

1. Créer une page avec des liens rapides vers vos sites préférés
2. Modifier la page nouvel onglet pour afficher le site dans un iframe (peut être bloqué)
3. Utiliser une extension qui remplace complètement la page nouvel onglet

## Limitations connues

- Les politiques de sécurité des navigateurs modernes limitent la capacité à manipuler l'URL après redirection
- Certains sites utilisent des en-têtes CSP qui bloquent les manipulations de l'historique
- L'effacement de l'URL est une "meilleure tentative" et peut ne pas fonctionner sur tous les sites
