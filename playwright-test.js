// Test e2e pour l'extension New Clean Tab avec Playwright
const { chromium, firefox } = require('playwright')
const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')

// Configuration
const EXTENSION_DIR = __dirname
const EXTENSION_ZIP = path.join(__dirname, 'new-clean-tab.zip')
const HOMEPAGE_TEST_URL = 'https://example.com'

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

	// Vérifier que les icônes existent
	;['icon48.png', 'icon96.png'].forEach(iconFile => {
		const iconPath = path.join(EXTENSION_DIR, iconFile)
		if (fs.existsSync(iconPath)) {
			zip.addLocalFile(iconPath)
			console.log(`- Ajout de ${iconFile}`)
		} else {
			console.warn(
				`⚠️ Icône ${iconFile} manquante, assurez-vous de les générer avec node icon-generator.js`
			)
		}
	})

	// Sauvegarder le zip
	zip.writeZip(EXTENSION_ZIP)
	console.log(`✅ Extension packagée dans ${EXTENSION_ZIP}`)

	return EXTENSION_ZIP
}

// Test de l'extension
async function testExtension() {
	console.log('🚀 Démarrage des tests e2e avec Playwright...')

	// Créer le zip de l'extension
	const extensionPath = createExtensionZip()

	// Dézipper dans un dossier temporaire pour Playwright
	const tempExtDir = path.join(__dirname, 'temp-extension')
	if (fs.existsSync(tempExtDir)) {
		fs.rmSync(tempExtDir, { recursive: true, force: true })
	}
	fs.mkdirSync(tempExtDir, { recursive: true })

	const zip = new AdmZip(extensionPath)
	zip.extractAllTo(tempExtDir, true)

	// Lancer Firefox avec l'extension
	const browser = await firefox.launchPersistentContext(
		'.playwright-firefox-profile',
		{
			headless: false,
			viewport: { width: 1280, height: 720 },
			args: [`--load-extension=${tempExtDir}`],
			// Remplacer le Nouvel Onglet par notre extension
			firefoxUserPrefs: {
				'browser.startup.homepage': HOMEPAGE_TEST_URL,
				'browser.newtabpage.enabled': false,
				'browser.startup.page': 1,
				'devtools.console.stdout.content': true,
			},
		}
	)

	try {
		// Ouvrir une nouvelle page
		console.log("Ouverture d'un nouvel onglet...")
		const page = await browser.newPage()

		// Attendre un peu pour que la page charge
		await page.waitForTimeout(2000)

		// Déterminer si nous avons été redirigés vers la page d'accueil
		const currentUrl = page.url()
		console.log(`URL actuelle: ${currentUrl}`)

		// Vérifier le résultat
		if (currentUrl === 'about:blank' || currentUrl === 'about:newtab') {
			console.log('✅ URL nettoyée avec succès!')
		} else if (currentUrl === HOMEPAGE_TEST_URL) {
			console.log("✅ Redirection vers la page d'accueil réussie!")
			console.log("⚠️ L'URL n'a pas été nettoyée après redirection")

			// Vérifier visuellement si la barre d'URL est vide
			console.log('🔍 Analyse visuelle...')
			console.log(
				"Note: Impossible de vérifier programmatiquement le contenu de la barre d'URL"
			)
			console.log(
				"     Veuillez vérifier visuellement si la barre d'URL est vide"
			)
		} else {
			console.log(
				'❌ Comportement inattendu. URL ni nettoyée ni redirigée correctement.'
			)
		}

		// Prendre une capture d'écran (utile pour vérifier l'état de la barre d'URL)
		await page.screenshot({
			path: 'test-playwright-result.png',
			fullPage: true,
		})
		console.log(
			"📸 Capture d'écran sauvegardée dans test-playwright-result.png"
		)

		// Attendre 5 secondes pour observer manuellement le comportement
		console.log('⏳ Attente de 5 secondes pour observation manuelle...')
		await page.waitForTimeout(5000)

		console.log('🏁 Test terminé!')
	} catch (error) {
		console.error('❌ Erreur lors des tests:', error)
	} finally {
		// Fermer le navigateur
		await browser.close()
		console.log('🧹 Playwright terminé')

		// Nettoyer les fichiers temporaires
		if (fs.existsSync(tempExtDir)) {
			fs.rmSync(tempExtDir, { recursive: true, force: true })
		}
	}
}

// Lancer les tests
testExtension().catch(console.error)
