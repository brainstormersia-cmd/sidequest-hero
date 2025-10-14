import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ArrowLeft } from "lucide-react";
import { products, Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const productId = searchParams.get("product");

  useEffect(() => {
    if (!productId) {
      toast({
        title: "Errore",
        description: "Prodotto non specificato",
        variant: "destructive",
      });
      navigate("/shop");
      return;
    }

    const foundProduct = products.find((p) => p.id === productId);
    if (!foundProduct) {
      toast({
        title: "Errore",
        description: "Prodotto non trovato",
        variant: "destructive",
      });
      navigate("/shop");
      return;
    }

    setProduct(foundProduct);
  }, [productId, navigate, toast]);

  const handlePayment = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "Autenticazione richiesta",
          description: "Devi effettuare il login per acquistare",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      console.log(`Creating payment for product: ${product.id}`);

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { product_id: product.id },
      });

      if (error) {
        console.error("Payment error:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("URL di pagamento non ricevuto");
      }

      console.log(`Redirecting to Stripe Checkout: ${data.url}`);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione del pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Shop
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Completa il tuo ordine
          </h1>

          {/* Product Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 mb-6">
            {product.badge && (
              <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            
            <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
            <p className="text-muted-foreground mb-4">{product.subtitle}</p>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-primary">
                {product.price}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.oldPrice}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{product.durationLabel}</p>
              <ul className="space-y-1">
                {product.perks.map((perk, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {perk.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Verrai reindirizzato a Stripe per completare il pagamento in modo sicuro.
                Al termine del pagamento, il tuo boost sarà attivato immediatamente.
              </p>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparazione pagamento...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Procedi al pagamento sicuro
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Pagamento sicuro</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Attivazione immediata</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>Assistenza 24/7</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
