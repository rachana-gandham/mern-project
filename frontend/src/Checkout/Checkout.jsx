import { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// import './Checkout.css'

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    postal_code: "400001",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get cart from location state or default to empty array
  const cart = location.state?.cart || [];
  
  // Log the cart to debug
  console.log("Checkout cart data:", cart);

  // Fixed totalPrice calculation with null checks
  const totalPrice = cart.reduce((acc, item) => {
    // Log each item to help with debugging
    console.log("Checkout item:", item);
    
    // Check if productId exists and has price before using it
    if (item && item.productId && item.productId.price !== undefined) {
      return acc + (item.quantity * item.productId.price);
    }
    // If the item is invalid, just return the accumulator unchanged
    console.log("Invalid cart item found (missing productId or price):", item);
    return acc;
  }, 0);

  // Log the calculated total price
  console.log("Total price calculated:", totalPrice);

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!customerName || !customerEmail || !address.line1 || !address.city || cart.length === 0) {
        return;
      }

      try {
        const response = await axios.post("https://ecommerce-6tho.onrender.com/api/payment/create-payment-intent", {
          amount: totalPrice * 100,
          customerName,
          customerEmail,
          address,
        });

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.log("Payment intent creation error:", error);
        setMessage("Unable to initiate payment. Please try again.");
      }
    };

    createPaymentIntent();
  }, [cart, totalPrice, customerName, customerEmail, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setMessage("Stripe hasn't loaded yet or details missing.");
      return;
    }

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: customerName,
          email: customerEmail,
          address: {
            line1: address.line1,
            city: address.city,
            postal_code: address.postal_code,
            country: "IN",
          },
        },
      },
    });

    if (error) {
      console.log("Payment confirmation error:", error);
      setMessage(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setMessage("Payment successful! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    }

    setLoading(false);
  };

  // return (
  //   <div className="checkout-wrapper">
  //     <div className="checkout-container">
  //       <h2 className="payment-heading">Payment Details</h2>

  //       {/* Add warning for empty cart */}
  //       {(!cart || cart.length === 0) && (
  //         <div style={{ color: "red", marginBottom: "20px", textAlign: "center" }}>
  //           Your cart is empty. Please add items to your cart before checkout.
  //         </div>
  //       )}

  //       <form onSubmit={handleSubmit} className="checkout-form">
  //         <table>
  //           <tbody>
  //             <tr>
  //               <td><label>Name</label></td>
  //               <td>
  //                 <input
  //                   value={customerName}
  //                   onChange={(e) => setCustomerName(e.target.value)}
  //                   required
  //                 />
  //               </td>
  //             </tr>
  //             <tr>
  //               <td><label>Email</label></td>
  //               <td>
  //                 <input
  //                   type="email"
  //                   value={customerEmail}
  //                   onChange={(e) => setCustomerEmail(e.target.value)}
  //                   required
  //                 />
  //               </td>
  //             </tr>
  //             <tr>
  //               <td><label>Address Line 1</label></td>
  //               <td>
  //                 <input
  //                   value={address.line1}
  //                   onChange={(e) => setAddress({ ...address, line1: e.target.value })}
  //                   required
  //                 />
  //               </td>
  //             </tr>
  //             <tr>
  //               <td><label>City</label></td>
  //               <td>
  //                 <input
  //                   value={address.city}
  //                   onChange={(e) => setAddress({ ...address, city: e.target.value })}
  //                   required
  //                 />
  //               </td>
  //             </tr>
  //             <tr>
  //               <td><label>Postal Code</label></td>
  //               <td>
  //                 <input
  //                   value={address.postal_code}
  //                   onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
  //                   required
  //                 />
  //               </td>
  //             </tr>
  //             <tr>
  //               <td><label>Payment Details</label></td>
  //               <td>
  //                 <div className="my-4">
  //                   <CardElement options={{ hidePostalCode: true }} />
  //                 </div>
  //               </td>
  //             </tr>
  //           </tbody>
  //         </table>

  //         <div className="total-price-container">
  //           <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
  //         </div>

  //         <button disabled={!stripe || loading || !clientSecret || cart.length === 0}>
  //           {loading ? "Processing..." : `Pay ₹${totalPrice.toFixed(2)}`}
  //         </button>
  //       </form>

  //       {message && (
  //         <div style={{ 
  //           marginTop: "15px", 
  //           padding: "10px", 
  //           backgroundColor: message.includes("successful") ? "#d4edda" : "#f8d7da",
  //           color: message.includes("successful") ? "#155724" : "#721c24",
  //           borderRadius: "4px",
  //           textAlign: "center"
  //         }}>
  //           {message}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div 
        className="checkout-wrapper" 
        style={{
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "100vh", 
            backgroundColor: "#f4f4f4"
        }}
    >
      <div 
        className="checkout-container" 
        style={{
            width: "400px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
        }}
      >
        <h2 className="payment-heading" style={{ marginBottom: "15px", color: "#333" }}>
          Payment Details
        </h2>

        {/* Add warning for empty cart */}
        {(!cart || cart.length === 0) && (
          <div style={{ color: "red", marginBottom: "20px", textAlign: "center" }}>
            Your cart is empty. Please add items to your cart before checkout.
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form">
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td><label>Name</label></td>
                <td>
                  <input
                    style={{
                        width: "100%",
                        padding: "8px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Email</label></td>
                <td>
                  <input
                    type="email"
                    style={{
                        width: "100%",
                        padding: "8px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Address Line 1</label></td>
                <td>
                  <input
                    style={{
                        width: "100%",
                        padding: "8px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>City</label></td>
                <td>
                  <input
                    style={{
                        width: "100%",
                        padding: "8px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Postal Code</label></td>
                <td>
                  <input
                    style={{
                        width: "100%",
                        padding: "8px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                    value={address.postal_code}
                    onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Payment Details</label></td>
                <td>
                  <div className="my-4" style={{ marginTop: "10px", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}>
                    <CardElement options={{ hidePostalCode: true }} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="total-price-container" style={{ marginTop: "15px" }}>
            <h3 style={{ color: "#333" }}>Total: ₹{totalPrice.toFixed(2)}</h3>
          </div>

          <button 
            disabled={!stripe || loading || !clientSecret || cart.length === 0}
            style={{
                width: "100%",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                padding: "10px",
                fontSize: "16px",
                border: "none",
                borderRadius: "5px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "10px"
            }}
          >
            {loading ? "Processing..." : `Pay ₹${totalPrice.toFixed(2)}`}
          </button>
        </form>

        {message && (
          <div style={{ 
            marginTop: "15px", 
            padding: "10px", 
            backgroundColor: message.includes("successful") ? "#d4edda" : "#f8d7da",
            color: message.includes("successful") ? "#155724" : "#721c24",
            borderRadius: "4px",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
);

};

export default Checkout;
