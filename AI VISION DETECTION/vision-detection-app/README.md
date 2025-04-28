# AI Vision Detection App

A modern web application for object detection in images using YOLO (You Only Look Once), built with React, Vite, and TailwindCSS.

## Features

- 📷 Upload images for object detection
- 🔍 Detect common objects in images (people, cars, animals, etc.)
- 📊 Visualize detection results with clear bounding boxes
- 📈 View detection statistics with interactive charts
- 🎯 See confidence scores for each detection
- 🖼️ Use sample images to test the detection capabilities

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Chart.js with react-chartjs-2
- **File Upload**: react-dropzone
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) (v16+)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vision-detection-app.git
cd vision-detection-app
```

2. Install dependencies
```bash
bun install
# or
npm install
```

3. Start the development server
```bash
bun run dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How It Works

This application simulates YOLO object detection in the browser:

1. Upload an image or select a sample image
2. The app processes the image and detects objects
3. Results are displayed with bounding boxes around detected objects
4. Statistics and confidence scores are shown in interactive charts

In a production environment, this would be connected to a real YOLO model running on a server or via WebAssembly in the browser.

## License

MIT

---

Built with ❤️ using React and modern web technologies.
