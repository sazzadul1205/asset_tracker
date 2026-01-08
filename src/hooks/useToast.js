// Hooks/useToast.js
// Centralized toast & confirmation utilities using SweetAlert2

import Swal from "sweetalert2";

/**
 * Toast visual styles by type
 */
const TOAST_STYLES = {
  success: { bg: "#f0fdf4", color: "#166534" },
  error: { bg: "#fef2f2", color: "#991b1b" },
  warning: { bg: "#fffbeb", color: "#92400e" },
  info: { bg: "#ffffff", color: "#1f2937" },
};

/**
 * useToast
 * Provides toast notifications and confirmation dialogs
 */
export const useToast = () => {
  /**
   * Show a toast notification
   *
   * @param {Object} params
   * @param {"success"|"error"|"warning"|"info"} params.icon - Toast type
   * @param {string} params.title - Message to display
   * @param {number} [params.timer=3000] - Auto close time (ms)
   * @param {"top"|"top-end"|"bottom"|"bottom-end"} [params.position="top"]
   */
  const showToast = ({
    icon = "info",
    title,
    timer = 3000,
    position = "top",
  }) => {
    if (!title) return;

    const style = TOAST_STYLES[icon] || TOAST_STYLES.info;

    Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      background: style.bg,
      color: style.color,
      customClass: {
        popup: "mx-auto rounded-xl shadow-md",
      },
    });
  };

  /**
   * Shorthand toast helpers
   */
  const success = (title, options = {}) =>
    showToast({ icon: "success", title, ...options });

  const error = (title, options = {}) =>
    showToast({ icon: "error", title, ...options });

  const warning = (title, options = {}) =>
    showToast({ icon: "warning", title, ...options });

  const info = (title, options = {}) =>
    showToast({ icon: "info", title, ...options });

  /**
   * Confirmation dialog
   *
   * @param {Object} params
   * @param {string} [params.title="Are you sure?"]
   * @param {string} [params.text="You won't be able to revert this!"]
   * @param {string} [params.confirmText="Yes"]
   * @param {string} [params.cancelText="Cancel"]
   * @param {string} [params.confirmColor="#2563eb"]
   * @param {string} [params.cancelColor="#6b7280"]
   *
   * @returns {Promise<boolean>} - true if confirmed
   */
  const confirm = async ({
    title = "Are you sure?",
    text = "You won't be able to revert this!",
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmColor = "#2563eb",
    cancelColor = "#6b7280",
  } = {}) => {
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
      focusCancel: true,
    });

    return result.isConfirmed;
  };

  return { success, error, warning, info, showToast, confirm };
};
