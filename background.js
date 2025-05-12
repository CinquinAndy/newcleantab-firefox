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

				// Méthode principale: Créer une nouvelle URL transparente
				try {
					await browser.tabs.executeScript(tabId, {
						code: `
							(function() {
								// Logger le début de notre opération
								console.log("Tentative de nettoyage de l'URL en cours...");
								
								try {
									// Sauvegarder le contenu actuel et le titre
									const currentHTML = document.documentElement.outerHTML;
									const currentTitle = document.title;
									
									// Créer une URL de données qui contient le HTML actuel
									const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(currentHTML);
									
									// Remplacer l'URL actuelle par notre URL de données transparente
									window.location.replace(dataUrl);
									
									// Le navigateur va recharger la page mais avec une URL data:
									console.log("Redirection vers URL data: initiée");
								} catch(e) {
									console.error("Échec de la méthode principale:", e);
								}
							})();
						`,
					})
				} catch (error) {
					console.error("Échec d'exécution du script principal:", error)
				}

				// Méthode alternative: Tenter de cliquer dans la barre d'URL après un délai
				setTimeout(async () => {
					try {
						await browser.tabs.executeScript(tabId, {
							code: `
								(function() {
									console.log("Méthode de focus sur la barre d'URL...");
									
									try {
										// Créer un input temporaire, focus dessus puis le supprimer
										const input = document.createElement('input');
										input.style.position = 'fixed';
										input.style.top = '0';
										input.style.left = '0';
										input.style.opacity = '0';
										
										document.body.appendChild(input);
										input.focus();
										
										// Presser Escape pour annuler toute complétion auto
										const escEvent = new KeyboardEvent('keydown', { 
											key: 'Escape', 
											code: 'Escape',
											keyCode: 27, 
											which: 27,
											bubbles: true
										});
										input.dispatchEvent(escEvent);
										
										// Presser Ctrl+L pour aller à la barre d'adresse
										const ctrlLEvent = new KeyboardEvent('keydown', { 
											key: 'l', 
											code: 'KeyL',
											keyCode: 76, 
											which: 76,
											ctrlKey: true,
											bubbles: true
										});
										document.body.dispatchEvent(ctrlLEvent);
										
										// Simuler un clic sur la barre d'adresse (pas toujours possible)
										// Puis supprimer l'élément
										setTimeout(() => document.body.removeChild(input), 100);
										
										console.log("Focus sur la barre d'URL tenté");
									} catch(e) {
										console.error("Échec de la méthode de focus:", e);
									}
								})();
							`,
						})
					} catch (error) {
						console.error("Échec d'exécution du script de focus:", error)
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
