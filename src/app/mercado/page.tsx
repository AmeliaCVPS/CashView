"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Search, TrendingUp, TrendingDown, Star, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Asset {
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "br_stock";
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap: number;
  updatedAt: string | number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function MercadoPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "br_stock" | "crypto">("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    loadAssets();
  }, []);

  // Auto-refresh every 30 seconds - ONLY for Market page
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadAssets();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    filterAssets();
  }, [searchQuery, assets, filter]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/market?type=all`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do mercado');
      }

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAssets(data.assets || []);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      toast.error('Erro ao carregar dados do mercado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/market?type=all`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do mercado');
      }

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAssets(data.assets || []);
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ativos:', error);
      toast.error('Erro ao atualizar dados do mercado');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterAssets = () => {
    let result = [...assets];

    // Filter by type
    if (filter !== "all") {
      result = result.filter(asset => asset.type === filter);
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(searchLower) ||
          asset.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssets(result);
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "stock":
        return "Ação US";
      case "br_stock":
        return "Ação BR";
      case "crypto":
        return "Cripto";
      default:
        return type;
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Animated Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/15 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [-60, 60, -60],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          className="mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-card border-2 border-primary"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="/cashview-logo.png"
                alt="CashView"
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Mercado Financeiro
              </h1>
              <p className="text-muted-foreground">
                Acompanhe ações e criptomoedas em tempo real
              </p>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ativo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={filter === "all" ? "primary" : "ghost"}
                      onClick={() => setFilter("all")}
                    >
                      Todos
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={filter === "stock" ? "primary" : "ghost"}
                      onClick={() => setFilter("stock")}
                    >
                      Ações US
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={filter === "br_stock" ? "primary" : "ghost"}
                      onClick={() => setFilter("br_stock")}
                    >
                      🇧🇷 Ações BR
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={filter === "crypto" ? "primary" : "ghost"}
                      onClick={() => setFilter("crypto")}
                    >
                      Cripto
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados do mercado...</p>
            </CardContent>
          </Card>
        )}

        {/* Assets List */}
        {!isLoading && (
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset) => (
                <motion.div
                  key={asset.symbol}
                  variants={fadeInUp}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card className="transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <motion.button
                            onClick={() => toggleFavorite(asset.symbol)}
                            className="text-muted-foreground hover:text-warning transition-colors"
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                favorites.includes(asset.symbol)
                                  ? "fill-warning text-warning"
                                  : ""
                              }`}
                            />
                          </motion.button>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground">{asset.symbol}</h3>
                              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
                                {getAssetTypeLabel(asset.type)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <motion.p 
                            className="text-2xl font-bold text-foreground"
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            R$ {asset.currentPrice.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </motion.p>
                          <div className="flex items-center gap-1 justify-end">
                            {asset.change24h >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-success" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-danger" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                asset.change24h >= 0 ? "text-success" : "text-danger"
                              }`}
                            >
                              {asset.change24h >= 0 ? "+" : ""}
                              {asset.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAssets.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nenhum ativo encontrado</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}