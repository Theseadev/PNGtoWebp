// Ambil elemen DOM
const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const downloadZipBtn = document.getElementById("downloadZip");

// Gunakan let supaya bisa reset zip nanti
let zip = new JSZip();
let fileCount = 0;

// Event saat user memilih file
fileInput.addEventListener("change", async (e) => {
  // Reset tampilan dan zip
  gallery.innerHTML = '';
  zip = new JSZip();
  fileCount = 0;
  downloadZipBtn.style.display = "none";

  const files = Array.from(e.target.files).slice(0, 20); // Batasi ke 20 file

  for (const file of files) {
    if (file.type !== "image/png") continue; // Hanya PNG yang diterima

    // Buat imageBitmap untuk pengolahan gambar
    const imageBitmap = await createImageBitmap(file);

    // Buat canvas dan gambar ulang ke format WebP
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    // Convert ke blob WebP dengan kualitas 0.8
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.8));
    const url = URL.createObjectURL(blob);
    const filename = file.name.replace(/\.png$/i, ".webp");

    // Buat kartu preview
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = url;
    img.alt = filename;

    const download = document.createElement("a");
    download.href = url;
    download.download = filename;
    download.innerText = "Download";

    // Revoke object URL setelah download untuk cegah memory leak
    download.addEventListener("click", () => {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    // Tambahkan ke galeri
    card.appendChild(img);
    card.appendChild(download);
    gallery.appendChild(card);

    // Animasi masuk
    requestAnimationFrame(() => {
      card.style.opacity = 1;
    });

    // Tambahkan file ke ZIP
    const arrayBuffer = await blob.arrayBuffer();
    zip.file(filename, arrayBuffer);
    fileCount++;
  }

  if (fileCount > 0) {
    downloadZipBtn.style.display = "inline-block";
  }
});

// Event saat tombol ZIP diklik
downloadZipBtn.addEventListener("click", async () => {
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "converted_images.zip";
  a.click();

  // Revoke URL setelah delay
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
});
