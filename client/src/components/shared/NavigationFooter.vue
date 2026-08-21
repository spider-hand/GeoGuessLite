<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'SharedNavigationFooter',
})

const { t } = useI18n()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="navigation-footer">
    <div class="navigation-footer__content">
      <p class="navigation-footer__credit">
        {{ t('components.shared.NavigationFooter.credit', { year }) }}
      </p>

      <nav
        class="navigation-footer__actions"
        :aria-label="t('components.shared.NavigationFooter.navigationLabel')"
      >
        <RouterLink class="navigation-footer__action" to="/privacy">
          {{ t('components.shared.NavigationFooter.privacy') }}
        </RouterLink>
        <RouterLink class="navigation-footer__action" to="/terms">
          {{ t('components.shared.NavigationFooter.terms') }}
        </RouterLink>
        <a class="navigation-footer__action" href="mailto:creative.spider.hand@gmail.com">
          {{ t('components.shared.NavigationFooter.contact') }}
        </a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.navigation-footer {
  position: relative;
  z-index: 1;
  width: 100%;
  background-color: var(--on-primary);
}

.navigation-footer__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

.navigation-footer__credit {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body-sm);
}

.navigation-footer__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.navigation-footer__action {
  border: 0;
  padding: 6px 10px;
  background: transparent;
  color: var(--body);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body-sm);
  text-decoration: none;
  cursor: pointer;
  transition: color 160ms ease;
}

.navigation-footer__action:hover {
  color: var(--on-dark);
}

.navigation-footer__action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .navigation-footer__content {
    flex-wrap: wrap;
    padding-inline: var(--spacing-md);
  }

  .navigation-footer__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
