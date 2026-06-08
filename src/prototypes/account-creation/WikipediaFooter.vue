<template>
  <footer class="wikipedia-footer">
    <div class="footer-content">
      <div class="footer-logo-section">
        <img src="./assets/wikipedia-wordmark.svg" alt="Wikipedia" class="footer-wordmark" />
        <ul class="footer-icons">
          <li>
            <a
              href="https://www.wikimedia.org/"
              class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"
            >
              <picture>
                <source media="(min-width: 500px)" :srcset="wikimediaButtonSvg" width="84" height="29" />
                <img src="./assets/wikimedia.svg" width="25" height="25" alt="Wikimedia Foundation" />
              </picture>
            </a>
          </li>
          <li>
            <a
              href="https://www.mediawiki.org/"
              class="cdx-button cdx-button--fake-button cdx-button--size-large cdx-button--fake-button--enabled"
            >
              <picture>
                <source
                  media="(min-width: 500px)"
                  :srcset="poweredbyMediawikiSvg"
                  width="88"
                  height="31"
                />
                <img
                  src="./assets/mediawiki-compact.svg"
                  width="25"
                  height="25"
                  alt="Powered by MediaWiki"
                />
              </picture>
            </a>
          </li>
        </ul>
      </div>

      <ul class="footer-links">
        <li>
          <a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Privacy_policy"
            >Privacy policy</a
          >
        </li>
        <li><a href="https://en.wikipedia.org/wiki/Wikipedia:Contact_us">Contact Wikipedia</a></li>
        <li>
          <a
            href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Legal:Wikimedia_Foundation_Legal_and_Safety_Contact_Information"
            >Legal &amp; safety contacts</a
          >
        </li>
        <li>
          <a
            href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Universal_Code_of_Conduct"
            >Code of Conduct</a
          >
        </li>
        <li><a href="https://developer.wikimedia.org/">Developers</a></li>
        <li><a href="https://stats.wikimedia.org/#/en.wikipedia.org">Statistics</a></li>
        <li>
          <a href="https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Cookie_statement"
            >Cookie statement</a
          >
        </li>
        <li>
          <a href="https://foundation.m.wikimedia.org/wiki/Special:MyLanguage/Policy:Terms_of_Use"
            >Terms of Use</a
          >
        </li>
        <li><a href="#">Desktop view</a></li>
      </ul>
    </div>
  </footer>
</template>

<script setup lang="ts">
import wikimediaButtonSvg from './assets/wikimedia-button.svg'
import poweredbyMediawikiSvg from './assets/poweredby-mediawiki.svg'
</script>

<style scoped>
.wikipedia-footer {
  background-color: var(--background-color-interactive);
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
  overflow: auto;
  padding-bottom: 6px;
}

.footer-content {
  overflow: auto;
  margin-top: 42px;
  padding: 0 var(--spacing-100);
}

.footer-content > * {
  margin-bottom: 9px;
}

.footer-logo-section {
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-wordmark {
  display: block;
  height: 22px;
  width: auto;
}

.footer-icons {
  display: flex;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-icons picture,
.footer-icons img {
  display: flex;
}

.footer-icons .cdx-button.cdx-button--fake-button--enabled,
.footer-icons .cdx-button.cdx-button--fake-button--enabled:hover,
.footer-icons .cdx-button.cdx-button--fake-button--enabled:active {
  background: var(--background-color-base-fixed, #fff);
}

.footer-links {
  list-style: none;
  padding: 0;
  font-size: 0.875em;
}

.footer-links li {
  display: inline-block;
  margin-right: 8px;
  line-height: 2;
}

.footer-links li::after {
  content: '\2022';
  padding-left: 8px;
  color: var(--color-progressive, #36c);
  font-size: 1em;
  line-height: 1;
}

.footer-links li:last-child::after {
  content: none;
}

@media (max-width: 500px) {
  .footer-icons .cdx-button {
    padding-left: 11px;
    padding-right: 11px;
  }
}
</style>
