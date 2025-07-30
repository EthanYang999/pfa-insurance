"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();

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
      {t('nav.logout')}
    </Button>
  );
}
