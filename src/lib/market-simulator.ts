// Simulador de mercado 100% local

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: "stock" | "crypto";
  currentPrice: number;
  change24h: number;
  marketCap: number;
  volume: number;
  history: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export class MarketSimulator {
  private static assets: Map<string, Asset> = new Map();
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;

    // Ações brasileiras
    this.createAsset("PETR4", "Petrobras PN", "stock", 38.50);
    this.createAsset("VALE3", "Vale ON", "stock", 62.80);
    this.createAsset("ITUB4", "Itaú Unibanco PN", "stock", 25.30);
    this.createAsset("BBDC4", "Bradesco PN", "stock", 13.45);
    this.createAsset("ABEV3", "Ambev ON", "stock", 11.20);
    this.createAsset("WEGE3", "WEG ON", "stock", 42.10);
    this.createAsset("RENT3", "Localiza ON", "stock", 58.90);
    this.createAsset("MGLU3", "Magazine Luiza ON", "stock", 3.25);
    this.createAsset("HAPV3", "Hapvida ON", "stock", 4.80);
    this.createAsset("VIVT3", "Vivo ON", "stock", 41.20);

    // Criptomoedas
    this.createAsset("BTC", "Bitcoin", "crypto", 245000);
    this.createAsset("ETH", "Ethereum", "crypto", 13500);
    this.createAsset("BNB", "Binance Coin", "crypto", 1850);
    this.createAsset("SOL", "Solana", "crypto", 680);
    this.createAsset("XRP", "Ripple", "crypto", 3.20);
    this.createAsset("ADA", "Cardano", "crypto", 2.45);
    this.createAsset("DOGE", "Dogecoin", "crypto", 0.85);
    this.createAsset("MATIC", "Polygon", "crypto", 4.50);

    this.initialized = true;
  }

  private static createAsset(
    symbol: string,
    name: string,
    type: "stock" | "crypto",
    basePrice: number
  ) {
    const change24h = (Math.random() - 0.5) * 10; // -5% a +5%
    const currentPrice = basePrice * (1 + change24h / 100);
    const marketCap = basePrice * Math.random() * 1000000000;
    const volume = Math.random() * 100000000;

    const history = this.generateHistory(basePrice, 30);

    this.assets.set(symbol, {
      id: symbol,
      symbol,
      name,
      type,
      currentPrice,
      change24h,
      marketCap,
      volume,
      history,
    });
  }

  private static generateHistory(
    basePrice: number,
    days: number
  ): PricePoint[] {
    const history: PricePoint[] = [];
    let price = basePrice;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Variação aleatória
      const change = (Math.random() - 0.5) * 0.05; // -2.5% a +2.5%
      price = price * (1 + change);

      history.push({
        timestamp: date,
        price,
        volume: Math.random() * 100000000,
      });
    }

    return history;
  }

  static getAllAssets(): Asset[] {
    this.initialize();
    return Array.from(this.assets.values());
  }

  static getAsset(symbol: string): Asset | undefined {
    this.initialize();
    return this.assets.get(symbol);
  }

  static searchAssets(query: string): Asset[] {
    this.initialize();
    const lowerQuery = query.toLowerCase();
    return Array.from(this.assets.values()).filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(lowerQuery) ||
        asset.name.toLowerCase().includes(lowerQuery)
    );
  }

  static getAssetsByType(type: "stock" | "crypto"): Asset[] {
    this.initialize();
    return Array.from(this.assets.values()).filter(
      (asset) => asset.type === type
    );
  }

  // Atualiza preços (simula mercado em tempo real)
  static updatePrices() {
    this.assets.forEach((asset) => {
      const change = (Math.random() - 0.5) * 0.02; // -1% a +1%
      asset.currentPrice = asset.currentPrice * (1 + change);
      asset.change24h = (asset.currentPrice / asset.history[asset.history.length - 1].price - 1) * 100;

      // Adiciona novo ponto ao histórico
      asset.history.push({
        timestamp: new Date(),
        price: asset.currentPrice,
        volume: Math.random() * 100000000,
      });

      // Mantém apenas últimos 30 dias
      if (asset.history.length > 30) {
        asset.history.shift();
      }
    });
  }
}
