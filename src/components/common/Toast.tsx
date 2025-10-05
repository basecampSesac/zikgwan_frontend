import {
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";
import { useToastStore } from "../../store/toastStore";

const variantStyles = {
  success: "border-green-200 text-green-700 bg-green-50",
  error: "border-red-200 text-red-700 bg-red-50",
  info: "border-gray-200 text-gray-700 bg-gray-50",
  warning: "border-gray-200 text-gray-700 bg-gray-50",
};

const icons = {
  success: <FiCheckCircle className="text-green-600 text-xl" />,
  error: <FiXCircle className="text-red-600 text-xl" />,
  info: <FiInfo className="text-gray-600 text-xl" />,
  warning: <FiAlertTriangle className="text-gray-600 text-xl" />,
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-[11000]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white border rounded-lg shadow-md px-6 py-4 flex items-center gap-4 w-[500px] max-w-[700px] ${
            variantStyles[toast.type]
          }`}
        >
          {icons[toast.type]}
          <span className="text-base flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
