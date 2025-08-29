import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import SampleImage from './components/SampleImage';
import { detectObjects, Detection } from './services/detectionService';

import ThemeToggle from './ThemeToggle';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setDetections([]);
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Loading model and processing image...');

    try {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
      setImageName(file.name);

      const results = await detectObjects(file);
      setDetections(results);

      if (results.length === 0) {
        setError('No objects were detected in this image. Try another image with clearer objects.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process the image. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleImageSelect = (url: string, fileName: string) => {
    setImageUrl(url);
    setImageName(fileName);
    setDetections([]);
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Loading model and processing image...');

    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        return detectObjects(file);
      })
      .then((results) => {
        setDetections(results);
        if (results.length === 0) {
          setError('No objects were detected in this image. Try another image with clearer objects.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error processing sample image:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to process the sample image. Please try again.'
        );
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Left: Title & subtitle */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              AI Vision Detection
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Upload an image and get real-time object detection results
            </p>
          </div>

          {/* Right: Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Upload Image</h2>
          <ImageUploader onImageUpload={handleImageUpload} />
          <SampleImage onSampleImageSelect={handleSampleImageSelect} />

          {/* Preview */}
          {imageUrl && !isLoading && !error && detections.length === 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-medium">Preview</h3>
              <div className="flex justify-center rounded-lg border border-border p-4">
                <img
                  src={imageUrl}
                  alt={imageName || 'Uploaded image'}
                  className="max-h-[400px] rounded-lg object-contain"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner message={loadingMessage} />}

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg bg-destructive/10 p-4 text-destructive-foreground">
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && detections.length > 0 && (
            <ResultsPanel imageUrl={imageUrl} detections={detections} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            AI Vision Detection App - Powered by TensorFlow.js with COCO-SSD Model
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
