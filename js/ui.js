const resultArea = document.getElementById("result-area");

function showMessage(message) {
    resultArea.innerHTML =
        `<p>${message}</p>`;
}

function showProgress(progress) {
    resultArea.innerHTML =
        `<p>${progress}</p>`;
}

function showSelectedFiles(files) {
    resultArea.innerHTML = `
        <p>
            Selected Files:
            ${files.length}
        </p>
        `;
}

function showPdfInfo(file, pageCount) {
    resultArea.innerHTML = `
        <h3>PDF Information</h3>
        <p><strong>Name:</strong> ${file.name}</p>
        <p><strong>Pages:</strong> ${pageCount}</p>
        <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
}

function showFileList(files) {
    const list = document.getElementById("file-list");
    list.innerHTML = "";

    files.forEach((file, index) => {
        const li = document.createElement("li");

        const nameSpan = document.createElement("span");
        nameSpan.className = "filename";
        nameSpan.textContent = file.name;

        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.onclick = () => {
            if (index > 0) {
                [files[index - 1], files[index]] = [files[index], files[index - 1]];
                showFileList(files);
            }
        };

        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.onclick = () => {
            if (index < files.length - 1) {
                [files[index + 1], files[index]] = [files[index], files[index + 1]];
                showFileList(files);
            }
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.onclick = () => {
            files.splice(index, 1);
            showFileList(files);
        };

        const btnContainer = document.createElement("div");
        btnContainer.className = "buttons";
        btnContainer.appendChild(upBtn);
        btnContainer.appendChild(downBtn);
        btnContainer.appendChild(removeBtn);

        li.appendChild(nameSpan);
        li.appendChild(btnContainer);
        list.appendChild(li);
    });
}
