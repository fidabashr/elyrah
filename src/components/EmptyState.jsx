import { Link } from "react-router-dom";

function EmptyState({
  title = "No data found",
  message = "There is nothing to display.",
  linkTo,
  linkText,
}) {
  return (
    <div className="py-20 text-center">

      <div className="mb-4 text-5xl text-stone-300">
        ♡
      </div>

      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-stone-500">
        {message}
      </p>

      {linkTo && linkText && (
        <Link
          to={linkTo}
          className="mt-5 inline-block bg-stone-900 px-6 py-3 text-sm text-white hover:bg-stone-700"
        >
          {linkText}
        </Link>
      )}

    </div>
  );
}

export default EmptyState;