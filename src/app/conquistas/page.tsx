"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Trophy, Lock, CheckCircle, Target, Coins, Heart, TrendingUp, Calendar } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "economia" | "metas" | "doacao" | "investimento" | "uso";
  unlocked: boolean;
  progress: number;
  target: number;
  reward: number;
}

const ACHIEVEMENTS_TEMPLATE: Achievement[] = [
  {
    id: "first-save",
    name: "Primeira Economia",
    description: "Registre sua primeira economia",
    icon: "coins",
    category: "economia",
    unlocked: false,
    progress: 0,
    target: 1,
    reward: 50,
  },
  {
    id: "save-100",
    name: "Economizador",
    description: "Economize R$ 100",
    icon: "target",
    category: "economia",
    unlocked: false,
    progress: 0,
    target: 100,
    reward: 100,
  },
  {
    id: "save-1000",
    name: "Poupador Expert",
    description: "Economize R$ 1.000",
    icon: "trophy",
    category: "economia",
    unlocked: false,
    progress: 0,
    target: 1000,
    reward: 500,
  },
  {
    id: "first-goal",
    name: "Primeira Meta",
    description: "Complete sua primeira meta financeira",
    icon: "target",
    category: "metas",
    unlocked: false,
    progress: 0,
    target: 1,
    reward: 100,
  },
  {
    id: "goal-master",
    name: "Mestre das Metas",
    description: "Complete 10 metas financeiras",
    icon: "trophy",
    category: "metas",
    unlocked: false,
    progress: 0,
    target: 10,
    reward: 1000,
  },
  {
    id: "first-donation",
    name: "Coração Solidário",
    description: "Faça sua primeira doação",
    icon: "heart",
    category: "doacao",
    unlocked: false,
    progress: 0,
    target: 1,
    reward: 100,
  },
  {
    id: "donate-1000",
    name: "Filantropo",
    description: "Doe 1.000 milhas para ONGs",
    icon: "heart",
    category: "doacao",
    unlocked: false,
    progress: 0,
    target: 1000,
    reward: 500,
  },
  {
    id: "first-simulation",
    name: "Investidor Iniciante",
    description: "Realize sua primeira simulação de investimento",
    icon: "trending",
    category: "investimento",
    unlocked: false,
    progress: 0,
    target: 1,
    reward: 50,
  },
  {
    id: "daily-streak-7",
    name: "Consistência",
    description: "Acesse o app por 7 dias consecutivos",
    icon: "calendar",
    category: "uso",
    unlocked: false,
    progress: 0,
    target: 7,
    reward: 200,
  },
  {
    id: "daily-streak-30",
    name: "Dedicação Total",
    description: "Acesse o app por 30 dias consecutivos",
    icon: "trophy",
    category: "uso",
    unlocked: false,
    progress: 0,
    target: 30,
    reward: 1000,
  },
];

export default function ConquistasPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_TEMPLATE);
  const [filter, setFilter] = useState<"all" | Achievement["category"]>("all");
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAchievements();
      
      // Auto-refresh a cada 5 segundos
      const interval = setInterval(() => {
        fetchAchievements();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      // Fetch unlocked achievements
      const achievementsResponse = await fetch(`/api/achievements?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch profile data to calculate progress
      const profileResponse = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch donations to calculate donated miles
      const donationsResponse = await fetch(`/api/donations?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let unlockedAchievements: any[] = [];
      let profileData: any = {};
      let donationsData: any[] = [];

      if (achievementsResponse.ok) {
        unlockedAchievements = await achievementsResponse.json();
      }

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      if (donationsResponse.ok) {
        donationsData = await donationsResponse.json();
      }

      // Calculate total donated miles
      const totalDonatedMiles = donationsData.reduce((sum: number, donation: any) => sum + donation.milesAmount, 0);
      const totalDonationsCount = donationsData.length;
      
      // Merge database achievements with template and calculate progress
      const mergedAchievements = ACHIEVEMENTS_TEMPLATE.map(template => {
        const dbAchievement = unlockedAchievements.find((d: any) => d.achievementId === template.id);
        
        if (dbAchievement) {
          return {
            ...template,
            unlocked: true,
            progress: template.target,
          };
        }

        // Calculate progress based on user data
        let calculatedProgress = 0;
        
        switch (template.id) {
          case "first-save":
            calculatedProgress = Math.min(profileData.totalSavingsAmount >= 1 ? 1 : 0, template.target);
            break;
          case "save-100":
            calculatedProgress = Math.min(Math.floor(profileData.totalSavingsAmount || 0), template.target);
            break;
          case "save-1000":
            calculatedProgress = Math.min(Math.floor(profileData.totalSavingsAmount || 0), template.target);
            break;
          case "first-donation":
            calculatedProgress = Math.min(totalDonationsCount, template.target);
            break;
          case "donate-1000":
            calculatedProgress = Math.min(totalDonatedMiles, template.target);
            break;
          default:
            calculatedProgress = 0;
        }
        
        return {
          ...template,
          progress: calculatedProgress,
        };
      });
      
      setAchievements(mergedAchievements);
      setTotalUnlocked(mergedAchievements.filter((a: Achievement) => a.unlocked).length);
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string, unlocked: boolean) => {
    const className = `w-8 h-8 ${unlocked ? "text-warning" : "text-muted-foreground"}`;
    switch (iconName) {
      case "coins":
        return <Coins className={className} />;
      case "target":
        return <Target className={className} />;
      case "trophy":
        return <Trophy className={className} />;
      case "heart":
        return <Heart className={className} />;
      case "trending":
        return <TrendingUp className={className} />;
      case "calendar":
        return <Calendar className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const filteredAchievements = filter === "all" 
    ? achievements 
    : achievements.filter(a => a.category === filter);

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
              Conquistas
            </h1>
            <p className="text-muted-foreground">
              Desbloqueie conquistas e ganhe recompensas
            </p>
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-8 bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Progresso</p>
                <p className="text-4xl font-bold text-foreground">
                  {totalUnlocked}/{achievements.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round((totalUnlocked / achievements.length) * 100)}% completo
                </p>
              </div>
              <Trophy className="w-16 h-16 text-warning" />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "all" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("economia")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "economia" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Economia
          </button>
          <button
            onClick={() => setFilter("metas")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "metas" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Metas
          </button>
          <button
            onClick={() => setFilter("doacao")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "doacao" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Doações
          </button>
          <button
            onClick={() => setFilter("investimento")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "investimento" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Investimentos
          </button>
          <button
            onClick={() => setFilter("uso")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "uso" 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Uso Diário
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`${
                achievement.unlocked 
                  ? "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20" 
                  : "opacity-75"
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? "bg-warning/20" : "bg-muted"
                  }`}>
                    {achievement.unlocked ? (
                      getIcon(achievement.icon, true)
                    ) : (
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {achievement.name}
                      {achievement.unlocked && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!achievement.unlocked && (
                  <>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-foreground font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ 
                            width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Recompensa</span>
                  <span className="text-sm font-bold text-warning flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {achievement.reward} milhas
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}