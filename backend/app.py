import os
import base64
import requests

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

VISION_KEY = os.environ.get("VISION_KEY", "")
VISION_ENDPOINT = os.environ.get("VISION_ENDPOINT", "").rstrip("/")


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "configured": bool(VISION_KEY and VISION_ENDPOINT)
    })


@app.route("/analyze", methods=["POST"])
def analyze():

    if not VISION_KEY or not VISION_ENDPOINT:
        return jsonify({
            "error": "Azure Vision credentials are not configured."
        }), 500

    data = request.get_json(silent=True) or {}

    image_url = data.get("url")
    image_base64 = data.get("image_base64")

    api_url = (
        f"{VISION_ENDPOINT}/computervision/imageanalysis:analyze"
        "?api-version=2023-10-01"
        "&features=Tags,Read"
    )

    headers = {
        "Ocp-Apim-Subscription-Key": VISION_KEY
    }

    try:

        if image_url:

            headers["Content-Type"] = "application/json"

            response = requests.post(
                api_url,
                headers=headers,
                json={"url": image_url},
                timeout=30
            )

        elif image_base64:

            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]

            image_bytes = base64.b64decode(image_base64)

            headers["Content-Type"] = "application/octet-stream"

            response = requests.post(
                api_url,
                headers=headers,
                data=image_bytes,
                timeout=30
            )

        else:

            return jsonify({
                "error": "Please upload an image or provide an image URL."
            }), 400

    except requests.RequestException as e:

        return jsonify({
            "error": "Unable to contact Azure AI Vision.",
            "details": str(e)
        }), 502

    try:
        azure = response.json()

    except Exception:

        return jsonify({
            "error": "Azure returned an invalid response."
        }), 500

    if not response.ok:
        return jsonify({
            "success": False,
            "error": azure
        }), response.status_code

    result = {
        "success": True,
        "tags": [],
        "ocr": "",
        "raw": azure
    }

    # ---------------- TAGS ----------------

    for tag in azure.get("tagsResult", {}).get("values", []):

        result["tags"].append({
            "name": tag.get("name"),
            "confidence": tag.get("confidence")
        })

    # ---------------- OCR ----------------

    lines = []

    for block in azure.get("readResult", {}).get("blocks", []):

        for line in block.get("lines", []):

            if line.get("text"):
                lines.append(line["text"])

    result["ocr"] = "\n".join(lines)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)