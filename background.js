// Keep track of tabs that were created from our extension
let newTabsFromExtension = new Set()

// Listen for new tabs created by our extension
browser.tabs.onCreated.addListener(tab => {
	if (tab.url === 'about:newtab') {
		newTabsFromExtension.add(tab.id)
	}
})

// Listen for tab URL changes
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	// Si l'onglet a fini de charger
	if (changeInfo.status === 'complete') {
		try {
			// Vérifier si cet onglet est le dernier nouvel onglet créé
			const data = await browser.storage.local.get([
				'lastNewTabId',
				'lastNewTabTime',
			])

			// Si c'est notre onglet et qu'il a été créé il y a moins de 30 secondes
			if (
				data.lastNewTabId === tabId &&
				data.lastNewTabTime &&
				Date.now() - data.lastNewTabTime < 30000
			) {
				console.log(
					"Tab identifiée comme nouvel onglet, tentative de nettoyage d'URL..."
				)

				// Méthode 1: Remplacer l'URL via history.replaceState
				try {
					await browser.tabs.executeScript(tabId, {
						code: `
							console.log("Méthode 1: Tentative d'utilisation de history.replaceState")
							try {
								history.replaceState({}, document.title, 'about:blank')
								console.log("history.replaceState exécuté")
							} catch(e) {
								console.error("Méthode 1 échouée:", e)
							}
						`,
					})
				} catch (error) {
					console.error("Méthode 1 n'a pas pu être exécutée:", error)
				}

				// Méthode 2: Tentative avec navigation dans l'historique
				setTimeout(async () => {
					try {
						await browser.tabs.executeScript(tabId, {
							code: `
								console.log("Méthode 2: Tentative avec manipulation de l'historique")
								try {
									// Sauvegarder l'URL actuelle et le titre
									const currentURL = window.location.href
									const currentTitle = document.title
									
									// Ajouter une entrée d'historique bidon
									history.pushState({}, "New Tab", "about:blank")
									
									// Revenir à l'URL originale mais sans changer l'URL visible
									history.replaceState({}, currentTitle, "about:blank")
									
									console.log("Manipulation d'historique effectuée")
								} catch(e) {
									console.error("Méthode 2 échouée:", e)
								}
							`,
						})
					} catch (error) {
						console.error("Méthode 2 n'a pas pu être exécutée:", error)
					}
				}, 500)

				// Méthode 3: Tentative de focus sur la barre d'URL
				setTimeout(async () => {
					try {
						await browser.tabs.executeScript(tabId, {
							code: `
								console.log("Méthode 3: Tentative de focus sur la barre d'URL")
								try {
									// Créer un élément input temporaire
									const tmpInput = document.createElement('input')
									document.body.appendChild(tmpInput)
									
									// Focus sur l'input puis le supprimer
									tmpInput.focus()
									document.body.removeChild(tmpInput)
									
									// Forcer le focus sur la barre d'URL avec un petit délai
									setTimeout(() => {
										window.location.href = "about:blank#"
										history.replaceState({}, document.title, "about:blank")
									}, 50)
									
									console.log("Focus sur la barre d'URL tenté")
								} catch(e) {
									console.error("Méthode 3 échouée:", e)
								}
							`,
						})
					} catch (error) {
						console.error("Méthode 3 n'a pas pu être exécutée:", error)
					}
				}, 1000)

				// Nettoyer les données de stockage quoi qu'il arrive
				await browser.storage.local.remove(['lastNewTabId', 'lastNewTabTime'])
				console.log(
					"Nettoyage d'URL terminé (résultat à vérifier visuellement)"
				)
			}
		} catch (error) {
			console.error("Erreur dans le script d'arrière-plan:", error)
		}
	}
})

// Clean up our set when tabs are closed
browser.tabs.onRemoved.addListener(async tabId => {
	try {
		// Vérifier si c'était notre onglet suivi
		const data = await browser.storage.local.get('lastNewTabId')
		if (data.lastNewTabId === tabId) {
			// Nettoyer les données
			await browser.storage.local.remove(['lastNewTabId', 'lastNewTabTime'])
			console.log("Données nettoyées car l'onglet suivi a été fermé")
		}
	} catch (error) {
		console.error("Erreur lors du nettoyage à la fermeture d'onglet:", error)
	}
})
