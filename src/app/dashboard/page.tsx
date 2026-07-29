"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Coins, TrendingUp, Heart, Trophy, Target } from "lucide-react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200
    }
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState({
    totalMiles: 0,
    pendingMiles: 0,
    totalSavings: 0,
    totalDonations: 0,
    achievements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      // So a primeira carga mostra o spinner; as atualizacoes seguintes acontecem
      // em segundo plano, senao a tela inteira pisca a cada 10 segundos.
      fetchDashboardData(refreshKey > 0);
    }
  }, [session, refreshKey]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (emSegundoPlano = false) => {
    try {
      if (!emSegundoPlano) setLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      // Fetch all data in parallel
      const [profileResponse, achievementsResponse] = await Promise.all([
        fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/achievements?userId=${session?.user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let profileData: any = null;
      let achievementsData: any[] = [];

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      if (achievementsResponse.ok) {
        achievementsData = await achievementsResponse.json();
      }

      setStats({
        totalMiles: profileData?.totalMiles || 0,
        pendingMiles: 0,
        totalSavings: profileData?.totalSavingsAmount || 0,
        totalDonations: profileData?.totalDonationsCount || 0,
        achievements: achievementsData.length || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      if (!emSegundoPlano) setLoading(false);
    }
  };

  if (isPending || loading) {
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
          className="mb-8 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-primary"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/cashview-logo.png"
              alt="CashView"
              width={48}
              height={48}
              priority
            />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Olá, {session.user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel de controle financeiro
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={scaleIn} whileHover={{ scale: 1.05, y: -5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Milhas Disponíveis
                  </CardTitle>
                  <Coins className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalMiles.toLocaleString()}
                </p>
                <p className="text-xs text-success mt-1">
                  Liberadas para uso
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} whileHover={{ scale: 1.05, y: -5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Economizado
                  </CardTitle>
                  <Target className="w-5 h-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  R$ {stats.totalSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-success mt-1">
                  Continue economizando!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} whileHover={{ scale: 1.05, y: -5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Doado
                  </CardTitle>
                  <Heart className="w-5 h-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalDonations}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalDonations === 0 ? "Nenhuma doação ainda" : `${stats.totalDonations} ${stats.totalDonations === 1 ? "doação" : "doações"}`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} whileHover={{ scale: 1.05, y: -5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conquistas
                  </CardTitle>
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.achievements}/10
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Desbloqueadas
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="cursor-pointer" onClick={() => router.push("/simulador")}>
              <CardHeader>
                <motion.div 
                  className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <TrendingUp className="w-6 h-6 text-accent" />
                </motion.div>
                <CardTitle>Simular Investimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Veja quanto seu dinheiro pode render no futuro
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="cursor-pointer" onClick={() => router.push("/doacoes")}>
              <CardHeader>
                <motion.div 
                  className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart className="w-6 h-6 text-secondary" />
                </motion.div>
                <CardTitle>Doar Milhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Converta suas milhas em doações para ONGs
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="cursor-pointer" onClick={() => router.push("/mercado")}>
              <CardHeader>
                <motion.div 
                  className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Coins className="w-6 h-6 text-primary" />
                </motion.div>
                <CardTitle>Ver Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe ações e criptomoedas em tempo real
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}