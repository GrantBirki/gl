// Hero configuration on the gallery page

const hero = {
  // If the entire hero section should be enabled or not
  enabled: true,
  padding: 'pt-12 md:pt-20',

  // Hero title with HTML support
  title: {
    enabled: true, // If the title should be enabled or not
    text: `<span class="fancy">Gallery</span>`,
  },

  // Hero subtitle with HTML support
  subtitle: {
    enabled: true, // If the subtitle should be enabled or not
    text: `<span class="fancy">Highlights from the adventures of Grant and Leah's lives</span>`,
  },

  // First CTA block
  callToAction: {
    // Enable or disable first CTA
    enabled: false,
    // CTA text
    text: 'Get template',
    // CTA link
    href: 'https://github.com/grantbirki/astrowind',
    // Target html <a> tag
    target: '_blank',
    // Rel html <a> tag
    rel: 'noopener',
    // CTA icon
    icon: 'tabler:download',
  },

  // Second CTA block (optional)
  callToAction2: {
    // Enable or disable second CTA
    enabled: false,
    // CTA text
    text: 'Learn more',
    // CTA link
    href: '#features',
    // Target html <a> tag
    target: '_blank',
    // Rel html <a> tag
    rel: 'noopener',
    icon: 'tabler:book',
  },

  // Hero image
  image: {
    // If the image should be enabled or not
    enabled: false,
    // Image source
    src: import('~/assets/images/hero.png'),
    // Image alt text
    alt: 'Grant and Leah',
  },
};

export default hero;
