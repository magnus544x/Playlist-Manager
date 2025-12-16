import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
// Remove the broken image import, we'll use a gradient fallback
// import generatedBg from '@assets/generated_images/futuristic_digital_background_with_neon_waves_and_cyber_elements.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fetch the password file from public directory
      const response = await fetch("/password.txt");
      if (!response.ok) {
        throw new Error("Could not load authentication configuration.");
      }
      const text = await response.text();
      
      // Parse format: login/password
      const validCredentials = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const [u, p] = line.split("/");
          return { username: u?.trim(), password: p?.trim() };
        });

      const isValid = validCredentials.some(
        cred => cred.username === username && cred.password === password
      );

      // Simulate a small delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isValid) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", username);
        setLocation("/app");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid credentials.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Authentication failed. Check password.txt config.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-panel border border-white/10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/50 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <ShieldCheck className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-wider">POLSKA <span className="text-primary">TV</span></h1>
          <p className="text-muted-foreground font-ui">Secure Access Gateway</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative group">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="text" 
                placeholder="Username" 
                className="pl-10 bg-black/40 border-white/10 h-12 text-white focus:border-primary/50 focus:ring-primary/20 font-ui tracking-wide"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="password" 
                placeholder="Password" 
                className="pl-10 bg-black/40 border-white/10 h-12 text-white focus:border-primary/50 focus:ring-primary/20 font-ui tracking-wide"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary text-black font-bold font-display tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            disabled={isLoading}
          >
            {isLoading ? "AUTHENTICATING..." : "ENTER SYSTEM"}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-ui">
            LINUX / WINDOWS COMPATIBLE SYSTEM
          </p>
        </div>
      </motion.div>
    </div>
  );
}
