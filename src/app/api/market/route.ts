import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Popular US stocks (Finnhub free tier supports US markets)
const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
];

// Popular Brazilian stocks (B3)
const BRAZILIAN_STOCKS = [
  { symbol: 'PETR4', name: 'Petrobras PN' },
  { symbol: 'VALE3', name: 'Vale ON' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
  { symbol: 'BBDC4', name: 'Bradesco PN' },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON' },
  { symbol: 'ABEV3', name: 'Ambev ON' },
  { symbol: 'WEGE3', name: 'WEG ON' },
  { symbol: 'BBAS3', name: 'Banco do Brasil ON' }
];

// Popular cryptocurrencies (CoinGecko IDs)
const DEFAULT_CRYPTOS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' }
];

async function fetchStockQuote(symbol: string, name: string) {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      console.error(`Finnhub error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Finnhub returns: { c, h, l, o, pc, t } where c=current, h=high, l=low, o=open, pc=previous close, t=timestamp
    if (!data.c || data.c === 0) {
      return null;
    }

    const changePercent = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;

    return {
      symbol,
      name,
      type: 'stock' as const,
      currentPrice: data.c,
      change24h: changePercent,
      high24h: data.h || data.c,
      low24h: data.l || data.c,
      volume: 0,
      marketCap: 0,
      updatedAt: data.t ? data.t * 1000 : Date.now()
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

async function fetchBrazilianStocks() {
  const results: any[] = [];
  
  // Try brapi.dev first (4 free stocks: PETR4, VALE3, MGLU3, ITUB4)
  try {
    const brapiSymbols = ['PETR4', 'VALE3', 'MGLU3', 'ITUB4'];
    const url = `https://brapi.dev/api/quote/${brapiSymbols.join(',')}`;
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (response.ok) {
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((stock: any) => {
          if (stock.regularMarketPrice) {
            const stockInfo = BRAZILIAN_STOCKS.find(s => s.symbol === stock.symbol);
            const changePercent = stock.regularMarketChangePercent || 0;
            
            results.push({
              symbol: stock.symbol,
              name: stockInfo?.name || stock.shortName || stock.longName,
              type: 'br_stock' as const,
              currentPrice: stock.regularMarketPrice,
              change24h: changePercent,
              high24h: stock.regularMarketDayHigh || stock.regularMarketPrice,
              low24h: stock.regularMarketDayLow || stock.regularMarketPrice,
              volume: stock.regularMarketVolume || 0,
              marketCap: stock.marketCap || 0,
              updatedAt: Date.now()
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching from brapi.dev:', error);
  }

  // Fetch remaining stocks from Yahoo Finance (with .SA suffix)
  const remainingStocks = BRAZILIAN_STOCKS.filter(
    stock => !results.find(r => r.symbol === stock.symbol)
  );

  for (const stock of remainingStocks) {
    try {
      const yahooSymbol = `${stock.symbol}.SA`;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
      const response = await fetch(url, { 
        next: { revalidate: 60 },
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.ok) {
        const data = await response.json();
        const quote = data?.chart?.result?.[0];
        
        if (quote?.meta) {
          const currentPrice = quote.meta.regularMarketPrice;
          const previousClose = quote.meta.chartPreviousClose || quote.meta.previousClose;
          const changePercent = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
          
          results.push({
            symbol: stock.symbol,
            name: stock.name,
            type: 'br_stock' as const,
            currentPrice: currentPrice,
            change24h: changePercent,
            high24h: quote.meta.regularMarketDayHigh || currentPrice,
            low24h: quote.meta.regularMarketDayLow || currentPrice,
            volume: quote.meta.regularMarketVolume || 0,
            marketCap: 0,
            updatedAt: Date.now()
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching ${stock.symbol} from Yahoo:`, error);
    }
  }

  return results;
}

async function fetchCryptoPrices() {
  try {
    const ids = DEFAULT_CRYPTOS.map(c => c.id).join(',');
    const url = COINGECKO_API_KEY
      ? `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&x_cg_demo_api_key=${COINGECKO_API_KEY}`
      : `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

    const response = await fetch(url, { next: { revalidate: 30 } });

    if (!response.ok) {
      console.error(`CoinGecko error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    return DEFAULT_CRYPTOS.map(crypto => {
      const priceData = data[crypto.id];
      
      if (!priceData || !priceData.usd) {
        return null;
      }

      // Convert USD to BRL (approximate rate: 5.0)
      const usdToBrl = 5.0;

      return {
        symbol: crypto.symbol,
        name: crypto.name,
        type: 'crypto' as const,
        currentPrice: priceData.usd * usdToBrl,
        change24h: priceData.usd_24h_change || 0,
        high24h: priceData.usd * usdToBrl * 1.02,
        low24h: priceData.usd * usdToBrl * 0.98,
        volume: priceData.usd_24h_vol || 0,
        marketCap: priceData.usd_market_cap || 0,
        updatedAt: Date.now()
      };
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const symbol = searchParams.get('symbol');

    if (!FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: 'API de mercado não configurada. Configure FINNHUB_API_KEY.', code: 'MISSING_API_KEY' },
        { status: 500 }
      );
    }

    // Single asset request (not implemented for now)
    if (symbol) {
      return NextResponse.json(
        { error: 'Single asset lookup not implemented', code: 'NOT_IMPLEMENTED' },
        { status: 501 }
      );
    }

    let assets: any[] = [];

    // Fetch US stocks
    if (type === 'all' || type === 'stock') {
      const stockPromises = DEFAULT_STOCKS.map(stock => 
        fetchStockQuote(stock.symbol, stock.name)
      );
      const stockResults = await Promise.all(stockPromises);
      assets.push(...stockResults.filter(Boolean));
    }

    // Fetch Brazilian stocks
    if (type === 'all' || type === 'br_stock') {
      const brazilianResults = await fetchBrazilianStocks();
      assets.push(...brazilianResults);
    }

    // Fetch cryptocurrencies
    if (type === 'all' || type === 'crypto') {
      const cryptoResults = await fetchCryptoPrices();
      assets.push(...cryptoResults);
    }

    return NextResponse.json(
      { assets },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      }
    );
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}