"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button 
      onClick={logout}
      variant="outline" 
      size="sm"
      className={cn(
        "border-pfa-champagne-gold text-pfa-champagne-gold hover:bg-pfa-champagne-gold hover:text-pfa-royal-blue transition-colors",
        className
      )}
    >
      退出
    </Button>
  );
}
