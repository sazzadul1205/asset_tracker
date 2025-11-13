// Hooks/useToast.js
import Swal from "sweetalert2";

export const useToast = () => {
  // ---------- Toast (simple top notifications) ----------
  const showToast = (icon, title, timer = 3000, position = "top") => {
    Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      background:
        icon === "success"
          ? "#f0fdf4"
          : icon === "error"
          ? "#fef2f2"
          : icon === "warning"
          ? "#fffbeb"
          : "#ffffff",
      color:
        icon === "success"
          ? "#166534"
          : icon === "error"
          ? "#991b1b"
          : icon === "warning"
          ? "#92400e"
          : "#000000",
      customClass: {
        popup: "mx-auto",
      },
    });
  };

  const success = (title, timer, position) =>
    showToast("success", title, timer, position);
  const error = (title, timer, position) =>
    showToast("error", title, timer, position);
  const info = (title, timer, position) =>
    showToast("info", title, timer, position);
  const warning = (title, timer, position) =>
    showToast("warning", title, timer, position);

  // ---------- Confirmation Dialog ----------
  const confirm = async (
    title = "Are you sure?",
    text = "You won't be able to revert this!",
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmColor = "#2563eb",
    cancelColor = "#6b7280"
  ) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: confirmColor,
      cancelButtonColor: cancelColor,
      reverseButtons: true,
    });

    return result.isConfirmed;
  };

  return { success, error, info, warning, showToast, confirm };
};
