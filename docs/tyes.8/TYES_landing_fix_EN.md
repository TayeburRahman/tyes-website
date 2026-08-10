# tyes.app — Landing Page: What's Broken and How to Fix It

Verified live on the production site, 8 August 2026. Everything below is measured from the files `tyes.app` actually serves, not from an impression of how the site looks.

---

## 1. What actually happened

The landing page was not modified. It was **replaced with an entirely different file**, and the original site was moved to `/main.html`.

| | `index.html` (what tyes.app serves) | `main.html` (the original site) |
|---|---|---|
| File size | **5,750 bytes** | **95,202 bytes** |
| `<section>` elements | **0** | 8 |
| Webflow interactions (`data-w-id`) | **0** | **17** |
| `<img>` elements | **0** | 31 |
| `<a>` links | **0** | 36 |
| `<h1>` elements | **0** | 1 |
| Text in the HTML | **57 characters** (the `<title>` only) | 6,235 characters |
| Stack | Tailwind CDN + `/landing/assets/index-B2KUD1UC.js` | Webflow export: `webflow.js`, jQuery, `globe.js`, Calendly |

`index.html` and `landing.html` are **byte-identical** (both 5,750 bytes).

**Why every animation is gone:** all of them were Webflow interactions, driven by `js/webflow.js` through `data-w-id` attributes. There are **17** of them. The new page does not load `webflow.js` at all and contains zero `data-w-id` attributes. Nothing is broken — the animations simply are not on the page that loads at the root any more. They are intact, on `/main.html`.

**What is left on the landing page:** a single screen — the 3D tunnel, the headline "Get Seen. Go Viral. Be In Shops.", and two buttons. Pressing `End` (jump to the bottom of the document) leaves you on the same screen. There is nothing below the hero.

---

## 2. The SEO problem, which is worse than the visual one

The root of the site returns **57 characters of text** and **zero links**. Everything a crawler sees before executing JavaScript is the `<title>` tag.

- Google indexes `tyes.app/` — a page with no `<h1>`, no content, and no internal links.
- Pricing, FAQ, How It Works and Retail Network all live on `/main.html`, which nothing links to except a single button. It is effectively an orphan page.
- `main.html` declares `<link rel="canonical" href="https://www.tyes.app/main.html">` and the same `og:url`, while `index.html` declares canonical `https://www.tyes.app/`. Two pages with **identical `<title>` and identical meta description**, pointing at different canonicals. That is self-reported duplicate content.
- With no `<h1>` on the root, there is no signal telling Google what the site is about.

Every week this stays live costs rankings that do not come back the moment it is fixed.

---

## 3. The fix — put the original site back at the root

Two commands. Nothing is deleted; the tunnel page is kept as a separate file.

```bash
# from the repo root
git mv index.html   splash.html
git mv main.html    index.html
git rm landing.html          # byte-identical duplicate of splash.html — optional, can stay
git commit -m "restore Webflow site at root, keep tunnel splash at /splash.html"
git push
```

Then three edits that are **not optional**:

**a) In the new `index.html` (formerly `main.html`)** — canonical and `og:url` must point at the root, not at `/main.html`:

```html
<link rel="canonical" href="https://www.tyes.app/">
<meta property="og:url" content="https://www.tyes.app/">
```

And the internal link that still points at the old address:

```html
<!-- replace -->
href="https://www.tyes.app/main.html"
<!-- with -->
href="https://www.tyes.app/"
```

**b) In `splash.html`** — its buttons pointed at `/main.html`; they now need to point at `/`:

```html
<a href="/">Get Started →</a>
```

Its canonical must no longer claim the root, or it competes with the real homepage:

```html
<link rel="canonical" href="https://www.tyes.app/splash.html">
<meta name="robots" content="noindex, follow">
```

**c) `vercel.json`** — so existing and already-indexed links do not 404:

