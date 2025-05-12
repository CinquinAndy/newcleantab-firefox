;(async function () {
	try {
		// Set document title
		document.title = 'New Clean Tab'

		// Get homepage setting
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		// Get the current tab
		const currentTab = await browser.tabs.getCurrent()

		// Use two-step approach:
		// 1. Load the homepage using tabs.update
		await browser.tabs.update(currentTab.id, {
			url: homepage,
			loadReplace: true, // This attempts to replace the current history entry
		})

		// 2. After a delay, try to clean the URL bar (this is a best-effort approach)
		setTimeout(async () => {
			try {
				// Execute script in the tab to clean the URL
				await browser.tabs.executeScript(currentTab.id, {
					code: `
						try {
							// Attempt to replace the current history entry to a cleaner URL
							history.replaceState({}, document.title, 'about:newtab');
						} catch (e) {
							console.error("Failed to clean URL:", e);
						}
					`,
				})
			} catch (err) {
				console.error('Failed to execute clean-up script:', err)
			}
		}, 1000)
	} catch (error) {
		console.error('Error loading homepage:', error)
		document.body.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #555;">Error loading homepage. Please check your settings.</div>`
	}
})()
