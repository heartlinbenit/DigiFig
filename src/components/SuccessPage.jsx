import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/SuccessPage.css";

function SuccessPage() {
  const location = useLocation();
  const { status, message } = location.state || {
    status: "Unknown",
    message: "No additional information available.",
  };

  useEffect(() => {
    if (status === "Success") {
      const end = Date.now() + 3 * 1000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > end) return;

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors,
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    } else if (status === "Failed") {
      toast.error("Payment Failed ❌", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [status]);

  return (
    <div className="success-container">
      <ToastContainer />
      <h1>{status === "Success" ? "Payment Successful 🎉" : "Payment Failed ❌"}</h1>
      <p>{message}</p>
      <Link to="/">
        <button>Make Another Payment</button>
      </Link>
    </div>
  );
}

export default SuccessPage;
