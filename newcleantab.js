;(async function () {
	// Set document title
	document.title = 'New Clean Tab'

	// Clear the URL bar by using history.replaceState
	history.replaceState(null, document.title, 'about:newtab')

	// Get the loading element and iframe
	const loading = document.getElementById('loading')
	const frame = document.getElementById('frame')

	try {
		// Find out what the homepage is set to
		const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
			.value
		const homepage = /^https?:\/\//.test(homepageRaw)
			? homepageRaw
			: 'http://' + homepageRaw

		// Approach 1: Try direct iframe navigation first (for sites that allow framing)
		try {
			frame.src = homepage
			// Hide loading message after the iframe has loaded
			frame.onload = () => {
				loading.style.display = 'none'
				// Remove HTTP Referer for privacy
				frame.contentWindow.location.href = homepage
			}

			// Focus on URL bar after a short delay to ensure the page is loaded
			setTimeout(() => {
				// This trick helps focus the address bar in most browsers
				window.history.replaceState(null, document.title, 'about:newtab')
			}, 300)
		} catch (e) {
			// If iframe navigation fails, we fall back to opening in a new tab
			console.error('Iframe navigation failed, opening in new tab:', e)
			window.location.href = homepage
		}
	} catch (error) {
		console.error('Error:', error)
		loading.textContent = 'Error loading homepage'
	}
})()
