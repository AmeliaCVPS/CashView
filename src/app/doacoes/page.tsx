"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Heart, Target, ExternalLink } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface NGO {
  id: number;
  name: string;
  logoUrl: string;
  description: string;
  minMiles: number;
  ods: string;
  website?: string;
  active: boolean;
}

const ODS_COLORS: Record<number, string> = {
  1: "#E5243B",
  2: "#DDA63A",
  3: "#4C9F38",
  4: "#C5192D",
  5: "#FF3A21",
  6: "#26BDE2",
  7: "#FCC30B",
  8: "#A21942",
  9: "#FD6925",
  10: "#DD1367",
  11: "#FD9D24",
  12: "#BF8B2E",
  13: "#3F7E44",
  14: "#0A97D9",
  15: "#56C02B",
  16: "#00689D",
  17: "#19486A",
};

const NGO_WEBSITES: Record<string, string> = {
  "Instituto Ayrton Senna": "https://institutoayrtonsenna.org.br",
  "Ação da Cidadania": "https://www.acaodacidadania.org.br",
  "Geração Empreendedora": "https://www.cejesc.org.br/projetos/GERA%C3%87%C3%83O%20EMPREENDEDORA",
  "Observatório do Clima": "https://oc.eco.br",
  "Pastoral da Criança": "https://pastoraldacrianca.org.br",
};

export default function DoacoesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [availableMiles, setAvailableMiles] = useState(0);
  const [donationAmounts, setDonationAmounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [loadingNgos, setLoadingNgos] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserMiles();
      fetchNgos();
    }
  }, [session]);

  const fetchNgos = async () => {
    try {
      setLoadingNgos(true);
      const response = await fetch("/api/ngos");

      if (response.ok) {
        const data = await response.json();
        setNgos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar ONGs:", error);
      toast.error("Erro ao carregar ONGs");
    } finally {
      setLoadingNgos(false);
    }
  };

  const fetchUserMiles = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/miles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableMiles(data.totalMiles || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar milhas:", error);
    }
  };

  const handleDonate = async (ngo: NGO) => {
    const amount = donationAmounts[ngo.id] || ngo.minMiles;

    if (amount < ngo.minMiles) {
      toast.error(`Doação mínima: ${ngo.minMiles} milhas`);
      return;
    }

    if (amount > availableMiles) {
      toast.error("Milhas insuficientes");
      return;
    }

    setLoading({ ...loading, [ngo.id]: true });

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          ngoId: ngo.id,
          milesAmount: amount,
          investmentValue: 0,
        }),
      });

      if (response.ok) {
        toast.success(`${amount} milhas doadas para ${ngo.name}!`);
        await fetchUserMiles();
        
        // Verificar conquistas após doação
        try {
          await fetch("/api/achievements/check", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Erro ao verificar conquistas:", error);
        }
        
        setDonationAmounts({ ...donationAmounts, [ngo.id]: ngo.minMiles });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao processar doação");
      }
    } catch (error) {
      console.error("Erro ao doar:", error);
      toast.error("Erro ao processar doação");
    } finally {
      setLoading({ ...loading, [ngo.id]: false });
    }
  };

  const handleVisitWebsite = (ngoName: string) => {
    const url = NGO_WEBSITES[ngoName];
    if (!url) return;
    
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const parseOds = (odsString: string): number[] => {
    return odsString.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
  };

  if (isPending || loadingNgos) {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Doações</h1>
            <p className="text-muted-foreground">Converta suas milhas em doações para ONGs parceiras</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <Image 
                src="/cashview-logo.png" 
                alt="CashView" 
                width={64} 
                height={64} 
                priority
              />
            </div>
          </div>
        </div>

        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Milhas Disponíveis</p>
                <p className="text-4xl font-bold text-foreground">{availableMiles.toLocaleString()}</p>
              </div>
              <Heart className="w-12 h-12 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-accent/10 to-primary/10">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Objetivos de Desenvolvimento Sustentável (ODS)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Todas as ONGs parceiras estão alinhadas com os ODS da ONU, contribuindo para um mundo mais justo e sustentável.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ngos.map((ngo) => {
            const odsArray = parseOds(ngo.ods);
            
            return (
              <Card key={ngo.id}>
                <CardHeader>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={ngo.logoUrl}
                        alt={ngo.name}
                        width={80}
                        height={80}
                        className={ngo.name === "Geração Empreendedora" ? "object-contain w-3/4 h-3/4" : "object-cover w-full h-full"}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{ngo.name}</CardTitle>
                      {NGO_WEBSITES[ngo.name] && (
                        <button onClick={() => handleVisitWebsite(ngo.name)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                          Visitar site
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {odsArray.map((ods) => (
                      <span key={ods} className="text-xs px-3 py-1.5 rounded font-semibold text-white" style={{ backgroundColor: ODS_COLORS[ods] }}>
                        ODS {ods}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{ngo.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>Mínimo: {ngo.minMiles} milhas</span>
                  </div>
                  <Input
                    type="number"
                    label="Quantidade de milhas"
                    value={donationAmounts[ngo.id] || ngo.minMiles}
                    onChange={(e) => setDonationAmounts({ ...donationAmounts, [ngo.id]: Number(e.target.value) })}
                    min={ngo.minMiles}
                    step={10}
                  />
                  <Button variant="primary" className="w-full" onClick={() => handleDonate(ngo)} disabled={loading[ngo.id] || availableMiles < ngo.minMiles}>
                    {loading[ngo.id] ? "Processando..." : "Doar Milhas"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-primary/10">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Sobre as Doações</h3>
                <p className="text-sm text-muted-foreground">
                  Ao doar milhas, você está contribuindo diretamente para projetos sociais e ambientais importantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}