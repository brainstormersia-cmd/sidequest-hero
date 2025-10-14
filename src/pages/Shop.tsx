import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { BoostShopCard } from "@/components/BoostShopCard";
import { ShieldCheck, Clock, Headphones } from "lucide-react";

const Shop = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("event: shop_view");
  }, []);

  const handleProductClick = (id: string, title: string) => {
    console.log("event: shop_click_product", { id, title });
  };

  const handleBuyClick = (id: string, title: string) => {
    console.log("event: shop_buy_click", { id, title });
    navigate(`/checkout?product=${id}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-100 to-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">
          SideQuest Shop
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Potenzia la tua esperienza con boost, pack esclusivi e abbonamenti premium
        </p>

        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch justify-items-center">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id, product.title)}
              className="cursor-pointer h-full flex justify-center"
            >
              <BoostShopCard
                {...product}
                onBuy={(e) => {
                  e.stopPropagation();
                  handleBuyClick(product.id, product.title);
                }}
              />
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto opacity-50">
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200/50 bg-white/30">
            <ShieldCheck size={14} className="text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Pagamenti sicuri</div>
              <div className="text-[10px] text-gray-400">Protezione anti-frode</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200/50 bg-white/30">
            <Clock size={14} className="text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Attivazione immediata</div>
              <div className="text-[10px] text-gray-400">Il boost parte subito</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200/50 bg-white/30">
            <Headphones size={14} className="text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Supporto veloce</div>
              <div className="text-[10px] text-gray-400">Risposte rapide 7/7</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;
