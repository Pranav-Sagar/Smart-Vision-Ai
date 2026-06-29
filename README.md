# Smart Vision AI

A web application built using **Flask** and **Microsoft Azure AI Vision** for image analysis.

## Features

* Upload images from your computer
* Analyze images using Azure AI Vision
* Semantic image tag detection
* OCR (Optical Character Recognition)
* Human detection using Azure AI Vision tags
* Drag & Drop image upload
* Image URL support
* Responsive user interface

## Technologies Used

* Python
* Flask
* HTML5
* CSS3
* JavaScript
* Microsoft Azure AI Vision API

## Project Structure

```
Smart-Vision-Ai/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── static/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── README.md
└── .gitignore
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Pranav-Sagar/Smart-Vision-Ai.git
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
VISION_ENDPOINT=YOUR_AZURE_ENDPOINT
VISION_KEY=YOUR_AZURE_KEY
```

Run the application:

```bash
cd backend
python app.py
```

Open:

```
http://127.0.0.1:5000
```

## Future Improvements

* Azure Face API integration
* Brand Detection
* Object Detection
* Landmark Recognition
* Cloud Deployment (Azure App Service / Vercel)

## Author

Pranav Sagar


Pranav
