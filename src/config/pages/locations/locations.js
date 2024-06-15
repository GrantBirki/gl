// Configuration for the locations component on the home page

const locations = {
  // Show or hide the locations component
  enabled: true,

  // Small highlight text at the top of the component
  highlight: 'Wedding Location',

  // Main title text
  title: 'Location',
  // Subtitle text
  subtitle: 'Details about the wedding venue',

  // Location cards to display
  locations: [
    {
      name: 'Venue',
      address: {
        enabled: true,
        line1: '505 Corral de Tierra Rd',
        city: 'Salinas',
        state: 'CA',
        postcode: '93908',
        country: 'United States',
      },
      description: 'Venue location and details',
      image: {
        alt: 'venue location',
        height: '140',
        src: 'https://i.imgur.com/JRGDoUG.jpeg',
      },
      buttons: [
        {
          text: 'Directions',
          link: 'https://maps.app.goo.gl/e9ZA5bm9XZ361UqLA', // google maps link
          target: '_blank', // opens in new tab
          size: 'large',
          icon: 'directions',
        },
        {
          text: 'Details',
          link: '/venue', // internal link
          target: '_self', // opens in same tab
          size: 'large',
          icon: 'link',
        },
      ],
    },
  ],
};

export default locations;
