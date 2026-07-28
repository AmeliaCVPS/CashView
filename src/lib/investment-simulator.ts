// Simulador de investimentos 100% local

export type InvestorProfile = "conservador" | "moderado" | "agressivo";

export interface SimulationScenario {
  name: string;
  returnRate: number; // % ao ano
  color: string;
}

export interface SimulationResult {
  scenarios: {
    pessimista: number[];
    conservador: number[];
    realista: number[];
    otimista: number[];
  };
  months: string[];
}

export interface PortfolioSuggestion {
  name: string;
  allocation: {
    asset: string;
    percentage: number;
    expectedReturn: number;
  }[];
  expectedReturn: number;
  risk: "baixo" | "médio" | "alto";
}

export class InvestmentSimulator {
  static simulate(
    initialAmount: number,
    monthlyDeposit: number,
    months: number,
    baseReturnRate: number = 0.13
  ): SimulationResult {
    const scenarios = {
      pessimista: this.calculateScenario(
        initialAmount,
        monthlyDeposit,
        months,
        baseReturnRate * 0.6,
        0.15
      ),
      conservador: this.calculateScenario(
        initialAmount,
        monthlyDeposit,
        months,
        baseReturnRate * 0.8,
        0.10
      ),
      realista: this.calculateScenario(
        initialAmount,
        monthlyDeposit,
        months,
        baseReturnRate,
        0.12
      ),
      otimista: this.calculateScenario(
        initialAmount,
        monthlyDeposit,
        months,
        baseReturnRate * 1.3,
        0.20
      ),
    };

    const monthLabels: string[] = [];
    for (let i = 0; i <= months; i++) {
      monthLabels.push(`Mês ${i}`);
    }

    return {
      scenarios,
      months: monthLabels,
    };
  }

  private static calculateScenario(
    initial: number,
    monthly: number,
    months: number,
    annualRate: number,
    volatility: number
  ): number[] {
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const values: number[] = [initial];
    let balance = initial;

    for (let i = 1; i <= months; i++) {
      // Adiciona depósito mensal
      balance += monthly;

      // Aplica rendimento com volatilidade
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const effectiveRate = monthlyRate * randomFactor;
      balance = balance * (1 + effectiveRate);

      values.push(Math.round(balance * 100) / 100);
    }

    return values;
  }

  static getPortfolioSuggestion(profile: InvestorProfile): PortfolioSuggestion {
    switch (profile) {
      case "conservador":
        return {
          name: "Portfólio Conservador",
          allocation: [
            { asset: "Tesouro Selic", percentage: 60, expectedReturn: 11.5 },
            { asset: "CDB", percentage: 25, expectedReturn: 12.0 },
            { asset: "Fundos DI", percentage: 15, expectedReturn: 10.8 },
          ],
          expectedReturn: 11.4,
          risk: "baixo",
        };

      case "moderado":
        return {
          name: "Portfólio Moderado",
          allocation: [
            { asset: "Tesouro IPCA+", percentage: 40, expectedReturn: 13.0 },
            { asset: "Ações", percentage: 30, expectedReturn: 15.0 },
            { asset: "Fundos Multimercado", percentage: 20, expectedReturn: 14.0 },
            { asset: "FIIs", percentage: 10, expectedReturn: 12.5 },
          ],
          expectedReturn: 13.8,
          risk: "médio",
        };

      case "agressivo":
        return {
          name: "Portfólio Agressivo",
          allocation: [
            { asset: "Ações Brasileiras", percentage: 40, expectedReturn: 16.0 },
            { asset: "Ações Internacionais", percentage: 25, expectedReturn: 18.0 },
            { asset: "Criptomoedas", percentage: 15, expectedReturn: 25.0 },
            { asset: "FIIs", percentage: 10, expectedReturn: 12.5 },
            { asset: "Tesouro IPCA+", percentage: 10, expectedReturn: 13.0 },
          ],
          expectedReturn: 17.2,
          risk: "alto",
        };
    }
  }

  static calculateInvestorProfile(answers: {
    idade: number;
    objetivo: string;
    prazo: string;
    volatilidade: string;
    experiencia: string;
  }): InvestorProfile {
    let score = 0;

    // Idade (quanto mais jovem, mais agressivo)
    if (answers.idade < 30) score += 3;
    else if (answers.idade < 50) score += 2;
    else score += 1;

    // Objetivo
    if (answers.objetivo === "crescimento") score += 3;
    else if (answers.objetivo === "equilibrio") score += 2;
    else score += 1;

    // Prazo
    if (answers.prazo === "longo") score += 3;
    else if (answers.prazo === "medio") score += 2;
    else score += 1;

    // Tolerância à volatilidade
    if (answers.volatilidade === "alta") score += 3;
    else if (answers.volatilidade === "media") score += 2;
    else score += 1;

    // Experiência
    if (answers.experiencia === "experiente") score += 3;
    else if (answers.experiencia === "intermediario") score += 2;
    else score += 1;

    // Total: 5-15 pontos
    if (score <= 7) return "conservador";
    if (score <= 11) return "moderado";
    return "agressivo";
  }
}