"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Coins, TrendingUp, Heart, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, type Variants, type TargetAndTransition } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Floating animation for decorative elements
const floatingAnimation: TargetAndTransition = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Particle component for background
const Particle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-primary/30 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100],
      x: [0, Math.random() * 100 - 50]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
    style={{
      left: `${Math.random() * 100}%`,
      bottom: 0
    }}
  />
);

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 150, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl"
          animate={{
            x: [0, -120, 0],
            y: [0, -80, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-[450px] h-[450px] bg-secondary/15 rounded-full blur-3xl"
          animate={{
            x: [-80, 80, -80],
            y: [-60, 60, -60],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-success/15 rounded-full blur-3xl"
          animate={{
            x: [60, -60, 60],
            y: [40, -40, 40],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Animated particles */}
        {[...Array(15)].map((_, i) => (
          <Particle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        
        {/* Floating sparkles */}
        <motion.div
          className="absolute top-20 left-10 text-primary"
          animate={floatingAnimation}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-accent"
          animate={{
            y: [0, 25, 0],
            rotate: [0, 180, 360],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        
        <motion.div 
          className="container mx-auto px-4 py-20 relative z-10"
          style={{ y: y1 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                duration: 0.8 
              }}
            >
              <motion.div 
                className="w-40 h-40 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-primary shadow-2xl relative"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.5)"
                }}
                animate={{
                  boxShadow: [
                    "0 20px 25px -5px rgba(16, 185, 129, 0.3)",
                    "0 25px 50px -12px rgba(16, 185, 129, 0.5)",
                    "0 20px 25px -5px rgba(16, 185, 129, 0.3)"
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Image
                  src="/cashview-logo.png"
                  alt="CashView"
                  width={160}
                  height={160}
                  priority
                />
                {/* Rotating ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.span 
                className="text-gradient-primary inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                style={{
                  backgroundSize: "200% auto"
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                CashView
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Transforme suas economias em conquistas. Economize, invista e faça o bem.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Link href="/register">
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glowing effect */}
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-lg blur-xl opacity-50 group-hover:opacity-75"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.75, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <Button variant="primary" size="lg" className="w-full sm:w-auto relative overflow-hidden">
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: [-200, 200]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="relative flex items-center gap-2">
                      Começar Agora
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Já tenho conta
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 px-4 relative z-10"
        style={{ y: y2 }}
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-block mb-4"
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Por que escolher o CashView?
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Coins,
                title: "Ganhe Milhas",
                description: "Cada real economizado vira milhas. Sistema antifraude garante recompensas justas.",
                color: "primary",
                gradient: "from-primary/20 to-primary/5"
              },
              {
                icon: TrendingUp,
                title: "Invista Inteligente",
                description: "Simulações personalizadas baseadas no seu perfil de investidor.",
                color: "accent",
                gradient: "from-accent/20 to-accent/5"
              },
              {
                icon: Heart,
                title: "Doe com Propósito",
                description: "Converta milhas em doações para ONGs e contribua para um mundo melhor.",
                color: "secondary",
                gradient: "from-secondary/20 to-secondary/5"
              },
              {
                icon: Trophy,
                title: "Conquiste Objetivos",
                description: "Desbloqueie conquistas, compita com amigos e alcance suas metas.",
                color: "success",
                gradient: "from-success/20 to-success/5"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  rotateY: 5,
                  rotateX: 5
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className={`card p-6 text-center h-full relative overflow-hidden bg-gradient-to-br ${feature.gradient}`}
                  whileHover={{
                    boxShadow: `0 25px 50px -12px rgba(16, 185, 129, 0.25)`
                  }}
                >
                  {/* Animated border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, var(--color-${feature.color})/20 50%, transparent 70%)`,
                      backgroundSize: "200% 200%"
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <motion.div 
                    className={`w-16 h-16 bg-${feature.color}/20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10`}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.2
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground relative z-10">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10 overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
          }}
          style={{
            backgroundSize: "200% 200%"
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="container mx-auto text-center relative">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Pronto para começar sua jornada financeira?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Junte-se a milhares de usuários que já estão economizando e investindo de forma inteligente.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/register">
              <motion.div
                className="inline-block relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Pulsing glow effect */}
                <motion.div
                  className="absolute inset-0 bg-primary rounded-lg blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <Button variant="primary" size="lg" className="relative">
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: [-300, 300]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative">Criar Conta Grátis</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="py-8 px-4 border-t border-border relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto text-center text-muted-foreground">
          <motion.p
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            &copy; 2024 CashView. Todos os direitos reservados.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}