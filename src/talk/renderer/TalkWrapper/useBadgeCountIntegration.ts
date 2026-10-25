/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { subscribe } from '@nextcloud/event-bus'

/**
 * Unread counts published by Talk via the public `talk:unread:updated` event.
 */
type TalkUnreadCounts = {
	/** Number of non-archived conversations with unread messages */
	conversations: number
	/** Total number of unread messages */
	messages: number
	/** Number of conversations with an unread mention */
	mentions: number
	/** Number of conversations with an unread direct mention */
	mentionsDirect: number
}

declare module '@nextcloud/event-bus' {
	interface NextcloudEvents {
		'talk:unread:updated': TalkUnreadCounts
	}
}

let isInitialized = false

/**
 * Set the app badge counter according to Talk's unread message count.
 */
export function useBadgeCountIntegration(): void {
	if (isInitialized) {
		return
	}
	isInitialized = true

	subscribe('talk:unread:updated', (counts) => {
		window.TALK_DESKTOP.setBadgeCount(counts.messages)
	})
}
