import { useState } from 'react';

interface SampleImageProps {
  onSampleImageSelect: (imageUrl: string, fileName: string) => void;
}

// Sample image URLs - selected for good object detection results
const SAMPLE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1566454544259-f4b94c267cdc?auto=format&fit=crop&q=80&w=1000',
    name: 'Street Scene',
    description: 'Urban street with people, cars and traffic',
  },
  {
    url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80&w=1000',
    name: 'Dog at Beach',
    description: 'Golden retriever dog at the beach',
  },
  {
    url: 'https://images.unsplash.com/photo-1588420343618-6bd5f4eff2f0?auto=format&fit=crop&q=80&w=1000',
    name: 'Kitchen Scene',
    description: 'Kitchen with various objects and food',
  },
];

export default function SampleImage({ onSampleImageSelect }: SampleImageProps) {
  const [expandSamples, setExpandSamples] = useState(false);

  const handleSampleSelect = async (imageUrl: string, name: string) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create a file from the blob
      const file = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });

      // Create an object URL for this image
      const localUrl = URL.createObjectURL(file);

      // Call the parent handler
      onSampleImageSelect(localUrl, file.name);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpandSamples(!expandSamples)}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        {expandSamples ? 'Hide sample images' : 'Try with sample images'}
        <svg
          className={`ml-1 h-4 w-4 transform transition-transform ${
            expandSamples ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {expandSamples && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.name}
              onClick={() => handleSampleSelect(sample.url, sample.name)}
              className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="h-32 w-full rounded object-cover"
              />
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900">{sample.name}</h3>
                <p className="text-xs text-gray-500">{sample.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
