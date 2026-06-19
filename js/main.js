const processBtn = document.getElementById("process-btn");

async function getPdfPageCount(file) {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    return pdfDoc.getPageCount();
}

processBtn.addEventListener("click", async () => {
    const files = getSelectedFiles();
    const tool = document.getElementById("tool-select").value;

    if (files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    try {
        switch (tool) {
            case "compress":
                showMessage("Compress feature not yet implemented.");
                break;

            case "pdf-to-jpg":
                if (files.length > 1) {
                    alert(
                        "Please select only 1 PDF to convert to JPG."
                    );

                    return;
                }

                const toJpgBlob = await convertPdfToJpg(
                    files[0],
                    percent => {
                        showProgress(`Processing... ${percent}%`)
                    }
                );
                    
                const filename = files[0].name.replace(/\.pdf$/i, "");
                    if (toJpgBlob.type === "image/jpeg") {
                        saveAs(toJpgBlob, `${filename}-images.jpg`);
                    } else {
                        saveAs(toJpgBlob, `${filename}-images.zip`);
                    }

                showMessage("Convert to JPG completed successfully.");

                break;

            case "jpg-to-pdf":
                showMessage("JPG to PDF feature not yet implemented.");
                break;

            case "merge":
                if (files.length < 2) {
                    alert(
                        "Please select at least 2 PDFs."
                    );

                    return;
                }

                showMessage("Merging PDFs...");

                const mergedBytes = await mergePdfs(files, percent => {
                    showProgress(`Processing... ${percent}%`);
                });

                const mergeBlob = new Blob(
                    [mergedBytes],
                    { type: "application/pdf" }
                );

                const firstName =
                    files[0].name.replace(
                        /\.pdf$/i,
                        ""
                    );
                
                saveAs(
                    mergeBlob,
                    `${firstName}-merged.pdf`
                );

                showMessage("Merge completed.");

                break;
            
            case "split":
                if (files.length > 1) {
                    alert(
                        "Please select only 1 PDF to split."
                    );

                    return;
                }

                const pageCount = await getPdfPageCount(files[0]);

                showPdfInfo(files[0], pageCount);
                
                showMessage("Splitting PDF...");
                
                const splitBlob = await splitAllPagesToZip(
                    files[0],
                    percent => {
                        showProgress(`Processing... ${percent}%`);
                    });

                const originalName = files[0].name.replace(/\.pdf$/i, "");

                saveAs(
                    splitBlob,
                    `${originalName}-split.zip`
                );

                showMessage("Split completed successfully.");

                break;
            
            default:
                showMessage("Unknown tool selected.");
        }
    } catch (error) {
        console.error(error);
        showMessage("Failed to read PDF file.")
        alert("Failed to read PDF file.");
    }
});