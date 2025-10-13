import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, CreditCard, Clock, CheckCircle, TrendingUp, Target, Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { EarningsChart } from "@/components/EarningsChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { MilestoneProgress } from "@/components/MilestoneProgress";
import { mockEarningsHistory, mockCategoryStats } from "@/lib/mockData";
import walletRechargeImg from "@/assets/wallet-recharge.png";

const TransactionItem = ({ 
  title, 
  description, 
  amount, 
  type, 
  status,
  date 
}: { 
  title: string; 
  description: string; 
  amount: number; 
  type: "income" | "outcome" | "pending";
  status?: "completed" | "pending" | "escrow";
  date: string; 
}) => {
  const getIcon = () => {
    if (status === "pending" || status === "escrow") return <Clock className="w-5 h-5 text-warning" />;
    if (type === "income") return <ArrowDownRight className="w-5 h-5 text-success" />;
    return <ArrowUpRight className="w-5 h-5 text-muted-foreground" />;
  };

  const getAmountColor = () => {
    if (status === "pending" || status === "escrow") return "text-warning";
    if (type === "income") return "text-success";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted/50 rounded-xl transition-smooth cursor-pointer">
      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${getAmountColor()}`}>
          {type === "income" ? "+" : ""}€{Math.abs(amount).toFixed(2)}
        </p>
        {status && (
          <p className="text-xs text-muted-foreground capitalize">{status}</p>
        )}
      </div>
    </div>
  );
};

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [balance] = useState(127.50);
  const [pendingBalance] = useState(45.00);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "mobile" | "bank">("card");

  const transactions = [
    {
      title: "Consegna pacchi completata",
      description: "Missione: Centro città - Marco Rossi",
      amount: 25.00,
      type: "income" as const,
      status: "completed" as const,
      date: "2 ore fa"
    },
    {
      title: "Pagamento in escrow",
      description: "Missione: Dog sitting - Sofia Bianchi",
      amount: 60.00,
      type: "income" as const,
      status: "escrow" as const,
      date: "1 giorno fa"
    },
    {
      title: "Spesa settimanale",
      description: "Completata - Anna Verdi",
      amount: 15.00,
      type: "income" as const,
      status: "completed" as const,
      date: "3 giorni fa"
    },
    {
      title: "Ricarica wallet",
      description: "Carta di credito ****1234",
      amount: 50.00,
      type: "income" as const,
      status: "completed" as const,
      date: "1 settimana fa"
    },
    {
      title: "Commissione SideQuest",
      description: "5% su missione completata",
      amount: -1.25,
      type: "outcome" as const,
      status: "completed" as const,
      date: "2 ore fa"
    }
  ];

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (amount >= 10 && amount <= 500) {
      toast({
        title: "Ricarica in corso",
        description: `Ricarica di €${amount.toFixed(2)} in elaborazione`,
      });
      setRechargeAmount("");
      setIsRechargeOpen(false);
    } else {
      toast({
        title: "Importo non valido",
        description: "L'importo deve essere tra €10 e €500",
        variant: "destructive",
      });
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="min-h-screen bg-background lg:ml-64 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Portafoglio</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="p-8 bg-gradient-hero border-0 shadow-floating text-secondary-foreground relative overflow-hidden">
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <WalletIcon className="w-7 h-7" />
              <span className="text-base font-bold opacity-90">Saldo disponibile</span>
            </div>
            <div className="text-5xl font-black mb-6">
              <AnimatedCounter 
                value={balance} 
                prefix="€"
                decimals={2}
                duration={800}
              />
            </div>
            
            {pendingBalance > 0 && (
              <div className="bg-secondary-foreground/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border-2 border-secondary-foreground/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-base font-bold">In sospeso</span>
                </div>
                <p className="text-2xl font-black">
                  <AnimatedCounter 
                    value={pendingBalance} 
                    prefix="€"
                    decimals={2}
                    duration={800}
                  />
                </p>
                <p className="text-xs opacity-90 font-medium mt-1">Disponibile tra 2 giorni 🎉</p>
              </div>
            )}
            
            <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 shadow-elegant hover:shadow-floating transition-all hover:scale-105 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ricarica Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Ricarica Wallet</DialogTitle>
                </DialogHeader>
                
                {/* Illustration */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={walletRechargeImg} 
                    alt="Wallet" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <form onSubmit={handleRecharge} className="space-y-6">
                  {/* Quick Amounts */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Importi rapidi</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          className="h-12 font-semibold"
                          onClick={() => setRechargeAmount(amount.toString())}
                        >
                          €{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold">Importo personalizzato</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="10"
                      max="500"
                      step="0.01"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Inserisci importo (€10 - €500)"
                      className="mt-2 h-12"
                    />
                  </div>
                  
                  {/* Payment Methods */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Metodo di pagamento</Label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("card")}
                        className={`w-full flex items-center gap-3 p-4 border rounded-xl transition-smooth ${
                          selectedPaymentMethod === "card" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">Carta di Credito</p>
                          <p className="text-xs text-muted-foreground">Visa ****1234</p>
                        </div>
                        {selectedPaymentMethod === "card" && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("mobile")}
                        className={`w-full flex items-center gap-3 p-4 border rounded-xl transition-smooth ${
                          selectedPaymentMethod === "mobile" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">Apple / Google Pay</p>
                          <p className="text-xs text-muted-foreground">Pagamento rapido</p>
                        </div>
                        {selectedPaymentMethod === "mobile" && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("bank")}
                        className={`w-full flex items-center gap-3 p-4 border rounded-xl transition-smooth ${
                          selectedPaymentMethod === "bank" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">Bonifico Bancario</p>
                          <p className="text-xs text-muted-foreground">2-3 giorni lavorativi</p>
                        </div>
                        {selectedPaymentMethod === "bank" && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
                  >
                    Conferma Ricarica
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl">
            <TabsTrigger value="balance" className="rounded-lg">💰 Saldo</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">📜 Cronologia</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">📊 Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="mt-6 space-y-4">
            <Card className="p-4 bg-card shadow-card border-0">
              <h3 className="font-semibold text-foreground mb-3">Statistiche</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">€312</p>
                  <p className="text-sm text-muted-foreground">Guadagni totali</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">18</p>
                  <p className="text-sm text-muted-foreground">Missioni pagate</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-card shadow-card border-0">
              <h3 className="font-semibold text-foreground mb-3">Metodi di pagamento</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Visa ****1234</p>
                    <p className="text-xs text-muted-foreground">Scade 12/26</p>
                  </div>
                  <Button variant="ghost" size="sm">Modifica</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card className="bg-card shadow-card border-0 overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground">Transazioni recenti</h3>
              </div>
              <div className="divide-y divide-border/50">
                {transactions.map((transaction, index) => (
                  <TransactionItem key={index} {...transaction} />
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* Earnings Trend Chart */}
            <Card className="p-4 bg-card shadow-card border-0">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trend Guadagni (ultimi 30 giorni)
              </h3>
              <EarningsChart 
                data={mockEarningsHistory}
                variant="full"
                showGrid
              />
            </Card>

            {/* Category Breakdown */}
            <Card className="p-4 bg-card shadow-card border-0">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Guadagni per Categoria
              </h3>
              <CategoryBreakdown categories={mockCategoryStats} />
            </Card>

            {/* Fun Stats */}
            <Card className="p-4 bg-card shadow-card border-0">
              <h3 className="font-semibold text-foreground mb-4">🎉 I Tuoi Record</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Guadagno medio per ora</span>
                  <span className="font-semibold text-foreground text-lg">€18.50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Giorno migliore</span>
                  <span className="font-semibold text-foreground text-lg">Martedì (€65)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Categoria top</span>
                  <span className="font-semibold text-foreground text-lg">🐕 Dog sitting</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium text-foreground">Ranking Community</span>
                  <span className="font-bold text-primary text-lg">Top 15% 🏆</span>
                </div>
              </div>
            </Card>

            {/* Next Milestone */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-warning/5 border-primary/20 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Prossimo Obiettivo
              </h3>
              <MilestoneProgress
                current={balance + pendingBalance}
                next={500}
                label="€500 - Livello Gold Sidequester"
                showPercentage
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wallet;