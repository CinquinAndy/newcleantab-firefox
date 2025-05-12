;(async function () {
	try {
		console.log('[NewCleanTab] New tab page initializing...')

		// Get homepage setting from browser
		console.log('[NewCleanTab] Getting homepage setting...')
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		console.log(`[NewCleanTab] Homepage configured as: ${homepage}`)

		// Get current tab ID before redirect
		const currentTab = await browser.tabs.getCurrent()
		console.log(`[NewCleanTab] Current tab ID: ${currentTab.id}`)

		// Save tab ID in local storage to identify it in the background script
		await browser.storage.local.set({
			lastNewTabId: currentTab.id,
			lastNewTabTime: Date.now(),
		})
		console.log(`[NewCleanTab] Tab ID saved for tracking`)

		// Redirect to homepage
		console.log(`[NewCleanTab] Redirecting to homepage...`)
		window.location.href = homepage
	} catch (error) {
		console.error('[NewCleanTab] Error:', error)
		document.getElementById('loading').textContent = 'Error loading homepage'
	}
})()
