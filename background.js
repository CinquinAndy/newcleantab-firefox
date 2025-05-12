// Keep track of tabs that were created from our extension
let newTabsFromExtension = new Set()

// Listen for new tabs created by our extension
browser.tabs.onCreated.addListener(tab => {
	if (tab.url === 'about:newtab') {
		newTabsFromExtension.add(tab.id)
	}
})

// Listen for tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	// Process both loading and complete states
	if (changeInfo.status === 'loading' || changeInfo.status === 'complete') {
		try {
			// Check if this tab was created from our extension
			const data = await browser.storage.local.get([
				'lastNewTabId',
				'lastNewTabTime',
			])

			// If this is our tab and it was created recently
			if (
				data.lastNewTabId === tabId &&
				data.lastNewTabTime &&
				Date.now() - data.lastNewTabTime < 30000
			) {
				console.log(
					`[NewCleanTab] Tab ${tabId} identified as our new tab, status: ${changeInfo.status}, attempting URL cleaning...`
				)

				// AGGRESSIVE APPROACH: Try multiple methods in sequence

				// 1. First, try to redirect to a blank data URL that will then redirect to the homepage
				if (changeInfo.status === 'loading') {
					try {
						await browser.tabs.executeScript(tabId, {
							code: `
								(function() {
									console.log("[NewCleanTab] Aggressive loading phase intervention...");
									
									try {
										// Store the target URL we want to navigate to
										if (!sessionStorage.getItem('newCleanTabRedirectUrl')) {
											sessionStorage.setItem('newCleanTabRedirectUrl', window.location.href);
											console.log("[NewCleanTab] Stored redirect URL:", window.location.href);
											
											// Create a data URL that will handle the redirect with a clean URL
											const redirectCode = \`
												<!DOCTYPE html>
												<html>
													<head>
														<title>Redirecting...</title>
														<script>
															window.onload = function() {
																const targetUrl = sessionStorage.getItem('newCleanTabRedirectUrl');
																if (targetUrl) {
																	sessionStorage.removeItem('newCleanTabRedirectUrl');
																	// Use window.location.replace for a cleaner navigation
																	window.location.replace(targetUrl);
																	// Try to clean the URL immediately
																	history.replaceState({}, document.title, 'about:blank');
																}
															};
														</script>
													</head>
													<body style="margin:0;padding:0;overflow:hidden;">
														<div>Loading...</div>
													</body>
												</html>
											\`;
											
											// Redirect to the data URL
											const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(redirectCode);
											window.location.replace(dataUrl);
										}
									} catch(e) {
										console.error("[NewCleanTab] Aggressive loading intervention failed:", e);
									}
								})();
							`,
						})
					} catch (error) {
						console.error(
							'[NewCleanTab] Failed to execute aggressive loading script:',
							error
						)
					}
				}

				// 2. When complete, try to clean the URL and focus the address bar
				if (changeInfo.status === 'complete') {
					try {
						await browser.tabs.executeScript(tabId, {
							code: `
								(function() {
									console.log("[NewCleanTab] Aggressive complete phase intervention...");
									
									try {
										// Try to clean URL via history API
										history.replaceState({}, document.title, 'about:blank');
										console.log("[NewCleanTab] Replaced state with about:blank");
										
										// Force focus on address bar using keyboard shortcuts
										setTimeout(() => {
											try {
												// Create an input element to gain focus first
												const input = document.createElement('input');
												input.style.position = 'fixed';
												input.style.top = '0';
												input.style.left = '0';
												input.style.opacity = '0';
												document.body.appendChild(input);
												input.focus();
												
												// Try both common keyboard shortcuts
												const ctrlLEvent = new KeyboardEvent('keydown', {
													key: 'l',
													code: 'KeyL',
													keyCode: 76,
													which: 76,
													ctrlKey: true,
													bubbles: true
												});
												document.body.dispatchEvent(ctrlLEvent);
												
												// Remove the temporary input
												setTimeout(() => document.body.removeChild(input), 100);
											} catch(e) {
												console.error("[NewCleanTab] Focus attempt failed:", e);
											}
										}, 200);
									} catch(e) {
										console.error("[NewCleanTab] URL cleaning failed:", e);
									}
								})();
							`,
						})
					} catch (error) {
						console.error(
							'[NewCleanTab] Failed to execute URL cleaning script:',
							error
						)
					}

					// Clean up storage only after the complete phase
					await browser.storage.local.remove(['lastNewTabId', 'lastNewTabTime'])
					console.log(
						`[NewCleanTab] Finished URL cleaning attempts for tab ${tabId}`
					)
				}
			}
		} catch (error) {
			console.error('[NewCleanTab] Background script error:', error)
		}
	}
})

// Listen for navigation events to try to catch the very start of navigation
browser.tabs.onUpdated.addListener(
	(tabId, changeInfo, tab) => {
		if (changeInfo.url) {
			// If we see a URL change, try to clean it immediately
			browser.storage.local
				.get(['lastNewTabId', 'lastNewTabTime'])
				.then(data => {
					if (
						data.lastNewTabId === tabId &&
						data.lastNewTabTime &&
						Date.now() - data.lastNewTabTime < 30000
					) {
						console.log(
							`[NewCleanTab] URL change detected in tab ${tabId}, attempting early intervention`
						)

						browser.tabs
							.executeScript(tabId, {
								code: `
						(function() {
							console.log("[NewCleanTab] Early URL change intervention...");
							try {
								history.replaceState({}, document.title, 'about:blank');
							} catch(e) {
								console.error("[NewCleanTab] Early URL intervention failed:", e);
							}
						})();
					`,
							})
							.catch(error => {
								console.error(
									'[NewCleanTab] Failed to execute early URL intervention:',
									error
								)
							})
					}
				})
				.catch(error => {
					console.error('[NewCleanTab] Error checking tab data:', error)
				})
		}
	},
	{ urls: ['<all_urls>'] }
)

// Clean up when tabs are closed
browser.tabs.onRemoved.addListener(async tabId => {
	try {
		// Check if it was our tracked tab
		const data = await browser.storage.local.get('lastNewTabId')
		if (data.lastNewTabId === tabId) {
			// Clean up data
			await browser.storage.local.remove(['lastNewTabId', 'lastNewTabTime'])
			console.log(`[NewCleanTab] Cleaned up data for closed tab ${tabId}`)
		}
	} catch (error) {
		console.error('[NewCleanTab] Error during tab cleanup:', error)
	}
})
