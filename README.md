# AI-Vision-Detection: Advanced Object Detection and Visual Analytics

## 📌 Abstract
**AI-Vision-Detection** is an efficient object detection system that uses YOLOv8 to analyze images and generate comprehensive visual and statistical insights. This tool is designed for domains like surveillance, traffic monitoring, and retail analytics by offering real-time object detection capabilities and rich analytics.

---

## 🚀 Features
- Object detection using **YOLOv8**
- Annotated images with **bounding boxes**
- **Pie charts** of detected object class distributions
- **Histograms** of detection confidence scores
- **Boxplots** showing bounding box size statistics
- Robust **error handling** for smooth execution
- **Summary reports** with total and categorized object counts

---

## 🛠️ Technologies Used
- `YOLOv8 (Ultralytics)` – Pre-trained detection model
- `OpenCV` – Image handling and bounding box drawing
- `Matplotlib` – Visualization library
- `NumPy` – Data processing and math operations
- `Google Colab (Optional)` – Easy-to-use notebook interface for running the model

---

## ⚙️ Installation
Install the required packages using pip:

```bash
pip install ultralytics opencv-python matplotlib numpy

from google.colab import files
uploaded = files.upload()

results = model(image_path)


