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
				// Essayer de nettoyer l'URL
				setTimeout(() => {
					browser.tabs
						.executeScript(tabId, {
							code: `
							// Essayer de nettoyer l'URL sans navigation
							try {
								let currentTitle = document.title;
								// Remplacer l'URL dans l'historique du navigateur
								history.replaceState({}, currentTitle, 'about:blank');
								// Forcer le focus sur la barre d'URL
								setTimeout(() => {
									const tmpInput = document.createElement('input');
									document.body.appendChild(tmpInput);
									tmpInput.focus();
									document.body.removeChild(tmpInput);
								}, 100);
							} catch(e) {
								console.error("Échec du nettoyage de l'URL:", e);
							}
						`,
						})
						.catch(error => {
							console.error("L'exécution du script a échoué:", error)
						})
				}, 500) // Délai court pour s'assurer que la page est stable

				// Supprimer les données de stockage
				await browser.storage.local.remove(['lastNewTabId', 'lastNewTabTime'])
			}
		} catch (error) {
			console.error("Erreur dans le script d'arrière-plan:", error)
		}
	}
})

// Clean up our set when tabs are closed
browser.tabs.onRemoved.addListener(tabId => {
	newTabsFromExtension.delete(tabId)
})
