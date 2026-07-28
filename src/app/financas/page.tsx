"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PlusCircle, TrendingDown, TrendingUp, AlertCircle, Award, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: "income" | "expense";
  date: number;
  postponed?: boolean;
  milesEarned?: number;
}

export default function FinancasPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPostponed, setTotalPostponed] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "expense" as "income" | "expense",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchTransactions();
      fetchSavings();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  const fetchSavings = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/savings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const total = data.savings?.reduce((sum: number, saving: any) => sum + saving.amount, 0) || 0;
        setTotalPostponed(total);
      }
    } catch (error) {
      console.error("Erro ao carregar economias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "expense") {
      // Mostrar reflexão antes de adicionar despesa
      setCurrentExpense({
        amount: parseFloat(formData.amount),
        description: formData.description,
      });
      setShowReflection(true);
      setShowAddForm(false);
      return;
    }

    // Para receitas, adicionar diretamente
    await addTransaction(false);
  };

  const addTransaction = async (postponed: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount || currentExpense?.amount),
          description: formData.description || currentExpense?.description,
          type: formData.type,
          postponed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (postponed) {
          toast.success(`🎉 Você adiou a compra e ganhou ${data.milesEarned} milhas!`, {
            description: "Continue economizando para ganhar mais recompensas.",
          });
          // Atualizar savings após adiar compra
          await fetchSavings();
        } else if (formData.type === "expense") {
          toast.info("Despesa registrada");
        } else {
          toast.success("Receita registrada com sucesso!");
        }

        // Refresh transactions list
        await fetchTransactions();
        
        setFormData({ amount: "", description: "", type: "expense" });
        setShowAddForm(false);
        setShowReflection(false);
        setCurrentExpense(null);
      } else {
        toast.error("Erro ao registrar transação");
      }
    } catch (error) {
      toast.error("Erro ao registrar transação");
    }
  };

  const handleConfirmExpense = async () => {
    setFormData({
      amount: currentExpense.amount.toString(),
      description: currentExpense.description,
      type: "expense",
    });
    await addTransaction(false);
  };

  const handlePostponeExpense = async () => {
    setFormData({
      amount: currentExpense.amount.toString(),
      description: currentExpense.description,
      type: "expense",
    });
    await addTransaction(true);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

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
            Minhas Finanças
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas de forma inteligente
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Receitas</CardTitle>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-danger/10 to-danger/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Despesas</CardTitle>
                <TrendingDown className="w-5 h-5 text-danger" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Saldo</CardTitle>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${balance >= 0 ? "text-success" : "text-danger"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Economizado</CardTitle>
                <Award className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalPostponed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Compras adiadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Transaction Button */}
        {!showAddForm && !showReflection && (
          <div className="mb-8">
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              className="w-full md:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Transação
            </Button>
          </div>
        )}

        {/* Add Transaction Form */}
        {showAddForm && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      formData.type === "income"
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      formData.type === "expense"
                        ? "bg-danger text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 inline mr-2" />
                    Despesa
                  </button>
                </div>

                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0,00"
                />

                <Input
                  label="Descrição"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Ex: Almoço, Salário, Compras..."
                />

                <div className="flex gap-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ amount: "", description: "", type: "expense" });
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

        {/* Reflection Modal */}
        {showReflection && currentExpense && (
          <Card className="mb-8 border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-warning" />
                <CardTitle>Reflita sobre esta compra</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">
                  Você realmente precisa desta despesa agora?
                </p>
                <div className="bg-card p-4 rounded-lg mb-4">
                  <p className="text-muted-foreground mb-1">Despesa:</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {currentExpense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{currentExpense.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold text-primary mb-2">💰 Se você adiar esta compra:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Ganhará milhas proporcionais ao valor</li>
                    <li>✓ Poderá investir esse dinheiro</li>
                    <li>✓ Contribuirá para suas metas financeiras</li>
                    <li>✓ Poderá doar milhas para ONGs</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-2">🤔 Perguntas para refletir:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• É uma necessidade ou um desejo?</li>
                    <li>• Você pode esperar mais alguns dias?</li>
                    <li>• Isso está nos seus objetivos do mês?</li>
                    <li>• Há uma alternativa mais econômica?</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={handlePostponeExpense}
                  className="flex-1"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Adiar e Ganhar Milhas
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleConfirmExpense}
                  className="flex-1"
                >
                  Confirmar Despesa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma transação registrada ainda.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comece adicionando suas receitas e despesas!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      transaction.postponed
                        ? "bg-warning/10 border-warning/20"
                        : transaction.type === "income"
                        ? "bg-success/10 border-success/20"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.postponed
                            ? "bg-warning/20"
                            : transaction.type === "income"
                            ? "bg-success/20"
                            : "bg-danger/20"
                        }`}
                      >
                        {transaction.postponed ? (
                          <Award className="w-5 h-5 text-warning" />
                        ) : transaction.type === "income" ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          {transaction.postponed && " • Compra adiada"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income" ? "text-success" : "text-danger"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}R${" "}
                        {transaction.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {transaction.milesEarned && transaction.milesEarned > 0 && (
                        <p className="text-xs text-warning">
                          +{transaction.milesEarned} milhas
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}