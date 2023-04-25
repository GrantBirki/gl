const fs = require('fs');
const sizeOf = require('image-size');
const images = fs.readdirSync('public/assets');

// loop through all the images in the public/assets folder
var imgArray = [];
images.map((image, index) => {
  // get the img height and width
  const dimensions = sizeOf(`public/assets/${image}`);

  // create the image object
  const img = {
    key: index,
    alt: image,
    src: `/assets/${image}`,
    width: dimensions.width,
    height: dimensions.height,
  };

  // push the image object to the array
  imgArray.push(img);
});

// write the array to a json file
fs.writeFileSync('src/config/pages/gallery/photos.json', JSON.stringify(imgArray, null, 2));

console.log('Images generated successfully');
