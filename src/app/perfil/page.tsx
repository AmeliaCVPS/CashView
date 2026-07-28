"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InvestmentSimulator, InvestorProfile } from "@/lib/investment-simulator";
import { User, Coins, Target, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PerfilPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaire, setQuestionnaire] = useState({
    idade: 25,
    objetivo: "crescimento",
    prazo: "longo",
    volatilidade: "media",
    experiencia: "intermediario",
  });
  const [stats, setStats] = useState({
    totalMiles: 0,
    totalSavings: 0,
    totalDonations: 0,
    consistencyScore: 0,
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalMiles: data.totalMiles || 0,
          totalSavings: data.totalSavings || 0,
          totalDonations: data.totalDonations || 0,
          consistencyScore: data.consistencyScore || 0,
        });
        if (data.investorProfile) {
          setInvestorProfile(data.investorProfile);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleSubmitQuestionnaire = () => {
    const profile = InvestmentSimulator.calculateInvestorProfile(questionnaire);
    setInvestorProfile(profile);
    setShowQuestionnaire(false);
    
    // Salvar no backend
    saveInvestorProfile(profile);
    
    toast.success("Perfil de investidor atualizado!");
  };

  const saveInvestorProfile = async (profile: InvestorProfile) => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ investorProfile: profile }),
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const getProfileColor = (profile: InvestorProfile) => {
    switch (profile) {
      case "conservador":
        return "text-accent";
      case "moderado":
        return "text-warning";
      case "agressivo":
        return "text-danger";
    }
  };

  const getProfileDescription = (profile: InvestorProfile) => {
    switch (profile) {
      case "conservador":
        return "Você prefere investimentos de baixo risco com retornos estáveis.";
      case "moderado":
        return "Você busca equilibrar risco e retorno nos investimentos.";
      case "agressivo":
        return "Você aceita riscos maiores em busca de retornos elevados.";
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
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-card border-2 border-primary">
            <Image
              src="/cashview-logo.png"
              alt="CashView"
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações e preferências
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{session.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Milhas</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {stats.totalMiles.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Economizado</span>
                  </div>
                  <span className="font-bold text-foreground">
                    R$ {stats.totalSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Consistência</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {stats.consistencyScore}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investor Profile */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Perfil de Investidor</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuestionnaire(!showQuestionnaire)}
                  >
                    {investorProfile ? "Refazer" : "Definir Perfil"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!investorProfile && !showQuestionnaire && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Defina seu perfil de investidor para receber recomendações personalizadas
                    </p>
                    <Button variant="primary" onClick={() => setShowQuestionnaire(true)}>
                      Começar Questionário
                    </Button>
                  </div>
                )}

                {investorProfile && !showQuestionnaire && (
                  <div>
                    <div className="text-center mb-8">
                      <div className={`text-5xl font-bold mb-2 ${getProfileColor(investorProfile)} capitalize`}>
                        {investorProfile}
                      </div>
                      <p className="text-muted-foreground">
                        {getProfileDescription(investorProfile)}
                      </p>
                    </div>

                    {/* Portfolio Suggestion */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold text-foreground mb-4">
                        Carteira Sugerida
                      </h4>
                      {InvestmentSimulator.getPortfolioSuggestion(investorProfile).allocation.map((item) => (
                        <div key={item.asset} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-foreground">{item.asset}</span>
                            <span className="text-sm font-medium text-foreground">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm text-muted-foreground">
                          Retorno esperado anual
                        </p>
                        <p className="text-2xl font-bold text-success">
                          {InvestmentSimulator.getPortfolioSuggestion(investorProfile).expectedReturn}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showQuestionnaire && (
                  <div className="space-y-6">
                    <Input
                      label="Idade"
                      type="number"
                      value={questionnaire.idade}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, idade: Number(e.target.value) })
                      }
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Objetivo Principal
                      </label>
                      <select
                        value={questionnaire.objetivo}
                        onChange={(e) =>
                          setQuestionnaire({ ...questionnaire, objetivo: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
                      >
                        <option value="preservacao">Preservação de Capital</option>
                        <option value="equilibrio">Equilíbrio</option>
                        <option value="crescimento">Crescimento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Prazo de Investimento
                      </label>
                      <select
                        value={questionnaire.prazo}
                        onChange={(e) =>
                          setQuestionnaire({ ...questionnaire, prazo: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
                      >
                        <option value="curto">Curto Prazo (até 1 ano)</option>
                        <option value="medio">Médio Prazo (1-5 anos)</option>
                        <option value="longo">Longo Prazo (5+ anos)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Tolerância à Volatilidade
                      </label>
                      <select
                        value={questionnaire.volatilidade}
                        onChange={(e) =>
                          setQuestionnaire({ ...questionnaire, volatilidade: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Experiência com Investimentos
                      </label>
                      <select
                        value={questionnaire.experiencia}
                        onChange={(e) =>
                          setQuestionnaire({ ...questionnaire, experiencia: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
                      >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="experiente">Experiente</option>
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleSubmitQuestionnaire}
                      >
                        Salvar Perfil
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={() => setShowQuestionnaire(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}