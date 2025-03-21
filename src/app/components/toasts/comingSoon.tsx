import { toast } from "sonner";

interface ToastProps {
  title: string;
}

const CustomToast = ({ title }: ToastProps) => {
  return toast(title, {
    duration: 5000,
    position: "top-center",
    style: {
      background: "#1F1F1F",
      color: "#ffffff",
      borderRadius: "8px",
      fontSize: "18px",
      padding: "20px",
    },
    descriptionClassName: "text-gray-600 text-sm",
  });
};

export default CustomToast;
