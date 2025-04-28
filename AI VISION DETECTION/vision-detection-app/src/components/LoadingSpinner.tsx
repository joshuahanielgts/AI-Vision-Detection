interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Processing..." }: LoadingSpinnerProps) {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      <p className="mt-3 text-center text-lg font-medium text-gray-700">{message}</p>
      <p className="mt-1 text-center text-sm text-gray-500">
        This may take a moment if the model is loading for the first time
      </p>
    </div>
  );
}
