import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DebugAuth = () => {
  const navigate = useNavigate();
  const { user, session, profile, loading: authLoading } = useAuth();
  const [testQuery, setTestQuery] = useState<{
    loading: boolean;
    data: unknown;
    error: unknown;
  }>({ loading: true, data: null, error: null });

  useEffect(() => {
    const runTest = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, first_name")
          .limit(1);

        setTestQuery({ loading: false, data, error });
      } catch (err) {
        setTestQuery({ loading: false, data: null, error: err });
      }
    };

    runTest();
  }, []);

  const projectId = "wzxvjrecoinunnqkgzrr";
  const supabaseUrl = "https://wzxvjrecoinunnqkgzrr.supabase.co";

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Debug Auth</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Auth Status */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {user ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Stato Autenticazione
          </h2>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auth Loading:</span>
              <Badge variant={authLoading ? "secondary" : "outline"}>
                {authLoading ? "Loading..." : "Ready"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User:</span>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated" : "Not authenticated"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Session:</span>
              <Badge variant={session ? "default" : "secondary"}>
                {session ? "Active" : "None"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile:</span>
              <Badge variant={profile ? "default" : "secondary"}>
                {profile ? "Loaded" : "None"}
              </Badge>
            </div>
          </div>

          {user && (
            <details className="text-xs bg-muted/50 rounded-lg p-3">
              <summary className="cursor-pointer font-medium mb-2">User Data</summary>
              <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                {JSON.stringify({ id: user.id, email: user.email, created_at: user.created_at }, null, 2)}
              </pre>
            </details>
          )}

          {profile && (
            <details className="text-xs bg-muted/50 rounded-lg p-3">
              <summary className="cursor-pointer font-medium mb-2">Profile Data</summary>
              <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </details>
          )}
        </Card>

        {/* Test Query */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {testQuery.error ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            Test Query (Profiles)
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={testQuery.loading ? "secondary" : testQuery.error ? "destructive" : "default"}>
                {testQuery.loading ? "Loading..." : testQuery.error ? "Error" : "Success"}
              </Badge>
            </div>
          </div>

          {testQuery.data && (
            <details className="text-xs bg-muted/50 rounded-lg p-3">
              <summary className="cursor-pointer font-medium mb-2">Query Result</summary>
              <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                {JSON.stringify(testQuery.data, null, 2)}
              </pre>
            </details>
          )}

          {testQuery.error && (
            <details className="text-xs bg-destructive/10 rounded-lg p-3 border border-destructive/20">
              <summary className="cursor-pointer font-medium mb-2 text-destructive">Error Details</summary>
              <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                {JSON.stringify(testQuery.error, null, 2)}
              </pre>
            </details>
          )}
        </Card>

        {/* Project Config */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Configurazione Progetto</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Project ID:</span>
              <code className="bg-muted/50 rounded px-2 py-1 text-xs">{projectId}</code>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Supabase URL:</span>
              <code className="bg-muted/50 rounded px-2 py-1 text-xs break-all">{supabaseUrl}</code>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">localStorage (onboarding):</span>
              <code className="bg-muted/50 rounded px-2 py-1 text-xs">
                {localStorage.getItem('sidequest_onboarding_completed') || 'not set'}
              </code>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear localStorage & Reload
          </Button>
          {user && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
