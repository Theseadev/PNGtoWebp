const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const downloadZipBtn = document.getElementById("downloadZip");
const zip = new JSZip();
let fileCount = 0;

fileInput.addEventListener("change", async (e) => {
  gallery.innerHTML = '';
  zip.files = {};
  fileCount = 0;
  downloadZipBtn.style.display = "none";

  const files = Array.from(e.target.files).slice(0, 20);

  for (const file of files) {
    if (file.type !== "image/png") continue;

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.8));
    const url = URL.createObjectURL(blob);
    const filename = file.name.replace(/\.png$/i, ".webp");

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = url;

    const download = document.createElement("a");
    download.href = url;
    download.download = filename;
    download.innerText = "Download";

    card.appendChild(img);
    card.appendChild(download);
    gallery.appendChild(card);

    requestAnimationFrame(() => {
      card.style.opacity = 1;
    });

    const arrayBuffer = await blob.arrayBuffer();
    zip.file(filename, arrayBuffer);
    fileCount++;
  }

  if (fileCount > 0) {
    downloadZipBtn.style.display = "inline-block";
  }
});

downloadZipBtn.addEventListener("click", async () => {
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "converted_images.zip";
  a.click();
});


