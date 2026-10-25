<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import axios from '@nextcloud/axios'
import { t } from '@nextcloud/l10n'
import { generateOcsUrl } from '@nextcloud/router'
import { onBeforeMount, ref } from 'vue'
import NcActionLink from '@nextcloud/vue/components/NcActionLink'
import NcActions from '@nextcloud/vue/components/NcActions'
import IconDotsGrid from 'vue-material-design-icons/DotsGrid.vue'
import { appData } from '../../../../app/AppData.js'

type NavApp = {
	id: string
	name: string
	href: string
	icon: string
}

const apps = ref<NavApp[]>([])
const serverUrl = (appData.serverUrl as unknown as string) || ''
const theming = appData.capabilities?.theming

onBeforeMount(async () => {
	try {
		const response = await axios.get(generateOcsUrl('core/navigation/apps'))
		apps.value = (response.data?.ocs?.data || []).filter(({ id }: { id: string }) => id !== 'spreed')
	} catch (err) {
		console.debug('Failed to fetch navigation apps:', err)
	}
})
</script>

<template>
	<NcActions :aria-label="t('talk_desktop', 'Menu')" variant="tertiary-no-background" force-menu>
		<template #icon>
			<IconDotsGrid :size="20" fillColor="var(--color-background-plain-text)" />
		</template>

		<NcActionLink v-if="serverUrl && theming?.name" :href="serverUrl" target="_blank">
			<template #icon>
				<span class="action-icon-wrapper">
					<img class="app-icon" :src="theming?.logo" alt="">
				</span>
			</template>
			{{ theming?.name || 'Nextcloud' }}
		</NcActionLink>
		<NcActionLink
			v-for="app in apps"
			:key="app.id"
			:href="app.href"
			target="_blank">
			<template #icon>
				<span class="action-icon-wrapper">
					<img class="app-icon" :src="app.icon" alt="">
				</span>
			</template>
			{{ app.name }}
		</NcActionLink>
	</NcActions>
</template>

<style scoped>
.action-icon-wrapper {
	width: var(--default-clickable-area, 44px);
	height: var(--default-clickable-area, 44px);
	display: flex;
	align-items: center;
	justify-content: center;
}

.app-icon {
	max-width: 20px;
	max-height: 20px;
	filter: var(--background-invert-if-bright);
}
</style>
