/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
// Locale ??
exports.moment = require('moment');


// date-fns
//exports.datefns = require('date-fns');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Making a static map is really long - this is a handy helper function to make one
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=4`;

// Heure ouverture -> ouvert/fermé


// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `My Addresses!`;

exports.menu = [
  { slug: '/stores', title: 'Addresses', icon: 'addressbook', },
  { slug: '/top', title: 'Best', icon: 'top', },
  { slug: '/categories', title: 'Categories', icon: 'categorie', },
  { slug: '/tags', title: 'Tags', icon: 'tag', },  
  { slug: '/add', title: 'Ajouter', icon: 'add', },
  { slug: '/map', title: 'Carte', icon: 'map', }
]

exports.footermenu = [
  { slug: '/about', title: 'About', icon: '', },
  { slug: '/stores', title: 'Addresses', icon: '', },
  { slug: '/top', title: 'Best', icon: '', },
  { slug: '/categories', title: 'Categories', icon: '', },
  { slug: '/tags', title: 'Tags', icon: '', },  
  { slug: '/add', title: 'Ajouter', icon: '', },
  { slug: '/map', title: 'Carte', icon: '', },
  { slug: '/login', title: 'Login', icon: '' }

]
