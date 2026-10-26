<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -
  - Implements Talk Desktop Issue #1775: Tabs support for quick conversation switching
  -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Tab {
	token: string
	title: string
}

const tabs = ref<Tab[]>([])
const activeToken = ref<string>('')

const updateCurrentChatFromHash = () => {
	const hash = window.location.hash || ''
	const match = hash.match(/\/call\/([a-zA-Z0-9_-]+)/)
	if (match && match[1]) {
		const token = match[1]
		activeToken.value = token

		// Attempt to extract title from DOM
		const titleEl = document.querySelector('.top-bar__title, .header-title, [data-conversation-title]')
		const currentTitle = titleEl?.textContent?.trim() || `Rozmowa ${tabs.value.length + 1}`

		const existing = tabs.value.find(t => t.token === token)
		if (!existing) {
			tabs.value.push({ token, title: currentTitle })
			if (tabs.value.length > 6) {
				tabs.value.shift()
			}
		} else if (currentTitle && !currentTitle.startsWith('Rozmowa')) {
			existing.title = currentTitle
		}
	}
}

const selectTab = (token: string) => {
	activeToken.value = token
	window.location.hash = `#/call/${token}`
}

const closeTab = (token: string, e: Event) => {
	e.stopPropagation()
	tabs.value = tabs.value.filter(t => t.token !== token)
	if (activeToken.value === token) {
		if (tabs.value.length > 0) {
			selectTab(tabs.value[tabs.value.length - 1].token)
		} else {
			window.location.hash = '#/'
			activeToken.value = ''
		}
	}
}

onMounted(() => {
	window.addEventListener('hashchange', updateCurrentChatFromHash)
	setInterval(updateCurrentChatFromHash, 1500)
	updateCurrentChatFromHash()
})
</script>

<template>
	<div v-if="tabs.length > 0" class="conversation-tabs">
		<div
			v-for="tab in tabs"
			:key="tab.token"
			class="conversation-tab"
			:class="{ 'conversation-tab--active': tab.token === activeToken }"
			@click="selectTab(tab.token)"
		>
			<span class="conversation-tab__icon">💬</span>
			<span class="conversation-tab__title" :title="tab.title">{{ tab.title }}</span>
			<button class="conversation-tab__close" title="Zamknij kartę" @click="closeTab(tab.token, $event)">
				×
			</button>
		</div>
	</div>
</template>

<style scoped>
.conversation-tabs {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-left: 12px;
	max-width: 450px;
	overflow-x: auto;
	scrollbar-width: none;
	-webkit-app-region: no-drag;
}
.conversation-tabs::-webkit-scrollbar {
	display: none;
}
.conversation-tab {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 4px;
	font-size: 11px;
	color: #fff;
	cursor: pointer;
	white-space: nowrap;
	max-width: 140px;
	transition: all 0.15s ease;
}
.conversation-tab:hover {
	background: rgba(255, 255, 255, 0.18);
}
.conversation-tab--active {
	background: rgba(255, 255, 255, 0.25);
	border-color: rgba(255, 255, 255, 0.35);
	font-weight: 600;
}
.conversation-tab__title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.conversation-tab__close {
	background: transparent;
	border: none;
	color: rgba(255, 255, 255, 0.6);
	font-size: 13px;
	line-height: 1;
	padding: 0 2px;
	cursor: pointer;
	border-radius: 2px;
}
.conversation-tab__close:hover {
	color: #fff;
	background: rgba(255, 255, 255, 0.2);
}
</style>
