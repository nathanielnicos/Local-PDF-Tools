async function splitAllPagesToZip(file, onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();
    const zip = new JSZip();
    const originalName = file.name.replace(/\.pdf$/i, "");

    for (let i = 0; i < totalPages; i++) {
        const percent = Math.round(
            ((i + 1) / totalPages) * 100
        );

        onProgress?.(percent);  

        const newPdf = await PDFLib.PDFDocument.create();
        const [page] = await newPdf.copyPages(sourcePdf, [i]);

        newPdf.addPage(page);

        const pdfBytes = await newPdf.save();

        zip.file(
            `${originalName}-page-${i + 1}.pdf`,
            pdfBytes
        );

        await new Promise(resolve =>
            setTimeout(resolve, 0)
        );
    }

    onProgress?.("Creating ZIP...");

    return await zip.generateAsync({
        type: "blob"
    });
}