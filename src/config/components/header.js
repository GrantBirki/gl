// Configuration for the header component on all pages

// ----------- imports -----------
import { getPermalink } from '~/utils/permalinks';
// ----------- imports -----------

const headerData = {
  // List of links to be displayed in the header
  links: [
    {
      text: 'Home',
      href: '/',
    },
    {
      text: 'Travel + Stay',
      href: '/travel-and-stay',
    },
    {
      text: 'Schedule',
      href: '/schedule',
    },
    {
      text: 'Gifts',
      href: '/gifts',
    },
    {
      text: 'Save the Date',
      href: '/save-the-date',
    },
    {
      text: 'Things to Do',
      href: '/things-to-do',
    },
    {
      text: 'FAQs',
      href: '/faqs',
    },
    {
      text: 'Gallery',
      href: getPermalink('/gallery'),
    },
    {
      text: 'RSVP',
      href: '/rsvp',
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
