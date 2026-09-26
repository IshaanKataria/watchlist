import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EmailForm, GoogleButton } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="grid w-full max-w-sm gap-6 rounded-xl border bg-card p-6">
        <div className="grid gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Track the films you want to see. Rate the ones you have.
          </p>
        </div>
        <Tabs defaultValue="sign-in">
          <TabsList className="w-full">
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            <TabsTrigger value="sign-up">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <EmailForm mode="sign-in" />
          </TabsContent>
          <TabsContent value="sign-up">
            <EmailForm mode="sign-up" />
          </TabsContent>
        </Tabs>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton oauthFailed={error === "oauth"} />
      </div>
    </main>
  );
}
