function Loading({ message = "Loading..." }) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900"></div>

      <p className="text-sm text-stone-500">
        {message}
      </p>
    </div>
  );
}

export default Loading;