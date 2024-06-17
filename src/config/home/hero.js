// Hero configuration on the homepage

const hero = {
  // If the entire hero section should be enabled or not
  enabled: true,

  // Hero title with HTML support
  title: {
    enabled: true, // If the title should be enabled or not
    text: `<span class="fancy">Grant</span><span class="extra-fancy extra-fancy-spaced"> & </span><span class="fancy">Leah</span>`,
  },

  // Hero subtitle with HTML support
  subtitle: {
    enabled: true, // If the subtitle should be enabled or not
    text: `<span class="fancy">We are getting married!! Please join us, our family, and friends for a "weekend" of celebration near Monterey and Carmel Valley.<br><br>De Tierra Vineyards
    Salinas, California
    <br>September 29 - October 2nd, 2024
    </span>`,
  },

  // First CTA block
  callToAction: {
    // Enable or disable first CTA
    enabled: true,
    // CTA text
    text: 'Schedule',
    // CTA link
    href: '/schedule',
    // Target html <a> tag
    target: '_self',
    // Rel html <a> tag
    rel: 'noopener',
    // CTA icon
    icon: 'tabler:calendar',
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
    enabled: true,
    // Image source
    src: import('~/assets/images/hero.png'),
    // Image alt text
    alt: 'Grant and Leah',
  },
};

export default hero;
