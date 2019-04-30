/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);
exports.svgImage = (name) => fs.readFileSync(`./public/images/${name}.svg`);

// Some details about the site
exports.siteName = `EESYApp | SmartSkin | PHYSEE`;

exports.menu = [
  { slug: '/powerWindow', title: 'Your Window', icon: 'Nav_PW', },
  { slug: '/smartControl', title: 'SmartControl', icon: 'Nav_smart', },
  { slug: '/history', title: 'History', icon: 'Nav_performance', },
  { slug: '/community', title: 'Community', icon: 'Nav_community'},

];
