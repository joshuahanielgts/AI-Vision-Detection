import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

interface ResultsPanelProps {
  imageUrl: string | null;
  detections: Detection[];
}

export default function ResultsPanel({ imageUrl, detections }: ResultsPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  // Draw bounding boxes on the image
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || detections.length === 0) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the original image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Draw bounding boxes
      detections.forEach((detection) => {
        const [x, y, width, height] = detection.bbox;

        // Calculate coordinates relative to the canvas
        const boxX = x;
        const boxY = y;

        // Draw rectangle
        ctx.strokeStyle = getColorForClass(detection.class);
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, width, height);

        // Draw label
        ctx.fillStyle = getColorForClass(detection.class);
        const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(boxX, boxY - 20, textWidth + 10, 20);

        ctx.fillStyle = '#fff';
        ctx.fillText(label, boxX + 5, boxY - 5);
      });

      setResultImageUrl(canvas.toDataURL());
    };
  }, [imageUrl, detections]);

  // Prepare data for charts
  const classDistributionData = prepareClassDistributionData(detections);
  const confidenceScoreData = prepareConfidenceScoreData(detections);

  if (!imageUrl || detections.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800">Object Detection Results</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Detection Image */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 text-center text-lg font-semibold text-gray-700">Detected Objects</h3>
          <div className="flex justify-center">
            {resultImageUrl && (
              <img
                src={resultImageUrl}
                alt="Detected objects"
                className="max-h-[400px] rounded-lg object-contain"
              />
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>

        {/* Class Distribution Chart */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 text-center text-lg font-semibold text-gray-700">Object Class Distribution</h3>
          <div className="flex h-[300px] items-center justify-center">
            <Pie data={classDistributionData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Confidence Score Chart */}
        <div className="rounded-lg border border-gray-200 p-4 lg:col-span-2">
          <h3 className="mb-2 text-center text-lg font-semibold text-gray-700">Detection Confidence Scores</h3>
          <div className="h-[300px]">
            <Bar data={confidenceScoreData} options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Confidence'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Object ID'
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-700">Detection Summary</h3>
        <p className="text-sm text-gray-600">Total Objects Detected: <span className="font-semibold">{detections.length}</span></p>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">Object Class Breakdown:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
            {Object.entries(getClassCounts(detections)).map(([cls, count]) => (
              <li key={cls}>
                {cls}: <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getColorForClass(className: string): string {
  // Simple hash function to get consistent colors for class names
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#808080', '#00FFFF', '#FF00FF', '#FFFF00'
  ];

  return colors[Math.abs(hash) % colors.length];
}

function getClassCounts(detections: Detection[]): Record<string, number> {
  return detections.reduce((acc, detection) => {
    acc[detection.class] = (acc[detection.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function prepareClassDistributionData(detections: Detection[]): ChartData<'pie'> {
  const classCounts = getClassCounts(detections);
  const labels = Object.keys(classCounts);
  const data = Object.values(classCounts);
  const backgroundColors = labels.map(getColorForClass);

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('1)', '0.8)')),
        borderWidth: 1,
      },
    ],
  };
}

function prepareConfidenceScoreData(detections: Detection[]): ChartData<'bar'> {
  return {
    labels: detections.map((_, index) => `Object ${index + 1}`),
    datasets: [
      {
        label: 'Confidence Score',
        data: detections.map(detection => parseFloat((detection.confidence * 100).toFixed(1))),
        backgroundColor: detections.map(detection => getColorForClass(detection.class)),
        borderColor: detections.map(detection => getColorForClass(detection.class).replace('1)', '0.8)')),
        borderWidth: 1,
      },
    ],
  };
}
