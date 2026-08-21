<script setup lang="ts">
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
</script>

<template>
  <main class="privacy-page">
    <NavigationHeader />

    <article class="privacy-page__content">
      <header class="privacy-page__header">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 21, 2026</p>
      </header>

      <section>
        <h2>Information we collect</h2>
        <p>
          GeoGuess Lite collects your Google account identifier and display name when you sign in.
          We also store your optional country selection, account details, game records, and the
          language you select for the app.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          We use this information to authenticate you, provide games and player features, maintain
          the service, and display the language you choose.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          GeoGuess Lite uses Google Firebase for authentication and real-time game state, and
          AWS-hosted infrastructure to operate the service. These providers process information as
          needed to provide their services.
        </p>
      </section>

      <section>
        <h2>Browser storage</h2>
        <p>
          We store your selected language in browser storage. Firebase may also use browser storage
          to keep you signed in.
        </p>
      </section>

      <section>
        <h2>Account deletion</h2>
        <p>
          Registered users can delete their account from the User page. This removes account and
          profile data, but historical game records may be retained where needed for service
          integrity.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest version will be posted on
          this page with its updated date.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this Privacy Policy can be sent to
          <a href="mailto:creative.spider.hand@gmail.com">creative.spider.hand@gmail.com</a>.
        </p>
      </section>
    </article>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.privacy-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.privacy-page__content {
  flex: 1;
  width: min(100%, 800px);
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  color: var(--body);
}

.privacy-page__header {
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

.privacy-page__header p {
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
  .privacy-page__content {
    padding: var(--spacing-xl) var(--spacing-md);
  }
}
</style>
