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
        line1: '1501 Hwy 175',
        city: 'Hopland',
        state: 'CA',
        postcode: '95449',
        country: 'United States',
      },
      description: 'Venue location and details',
      image: {
        alt: 'venue location',
        height: '140',
        src: 'https://i.imgur.com/LZj8Gfo.jpeg',
      },
      buttons: [
        {
          text: 'Directions',
          link: 'https://maps.app.goo.gl/aYgM5oJ49CAgoMwm9', // google maps link
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
    {
      name: 'Pinschower Inn',
      address: {
        enabled: true,
        line1: '302 N Main Street',
        city: 'Cloverdale',
        state: 'CA',
        postcode: '95425',
        country: 'United States',
      },
      description: 'Inn Details:',
      image: {
        alt: 'reception location',
        height: '140',
        src: 'https://i.imgur.com/gTjLhpH.jpeg',
      },
      buttons: [
        {
          text: 'Directions',
          link: 'https://maps.app.goo.gl/iwK6vfkbHNY2nkbq6', // google maps link
          target: '_blank', // opens in new tab
          size: 'large',
          icon: 'directions',
        },
        {
          text: 'Details',
          link: '/hotel', // internal link
          target: '_self', // opens in same tab
          size: 'large',
          icon: 'link',
        },
      ],
    },
  ],
};

export default locations;
