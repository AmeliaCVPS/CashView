// Sistema de cálculo de milhas com antifraude

interface UserProfile {
  userId: string;
  accountAge: number; // dias
  consistencyScore: number; // 0-100
  dailyDesistCount: number;
  weeklyDesistCount: number;
  lastSavingDate: Date | null;
  hasBankIntegration: boolean;
}

interface SaveEvent {
  amount: number;
  timestamp: Date;
  userId: string;
}

export class MilesCalculator {
  private static readonly BASE_RATE = 0.5; // 1 real = 0.5 milhas base
  private static readonly NEW_USER_MULTIPLIER = 0.5;
  private static readonly CONSISTENT_USER_MULTIPLIER = 1.5;
  private static readonly BANK_INTEGRATION_BONUS = 1.2;
  private static readonly DAILY_DESIST_LIMIT = 3;
  private static readonly WEEKLY_DESIST_LIMIT = 10;
  private static readonly RELEASE_DELAY_HOURS = 24;

  static calculateMiles(amount: number, profile: UserProfile): number {
    let miles = amount * this.BASE_RATE;

    // Novo usuário (menos de 30 dias)
    if (profile.accountAge < 30) {
      miles *= this.NEW_USER_MULTIPLIER;
    }

    // Usuário consistente (score > 70)
    if (profile.consistencyScore > 70) {
      miles *= this.CONSISTENT_USER_MULTIPLIER;
    }

    // Bonus integração bancária
    if (profile.hasBankIntegration) {
      miles *= this.BANK_INTEGRATION_BONUS;
    }

    return Math.floor(miles);
  }

  static canEarnMiles(profile: UserProfile): {
    allowed: boolean;
    reason?: string;
  } {
    // Limite diário de desistências
    if (profile.dailyDesistCount >= this.DAILY_DESIST_LIMIT) {
      return {
        allowed: false,
        reason: "Limite diário de desistências atingido",
      };
    }

    // Limite semanal de desistências
    if (profile.weeklyDesistCount >= this.WEEKLY_DESIST_LIMIT) {
      return {
        allowed: false,
        reason: "Limite semanal de desistências atingido",
      };
    }

    return { allowed: true };
  }

  static getMilesReleaseTime(saveDate: Date): Date {
    const releaseTime = new Date(saveDate);
    releaseTime.setHours(releaseTime.getHours() + this.RELEASE_DELAY_HOURS);
    return releaseTime;
  }

  static areMilesReleased(saveDate: Date): boolean {
    const now = new Date();
    const releaseTime = this.getMilesReleaseTime(saveDate);
    return now >= releaseTime;
  }

  // Detecta gasto logo após economia (fraude)
  static isSuspiciousSpending(
    saveDate: Date,
    spendDate: Date,
    saveAmount: number,
    spendAmount: number
  ): boolean {
    const hoursDiff =
      (spendDate.getTime() - saveDate.getTime()) / (1000 * 60 * 60);

    // Se gastou mais de 70% do valor economizado em menos de 48h
    if (hoursDiff < 48 && spendAmount > saveAmount * 0.7) {
      return true;
    }

    return false;
  }

  static calculateConsistencyScore(
    totalSavings: number,
    totalDesists: number,
    accountAge: number
  ): number {
    if (totalSavings === 0) return 0;

    const desistRate = totalDesists / totalSavings;
    const ageBonus = Math.min(accountAge / 365, 1) * 20; // até 20 pontos por idade

    let score = 100 - desistRate * 100;
    score += ageBonus;

    return Math.max(0, Math.min(100, score));
  }
}
