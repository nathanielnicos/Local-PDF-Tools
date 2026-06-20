async function jpgToPdf(files, onProgress) {
    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        try {
            const file = files[i];
        
            const percent = Math.round(
                ((i + 1) / files.length) * 100
            );

            onProgress?.(percent);

            const arrayBuffer = await file.arrayBuffer();
            const jpgImage = await pdfDoc.embedJpg(arrayBuffer);

            const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
            page.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: jpgImage.width,
                height: jpgImage.height
            });
        } catch (e) {
            alert(`${e}, file number ${i+1} will be skipped.`)
        }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
}
