const processBtn = document.getElementById("process-btn");
const toolSelect = document.getElementById("tool-select");
const maxMBInput = document.getElementById("max-mb-input");

function updateMaxMBState() {
  maxMBInput.disabled = toolSelect.value !== "compress";
}

updateMaxMBState();

async function getPdfPageCount(file) {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    return pdfDoc.getPageCount();
}

toolSelect.addEventListener("change", () => {
    if (toolSelect.value === "compress") {
        maxMBInput.disabled = false;
    } else {
        maxMBInput.disabled = true;
    }
});

processBtn.addEventListener("click", async () => {
    const files = getSelectedFiles();
    const tool = document.getElementById("tool-select").value;
    let fileName = "";

    if (files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    try {
        switch (tool) {
            case "compress":
                if (files.length > 1) {
                    alert("Please select only 1 PDF to compress.");

                    return;
                }

                if (files[0].type !== "application/pdf") {
                    alert("Please select a PDF file.");

                    return;
                }

                const fileSizeMB = files[0].size / (1024 * 1024);
                let maxMBValue = maxMBInput.value.trim();
                let maxMB = parseFloat(maxMBValue);

                if (maxMB >= fileSizeMB) {
                    alert("Max MB must be smaller than the original file size.");

                    return;
                }

                if (!maxMBValue) {
                    maxMB = fileSizeMB * 0.8;

                    alert(`Max MB is automatically estimated at ${maxMB.toFixed(2)} MB (80% of original size).`);
                }

                const compressPdfBlob = await compressPdf(
                    files[0],
                    maxMB,
                    progress => {
                        showProgress(progress)
                    }
                );

                fileName = files[0].name.replace(/\.pdf$/i, "");

                saveAs(compressPdfBlob, `${fileName}-compressed.pdf`);

                const compressedSizeMB = compressPdfBlob.size / (1024 * 1024);
                const compressPercentage = ((compressedSizeMB - fileSizeMB) / fileSizeMB).toFixed(2) * 100;
                showMessage(`PDF compressed successfully, size: ${fileSizeMB.toFixed(2)} MB -> ${compressedSizeMB.toFixed(2)} MB (${compressPercentage}%).`);

                break;

            case "pdf-to-jpg":
                if (files.length > 1) {
                    alert("Please select only 1 PDF to convert to JPG.");

                    return;
                }

                if (files[0].type !== "application/pdf") {
                    alert("Please select a PDF file.");

                    return
                }

                const pdfToJpgBlob = await convertPdfToJpg(
                    files[0],
                    percent => {
                        showProgress(`Processing... ${percent}%`)
                    }
                );

                fileName = files[0].name.replace(/\.pdf$/i, "");
                     
                if (pdfToJpgBlob.type === "image/jpeg") {
                    saveAs(pdfToJpgBlob, `${fileName}.jpg`);
                } else {
                    saveAs(pdfToJpgBlob, `${fileName}.zip`);
                }

                showMessage("PDF to JPG completed successfully.");

                break;

            case "jpg-to-pdf":
                if (files[0].type !== "image/jpeg" && files[0].type !== "image/png") {
                    alert("Please select a JPG/JPEG/PNG file.");
                    
                    return;
                }    
            
                const jpgToPdfBlob = await jpgToPdf(
                    files,
                    percent => {
                        showProgress(`Processing... ${percent}%`)
                    }
                );

                fileName = files[0].name.replace(/\.(jpg|jpeg|png)$/i, "");

                saveAs(jpgToPdfBlob, `${fileName}.pdf`);
                
                showMessage("JPG/JPEG to PDF completed successfully.");

                break;

            case "merge":
                if (files.length < 2) {
                    alert(
                        "Please select at least 2 PDFs."
                    );

                    return;
                }

                for (let i = 0; i < files.length; i++) {
                    if (files[i].type !== "application/pdf") {
                        alert("Please select PDF files.");
                        return;
                    }
                }

                showMessage("Merging PDFs...");

                const mergedBytes = await mergePdfs(files, percent => {
                    showProgress(`Processing... ${percent}%`);
                });

                const mergeBlob = new Blob(
                    [mergedBytes],
                    { type: "application/pdf" }
                );

                fileName = files[0].name.replace(/\.pdf$/i, "");
                
                saveAs(
                    mergeBlob,
                    `${fileName}-merged.pdf`
                );

                showMessage("Merge PDF completed successfully.");

                break;
            
            case "split":
                if (files.length > 1) {
                    alert(
                        "Please select only 1 PDF to split."
                    );

                    return;
                }

                if (files[0].type !== "application/pdf") {
                    alert("Please select a PDF file.");

                    return
                }

                const pageCount = await getPdfPageCount(files[0]);

                showMessage("Splitting PDF...");
                
                const splitBlob = await splitAllPagesToZip(
                    files[0],
                    percent => {
                        showProgress(`Processing... ${percent}%`);
                    });

                fileName = files[0].name.replace(/\.pdf$/i, "");

                saveAs(
                    splitBlob,
                    `${fileName}-split.zip`
                );

                showMessage("Split PDF completed successfully.");

                break;
            
            default:
                showMessage("Unknown tool selected.");
        }
    } catch (error) {
        alert(error);
    }
});
