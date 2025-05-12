;(async function () {
	try {
		// Get homepage setting
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		// Simply redirect to the homepage immediately
		window.location.replace(homepage)
	} catch (error) {
		console.error('Error loading homepage:', error)
		document.body.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #555;">Error loading homepage. Please check your settings.</div>`
	}
})()
