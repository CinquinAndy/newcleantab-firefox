;(async function () {
	try {
		// Get homepage setting
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		window.location.href = homepage
	} catch (error) {
		console.error('Error:', error)
		document.body.textContent =
			'Error loading homepage. Please check your settings.'
	}
})()
