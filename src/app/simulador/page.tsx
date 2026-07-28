"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { TrendingUp, Info, AlertTriangle, Shield, Zap, Building2, FileText, X } from "lucide-react";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface InvestmentType {
  id: string;
  name: string;
  description: string;
  riskLevel: "Baixo" | "Médio" | "Alto" | "Muito Alto";
  minReturn: number;
  avgReturn: number;
  maxReturn: number;
  icon: any;
  details: string[];
  color: string;
  howItWorks: string;
  taxes: string;
  risks: string[];
  benefits: string[];
  liquidity: string;
}

const INVESTMENT_TYPES: InvestmentType[] = [
  {
    id: "cdi",
    name: "CDI",
    description: "Certificado de Depósito Interbancário - rendimento próximo à Taxa Selic",
    riskLevel: "Baixo",
    minReturn: 0.095,
    avgReturn: 0.105,
    maxReturn: 0.115,
    icon: Shield,
    color: "success",
    details: [
      "Baixíssimo risco",
      "Liquidez diária",
      "Referência do mercado financeiro",
      "Ideal para reserva de emergência",
    ],
    howItWorks: "O CDI é a taxa média dos empréstimos entre bancos. Investimentos atrelados ao CDI (como CDBs de liquidez diária) rendem um percentual dessa taxa, geralmente entre 100% e 120% do CDI, dependendo do banco e do valor investido.",
    taxes: "Imposto de Renda regressivo sobre o lucro: 22,5% (até 180 dias), 20% (181-360 dias), 17,5% (361-720 dias), 15% (acima de 720 dias). Isento de IOF após 30 dias.",
    risks: [
      "Risco de crédito baixo (protegido pelo FGC até R$ 250 mil)",
      "Risco de inflação superar a rentabilidade",
      "Variação do CDI pode reduzir ganhos"
    ],
    benefits: [
      "Segurança garantida pelo FGC",
      "Previsibilidade de rentabilidade",
      "Disponibilidade imediata dos recursos",
      "Melhor que poupança"
    ],
    liquidity: "Liquidez diária - pode resgatar a qualquer momento"
  },
  {
    id: "selic",
    name: "Taxa Selic",
    description: "Taxa básica de juros da economia brasileira",
    riskLevel: "Baixo",
    minReturn: 0.09,
    avgReturn: 0.105,
    maxReturn: 0.12,
    icon: Shield,
    color: "success",
    details: [
      "Baixíssimo risco",
      "Tesouro Direto",
      "Garantido pelo governo",
      "Ótimo para iniciantes",
    ],
    howItWorks: "Investimento em títulos do Tesouro Selic via Tesouro Direto. O rendimento acompanha a taxa Selic, que é definida pelo Banco Central. É o investimento mais seguro do país, pois é garantido pelo Tesouro Nacional.",
    taxes: "Imposto de Renda regressivo: 22,5% (até 180 dias), 20% (181-360 dias), 17,5% (361-720 dias), 15% (acima de 720 dias). Taxa de custódia BM&F: 0,20% ao ano sobre o valor investido. Isento de IOF após 30 dias.",
    risks: [
      "Risco praticamente zero (garantido pelo governo)",
      "Risco de marcação a mercado se vender antes do vencimento",
      "Inflação pode corroer ganhos reais"
    ],
    benefits: [
      "Máxima segurança do mercado brasileiro",
      "Liquidez diária (D+1)",
      "Investimento inicial baixo (a partir de R$ 30)",
      "Acessível via Tesouro Direto"
    ],
    liquidity: "Liquidez D+1 - resgate em 1 dia útil"
  },
  {
    id: "cdb",
    name: "CDB",
    description: "Certificado de Depósito Bancário - renda fixa emitida por bancos",
    riskLevel: "Baixo",
    minReturn: 0.10,
    avgReturn: 0.12,
    maxReturn: 0.14,
    icon: Building2,
    color: "primary",
    details: [
      "Risco baixo",
      "Garantia do FGC até R$ 250 mil",
      "Pode ter liquidez diária ou no vencimento",
      "Rentabilidade superior à poupança",
    ],
    howItWorks: "Ao comprar um CDB, você empresta dinheiro para o banco em troca de juros. O banco usa esse dinheiro para suas operações e paga de volta no vencimento com juros. CDBs podem ser prefixados (taxa fixa), pós-fixados (% do CDI) ou híbridos (IPCA + taxa fixa).",
    taxes: "Imposto de Renda regressivo sobre o rendimento: 22,5% (até 180 dias), 20% (181-360 dias), 17,5% (361-720 dias), 15% (acima de 720 dias). IOF para resgates em menos de 30 dias.",
    risks: [
      "Risco de crédito do banco emissor",
      "Cobertura do FGC limitada a R$ 250 mil por CPF por instituição",
      "CDBs com vencimento podem ter penalidade para resgate antecipado",
      "Bancos menores oferecem taxas maiores mas têm mais risco"
    ],
    benefits: [
      "Rentabilidade superior ao Tesouro Selic",
      "Proteção do FGC",
      "Opções com liquidez diária",
      "Diversas opções de prazos e taxas"
    ],
    liquidity: "Varia - pode ser diária ou apenas no vencimento"
  },
  {
    id: "acoes",
    name: "Ações",
    description: "Renda variável - participação em empresas listadas na bolsa",
    riskLevel: "Alto",
    minReturn: -0.10,
    avgReturn: 0.15,
    maxReturn: 0.35,
    icon: TrendingUp,
    color: "warning",
    details: [
      "Risco alto",
      "Potencial de retorno elevado",
      "Volatilidade significativa",
      "Requer conhecimento do mercado",
    ],
    howItWorks: "Ao comprar ações, você se torna sócio da empresa. Pode lucrar com a valorização das ações (ganho de capital) e com distribuição de dividendos. O preço das ações varia conforme oferta e demanda no mercado, influenciado por resultados da empresa, economia e sentimento dos investidores.",
    taxes: "Ganho de capital: 15% sobre o lucro para operações normais, 20% para day trade. Dividendos são isentos. Vendas até R$ 20.000/mês em operações normais são isentas. Declaração obrigatória no Imposto de Renda. Dedo-duro da bolsa (B3) reporta automaticamente à Receita Federal.",
    risks: [
      "Alta volatilidade - preço pode variar muito",
      "Risco de prejuízo significativo",
      "Risco de falência da empresa",
      "Influência de fatores macroeconômicos",
      "Risco de liquidez em ações menos negociadas",
      "Decisões emocionais podem levar a perdas"
    ],
    benefits: [
      "Potencial de retorno superior à renda fixa",
      "Recebimento de dividendos isentos de IR",
      "Participação nos lucros das empresas",
      "Liquidez alta nas principais ações",
      "Proteção contra inflação no longo prazo",
      "Possibilidade de diversificação"
    ],
    liquidity: "Alta - vendas são executadas em D+2 (2 dias úteis)"
  },
  {
    id: "cripto",
    name: "Criptomoedas",
    description: "Ativos digitais descentralizados - alta volatilidade",
    riskLevel: "Muito Alto",
    minReturn: -0.50,
    avgReturn: 0.20,
    maxReturn: 1.00,
    icon: Zap,
    color: "accent",
    details: [
      "Risco muito alto",
      "Extremamente volátil",
      "Não regulamentado",
      "Apenas para perfil arrojado",
    ],
    howItWorks: "Criptomoedas são moedas digitais descentralizadas baseadas em blockchain. Bitcoin, Ethereum e outras funcionam sem controle governamental. O preço é determinado puramente por oferta e demanda. Podem ser compradas em exchanges (corretoras de cripto) e armazenadas em carteiras digitais.",
    taxes: "Ganhos de capital são tributados em 15% sobre o lucro em vendas acima de R$ 35.000/mês. Vendas até R$ 35.000/mês são isentas. Declaração obrigatória no IR. As exchanges brasileiras reportam operações à Receita Federal. Importante manter controle rigoroso de compras e vendas.",
    risks: [
      "Volatilidade extrema - pode perder 50%+ em dias",
      "Risco de golpes e exchanges fraudulentas",
      "Risco de hack e roubo de carteiras",
      "Ausência de regulamentação clara",
      "Risco de proibição governamental",
      "Perda de senha/chave = perda total do investimento",
      "Mercado manipulável por 'baleias'",
      "Risco tecnológico e de substituição"
    ],
    benefits: [
      "Potencial de ganhos exponenciais",
      "Descentralização e independência bancária",
      "Liquidez 24/7 (mercado nunca fecha)",
      "Facilidade de transferências internacionais",
      "Proteção contra desvalorização monetária",
      "Inovação tecnológica"
    ],
    liquidity: "Muito alta - mercado 24/7, mas pode ter slippage"
  },
];

