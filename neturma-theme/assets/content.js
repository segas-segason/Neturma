const data = window.neturmaContent || {};
const one = (selector) => document.querySelector(selector);
const all = (selector) => Array.from(document.querySelectorAll(selector));
const text = (selector, value) => {
	const element = one(selector);
	if (element && value) element.textContent = value;
};
const html = (selector, value) => {
	const element = one(selector);
	if (element && value) element.innerHTML = value;
};
const section = (root, values) => {
	if (!values) return;
	text(`${root} #trigger-title`, values.title);
	const subtitle = one(`${root} header > div > p`);
	if (subtitle && values.subtitle) subtitle.innerHTML = values.subtitle;
};
const setGalleryImages = (selector, images) => {
	if (!Array.isArray(images) || !images.length) return;
	const links = all(selector);
	links.forEach((link, index) => {
		const image = images[index];
		if (!image) {
			link.closest('.f-carousel__slide, div')?.remove();
			return;
		}
		link.href = image.url;
		const node = link.querySelector('img');
		if (node) {
			node.src = image.url;
			node.alt = image.alt || '';
		}
	});
};
const setFaq = (items) => {
	if (!Array.isArray(items) || !items.length) return;
	const current = all('[data-question]');
	if (!current.length) return;
	const parent = current[0].parentElement;
	parent.innerHTML = items.map((item) => `<article class="faq-item border-b-2 border-primary last:border-b-0" data-question><button type="button" class="faq-item__trigger relative flex w-full cursor-pointer py-6 text-left"><span class="faq-item__icon absolute left-4 sm:left-6 xl:left-12">+</span><span class="mx-auto w-full max-w-406.25 pl-10 pr-4 sm:pl-14 sm:pr-6 xl:px-20">${item.question || ''}</span></button><div class="faq-item__content h-0 overflow-hidden"><div class="mx-auto w-full max-w-406.25 pb-6 pl-10 pr-4 sm:pl-14 sm:pr-6 xl:px-20">${item.answer || ''}</div></div></article>`).join('');
};
const setLinks = () => {
	const ticket = data.ticket || {};
	all('#sidebar-btn, a.btn').forEach((link) => {
		if (!ticket.url) return;
		if (/билет/i.test(link.textContent)) {
			link.href = ticket.url;
			link.textContent = ticket.title || link.textContent;
			if (ticket.target) link.target = ticket.target;
		}
	});
};
const setContacts = () => {
	const contacts = data.contacts || {};
	const footer = one('#footer .grid');
	const email = one('#footer a[href^="mailto:"]');
	if (email && contacts.infoEmail) {
		email.href = `mailto:${contacts.infoEmail}`;
		email.textContent = contacts.infoEmail;
	}
	if (footer && Array.isArray(contacts.socials) && contacts.socials.length) {
		const social = document.createElement('div');
		social.className = 'row-end-2 md:row-end-1 flex min-w-0 flex-col gap-6 xl:gap-10';
		social.innerHTML = `<div class="border-b-2 border-b-primary pb-4 pt-6 px-6 xl:px-10 xl:pb-6 xl:pt-10"><h3 class="text-primary">Подписывайся</h3></div><nav class="flex flex-col gap-4 xl:gap-6">${contacts.socials.map((item) => `<a href="${item.url || '#'}" class="transition-colors hover:text-primary px-6 xl:px-10" target="_blank" rel="noopener">${item.title || item.url || ''}</a>`).join('')}</nav>`;
		footer.insertBefore(social, footer.lastElementChild);
	}
	if (footer && (contacts.contactEmail || (Array.isArray(contacts.phones) && contacts.phones.length))) {
		const contact = document.createElement('div');
		contact.className = 'row-end-3 md:row-end-1 flex min-w-0 flex-col gap-6 xl:gap-10';
		const contactEmail = contacts.contactEmail ? `<a href="mailto:${contacts.contactEmail}" class="wrap-break-word transition-colors hover:text-primary px-6 xl:px-10">${contacts.contactEmail}</a>` : '';
		const phones = Array.isArray(contacts.phones) ? contacts.phones.map((item) => `<a href="tel:${String(item.number || '').replace(/[^+\d]/g, '')}" class="transition-colors hover:text-primary">${item.label || item.number || ''}</a>`).join('') : '';
		contact.innerHTML = `<div class="border-b-2 border-b-primary pb-4 pt-6 px-6 xl:px-10 xl:pb-6 xl:pt-10"><h3 class="text-primary">Для связи</h3></div><nav class="flex flex-col gap-4 xl:gap-6">${contactEmail}${phones ? `<div class="flex flex-col transition-colors px-6 xl:px-10"><p>Телефоны:</p>${phones}</div>` : ''}</nav>`;
		footer.insertBefore(contact, footer.lastElementChild);
	}
	text('#footer .row-end-2 p', contacts.copyright);
};
const setDocuments = () => {
	const requisites = data.requisites || {};
	const modal = one('#requisites-modal');
	if (!modal) return;
	const details = modal.querySelector('.space-y-1');
	if (details) details.innerHTML = `<p class="font-bold">${requisites.company || ''}</p><p>ИНН ${requisites.inn || ''}</p><p>ОГРН ${requisites.ogrn || ''}</p>`;
	const documentBox = modal.querySelector('.flex.flex-col.gap-2');
	if (documentBox && Array.isArray(requisites.documents) && requisites.documents.length) {
		documentBox.innerHTML = requisites.documents.map((item) => {
			const file = item.file || {};
			const url = file.url || file;
			return url ? `<a href="${url}" class="hover:text-muted transition-colors wrap-break-word" target="_blank" rel="noopener">${item.title || file.title || 'Документ'}</a>` : '';
		}).join('');
	}
};
text('#hero-year', data.hero?.year);
text('#hero-city', data.hero?.city);
text('#hero-slogan', data.hero?.slogan);
if (data.hero?.button) html('#hero-btn-down-label', `<span>${data.hero.button}</span>`);
section('#about-project', data.sections?.about);
section('#art-objects-section', data.sections?.art);
section('#about-visit', data.sections?.visit);
section('#on-freedom', data.sections?.freedom);
section('#about-food', data.sections?.food);
html('[data-about-project-panel] .flex.min-w-0.flex-col', data.sections?.about?.content);
html('[data-on-freedom-panel] .relative.z-2 > div:first-child .flex.min-w-0.flex-col', data.sections?.freedom?.content);
html('[data-food-top-block] article:nth-child(2)', data.sections?.food?.content);
html('[data-about-visit] p.text-semibold.text-muted-secondary', data.sections?.visit?.location);
const artParagraphs = all('[data-art-objects-panel] > div > p');
if (artParagraphs[0] && data.sections?.art?.intro) artParagraphs[0].innerHTML = data.sections.art.intro;
if (artParagraphs[1] && data.sections?.art?.outro) artParagraphs[1].innerHTML = data.sections.art.outro;
setGalleryImages('#carousel-art-objects a[data-fancybox="art-objects"]', data.artGallery);
setGalleryImages('.food-first-gallery a[data-fancybox="food-first"]', data.foodGallery);
setGalleryImages('#carousel-food-secondary a[data-fancybox="food-secondary"]', data.foodSlider);
setFaq(data.faq);
setLinks();
setContacts();
setDocuments();
