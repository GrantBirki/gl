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
        line1: '123 Sesame Street',
        city: 'Seattle',
        state: 'WA',
        postcode: '12345',
        country: 'United States',
      },
      description: 'Ceremony location and details',
      image: {
        alt: 'ceremony location',
        height: '140',
        src: 'https://images.unsplash.com/photo-1678986992005-87c3f4a2b0af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=60',
      },
      buttons: [
        {
          text: 'Directions',
          link: 'https://www.google.com', // google maps link
          target: '_blank', // opens in new tab
          size: 'large',
          icon: 'directions',
        },
        {
          text: 'Details',
          link: 'tel:1234567890', // phone number
          target: '_self', // opens in same tab
          size: 'large',
          icon: 'link',
        },
      ],
    },
    {
      name: 'Hotel',
      address: {
        enabled: true,
        line1: '13401 US-101',
        city: 'Hopland',
        state: 'CA',
        postcode: '95449',
        country: 'United States',
      },
      description: 'Thatcher Hotel:',
      image: {
        alt: 'reception location',
        height: '140',
        src: 'https://github.com/GrantBirki/gl/assets/23362539/766ac14e-b5a4-49a9-8ace-0d938d56bcd1',
      },
      buttons: [
        {
          text: 'Directions',
          link: 'https://maps.app.goo.gl/F2dMVx2p5WANsHZ87', // google maps link
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
