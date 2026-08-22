<script setup lang="ts">
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
</script>

<template>
  <main class="terms-page">
    <NavigationHeader />

    <article class="terms-page__content">
      <header class="terms-page__header">
        <h1>Terms of Service</h1>
        <p>Last updated: August 21, 2026</p>
      </header>

      <section>
        <h2>Using GeoGuessLite</h2>
        <p>
          By using GeoGuessLite, you agree to these Terms of Service. GeoGuessLite is provided for
          playing chess with AI opponents and other players.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <p>
          Use GeoGuessLite lawfully and respectfully. Do not misuse the service, interfere with
          other players, attempt unauthorized access, or use the service to harm others.
        </p>
      </section>

      <section>
        <h2>Accounts and game activity</h2>
        <p>
          Some features require signing in with Google. You are responsible for activity carried out
          through your account and for the information you choose to share while using GeoGuess
          Lite.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          GeoGuessLite may change, suspend, or discontinue features at any time. The service is
          provided as available, without warranties of any kind.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by applicable law, GeoGuessLite is not liable for
          indirect, incidental, special, consequential, or punitive damages arising from your use of
          the service.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. The latest version will be posted on this
          page with its updated date.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these Terms can be sent to
          <a href="mailto:creative.spider.hand@gmail.com">creative.spider.hand@gmail.com</a>.
        </p>
      </section>
    </article>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.terms-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.terms-page__content {
  flex: 1;
  width: min(100%, 800px);
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  color: var(--body);
}

.terms-page__header {
  margin-bottom: var(--spacing-xxl);
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: var(--on-dark);
  font-size: var(--font-size-display-sm);
  line-height: var(--line-height-display-sm);
}

h2 {
  color: var(--on-dark);
  font-size: var(--font-size-title-lg);
  line-height: var(--line-height-title-lg);
}

p {
  color: var(--muted-strong);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

.terms-page__header p {
  margin-top: var(--spacing-sm);
}

section + section {
  margin-top: var(--spacing-xl);
}

section p {
  margin-top: var(--spacing-sm);
}

a {
  color: var(--primary);
}

@media (max-width: 640px) {
  .terms-page__content {
    padding: var(--spacing-xl) var(--spacing-md);
  }
}
</style>
