import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  Settings, 
  TrendingUp, 
  Brain, 
  ArrowRight, 
  Check,
  Building2,
  Users,
  Sparkles
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="p-8 bg-background border-border hover:border-primary/40 transition-all hover:shadow-lg group animate-fade-in">
      <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary">
        {number}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span>La rivoluzione delle missioni è qui</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
              Agisci. Collabora. <br />
              <span className="text-primary">Crea impatto.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              SideQuest è la piattaforma che trasforma le azioni quotidiane in missioni reali. 
              Partecipa, crea e connetti persone e aziende in un ecosistema di opportunità.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              {user ? (
                <Button 
                  size="lg" 
                  className="text-lg px-8 hover-scale font-bold group"
                  onClick={() => navigate('/dashboard')}
                >
                  Vai alla Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 hover-scale font-bold group"
                    onClick={() => navigate('/login')}
                  >
                    Inizia ora
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 hover-scale font-semibold"
                    onClick={() => {
                      document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Scopri come funziona
                  </Button>
                </>
              )}
            </div>

            {/* Hero visual placeholder */}
            <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card p-8">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-100 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-lg font-semibold">Preview Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-4xl font-black">Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Rendere ogni azione significativa, connettendo persone, brand e territori 
                attraverso missioni che generano valore reale.
              </p>
            </div>
            
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-4xl font-black">Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Costruire il primo ecosistema globale dove la collaborazione e la fiducia 
                sostituiscono il lavoro passivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNZIONALITÀ PRINCIPALI */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black mb-4">Funzionalità principali</h2>
              <p className="text-xl text-muted-foreground">Tutto ciò di cui hai bisogno per iniziare</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Compass className="w-10 h-10" />}
                title="Trova missioni"
                description="Scopri attività vicino a te o digitali, filtra per interessi e ricompense."
              />
              <FeatureCard
                icon={<Settings className="w-10 h-10" />}
                title="Crea missioni"
                description="Lancia iniziative, sondaggi o campagne in pochi tap."
              />
              <FeatureCard
                icon={<TrendingUp className="w-10 h-10" />}
                title="Dashboard brand"
                description="Strumenti per aziende per misurare impatto e coinvolgimento."
              />
              <FeatureCard
                icon={<Brain className="w-10 h-10" />}
                title="Profilo XP"
                description="Costruisci la tua reputazione e ottieni vantaggi concreti."
              />
            </div>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black mb-4">Come funziona</h2>
              <p className="text-xl text-muted-foreground">Inizia in tre semplici passaggi</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <StepCard
                number="1"
                title="Scegli o crea una missione"
                description="Esplora le missioni disponibili o lancia la tua iniziativa personalizzata."
              />
              <StepCard
                number="2"
                title="Completa gli obiettivi"
                description="Porta a termine le attività e condividi i risultati con la community."
              />
              <StepCard
                number="3"
                title="Guadagna ricompense"
                description="Ottieni XP, token e riconoscimenti che aprono nuove opportunità."
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEZIONE B2B */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="p-12 lg:p-16 bg-gradient-to-br from-primary/10 to-purple-50 border-primary/20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-sm font-bold text-primary">
                    <Building2 className="w-4 h-4" />
                    <span>Per Aziende</span>
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-black">
                    Un nuovo canale di engagement per brand e territori.
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Le aziende possono lanciare campagne locali, missioni sociali o sfide di innovazione, 
                    ottenendo dati, impatto e contenuti autentici.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">Campagne misurabili con analytics in tempo reale</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">Coinvolgimento autentico con la community locale</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">Contenuti user-generated e feedback diretto</p>
                    </div>
                  </div>
                  
                  <Button size="lg" className="font-bold group mt-6">
                    Scopri la dashboard brand
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="bg-background rounded-xl p-8 shadow-xl border border-border">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-24 h-24 text-primary/40" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* COMMUNITY & TRUST */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-bold text-primary mb-4">
                <Users className="w-4 h-4" />
                <span>Community in crescita</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black">
                +500 missioni completate in 2 mesi
              </h2>
              
              <p className="text-xl text-muted-foreground">
                Migliaia di persone stanno già costruendo il loro futuro con SideQuest
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-5xl font-black text-primary">10k+</div>
                <p className="text-muted-foreground font-semibold">Utenti attivi</p>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-black text-primary">50+</div>
                <p className="text-muted-foreground font-semibold">Brand partner</p>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-black text-primary">95%</div>
                <p className="text-muted-foreground font-semibold">Soddisfazione</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 lg:p-16 bg-gradient-to-br from-primary to-purple-600 text-white text-center space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black">
                Unisciti alla rivoluzione delle missioni.
              </h2>
              
              <p className="text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto">
                Inizia oggi a trasformare le tue azioni in opportunità reali.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 font-bold group"
                  onClick={() => navigate('/login')}
                >
                  Registrati in anteprima
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 font-semibold bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/shop')}
                >
                  Esplora lo shop
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="font-black text-lg">SideQuest</h3>
                <p className="text-sm text-muted-foreground">
                  La piattaforma delle missioni reali.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm">Prodotto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Funzionalità</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Prezzi</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm">Aziende</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Dashboard Brand</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contattaci</a></li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm">Legale</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Termini di Servizio</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>© 2024 SideQuest. Tutti i diritti riservati.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
