let imageBase64 = "";
let imageUrl = "";

const imageInput = document.getElementById("imageInput");
const imageUrlInput = document.getElementById("imageUrl");

const previewCard = document.getElementById("previewCard");
const previewImage = document.getElementById("previewImage");

const analyzeBtn = document.getElementById("analyzeBtn");

const loading = document.getElementById("loading");
const results = document.getElementById("results");
const errorBox = document.getElementById("errorBox");

const tags = document.getElementById("tags");
const ocr = document.getElementById("ocr");
const rawJson = document.getElementById("rawJson");
const humanResult = document.getElementById("humanResult");

imageInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

        imageBase64 = event.target.result;
        imageUrl = "";

        previewImage.src = imageBase64;
        previewCard.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});

document.getElementById("loadUrlBtn").addEventListener("click", () => {

    const url = imageUrlInput.value.trim();

    if (!url) {

        alert("Please enter an image URL.");

        return;

    }

    imageUrl = url;
    imageBase64 = "";

    previewImage.src = url;

    previewCard.classList.remove("hidden");

});

analyzeBtn.addEventListener("click", analyzeImage);

function startLoading() {

    loading.classList.remove("hidden");
    results.classList.add("hidden");
    errorBox.classList.add("hidden");

}

function stopLoading() {

    loading.classList.add("hidden");

}

function clearResults() {

    tags.innerHTML = "";
    ocr.textContent = "";
    rawJson.textContent = "";

    humanResult.innerHTML = "Waiting...";

}

async function analyzeImage() {

    if (!imageBase64 && !imageUrl) {

        alert("Please upload an image.");

        return;

    }

    startLoading();
    clearResults();

    try {

        const payload = imageBase64
            ? { image_base64: imageBase64 }
            : { url: imageUrl };

        const response = await fetch("/analyze", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });

        const data = await response.json();

        stopLoading();

        if (!response.ok) {

            throw new Error(data.error || "Azure Vision Error");

        }

        results.classList.remove("hidden");

        rawJson.textContent = JSON.stringify(data, null, 2);

        renderTags(data.tags);

        renderOCR(data.ocr);

        detectHuman(data.tags);

    }

    catch (err) {

        stopLoading();

        errorBox.classList.remove("hidden");

        errorBox.innerHTML = err.message;

        console.error(err);

    }

}

function renderTags(tagList) {

    tags.innerHTML = "";

    if (!tagList || tagList.length === 0) {

        tags.innerHTML = "<p>No tags detected.</p>";

        return;

    }

    tagList.forEach(tag => {

        const chip = document.createElement("div");

        chip.className = "chip";

        chip.innerHTML =
            `${tag.name} (${(tag.confidence * 100).toFixed(1)}%)`;

        tags.appendChild(chip);

    });

}

function renderOCR(text) {

    if (text && text.trim() !== "") {

        ocr.textContent = text;

    }

    else {

        ocr.textContent = "No text detected.";

    }

}

function detectHuman(tagList) {

    const keywords = [

        "human face",
        "person",
        "male person",
        "portrait",
        "human"

    ];

    const detected = tagList.some(tag =>
        keywords.includes(tag.name.toLowerCase())
    );

    if (detected) {

        humanResult.innerHTML =
            "✅ Human detected in the image.";

    }

    else {

        humanResult.innerHTML =
            "❌ No human detected.";

    }

}

const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.style.borderColor = "#0067b8";

});

dropZone.addEventListener("dragleave", () => {

    dropZone.style.borderColor = "#8bbcf3";

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.style.borderColor = "#8bbcf3";

    const file = e.dataTransfer.files[0];

    if (!file) return;

    imageInput.files = e.dataTransfer.files;

    const reader = new FileReader();

    reader.onload = (event) => {

        imageBase64 = event.target.result;
        imageUrl = "";

        previewImage.src = imageBase64;

        previewCard.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});

console.log("Azure AI Vision Analyzer Ready");