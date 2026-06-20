async function compressPdf(file, maxMB, onProgress) {
    onProgress?.("On progress...")
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const newPdf = await PDFLib.PDFDocument.create();

    let quality = 1.0;
    let pdfBytes, blob;

    do {
        const tempPdf = await PDFLib.PDFDocument.create();

        for (let i = 0; i < pdfjsDoc.numPages; i++) {
        const pdfjsPage = await pdfjsDoc.getPage(i + 1);
        const viewport = pdfjsPage.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await pdfjsPage.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL("image/jpeg", quality);

        const jpgImage = await tempPdf.embedJpg(imgData);
        const newPage = tempPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        pdfBytes = await tempPdf.save();
        blob = new Blob([pdfBytes], { type: "application/pdf" });

        const sizeMB = blob.size / (1024 * 1024);
        onProgress?.(`Current size: ${sizeMB.toFixed(2)} MB, quality: ${quality.toFixed(2) * 100}%`);

        quality -= 0.01;
    } while (blob.size / (1024 * 1024) > maxMB && quality > 0);

    return blob;
}
