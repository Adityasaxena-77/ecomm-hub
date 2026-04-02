import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Mail, MapPin, Package, Phone, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z.string().trim().max(20, "Phone number is too long").optional().or(z.literal("")),
  address: z.string().trim().max(250, "Address is too long").optional().or(z.literal("")),
  city: z.string().trim().max(80, "City is too long").optional().or(z.literal("")),
  state: z.string().trim().max(80, "State is too long").optional().or(z.literal("")),
  pincode: z.string().trim().max(20, "Pincode is too long").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;

const emptyProfile: ProfileForm = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [password, setPassword] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const displayEmail = useMemo(() => user?.email ?? "", [user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [authLoading, navigate, user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, address, city, state, pincode")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Could not load profile details");
      setLoading(false);
      return;
    }

    setProfile({
      full_name: data?.full_name ?? user.user_metadata?.full_name ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
      city: data?.city ?? "",
      state: data?.state ?? "",
      pincode: data?.pincode ?? "",
    });
    setLoading(false);
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your profile details");
      return;
    }

    if (!user) return;

    setSavingProfile(true);
    const payload = {
      user_id: user.id,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      pincode: parsed.data.pincode || null,
    };

    const [{ error: profileError }, { error: authError }] = await Promise.all([
      supabase.from("profiles").upsert(payload, { onConflict: "user_id" }),
      supabase.auth.updateUser({ data: { full_name: parsed.data.full_name } }),
    ]);

    setSavingProfile(false);

    if (profileError || authError) {
      toast.error(profileError?.message || authError?.message || "Could not save profile");
      return;
    }

    toast.success("Profile updated successfully");
  };

  const handlePasswordSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your password");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSavingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPassword({ password: "", confirmPassword: "" });
    toast.success("Password updated successfully");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account details, delivery info, and security.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading profile...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Name, email, phone number, and delivery address.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={profile.full_name}
                          onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={displayEmail} className="pl-10" disabled readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">Use your current location</p>
                      <p className="text-sm text-muted-foreground">Auto-fill your delivery address from this device.</p>
                    </div>
                    <CurrentLocationButton
                      onLocationResolved={(location) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: location.address.slice(0, 250),
                          city: location.city.slice(0, 80),
                          state: location.state.slice(0, 80),
                          pincode: location.pincode.slice(0, 20),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profile.address}
                        onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                        className="pl-10"
                        placeholder="House no, street, area"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">City</label>
                      <Input
                        value={profile.city}
                        onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">State</label>
                      <Input
                        value={profile.state}
                        onChange={(e) => setProfile((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Pincode</label>
                      <Input
                        value={profile.pincode}
                        onChange={(e) => setProfile((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password Settings</CardTitle>
                  <CardDescription>Change your account password securely.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          value={password.password}
                          onChange={(e) => setPassword((prev) => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm Password</label>
                      <Input
                        type="password"
                        value={password.confirmPassword}
                        onChange={(e) => setPassword((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button type="submit" variant="outline" disabled={savingPassword}>
                      {savingPassword ? "Updating..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Track previous purchases and current order status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
                    <Package className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">View your orders anytime</p>
                      <p className="text-sm text-muted-foreground">Open your order history to check products, payment status, and delivery progress.</p>
                    </div>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => navigate("/orders")}>View Order History</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Profile;