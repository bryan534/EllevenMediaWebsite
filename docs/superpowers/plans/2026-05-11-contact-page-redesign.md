# Contact Page Left Column Enrichment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the contact page left column with a brand statement, services list, and client logos strip — without touching the form or layout.

**Architecture:** Pure content/style changes to `src/routes/contact/+page.svelte`. Logo assets are copied from `/Users/bryan/Downloads/Brands/` into `static/images/clients/`. All new markup is added inside the existing `.contact-header` div. No server-side changes.

**Tech Stack:** SvelteKit, vanilla CSS (scoped component styles), static asset serving via `/static`

---

### Task 1: Copy logo assets to static directory

**Files:**
- Create: `static/images/clients/bazaart.webp`
- Create: `static/images/clients/ironbreed.avif`
- Create: `static/images/clients/jb.png`
- Create: `static/images/clients/bblogowhite.png`

- [ ] **Step 1: Create the clients directory**

```bash
mkdir -p /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients
```

- [ ] **Step 2: Copy logo files**

```bash
cp "/Users/bryan/Downloads/Brands/Bazaart_5DD4CBCD-0BD5-49C7-910A-2D2105D856DC-2.PNG.webp" \
   /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients/bazaart.webp

cp "/Users/bryan/Downloads/Brands/IronBreedlogo.D9U31G2H.avif" \
   /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients/ironbreed.avif

cp "/Users/bryan/Downloads/Brands/JB_Full_logo.png" \
   /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients/jb.png

cp "/Users/bryan/Downloads/Brands/bblogowhite-3.png" \
   /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients/bblogowhite.png
```

- [ ] **Step 3: Verify files exist**

```bash
ls /Users/bryan/Downloads/EllevenMediaWebsite/static/images/clients/
```

Expected output:
```
bazaart.webp  bblogowhite.png  ironbreed.avif  jb.png
```

---

### Task 2: Update contact page left column HTML

**Files:**
- Modify: `src/routes/contact/+page.svelte`

The `.contact-header` div currently contains: section tag, h1, contact-sub paragraph, and contact-info block. Replace the `contact-sub` paragraph and add services + logos sections.

- [ ] **Step 1: Replace the `contact-sub` paragraph with the brand statement**

In `src/routes/contact/+page.svelte`, find:

```html
			<p class="contact-sub">
				Whether you have a specific project in mind or just want to explore possibilities, we'd love to hear from you.
			</p>
```

Replace with:

```html
			<p class="contact-sub">
				Digital experiences, built to last.
			</p>
```

- [ ] **Step 2: Add services list after the contact-sub paragraph, before contact-info**

Find:

```html
			<div class="contact-info">
```

Insert before it:

```html
			<div class="services-block">
				<p class="block-label">What We Do</p>
				<ul class="services-list">
					<li>Web Design & Development</li>
					<li>SEO & Performance</li>
					<li>Hosting & Infrastructure</li>
					<li>Email & Domain Setup</li>
					<li>DevOps & Deployment</li>
				</ul>
			</div>

```

- [ ] **Step 3: Add client logos strip after contact-info**

Find:

```html
		</div>

		<div class="contact-form-wrapper">
```

Insert before `<div class="contact-form-wrapper">`:

```html
		<div class="clients-block">
			<p class="block-label">Trusted By</p>
			<div class="clients-logos">
				<img src="/images/clients/bazaart.webp" alt="Bazaart" />
				<img src="/images/clients/ironbreed.avif" alt="IronBreed" />
				<img src="/images/clients/jb.png" alt="JB" />
				<img src="/images/clients/bblogowhite.png" alt="BB" />
			</div>
		</div>

```

---

### Task 3: Add CSS for new elements

**Files:**
- Modify: `src/routes/contact/+page.svelte` (the `<style>` block)

- [ ] **Step 1: Add styles for brand statement**

In the `<style>` block, find:

```css
	.contact-sub {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-gray-400);
		margin-bottom: var(--space-2xl);
		max-width: 90%;
	}
```

Replace with:

```css
	.contact-sub {
		font-size: 1.2rem;
		line-height: 1.6;
		color: var(--color-white);
		font-weight: 400;
		margin-bottom: var(--space-2xl);
		max-width: 90%;
	}
```

- [ ] **Step 2: Add styles for block label, services list, and clients strip**

In the `<style>` block, after the `.contact-sub` rule, add:

```css
	.block-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-md);
	}

	.services-block {
		margin-bottom: var(--space-2xl);
	}

	.services-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		border-left: 1px solid rgba(255, 255, 255, 0.12);
		padding-left: var(--space-lg);
	}

	.services-list li {
		font-size: 0.95rem;
		color: var(--color-gray-300);
		line-height: 1.5;
	}

	.clients-block {
		margin-top: var(--space-3xl);
	}

	.clients-logos {
		display: flex;
		align-items: center;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.clients-logos img {
		height: 28px;
		width: auto;
		object-fit: contain;
		filter: brightness(0) invert(1);
		opacity: 0.6;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.clients-logos img:hover {
		opacity: 1;
	}
```

- [ ] **Step 3: Add responsive override for logos on mobile**

In the `<style>` block, find the `@media (max-width: 576px)` block and add inside it:

```css
		.clients-logos {
			gap: var(--space-lg);
		}

		.clients-logos img {
			height: 22px;
		}
```

---

### Task 4: Verify in browser

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/bryan/Downloads/EllevenMediaWebsite && npm run dev
```

- [ ] **Step 2: Open the contact page**

Navigate to `http://localhost:5173/contact`

- [ ] **Step 3: Verify each element**

Check:
- Brand statement reads "Digital experiences, built to last." in white
- "What We Do" label appears above the services list
- Services list shows all 5 items with left border
- "Trusted By" label and 4 logos appear below contact info
- Logos are white/inverted and semi-transparent
- Logos brighten on hover
- Form on the right is unchanged

- [ ] **Step 4: Check mobile layout**

Resize browser to 375px wide and verify logos wrap cleanly and nothing overflows.
