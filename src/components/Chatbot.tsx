import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, MessageCircle, Send, Sparkles, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

type ProductCard = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  products?: ProductCard[];
  orderTracking?: {
    orderId: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  } | null;
};

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! How can I help you today?",
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    scrollToBottom();


    const { data, error } = await supabase.functions.invoke("ecommerce-chatbot", {
      body: {
        message,
        history: nextMessages.map(({ role, content }) => ({ role, content })),
      },
    });

    if (error) {
      const errorMessage = typeof error.message === "string" ? error.message : "Chatbot is unavailable right now. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data?.message || "I could not generate a response right now.",
      products: data?.products || [],
      orderTracking: data?.orderTracking || null,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
    scrollToBottom();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-4 flex h-[min(70vh,36rem)] w-[calc(100vw-2rem)] max-w-[24rem] origin-bottom-right flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/90 animate-slide-in sm:w-[24rem]">
          <div className="hero-gradient flex items-center justify-between px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-heading font-semibold">Shop Assistant</h2>
                <p className="text-xs text-primary-foreground/80">Recommendations, support & order help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 bg-secondary/40">
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                  {message.role === "assistant" && (
                    <Avatar className="h-9 w-9 border border-border bg-card">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn("max-w-[85%] space-y-3", message.role === "user" && "items-end")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-6 card-shadow",
                        message.role === "assistant"
                          ? "bg-card text-card-foreground"
                          : "hero-gradient text-primary-foreground",
                      )}
                    >
                      {message.content}
                    </div>

                    {message.orderTracking && (
                      <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Order tracking</span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {message.orderTracking.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-card-foreground">
                          <p>Order ID: <span className="font-medium">{message.orderTracking.orderId}</span></p>
                          <p>Payment: <span className="font-medium capitalize">{message.orderTracking.paymentStatus}</span></p>
                          <p>Total: <span className="font-medium">₹{Number(message.orderTracking.totalAmount).toLocaleString()}</span></p>
                          <p>Placed: <span className="font-medium">{new Date(message.orderTracking.createdAt).toLocaleDateString("en-IN")}</span></p>
                        </div>
                      </div>
                    )}

                    {message.products?.length ? (
                      <div className="space-y-3">
                        {message.products.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-transform duration-200 hover:-translate-y-0.5 card-shadow"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-card-foreground">{product.name}</p>
                              <p className="mt-1 text-xs capitalize text-muted-foreground">{product.category}</p>
                              <p className="mt-2 text-sm font-semibold text-primary">₹{product.price.toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-9 w-9 border border-border bg-card">
                      <AvatarFallback className="bg-accent/10 text-accent">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 border border-border bg-card">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground card-shadow">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border bg-card p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-2 py-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about products, delivery, returns, or order ID"
                className="h-10 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
              />
              <Button variant="hero" size="icon" onClick={() => void handleSend()} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        variant="hero"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full shadow-2xl transition-transform duration-300 hover:scale-105"
        aria-label="Open shopping assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default Chatbot;