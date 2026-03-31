import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const { removeFromCart } = useCart();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShoppingBag className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Please Login First</h2>
        <p className="text-muted-foreground mb-4">You need to login to checkout</p>
        <Button variant="hero" onClick={() => navigate("/auth")}>Login / Sign Up</Button>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Cart is Empty</h2>
        <p className="text-muted-foreground mb-4">Add items to proceed</p>
        <Button variant="hero" onClick={() => navigate("/")}>Continue Shopping</Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card rounded-xl card-shadow p-8 max-w-md w-full text-center">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Order Placed! 🎉</h2>
          <p className="text-muted-foreground mb-2">Your order has been confirmed</p>
          <p className="text-sm text-muted-foreground mb-6">Order ID: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span></p>
          <div className="space-y-3">
            <Button variant="hero" className="w-full" onClick={() => navigate("/orders")}>View My Orders</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.trim() || !city.trim() || !state.trim() || !pincode.trim() || !phone.trim()) {
      toast.error("Please fill all address details");
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Please enter UPI ID");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          payment_method: paymentMethod,
          payment_status: "paid",
          order_status: "confirmed",
          shipping_address: address,
          shipping_city: city,
          shipping_state: state,
          shipping_pincode: pincode,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      items.forEach((item) => removeFromCart(item.id));
      setOrderId(order.id);
      setOrderPlaced(true);
      toast.success("Order placed successfully! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="hero-gradient py-4">
        <div className="container flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-primary-foreground hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xl font-heading font-bold text-primary-foreground">Checkout</span>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Full Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-2" />
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                <Input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "upi", label: "UPI Payment", icon: Smartphone, desc: "Pay via Google Pay, PhonePe, Paytm" },
                  { id: "cod", label: "Cash on Delivery", icon: CreditCard, desc: "Pay when you receive" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-primary"
                    />
                    <method.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}

                {paymentMethod === "upi" && (
                  <div className="mt-3 p-4 bg-secondary/50 rounded-lg">
                    <label className="text-sm font-medium text-foreground mb-2 block">Enter UPI ID</label>
                    <Input
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Example: yourname@gpay, yourname@paytm</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl card-shadow p-6 sticky top-24">
              <h2 className="font-heading font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({totalItems})</span>
                  <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="hero" size="lg" className="w-full mt-4" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Placing Order..." : `Place Order — ₹${totalPrice.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
