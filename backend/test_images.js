async function testUrls() {
  const url1 = "https://media.fab.com/image_previews/gallery_images/ae22d98b-3db3-4b5f-9930-c285664f8588/397a5375-b762-4ebd-9842-6155dbbc5a8e.jpg";
  const url2 = url1.replace("image_previews/", "");
  const url3 = url1.replace("image_previews", "images");

  console.log("Checking:", url1);
  const r1 = await fetch(url1, { method: "HEAD" });
  console.log(r1.status, r1.headers.get("content-length"));

  console.log("Checking:", url2);
  const r2 = await fetch(url2, { method: "HEAD" });
  console.log(r2.status, r2.headers.get("content-length"));

  console.log("Checking:", url3);
  const r3 = await fetch(url3, { method: "HEAD" });
  console.log(r3.status, r3.headers.get("content-length"));
}
testUrls();
