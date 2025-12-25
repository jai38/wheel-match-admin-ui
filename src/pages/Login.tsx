import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";
import { authService } from "@/lib/api";
import logo from "@/assets/logo-black-text.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const login = useLogin();

  // Load credentials and redirect if authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Load saved credentials from localStorage
    const savedEmail = localStorage.getItem("login_email");
    const savedPassword = localStorage.getItem("login_password");
    const savedRememberMe = localStorage.getItem("login_remember_me") === "true";

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    // Save credentials if "Remember me" is checked
    if (rememberMe) {
      localStorage.setItem("login_email", email);
      localStorage.setItem("login_password", password);
      localStorage.setItem("login_remember_me", "true");
    } else {
      // Clear saved credentials if not checking "Remember me"
      localStorage.removeItem("login_email");
      localStorage.removeItem("login_password");
      localStorage.removeItem("login_remember_me");
    }

    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="Neo Wheels" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Sign in to manage your automotive inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@wheelmatch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
