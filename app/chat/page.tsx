import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat-interface";

export default async function ChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <ChatInterface user={data.claims} />;
}