;(async function () {
	try {
		// Get homepage setting
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		// Get current tab ID before redirect (to help background script)
		const currentTab = await browser.tabs.getCurrent()

		// Save this tab ID in local storage as the most recent newtab
		await browser.storage.local.set({
			lastNewTabId: currentTab.id,
			lastNewTabTime: Date.now(),
		})

		// Redirect to homepage
		window.location.href = homepage
	} catch (error) {
		console.error('Error:', error)
		document.getElementById('loading').textContent = 'Error loading homepage'
	}
})()
