async function mergePdfs(files, onProgress) {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const percent = Math.round(
            ((i + 1) / files.length) * 100
        );

        onProgress?.(percent);

        const bytes = await file.arrayBuffer();

        const pdf = await PDFLib.PDFDocument.load(bytes);

        const pages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
        );

        pages.forEach(page =>
            mergedPdf.addPage(page)
        );
    }

    return await mergedPdf.save();
}