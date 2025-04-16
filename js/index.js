function formatDate() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}

async function main() {
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
        img.onload = function () {
            const bg = document.createElement('canvas');
            bg.width = img.width;
            bg.height = img.height;
            const ctx = bg.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const icon = document.createElement('canvas');
            icon.width = 128;
            icon.height = 128;
            const iconCtx = icon.getContext('2d');
            iconCtx.drawImage(img, 0, 0, 128, 128);

            bg.toBlob(async function(bgBlob) {
                icon.toBlob(async function(iconBlob) {
                    const zip = new JSZip();

                    const formattedDate = formatDate();
                    const meta = {
                        pack: {
                            pack_format: 1,
                            description: `${file.name} §r§0§r§6§lGenerated on §d§l${formattedDate}`
                        }
                    };
                    zip.file("pack.mcmeta", JSON.stringify(meta, null, 2));
                    zip.file("pack.png", iconBlob);
                    zip.folder("assets/pixel").file("bg.jpg", bgBlob);

                    const content = await zip.generateAsync({ type: "blob" });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(content);
                    a.download = fileNameNoExt + ".zip";
                    a.click();
                    status.textContent = "Zipped Resourcepack";
                }, "image/png");
            }, "image/jpeg", 0.9);
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    status.textContent = "Processing...";
}
