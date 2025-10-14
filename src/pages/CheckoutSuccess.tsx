import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Home, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Errore",
        description: "Sessione di pagamento non trovata",
        variant: "destructive",
      });
      navigate("/shop");
      return;
    }

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      console.log(`Verifying payment for session: ${sessionId}`);

      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { session_id: sessionId },
      });

      if (error) {
        console.error("Verification error:", error);
        throw error;
      }

      if (!data?.success) {
        throw new Error("Verifica pagamento fallita");
      }

      console.log("Payment verified successfully:", data);
      setVerified(true);
      
      if (data.expires_at) {
        setExpiresAt(data.expires_at);
      }

      toast({
        title: "Pagamento completato!",
        description: "Il tuo boost è stato attivato con successo",
      });
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Errore",
        description: error.message || "Errore durante la verifica del pagamento",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="p-12 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Verifica del pagamento in corso...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {verified ? (
            <>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-bold mb-3">
                Pagamento completato!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Il tuo boost è stato attivato con successo
              </p>

              {expiresAt && (
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Boost Attivo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scade il: <span className="font-medium text-foreground">
                      {formatExpiryDate(expiresAt)}
                    </span>
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground">
                  Il tuo profilo è ora in evidenza! Riceverai priorità nei feed
                  e sulla mappa, e un bonus del 10% sui payout delle missioni idonee.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Vai alla Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/shop")}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Torna allo Shop
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>

              <h1 className="text-3xl font-bold mb-3">
                Verifica fallita
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Si è verificato un errore durante la verifica del pagamento
              </p>

              <Button
                onClick={() => navigate("/shop")}
                variant="outline"
                size="lg"
              >
                Torna allo Shop
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
