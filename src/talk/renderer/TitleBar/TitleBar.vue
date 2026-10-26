<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import AppsMenu from './components/AppsMenu.vue'
import DevMenu from './components/DevMenu.vue'
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import ConversationTabs from './components/ConversationTabs.vue'
import { BUILD_CONFIG } from '../../../shared/build.config.ts'
import { useDevMode } from '../../../shared/useDevMode.ts'
import { useAppConfigStore } from '../Settings/appConfig.store.ts'
import { useHeartbeat } from '../UserStatus/useHeartbeat.ts'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'
import hurikoLogo from '../../../../img/huriko-logo.png'

useUserStatusStore()
useHeartbeat()
useAppConfigStore()

const channel = __CHANNEL__

const OS = window.systemInfo

const applicationName = BUILD_CONFIG.applicationName

const { isDevMode } = useDevMode()
</script>

<template>
	<header class="title-bar">
		<div class="title-bar__inner">
			<template v-if="!OS.isMac">
				<div class="title-bar__title">
					{{ applicationName }}
				</div>

				<div class="title-bar__fork-badge">
					<img :src="hurikoLogo" class="title-bar__huriko-logo" alt="Huriko" />
					<span>Fork by Sairento</span>
				</div>

				<div v-if="channel !== 'stable'" class="title-bar__channel">
					{{ channel }}
				</div>
			</template>

			<ConversationTabs />

			<div class="spacer" />

			<div v-if="isDevMode" class="title-bar__item" data-theme-dark>
				<DevMenu />
			</div>

			<div class="title-bar__item" data-theme-dark>
				<AppsMenu />
			</div>

			<div class="title-bar__item title-bar__main-menu-container" data-theme-dark>
				<MainMenu />
			</div>

			<div class="title-bar__item">
				<UserMenu />
			</div>
		</div>
	</header>
</template>

<style scoped>
.title-bar {
	display: flex;
	height: var(--header-height);
	margin-bottom: calc(-1 * var(--header-height));
	box-sizing: border-box;
	color: var(--color-background-plain-text);
	user-select: none;
}

.title-bar__inner {
	flex: 1;
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	/* Note: titlebar-area-x always represents left offset */
	/* Logical properties cannot be used here */
	margin-inline: env(titlebar-area-x, 0) auto;
	max-width: env(titlebar-area-width, 100%);
	/* Inline with navigation items */
	padding-inline-start: calc(3 * var(--default-grid-baseline));
}

.title-bar__item {
	width: var(--header-height); /* Make it square */
	display: flex;
	justify-content: center;
}

.title-bar__title {
	margin-inline-end: calc(var(--default-grid-baseline) * 2);
	position: relative;
	font-size: 18px;
	font-weight: bold;
	&:focus-visible::after {
		bottom: 0;
	}
}

.title-bar__fork-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #ffffff;
	background: rgba(0, 130, 201, 0.45);
	border: 1px solid rgba(255, 255, 255, 0.35);
	padding: 2px 9px 2px 6px;
	border-radius: 12px;
	margin-inline-end: calc(var(--default-grid-baseline) * 2);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.title-bar__huriko-logo {
	height: 14px;
	width: auto;
	vertical-align: middle;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.title-bar__channel {
	text-transform: capitalize;
}

.spacer {
	flex: 1 0 auto;
	height: 100%;
	-webkit-app-region: drag;
}

.title-bar__main-menu-container {
	/* Increase the trigger button size to fill the title bar except for 4px paddings */
	/* Aligns NcAction's popover with the title bar with 4px distance */
	/* TODO: instead, either add distance prop to NcActions or decrease the title bar size to 34px + 4px * 2 */
	--default-clickable-area: 38px;
}
</style>
