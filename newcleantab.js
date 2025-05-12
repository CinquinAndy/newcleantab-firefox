;(async function () {
	try {
		console.log('[NewCleanTab] New tab page initializing...')

		// Get homepage setting from browser
		console.log('[NewCleanTab] Getting homepage setting...')
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value

		// Validate homepage URL
		if (!homepageRaw) {
			throw new Error('No homepage configured')
		}

		// Ensure URL has proper protocol
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		// Validate URL format
		try {
			new URL(homepage)
		} catch (e) {
			throw new Error('Invalid homepage URL format')
		}

		console.log(`[NewCleanTab] Homepage configured as: ${homepage}`)

		// Redirect to homepage
		console.log(`[NewCleanTab] Redirecting to homepage...`)
		window.location.href = homepage
	} catch (error) {
		console.error('[NewCleanTab] Error:', error)
		const loadingElement = document.getElementById('loading')
		if (loadingElement) {
			loadingElement.textContent = error.message || 'Error loading homepage'
		}
	}
})()
