// Configuration for the header component on all pages

// ----------- imports -----------
import { getPermalink } from '~/utils/permalinks';
// ----------- imports -----------

const headerData = {
  // List of links to be displayed in the header
  links: [
    {
      text: 'Location',
      links: [
        {
          text: 'Location',
          href: getPermalink('/location'),
        },
        {
          text: 'Accommodations',
          href: '/accommodations',
        },
        {
          text: 'Venue',
          href: '/venue',
        },
      ],
    },

    // A single link with no dropdown
    {
      text: 'Registry',
      href: '/registry',
    },
    {
      text: 'Save the Date',
      href: '/save-the-date',
    },
    {
      text: 'Details',
      href: '/details',
    },
    {
      text: 'Gallery',
      href: getPermalink('/gallery'),
    },

    // // The blog link is a special case, it uses the getBlogPermalink function
    // {
    //   text: 'Blog',
    //   href: getBlogPermalink(),
    // },
  ],

  // List of buttons to be displayed in the header
  actions: [
    // {
    //   // text to display on the button
    //   text: 'Download',
    //   // link to go to when the button is clicked
    //   href: 'https://github.com/grantbirki/astrowind',
    //   // can be 'button', 'primary', or 'ghost'
    //   type: 'button',
    //   // HTML rel attribute
    //   rel: 'noopener',
    //   // HTML target attribute
    //   target: '_blank',
    // },
  ],
};

export default headerData;