```json
{
  "redirects": [
    { "source": "/main.html",    "destination": "/",             "permanent": true },
    { "source": "/landing.html", "destination": "/splash.html",  "permanent": false }
  ]
}
```

`permanent: true` on `/main.html` matters: it passes the SEO signals accumulated while the content lived there back to the root.

---

## 4. Alternative — keep the tunnel as a once-per-session intro

If the tunnel is worth keeping, it runs as an intro overlay on top of the real site. The root stays the Webflow page, so the SEO problem in §2 is still solved.

After the swap in §3, add this immediately after `<body>` in `index.html`:

```html
<div id="tyes-intro" style="position:fixed;inset:0;z-index:99999;background:#000">
  <iframe src="/splash.html?intro=1"
          style="width:100%;height:100%;border:0;display:block"
          title="tyes intro"></iframe>
</div>
<script>
(function () {
  var el = document.getElementById('tyes-intro');
  if (!el) return;

  // show the intro once per browser session
  if (sessionStorage.getItem('tyesIntroSeen')) { el.remove(); return; }
  document.documentElement.style.overflow = 'hidden';

  function dismiss() {
    sessionStorage.setItem('tyesIntroSeen', '1');
    el.style.transition = 'opacity .6s ease';
    el.style.opacity = '0';
    setTimeout(function () {
      el.remove();
      document.documentElement.style.overflow = '';
    }, 600);
  }

  window.addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data === 'tyes:intro-done') dismiss();
  });

  // safety net so nobody gets stuck in the intro
  setTimeout(dismiss, 9000);
})();
</script>
```

And in `splash.html`, so the intro's buttons dismiss the overlay instead of navigating:

```html
<script>
document.addEventListener('click', function (e) {
  if (new URLSearchParams(location.search).get('intro') !== '1') return;
  var t = e.target.closest('a, button');
  if (!t) return;
  e.preventDefault();
  parent.postMessage('tyes:intro-done', location.origin);
});
</script>
```

Be aware of the trade-off: the intro delays first paint and hurts LCP, the speed metric Google measures. If paid traffic lands on the root, the §3 version converts better.

---

## 5. Separate issues found during the same check

Kept apart from the main problem on purpose.

**Real, needs fixing.** The footer social links point at the networks' own homepages, not at the tyes profiles:

```html
href="https://facebook.com/"
href="https://www.linkedin.com/"
href="https://www.instagram.com/"
```

**Real, but a design decision rather than a bug.** On the tunnel page, the headline and both buttons are not visible on load. They only appear after roughly 14 scroll ticks. A visitor who lands and does not scroll sees no message and no call to action — only the tunnel.

**Cosmetic.** The outlined "Get Your Free Strategy" button is transparent, so tunnel images pass behind it and show through the label.

**Not a bug, despite appearances — do not "fix" this.** The "Get Your Free Image" and "Get Your Free Strategy" buttons have no `href` attribute in the HTML. They were clicked and tested: they work, navigation is handled in JavaScript and lands correctly on `/main.html`. Noted explicitly so it is not filed as a dead link.

---

## 6. Not verified

No repository access and no reachable web archive from this environment, so there is **no pixel-level comparison against the previous version**. The comparison above is between what the root serves today and `main.html`, which is the original Webflow export — that is how the 17 interactions were counted and located.

To retrieve the exact previous version, the Vercel deployment history is the fastest route: every past deployment stays live at its own URL. Vercel dashboard → the tyes project → Deployments → open one from before the change.

From git:

```bash
git log --oneline -- index.html main.html landing.html
git show <commit>:index.html > /tmp/index-previous.html
```

---

## Summary of what needs to be done

1. Swap the files so the root serves the Webflow site again (§3).
2. Fix canonical and `og:url` on the new root; add the `/main.html` → `/` permanent redirect (§3a, §3c).
3. Mark `splash.html` `noindex` and point its canonical at itself (§3b).
4. Fix the three footer social links (§5).
5. Decide whether the tunnel comes back as an intro (§4) — separate decision, not a blocker for items 1–4.
