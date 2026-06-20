const fileInput = document.getElementById("file-input");
const uploadArea = document.getElementById("upload-area");

let selectedFiles = [];

function updateSelectedFiles(files) {
    selectedFiles = Array.from(files);
}

function getSelectedFiles() {
    return selectedFiles;
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    preventDefaults(e);

    const files = e.dataTransfer.files;
    
    updateSelectedFiles(files);
    
    fileInput.files = files;

    showFileList(getSelectedFiles());
}

function initializeUpload() {
    fileInput.addEventListener(
        "change",
        event => {
            updateSelectedFiles(event.target.files);
            showFileList(getSelectedFiles())
        }
    );

    ["dragenter", "dragover", "dragleave", "drop"]
        .forEach(eventName => {

            uploadArea.addEventListener(
                eventName,
                preventDefaults,
                false
            );
        });

    uploadArea.addEventListener(
        "drop",
        handleDrop
    );

    ["dragenter", "dragover"]
        .forEach(eventName => {

            uploadArea.addEventListener(
                eventName,
                () => {
                    uploadArea.classList.add(
                        "drag-active"
                    );
                }
            );
        });

    ["dragleave", "drop"]
        .forEach(eventName => {

            uploadArea.addEventListener(
                eventName,
                () => {
                    uploadArea.classList.remove(
                        "drag-active"
                    );
                }
            );
        });
}

initializeUpload();
