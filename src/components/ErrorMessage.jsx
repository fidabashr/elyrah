function ErrorMessage({ message, onRetry }) {
  return (
    <div className="py-20 text-center">

      <h2 className="text-lg font-semibold text-red-600">
        Something went wrong!
      </h2>

      <p className="mt-2 text-sm text-stone-500">
        {message || "Unable to load data. Please try again."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 bg-stone-900 px-6 py-3 text-sm text-white hover:bg-stone-700"
        >
          Try Again
        </button>
      )}

    </div>
  );
}

export default ErrorMessage;