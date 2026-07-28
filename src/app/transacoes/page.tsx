"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PlusCircle, TrendingDown, TrendingUp, AlertTriangle, Gift } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: number;
  postponed?: boolean;
}

export default function TransacoesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    // Se for despesa, mostrar modal de reflexão
    if (formData.type === "expense") {
      setCurrentExpense({ ...formData, amount });
      setShowModal(false);
      setShowReflectionModal(true);
      return;
    }

    // Se for receita, adicionar diretamente
    await addTransaction(false);
  };

  const addTransaction = async (postponed: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const amount = currentExpense?.amount || parseFloat(formData.amount);
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          amount,
          description: formData.description,
          postponed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (postponed && data.milesEarned) {
          toast.success(
            `Compra adiada! Você ganhou ${data.milesEarned} milhas por economizar R$ ${amount.toFixed(2)}! 🎉`
          );
        } else {
          toast.success(
            `${formData.type === "income" ? "Receita" : "Despesa"} adicionada com sucesso!`
          );
        }

        fetchTransactions();
        setFormData({ type: "expense", amount: "", description: "" });
        setShowModal(false);
        setShowReflectionModal(false);
        setCurrentExpense(null);
      } else {
        toast.error("Erro ao adicionar transação");
      }
    } catch (error) {
      toast.error("Erro ao adicionar transação");
    }
  };

  const handlePostpone = () => {
    addTransaction(true);
  };

  const handleContinue = () => {
    addTransaction(false);
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

  if (!session?.user) return null;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Despesas e Receitas
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas finanças e ganhe milhas economizando
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${balance >= 0 ? "from-primary/10 to-primary/5" : "from-warning/10 to-warning/5"}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Saldo</CardTitle>
                <Gift className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${balance >= 0 ? "text-success" : "text-warning"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação registrada ainda
                </p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-success/20"
                            : "bg-danger/20"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "income" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === "income"
                          ? "border-success bg-success/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
                      <p className="text-sm font-medium">Receita</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "expense" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === "expense"
                          ? "border-danger bg-danger/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <TrendingDown className="w-6 h-6 mx-auto mb-2 text-danger" />
                      <p className="text-sm font-medium">Despesa</p>
                    </button>
                  </div>
                </div>

                <Input
                  label="Descrição"
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Almoço, Salário, Compras"
                  required
                />

                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Adicionar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reflection Modal */}
      {showReflectionModal && currentExpense && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2 border-warning">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <CardTitle className="text-warning">Reflexão sobre o Gasto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-warning/10 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">
                  Você realmente precisa deste gasto?
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>💰 Valor: R$ {currentExpense.amount.toFixed(2)}</p>
                  <p>📝 Descrição: {formData.description}</p>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Ganhe Milhas Adiando!
                </p>
                <p className="text-sm text-muted-foreground">
                  Se você adiar esta compra, você ganhará milhas equivalentes ao valor
                  economizado. Use essas milhas para doar a ONGs ou investir no fundo
                  CashView!
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  O que você deseja fazer?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="primary"
                    onClick={handlePostpone}
                    className="w-full"
                  >
                    ✨ Adiar e Ganhar Milhas
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleContinue}
                    className="w-full"
                  >
                    Continuar Compra
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setShowReflectionModal(false);
                  setCurrentExpense(null);
                  setShowModal(true);
                }}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}