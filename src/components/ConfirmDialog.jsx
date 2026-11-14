
function ConfirmDialog({
  dialog,
  onClose,
  onConfirm,
}) {
  if (!dialog) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-title"
          className="text-lg font-semibold text-stone-900"
        >
          {dialog.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          {dialog.message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
          >
            {dialog.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
