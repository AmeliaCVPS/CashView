"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { TrendingUp, Coins, ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar, Info } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FundHistory {
  id: number;
  type: string;
  value: number;
  balanceAfter: number;
  createdAt: number;
}

interface Projection {
  month: number;
  value: number;
}

export default function FundoPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [availableMiles, setAvailableMiles] = useState(0);
  const [fundBalance, setFundBalance] = useState(0);
  const [monthlyReturn, setMonthlyReturn] = useState(0);
  const [history, setHistory] = useState<FundHistory[]>([]);
  const [convertAmount, setConvertAmount] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projections, setProjections] = useState<{
    conservador: Projection[];
    moderado: Projection[];
    agressivo: Projection[];
  }>({
    conservador: [],
    moderado: [],
    agressivo: [],
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Fetch user miles
      const milesResponse = await fetch("/api/miles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (milesResponse.ok) {
        const milesData = await milesResponse.json();
        setAvailableMiles(milesData.totalMiles || 0);
      }

      // Fetch fund data
      const fundResponse = await fetch(`/api/fund?userId=${session?.user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (fundResponse.ok) {
        const fundData = await fundResponse.json();
        setFundBalance(fundData.fundBalance || 0);
        setMonthlyReturn(fundData.monthlyReturn || 0);
        setHistory(fundData.history || []);
      }

      // Fetch projections
      const projectionsResponse = await fetch(
        `/api/fund?userId=${session?.user?.id}&action=projections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (projectionsResponse.ok) {
        const projectionsData = await projectionsResponse.json();
        setProjections(projectionsData.projections || {
          conservador: [],
          moderado: [],
          agressivo: [],
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleConvert = async () => {
    if (convertAmount < 100) {
      toast.error("Quantidade mínima: 100 milhas");
      return;
    }

    if (convertAmount > availableMiles) {
      toast.error("Milhas insuficientes");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/fund?action=convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          milesAmount: convertAmount,
        }),
      });

      if (response.ok) {
        toast.success(`${convertAmount} milhas convertidas para o Fundo CashView!`);
        await fetchData();
        setConvertAmount(1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao converter milhas");
      }
    } catch (error) {
      toast.error("Erro ao converter milhas");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    if (withdrawAmount > fundBalance) {
      toast.error("Saldo insuficiente no fundo");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/fund?action=withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          value: withdrawAmount,
        }),
      });

      if (response.ok) {
        toast.success(`R$ ${withdrawAmount.toFixed(2)} resgatado do Fundo CashView!`);
        await fetchData();
        setWithdrawAmount(0);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao resgatar valor");
      }
    } catch (error) {
      toast.error("Erro ao resgatar valor");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito";
      case "return":
        return "Rendimento";
      case "withdrawal":
        return "Resgate";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="w-5 h-5 text-primary" />;
      case "return":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "withdrawal":
        return <ArrowDownCircle className="w-5 h-5 text-warning" />;
      default:
        return <DollarSign className="w-5 h-5" />;
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
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Fundo CashView</h1>
            <p className="text-muted-foreground">Invista suas milhas e ganhe rendimentos baseados na taxa Selic</p>
          </div>
          <motion.div 
            className="hidden md:block"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <Image src="/cashview-logo.png" alt="CashView" width={64} height={64} className="object-cover w-full h-full" />
            </div>
          </motion.div>
        </motion.div>

        {/* Saldo e Rendimento */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saldo no Fundo</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(fundBalance)}</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DollarSign className="w-12 h-12 text-primary" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-gradient-to-br from-success/10 to-primary/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rendimento Mensal</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(monthlyReturn)}</p>
                  </div>
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-12 h-12 text-success" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Milhas Disponíveis</p>
                    <p className="text-3xl font-bold text-foreground">{availableMiles.toLocaleString()}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Coins className="w-12 h-12 text-accent" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="mb-8 bg-accent/10">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Como funciona o Fundo CashView?</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    O Fundo CashView permite que você invista suas milhas ganhas e receba rendimentos mensais baseados na taxa Selic.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Conversão: 1 milha = R$ 0,01</li>
                    <li>Investimento mínimo: 100 milhas (R$ 1,00)</li>
                    <li>Rendimento mensal automático baseado na taxa Selic</li>
                    <li>Resgate disponível a qualquer momento</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Converter Milhas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-primary" />
                  Investir Milhas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  label="Quantidade de milhas"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  min={100}
                  step={100}
                />
                <p className="text-sm text-muted-foreground">
                  Valor a investir: <span className="font-bold text-foreground">{formatCurrency(convertAmount * 0.01)}</span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleConvert}
                    disabled={loading || availableMiles < 100}
                  >
                    {loading ? "Processando..." : "Converter e Investir"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resgatar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-warning" />
                  Resgatar Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  label="Valor a resgatar (R$)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  min={0}
                  step={0.01}
                />
                <p className="text-sm text-muted-foreground">
                  Saldo disponível: <span className="font-bold text-foreground">{formatCurrency(fundBalance)}</span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={loading || fundBalance <= 0}
                  >
                    {loading ? "Processando..." : "Resgatar"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Projeções com Gráficos Visuais */}
        {projections.conservador.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Projeções de Rendimento (Taxa Selic)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Conservador */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      Conservador (0.5%/mês)
                    </h4>
                    {projections.conservador.map((proj, index) => {
                      const maxValue = Math.max(...projections.conservador.map(p => p.value));
                      const heightPercent = (proj.value / maxValue) * 100;
                      return (
                        <motion.div 
                          key={proj.month}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="relative p-3 bg-muted/50 rounded-lg overflow-hidden">
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-muted/80 to-primary/20"
                              initial={{ width: 0 }}
                              animate={{ width: `${heightPercent}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            />
                            <div className="relative flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{proj.month} {proj.month === 1 ? "mês" : "meses"}</span>
                              <span className="text-sm font-bold text-foreground">{formatCurrency(proj.value)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Moderado */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      Moderado (1.0%/mês)
                    </h4>
                    {projections.moderado.map((proj, index) => {
                      const maxValue = Math.max(...projections.moderado.map(p => p.value));
                      const heightPercent = (proj.value / maxValue) * 100;
                      return (
                        <motion.div 
                          key={proj.month}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="relative p-3 bg-primary/10 rounded-lg overflow-hidden">
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/60"
                              initial={{ width: 0 }}
                              animate={{ width: `${heightPercent}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            />
                            <div className="relative flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{proj.month} {proj.month === 1 ? "mês" : "meses"}</span>
                              <span className="text-sm font-bold text-foreground">{formatCurrency(proj.value)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Agressivo */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      Agressivo (2.0%/mês)
                    </h4>
                    {projections.agressivo.map((proj, index) => {
                      const maxValue = Math.max(...projections.agressivo.map(p => p.value));
                      const heightPercent = (proj.value / maxValue) * 100;
                      return (
                        <motion.div 
                          key={proj.month}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="relative p-3 bg-success/10 rounded-lg overflow-hidden">
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-success/30 to-success/60"
                              initial={{ width: 0 }}
                              animate={{ width: `${heightPercent}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            />
                            <div className="relative flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{proj.month} {proj.month === 1 ? "mês" : "meses"}</span>
                              <span className="text-sm font-bold text-foreground">{formatCurrency(proj.value)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Projeções são estimativas baseadas nas taxas indicadas e não garantem rendimentos futuros.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Histórico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <p className="text-sm font-medium text-foreground">{getTypeLabel(item.type)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            item.type === "withdrawal" ? "text-warning" : "text-success"
                          }`}>
                            {item.type === "withdrawal" ? "-" : "+"} {formatCurrency(item.value)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {formatCurrency(item.balanceAfter)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}