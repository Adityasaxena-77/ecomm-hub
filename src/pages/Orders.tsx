import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ReviewModal from "@/components/ReviewModal";
import { Package, ArrowLeft, CheckCircle2, Truck, MapPin, CheckCircle, RotateCcw } from "lucide-react";
import OrderTracking from "@/components/OrderTracking";
import { Product } from "@/data/products";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string;
  shipping_city: string | null;
  shipping_state: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  placed: { icon: CheckCircle2, color: "text-blue-600", label: "Order Placed" },
  confirmed: { icon: CheckCircle, color: "text-green-600", label: "Order Confirmed" },
  packed: { icon: Package, color: "text-yellow-600", label: "Packed" },
  shipped: { icon: Truck, color: "text-blue-600", label: "Shipped" },
  out_for_delivery: { icon: MapPin, color: "text-orange-600", label: "Out for Delivery" },
  delivered: { icon: CheckCircle, color: "text-green-700", label: "Delivered" },
  return_requested: { icon: RotateCcw, color: "text-orange-600", label: "Return Requested" },
};

type ReviewMode = "feedback" | "review";

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("feedback");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const createReviewProduct = (item: OrderItem): Product => ({
    id: Number(item.id) || 0,
    name: item.product_name,
    price: item.price,
    originalPrice: item.price,
    discount: 0,
    rating: 4.5,
    reviews: 0,
    image: item.product_image || "https://via.placeholder.com/150",
    category: "electronics",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .neq("order_status", "cancelled")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Fetch orders error:", ordersError);
      toast.error("Failed to load orders");
      setLoading(false);
      return;
    }

    if (ordersData) {
      const ordersWithItems: Order[] = [];
      for (const order of ordersData) {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        if (itemsError) {
          console.error("Fetch order items error:", itemsError);
          continue;
        }
        ordersWithItems.push({ ...order, order_items: items || [] });
      }
      setOrders(ordersWithItems);
    }
    setLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { data: updatedOrders, error: orderError } = await supabase
        .from("orders")
        .update({ order_status: "cancelled" })
        .eq("id", orderId)
        .select("id");
      if (orderError) throw orderError;
      if (!updatedOrders || updatedOrders.length === 0) {
        throw new Error("Order could not be cancelled or was not found");
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      toast.success("Order cancelled and removed successfully");
      await fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error("Failed to cancel order: " + (error as Error).message);
    }
  };

  const returnOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: "return_requested" })
        .eq("id", orderId);
      if (error) throw error;
      toast.success("Return request submitted successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to submit return request");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Orders</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Button variant="hero" onClick={() => navigate("/")}>Shop Now</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.confirmed;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-card rounded-xl card-shadow p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>

                  <OrderTracking status={order.order_status} />

                  <div className="flex gap-2 mt-4">
                    {(order.order_status === "placed" || order.order_status === "confirmed") && (
                      <Button variant="destructive" size="sm" onClick={() => cancelOrder(order.id)}>
                        Cancel Order
                      </Button>
                    )}
                    {order.order_status === "delivered" && (
                      <Button variant="outline" size="sm" onClick={() => returnOrder(order.id)}>
                        Return Order
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex flex-wrap gap-3 items-center justify-between bg-muted/5 rounded-xl p-3">
                        <div className="flex gap-3 items-center min-w-0 flex-1">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded-md object-cover" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(createReviewProduct(item));
                                setReviewMode("feedback");
                                setReviewOpen(true);
                              }}
                            >
                              Give Feedback
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(createReviewProduct(item));
                                setReviewMode("review");
                                setReviewOpen(true);
                              }}
                            >
                              Write Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground capitalize">{order.payment_method} • {order.payment_status}</span>
                    <span className="font-bold text-foreground">Total: ₹{Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          mode={reviewMode}
          open={reviewOpen}
          onOpenChange={(open) => setReviewOpen(open)}
        />
      )}
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Orders;
