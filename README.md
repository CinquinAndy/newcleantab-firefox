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

Ce projet inclut deux systèmes de test end-to-end qui vous permettent de vérifier le fonctionnement de l'extension.

### Prérequis pour les tests

1. NodeJS et NPM installés
2. Firefox installé (de préférence Firefox Developer Edition)
3. Pour les tests Selenium, Geckodriver installé:
   ```
   npm install -g geckodriver
   ```

### Préparation des tests

1. Installez les dépendances:

   ```
   npm install
   ```

2. Générez les icônes requises:
   ```
   npm run icons
   ```

### Exécution des tests

#### Tests avec Playwright (recommandé)

Lancez les tests avec Playwright:

```
npm run test:playwright
```

Playwright offre:

- Une meilleure intégration avec Firefox
- Une observation visuelle plus facile (mode graphique)
- Une pause de 5 secondes à la fin pour observer le résultat

#### Tests avec Selenium (alternative)

Lancez les tests avec Selenium:

```
npm test
```

### Cycle de développement

Pour un cycle de développement rapide:

1. Modifiez le code de l'extension (background.js, newcleantab.js, etc.)
2. Exécutez `npm run test:playwright` pour tester vos modifications
3. Observez visuellement le comportement et vérifiez les logs de console
4. Vérifiez la capture d'écran générée
5. Répétez jusqu'à obtenir le comportement désiré

### Nettoyage

Pour nettoyer les fichiers temporaires:

```
npm run clean
```

## Méthodes implémentées pour nettoyer l'URL

Cette extension utilise plusieurs approches pour tenter de nettoyer l'URL:

1. **Méthode principale**: Remplace la page actuelle par une version "data:URL" qui contient le même contenu mais avec une URL propre.

2. **Méthode alternative**: Tente de forcer le focus sur la barre d'URL en:
   - Créant un champ de texte temporaire
   - Utilisant le raccourci clavier Ctrl+L (commande universelle pour sélectionner la barre d'adresse)
   - Simulant des événements de touches pour effacer la barre d'adresse

## Structure des fichiers

- `manifest.json`: Configuration de l'extension
- `newcleantab.html`: Page HTML pour le nouvel onglet
- `newcleantab.js`: Script principal de l'extension
- `background.js`: Script d'arrière-plan pour la manipulation de l'URL
- `test-e2e.js`: Script de test avec Selenium
- `playwright-test.js`: Script de test avec Playwright
- `icon-generator.js`: Générateur d'icônes pour les tests
- `icon48.png` & `icon96.png`: Icônes de l'extension

## Conseils pour déboguer l'extension

1. Utilisez `about:debugging` et "Inspecter" pour voir les logs du background script
2. Observez les tests Playwright qui s'exécutent visuellement
3. Examinez les captures d'écran générées
4. Si l'URL n'est pas nettoyée, essayez d'autres approches dans `background.js`

## Alternatives pour nettoyer l'URL

Si le nettoyage d'URL après redirection ne fonctionne pas, vous pouvez envisager:

1. Créer une page avec des liens rapides vers vos sites préférés
2. Modifier la page nouvel onglet pour afficher le site dans un iframe (peut être bloqué)
3. Utiliser une extension qui remplace complètement la page nouvel onglet

## Limitations connues

- Les politiques de sécurité des navigateurs modernes limitent la capacité à manipuler l'URL après redirection
- Les extensions peuvent avoir des limitations d'accès à la barre d'URL pour des raisons de sécurité
- Certains sites utilisent des en-têtes CSP qui bloquent les manipulations de l'historique
- L'effacement de l'URL est une "meilleure tentative" et peut ne pas fonctionner sur tous les sites
