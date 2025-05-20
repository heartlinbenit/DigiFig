import { useLocation, Link } from "react-router-dom";
import "../styles/SuccessPage.css";

function SuccessPage() {
  const location = useLocation();
  const { status, message } = location.state || { status: "Unknown", message: "No additional information available." };

  return (
    <div className="success-container">
      <h1>{status === "Success" ? "Payment Successful 🎉" : "Payment Failed ❌"}</h1>
     
      <Link to="/">
        <button>Make Another Payment</button>
      </Link>
    </div>
  );
}

export default SuccessPage;
