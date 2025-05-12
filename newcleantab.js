;(async function () {
	// Find out what the homepage is set to
	const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
		.value
	const homepage = /^https?:\/\//.test(homepageRaw)
		? homepageRaw
		: 'http://' + homepageRaw

	// Set document title before navigation
	document.title = 'New Clean Tab'

	// Simply navigate to the homepage
	window.location.href = homepage
})()
