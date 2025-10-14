import { useEffect } from "react";
import { products } from "@/data/products";
import { BoostShopCard } from "@/components/BoostShopCard";

const Shop = () => {
  useEffect(() => {
    console.log("event: shop_view");
  }, []);

  const handleProductClick = (id: string, title: string) => {
    console.log("event: shop_click_product", { id, title });
  };

  const handleBuyClick = (id: string, title: string) => {
    console.log("event: shop_buy_click", { id, title });
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

        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id, product.title)}
              className="cursor-pointer w-full max-w-sm"
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
      </div>
    </main>
  );
};

export default Shop;
