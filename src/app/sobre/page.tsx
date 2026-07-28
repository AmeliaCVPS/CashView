"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Image from "next/image";
import { Mail, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  {
    name: "Marcos Pires Cardoso",
    role: "Co-fundador & CEO",
    email: "marcos@cashview.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Daniel Oliveira Gomes",
    role: "Co-fundador & CTO",
    email: "daniel@cashview.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Thiago Nascimento",
    role: "Head de Produto",
    email: "thiago@cashview.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Edson Oliveira",
    role: "Head de Design",
    email: "edson@cashview.com",
    linkedin: "https://linkedin.com",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function SobrePage() {
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
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white border-4 border-primary">
              <Image
                src="/cashview-logo.png"
                alt="CashView"
                width={96}
                height={96}
                priority
              />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            variants={fadeInUp}
          >
            <span className="text-gradient-primary">Sobre o CashView</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Uma plataforma inovadora que transforma a forma como você economiza, investe e faz o bem.
          </motion.p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Nossa Missão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                O CashView nasceu com o propósito de democratizar a educação financeira e tornar
                a economia de dinheiro uma experiência gamificada e recompensadora. Acreditamos
                que todos merecem ter controle sobre suas finanças e a oportunidade de contribuir
                para um mundo melhor através de doações para ONGs parceiras.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <div className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8 text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Como Funciona
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">1. Economize</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Registre suas economias e ganhe milhas proporcionais. Nosso sistema
                    antifraude garante que as recompensas sejam justas e motivadoras.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">2. Invista</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Simule investimentos com base no seu perfil de investidor. Veja cenários
                    realistas de como seu dinheiro pode crescer ao longo do tempo.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">3. Doe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Converta suas milhas em doações para ONGs parceiras alinhadas com os
                    Objetivos de Desenvolvimento Sustentável da ONU.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Team Photo */}
        <div className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8 text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Nosso Time
          </motion.h2>
          
          {/* Team Group Photo - FIXED: object-position to show faces properly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-[2/1] overflow-hidden">
                  <Image
                    src="/team-photo.jpg"
                    alt="Equipe CashView"
                    fill
                    className="object-cover object-top"
                    style={{ objectPosition: '50% 20%' }}
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members Info */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {TEAM.map((member, index) => (
              <motion.div 
                key={member.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
                      <div className="flex items-center justify-center gap-3">
                        <motion.a
                          href={`mailto:${member.email}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Mail className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Nossos Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="font-semibold text-foreground mb-2">Transparência</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as simulações e cálculos são feitos de forma transparente,
                    sem taxas ocultas ou pegadinhas.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="font-semibold text-foreground mb-2">Gamificação</h4>
                  <p className="text-sm text-muted-foreground">
                    Acreditamos que economizar pode ser divertido. Por isso, criamos
                    um sistema de recompensas e conquistas.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="font-semibold text-foreground mb-2">Impacto Social</h4>
                  <p className="text-sm text-muted-foreground">
                    Conectamos usuários com ONGs sérias e comprometidas com os ODS da ONU.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="font-semibold text-foreground mb-2">Educação Financeira</h4>
                  <p className="text-sm text-muted-foreground">
                    Fornecemos ferramentas e simulações para ajudar na tomada de decisões
                    financeiras informadas.
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Entre em Contato
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Tem alguma dúvida ou sugestão? Adoraríamos ouvir você!
              </p>
              <motion.a
                href="mailto:contato@cashview.com"
                className="inline-block px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                contato@cashview.com
              </motion.a>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}