export default function SimuladorPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selectedType, setSelectedType] = useState<InvestmentType>(INVESTMENT_TYPES[0]);
  const [formData, setFormData] = useState({
    initialAmount: 1000,
    monthlyDeposit: 500,
    months: 12,
  });
  const [simulation, setSimulation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const calculateSimulation = () => {
    const { initialAmount, monthlyDeposit, months } = formData;
    
    const chartData = [];
    const scenarios = {
      pessimista: [] as number[],
      realista: [] as number[],
      otimista: [] as number[],
    };

    // Cálculo para cada cenário
    const rates = {
      pessimista: selectedType.minReturn / 12,
      realista: selectedType.avgReturn / 12,
      otimista: selectedType.maxReturn / 12,
    };

    Object.keys(rates).forEach((scenario) => {
      let balance = initialAmount;
      scenarios[scenario as keyof typeof scenarios].push(balance);

      for (let i = 0; i < months; i++) {
        balance = balance * (1 + rates[scenario as keyof typeof rates]) + monthlyDeposit;
        scenarios[scenario as keyof typeof scenarios].push(balance);
      }
    });

    // Preparar dados para o gráfico
    for (let i = 0; i <= months; i++) {
      chartData.push({
        month: i,
        pessimista: scenarios.pessimista[i],
        realista: scenarios.realista[i],
        otimista: scenarios.otimista[i],
        investido: initialAmount + (monthlyDeposit * i)
      });
    }

    setSimulation({ scenarios, chartData });
  };

  const handleSimulate = () => {
    calculateSimulation();
  };

  const totalInvested = formData.initialAmount + formData.monthlyDeposit * formData.months;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Baixo":
        return "text-success";
      case "Médio":
        return "text-primary";
      case "Alto":
        return "text-warning";
      case "Muito Alto":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "Baixo":
        return "bg-success/20";
      case "Médio":
        return "bg-primary/20";
      case "Alto":
        return "bg-warning/20";
      case "Muito Alto":
        return "bg-danger/20";
      default:
        return "bg-muted";
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

      {/* Full Information Modal */}
      {showFullInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = selectedType.icon;
                  return <Icon className={`w-8 h-8 text-${selectedType.color}`} />;
                })()}
                <h2 className="text-2xl font-bold text-foreground">{selectedType.name}</h2>
              </div>
              <button
                onClick={() => setShowFullInfo(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-muted-foreground">{selectedType.description}</p>
              </div>

              {/* Risk Level */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className={getRiskColor(selectedType.riskLevel)} />
                  Nível de Risco: <span className={getRiskColor(selectedType.riskLevel)}>{selectedType.riskLevel}</span>
                </h3>
                <div className={`${getRiskBgColor(selectedType.riskLevel)} p-4 rounded-lg`}>
                  <p className="text-sm text-muted-foreground mb-2">Retorno Anual Esperado:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cenário Pessimista</p>
                      <p className="text-xl font-bold text-danger">
                        {(selectedType.minReturn * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cenário Realista</p>
                      <p className="text-xl font-bold text-primary">
                        {(selectedType.avgReturn * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cenário Otimista</p>
                      <p className="text-xl font-bold text-success">
                        {(selectedType.maxReturn * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Como Funciona
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedType.howItWorks}
                </p>
              </div>

              {/* Liquidity */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Liquidez
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedType.liquidity}
                </p>
              </div>

              {/* Taxes */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-warning" />
                  Tributação e Impostos
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedType.taxes}
                </p>
              </div>

              {/* Risks */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                  Riscos
                </h3>
                <ul className="space-y-2">
                  {selectedType.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-danger mt-0.5">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  Benefícios
                </h3>
                <ul className="space-y-2">
                  {selectedType.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Principais Características</h3>
                <ul className="space-y-2">
                  {selectedType.details.map((detail, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Simulador de Investimentos
            </h1>
            <p className="text-muted-foreground">
              Compare diferentes tipos de investimentos e veja como seu dinheiro pode crescer
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src="/cashview-logo.png"
                alt="CashView"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Investment Types Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Selecione o tipo de investimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {INVESTMENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type);
                    setSimulation(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedType.id === type.id
                      ? `border-${type.color} bg-${type.color}/10`
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 text-${type.color}`} />
                  <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                  <p className={`text-xs font-medium ${getRiskColor(type.riskLevel)}`}>
                    Risco: {type.riskLevel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Investment Info */}
        <Card className={`mb-8 border-2 border-${selectedType.color}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = selectedType.icon;
                  return <Icon className={`w-8 h-8 text-${selectedType.color}`} />;
                })()}
                <div>
                  <CardTitle className="text-xl">{selectedType.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedType.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullInfo(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Informações Completas
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>
          {showDetails && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${getRiskColor(selectedType.riskLevel)}`} />
                    Nível de Risco: {selectedType.riskLevel}
                  </h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Retorno Anual Esperado:</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-danger">Mínimo:</span>{" "}
                        <span className="font-semibold">
                          {(selectedType.minReturn * 100).toFixed(1)}%
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-primary">Médio:</span>{" "}
                        <span className="font-semibold">
                          {(selectedType.avgReturn * 100).toFixed(1)}%
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-success">Máximo:</span>{" "}
                        <span className="font-semibold">
                          {(selectedType.maxReturn * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Principais Características:</h4>
                  <ul className="space-y-2">
                    {selectedType.details.map((detail, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Parâmetros da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Valor Inicial (R$)"
                type="number"
                value={formData.initialAmount}
                onChange={(e) =>
                  setFormData({ ...formData, initialAmount: Number(e.target.value) })
                }
                min="0"
                step="100"
              />

              <Input
                label="Aporte Mensal (R$)"
                type="number"
                value={formData.monthlyDeposit}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyDeposit: Number(e.target.value) })
                }
                min="0"
                step="100"
              />

              <Input
                label="Período (meses)"
                type="number"
                value={formData.months}
                onChange={(e) =>
                  setFormData({ ...formData, months: Number(e.target.value) })
                }
                min="1"
                max="360"
              />

              <Button variant="primary" className="w-full" onClick={handleSimulate}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Simular
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Total investido:
                </p>
                <p className="text-2xl font-bold text-foreground">
                  R${" "}
                  {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {!simulation && (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configure os parâmetros e clique em Simular para ver os resultados
                  </p>
                </CardContent>
              </Card>
            )}

            {simulation && (
              <>
                {/* Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-danger/10 to-danger/5">
                    <CardHeader>
                      <CardTitle className="text-sm text-danger">
                        Cenário Pessimista
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        R${" "}
                        {simulation.scenarios.pessimista[
                          simulation.scenarios.pessimista.length - 1
                        ].toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedType.minReturn * 100).toFixed(1)}% a.a.
                      </p>
                      <p className="text-xs text-success mt-2">
                        +R${" "}
                        {(
                          simulation.scenarios.pessimista[
                            simulation.scenarios.pessimista.length - 1
                          ] - totalInvested
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm text-primary">
                        Cenário Realista
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        R${" "}
                        {simulation.scenarios.realista[
                          simulation.scenarios.realista.length - 1
                        ].toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedType.avgReturn * 100).toFixed(1)}% a.a.
                      </p>
                      <p className="text-xs text-success mt-2">
                        +R${" "}
                        {(
                          simulation.scenarios.realista[
                            simulation.scenarios.realista.length - 1
                          ] - totalInvested
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-success/10 to-success/5">
                    <CardHeader>
                      <CardTitle className="text-sm text-success">
                        Cenário Otimista
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        R${" "}
                        {simulation.scenarios.otimista[
                          simulation.scenarios.otimista.length - 1
                        ].toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedType.maxReturn * 100).toFixed(1)}% a.a.
                      </p>
                      <p className="text-xs text-success mt-2">
                        +R${" "}
                        {(
                          simulation.scenarios.otimista[
                            simulation.scenarios.otimista.length - 1
                          ] - totalInvested
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do Patrimônio - {selectedType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Comparação entre os três cenários ao longo do tempo
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulation.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#94a3b8"
                            label={{ value: 'Meses', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          />
                          <YAxis 
                            stroke="#94a3b8"
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid #1e293b',
                              borderRadius: '8px'
                            }}
                            formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            labelFormatter={(label) => `Mês ${label}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="investido" 
                            stroke="#94a3b8" 
                            strokeWidth={2}
                            name="Total Investido"
                            strokeDasharray="5 5"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="pessimista" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Pessimista"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="realista" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            name="Realista"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="otimista" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Otimista"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-warning/10 border-warning/20">
                  <CardContent className="py-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Aviso Importante
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Esta simulação é apenas ilustrativa e não garante rentabilidade futura.
                          Os valores reais podem variar significativamente. Rentabilidade passada
                          não é garantia de rentabilidade futura. Consulte um profissional
                          certificado antes de investir.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}