"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Users, TrendingUp, Trophy, Medal, UserPlus, Target, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Friend {
  id: string;
  name: string;
  email: string;
  savingsPercentage: number;
  weeklyProgress: number;
  rank: number;
  goalsCompleted: number;
  activeGoals: number;
  totalGoalProgress: number;
  isCurrentUser?: boolean;
}

interface Goal {
  id: number;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number | null;
  completed: boolean;
  createdAt: number;
}

export default function AmigosPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState({ rank: 1, percentage: 15.5, progress: 250, goalsCompleted: 0, activeGoals: 0 });
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: 0, deadline: "" });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFriends();
      fetchUserGoals();
    }
  }, [session]);

  const fetchUserGoals = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/goals?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserGoals(data);
        
        const completed = data.filter((g: Goal) => g.completed).length;
        const active = data.filter((g: Goal) => !g.completed).length;
        const totalProgress = data.reduce((sum: number, g: Goal) => sum + (g.currentAmount / g.targetAmount * 100), 0) / (data.length || 1);
        
        setUserRank(prev => ({ 
          ...prev, 
          goalsCompleted: completed, 
          activeGoals: active,
          percentage: totalProgress
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/friends?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch goals for each friend
        const friendsWithGoals = await Promise.all(
          data.map(async (friendship: any, index: number) => {
            try {
              const goalsResponse = await fetch(`/api/goals?userId=${friendship.friend.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              let goalsData = [];
              if (goalsResponse.ok) {
                goalsData = await goalsResponse.json();
              }
              
              const completed = goalsData.filter((g: Goal) => g.completed).length;
              const active = goalsData.filter((g: Goal) => !g.completed).length;
              const totalProgress = goalsData.length > 0 
                ? goalsData.reduce((sum: number, g: Goal) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goalsData.length
                : 0;
              
              return {
                id: friendship.friend.id,
                name: friendship.friend.name,
                email: friendship.friend.email,
                savingsPercentage: totalProgress,
                weeklyProgress: Math.floor(Math.random() * 500),
                rank: index + 2,
                goalsCompleted: completed,
                activeGoals: active,
                totalGoalProgress: totalProgress,
              };
            } catch (error) {
              return {
                id: friendship.friend.id,
                name: friendship.friend.name,
                email: friendship.friend.email,
                savingsPercentage: 0,
                weeklyProgress: 0,
                rank: index + 2,
                goalsCompleted: 0,
                activeGoals: 0,
                totalGoalProgress: 0,
              };
            }
          })
        );
        
        // Sort by goals completed and progress
        friendsWithGoals.sort((a, b) => {
          if (b.goalsCompleted !== a.goalsCompleted) {
            return b.goalsCompleted - a.goalsCompleted;
          }
          return b.totalGoalProgress - a.totalGoalProgress;
        });
        
        // Update ranks
        friendsWithGoals.forEach((friend, index) => {
          friend.rank = index + 2;
        });
        
        setFriends(friendsWithGoals);
      }
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail) {
      toast.error("Digite um email válido");
      return;
    }

    if (searchEmail === session?.user?.email) {
      toast.error("Você não pode adicionar a si mesmo como amigo");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      const searchResponse = await fetch(`/api/friends/search?email=${encodeURIComponent(searchEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        toast.error(errorData.error || "Usuário não encontrado");
        setLoading(false);
        return;
      }

      const userData = await searchResponse.json();
      
      const addResponse = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId: session?.user?.id,
          friendId: userData.id 
        }),
      });

      const data = await addResponse.json();

      if (addResponse.ok) {
        toast.success(`${userData.name} adicionado como amigo!`);
        await fetchFriends();
        setSearchEmail("");
        setShowAddForm(false);
      } else {
        if (data.code === "DUPLICATE_FRIENDSHIP") {
          toast.error("Este usuário já é seu amigo");
        } else {
          toast.error(data.error || "Erro ao adicionar amigo");
        }
      }
    } catch (error) {
      toast.error("Erro ao adicionar amigo");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.name || newGoal.targetAmount <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const deadline = newGoal.deadline ? new Date(newGoal.deadline).getTime() : null;
      
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: newGoal.name,
          targetAmount: newGoal.targetAmount,
          deadline,
        }),
      });

      if (response.ok) {
        toast.success("Meta criada com sucesso!");
        await fetchUserGoals();
        await fetchFriends(); // Atualizar ranking
        setNewGoal({ name: "", targetAmount: 0, deadline: "" });
        setShowGoalForm(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao criar meta");
      }
    } catch (error) {
      toast.error("Erro ao criar meta");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoalProgress = async (goalId: number, amount: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const goal = userGoals.find(g => g.id === goalId);
      if (!goal) return;
      
      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentAmount: newAmount,
        }),
      });

      if (response.ok) {
        toast.success("Progresso atualizado!");
        await fetchUserGoals();
        await fetchFriends(); // Atualizar ranking
      }
    } catch (error) {
      toast.error("Erro ao atualizar progresso");
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-warning" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-secondary" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Competição de Metas
          </h1>
          <p className="text-muted-foreground">
            Crie metas financeiras e compita com seus amigos para alcançá-las primeiro
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Sua Posição
                </CardTitle>
                <Trophy className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                #{userRank.rank}
              </p>
              <p className="text-sm text-success mt-1">
                {userRank.rank === 1 ? "🎉 Você está no topo!" : "Continue economizando!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Metas Completadas
                </CardTitle>
                <Check className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {userRank.goalsCompleted}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Conquistas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Metas Ativas
                </CardTitle>
                <Target className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {userRank.activeGoals}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Em progresso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Total de Amigos
                </CardTitle>
                <Users className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {friends.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Competindo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Goals Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Minhas Metas Financeiras</CardTitle>
              <Button variant="primary" size="sm" onClick={() => setShowGoalForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Você ainda não tem metas financeiras</p>
                <Button variant="primary" onClick={() => setShowGoalForm(true)}>
                  Criar Primeira Meta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const daysLeft = goal.deadline ? Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                  
                  return (
                    <div key={goal.id} className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{goal.name}</h4>
                        {goal.completed ? (
                          <span className="text-xs px-2 py-1 rounded bg-success text-white">
                            ✓ Concluída
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                            Em progresso
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            R$ {goal.currentAmount.toLocaleString()} / R$ {goal.targetAmount.toLocaleString()}
                          </span>
                          <span className="text-foreground font-semibold">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${goal.completed ? 'bg-success' : 'bg-primary'} rounded-full h-2 transition-all`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {daysLeft !== null && (
                          <span className="text-xs text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo expirado'}
                          </span>
                        )}
                        {!goal.completed && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateGoalProgress(goal.id, 100)}
                          >
                            Adicionar R$ 100
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Goal Form */}
        {showGoalForm && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Criar Nova Meta</CardTitle>
                <button onClick={() => setShowGoalForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <Input
                  label="Nome da Meta"
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Viagem para Europa"
                  required
                />
                <Input
                  label="Valor Alvo (R$)"
                  type="number"
                  value={newGoal.targetAmount || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  placeholder="5000"
                  min="1"
                  step="0.01"
                  required
                />
                <Input
                  label="Prazo (Opcional)"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                    {loading ? "Criando..." : "Criar Meta"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowGoalForm(false);
                      setNewGoal({ name: "", targetAmount: 0, deadline: "" });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Friend Section */}
        {!showAddForm && (
          <div className="mb-8">
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              className="w-full md:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Amigo
            </Button>
          </div>
        )}

        {/* Add Friend Form */}
        {showAddForm && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle>Adicionar Novo Amigo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <Input
                  label="Email do amigo"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  required
                />
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Adicionando..." : "Adicionar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setSearchEmail("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Competition Info */}
        {friends.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-accent/10 to-primary/10">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Competição de Metas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quem completar mais metas lidera o ranking!
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-warning" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        {friends.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Você ainda não tem amigos
              </h3>
              <p className="text-muted-foreground mb-6">
                Adicione amigos para competir e tornar a economia ainda mais divertida!
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Amigo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current User */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border-2 border-primary">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(userRank.rank)}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Você
                      <span className="text-xs px-2 py-1 rounded bg-primary text-white">
                        Você
                      </span>
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {userRank.goalsCompleted} metas completadas
                      </span>
                      <span className="text-sm text-muted-foreground">
                        •
                      </span>
                      <span className="text-sm text-success">
                        {userRank.activeGoals} ativas
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {userRank.percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      progresso médio
                    </div>
                  </div>
                </div>

                {/* Friends */}
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(friend.rank)}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {friend.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {friend.goalsCompleted} metas completadas
                        </span>
                        <span className="text-sm text-muted-foreground">
                          •
                        </span>
                        <span className="text-sm text-success">
                          {friend.activeGoals} ativas
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {friend.totalGoalProgress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        progresso médio
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}