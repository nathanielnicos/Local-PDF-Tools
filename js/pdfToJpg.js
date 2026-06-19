pdfjsLib.GlobalWorkerOptions.workerSrc ="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

async function convertPdfToJpg(file, onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const images = [];

    for (let i = 0; i < pdf.numPages; i++) {
        const percent = Math.round(
            ((i + 1) / pdf.numPages) * 100
        );

        onProgress?.(percent);

        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const jpgData = canvas.toDataURL("image/jpeg", 0.9);

        images.push(jpgData);
    }

    if (images.length === 1) {
        const base64 = images[0].split(",")[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: "image/jpeg" });
    } else {
        const zip = new JSZip();
        const originalName = file.name.replace(/\.pdf$/i, "");
        
        images.forEach((imgData, i) => {
            const base64 = imgData.split(",")[1];
            
            zip.file(
                `${originalName}-page-${i + 1}.jpg`,
                base64,
                { base64: true }
            );
        });

        onProgress?.("Creating ZIP...");

        return await zip.generateAsync({
            type: "blob"
        });
    }
}
