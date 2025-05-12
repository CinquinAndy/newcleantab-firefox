;(async function () {
	// Find out what the homepage is set to
	const homepageRaw = (await browser.browserSettings.homepageOverride.get({}))
		.value
	const homepage = /^https?:\/\//.test(homepageRaw)
		? homepageRaw
		: 'http://' + homepageRaw
	document.querySelector('iframe').src = homepage

	// Set document title
	document.title = 'New Clean Tab'

	// Clear the URL bar by using history.replaceState
	history.replaceState(null, document.title, 'about:newtab')

	// Focus on URL bar after a short delay to ensure the page is loaded
	setTimeout(() => {
		// This trick helps focus the address bar in most browsers
		window.location.href = 'about:newtab#focus'
		window.location.href = 'about:newtab'
	}, 100)

	// When we navigate away from the homepage, navigate the top level instead
	const currTab = await browser.tabs.getCurrent()
	browser.webNavigation.onBeforeNavigate.addListener(e => {
		console.log(e)
		if (e.tabId === currTab.id && e.frameId !== 0 && e.parentFrameId === 0) {
			window.location.href = e.url
		}
	})
})()
