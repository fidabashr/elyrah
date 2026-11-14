
import { useState } from "react";

function useConfirm() {
  const [dialog, setDialog] = useState(null);

  function showConfirm(options) {
    setDialog(options);
  }

  function closeConfirm() {
    setDialog(null);
  }

  function handleConfirm() {
    if (dialog?.onConfirm) {
      dialog.onConfirm();
    }

    closeConfirm();
  }

  return {
    dialog,
    showConfirm,
    closeConfirm,
    handleConfirm,
  };
}

export default useConfirm;
