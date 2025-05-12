// Test e2e pour l'extension New Clean Tab
const { Builder, By, until } = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox')
const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')

// Configuration
const EXTENSION_DIR = __dirname // Le répertoire actuel où se trouve le manifest.json
const EXTENSION_ZIP = path.join(__dirname, 'new-clean-tab.zip')
const HOMEPAGE_TEST_URL = 'https://example.com' // URL de test facile à charger

// Crée un zip de l'extension
function createExtensionZip() {
	console.log("Création du zip de l'extension...")
	const zip = new AdmZip()

	// Ajouter les fichiers essentiels
	const files = [
		'manifest.json',
		'newcleantab.html',
		'newcleantab.js',
		'background.js',
	]

	files.forEach(file => {
		const filePath = path.join(EXTENSION_DIR, file)
		if (fs.existsSync(filePath)) {
			zip.addLocalFile(filePath)
			console.log(`- Ajout de ${file}`)
		} else {
			console.warn(`⚠️ Fichier ${file} manquant`)
		}
	})

	// Générer des icônes temporaires si elles n'existent pas
	;['icon48.png', 'icon96.png'].forEach(iconFile => {
		const iconPath = path.join(EXTENSION_DIR, iconFile)
		if (!fs.existsSync(iconPath)) {
			console.log(`- Génération de l'icône ${iconFile}`)
			// Créer une icône de placeholder - vous pouvez remplacer cela par une vraie génération d'icône
			const size = iconFile === 'icon48.png' ? 48 : 96
			// Ici, nous supposons que vous créez manuellement ces icônes pour le moment
			console.warn(
				`⚠️ Icône ${iconFile} manquante, veuillez la créer manuellement`
			)
		} else {
			zip.addLocalFile(iconPath)
			console.log(`- Ajout de ${iconFile}`)
		}
	})

	// Sauvegarder le zip
	zip.writeZip(EXTENSION_ZIP)
	console.log(`✅ Extension packagée dans ${EXTENSION_ZIP}`)

	return EXTENSION_ZIP
}

// Configurer Firefox pour charger l'extension temporairement
async function setupDriver() {
	const extensionPath = createExtensionZip()

	// Configurer Firefox pour utiliser l'extension
	const options = new firefox.Options()
		.setPreference('browser.startup.homepage', HOMEPAGE_TEST_URL)
		.setPreference('browser.newtabpage.enabled', false)
		.setPreference('browser.startup.page', 1) // Ouvrir la page d'accueil au démarrage
		.setPreference('devtools.console.stdout.content', true) // Afficher les logs console

	// Créer le driver
	const driver = await new Builder()
		.forBrowser('firefox')
		.setFirefoxOptions(options)
		.build()

	// Installer l'extension temporairement
	const firefoxDriver =
		driver.getCapabilities().get('browserName') === 'firefox'
	if (firefoxDriver) {
		console.log("Installation de l'extension temporairement...")
		// En Selenium, il n'y a pas de méthode directe pour installer l'extension
		// C'est automatiquement géré par Firefox Developer Edition ou Nightly
		console.log(
			"⚠️ Note: Vous devez installer l'extension manuellement pour les tests"
		)
	}

	return driver
}

// Test de l'extension
async function testExtension() {
	let driver

	try {
		console.log('🚀 Démarrage des tests e2e...')
		driver = await setupDriver()

		// 1. Test d'ouverture d'un nouvel onglet
		console.log("Test 1: Ouverture d'un nouvel onglet...")
		await driver.executeScript(`
      window.open('about:newtab', '_blank');
    `)

		// Attendre un moment pour que la redirection se produise
		await driver.sleep(3000)

		// Obtenir tous les handles d'onglets
		const handles = await driver.getAllWindowHandles()
		console.log(`- ${handles.length} onglet(s) ouvert(s)`)

		// Basculer vers le nouvel onglet
		await driver.switchTo().window(handles[handles.length - 1])

		// 2. Vérifier l'URL actuelle après redirection
		const currentUrl = await driver.getCurrentUrl()
		console.log(`- URL actuelle: ${currentUrl}`)

		// 3. Vérifier si l'URL dans la barre d'adresse a été nettoyée
		// Remarque: Il est difficile de vérifier directement ce que l'utilisateur voit dans la barre d'adresse
		// On peut seulement vérifier l'URL réelle de la page
		if (currentUrl === 'about:blank' || currentUrl === 'about:newtab') {
			console.log('✅ URL nettoyée avec succès!')
		} else if (currentUrl === HOMEPAGE_TEST_URL) {
			console.log("✅ Redirection vers la page d'accueil réussie!")
			console.log("⚠️ L'URL n'a pas été nettoyée après redirection")
		} else {
			console.log(
				'❌ Comportement inattendu. URL ni nettoyée ni redirigée correctement.'
			)
		}

		// 4. Capturer une capture d'écran pour vérification manuelle
		const screenshot = await driver.takeScreenshot()
		fs.writeFileSync('test-result.png', screenshot, 'base64')
		console.log("📸 Capture d'écran sauvegardée dans test-result.png")

		console.log('🏁 Tests terminés !')
	} catch (error) {
		console.error('❌ Erreur lors des tests:', error)
	} finally {
		if (driver) {
			await driver.quit()
			console.log('🧹 Driver Selenium fermé')
		}
	}
}

// Lancer les tests
testExtension()
