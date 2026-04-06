const https = require('https');
https.get("https://media.fab.com/image_previews/gallery_images/ae22d98b-3db3-4b5f-9930-c285664f8588/397a5375-b762-4ebd-9842-6155dbbc5a8e.jpg", (res) => {
  let chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const fs = require('fs');
    fs.writeFileSync('test.jpg', buffer);
    console.log('Saved test.jpg', buffer.length);
  });
});
