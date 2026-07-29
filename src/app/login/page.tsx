"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: "/dashboard",
      });

      if (error) {
        // Credencial errada e o caso comum e tem texto proprio; qualquer outra falha
        // mostra a causa real, senao fica impossivel distinguir "senha errada" de
        // "o servidor caiu".
        const credencialInvalida =
          error.code === "INVALID_EMAIL_OR_PASSWORD" || error.status === 401;
        const detalhe = [error.message, error.code].filter(Boolean).join(" — ");
        toast.error(
          credencialInvalida
            ? "Email ou senha inválidos. Verifique se você já criou uma conta e tente novamente."
            : `Erro ao fazer login: ${detalhe || "falha inesperada"}`
        );
        setLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      const detalhe = error instanceof Error ? error.message : String(error);
      toast.error(`Erro ao fazer login: ${detalhe}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-primary"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
            >
              <Image
                src="/cashview-logo.png"
                alt="CashView"
                width={128}
                height={128}
                priority
              />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            CashView
          </h1>
          <p className="text-muted-foreground">
            Entre na sua conta para continuar
          </p>
        </motion.div>

        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              autoComplete="off"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
                className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-ring"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-foreground"
              >
                Lembrar de mim
              </label>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}