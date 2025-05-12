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

		// Create a data URL that will handle the redirect
		const redirectCode = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Redirecting...</title>
					<script>
						// Execute immediately
						window.location.replace("${homepage}");
						// Try to clean URL
						history.replaceState({}, document.title, 'about:blank');
					</script>
				</head>
				<body style="margin:0;padding:0;overflow:hidden;">
					<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#888;">
						Loading homepage...
					</div>
				</body>
			</html>
		`

		// Redirect to the data URL
		const dataUrl =
			'data:text/html;charset=utf-8,' + encodeURIComponent(redirectCode)
		window.location.replace(dataUrl)
	} catch (error) {
		console.error('[NewCleanTab] Error:', error)
		const loadingElement = document.getElementById('loading')
		if (loadingElement) {
			loadingElement.textContent = error.message || 'Error loading homepage'
		}
	}
})()
