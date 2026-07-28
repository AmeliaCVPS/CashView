"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "./Button";
import { Menu, X, LogOut, Coins } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Logout realizado com sucesso");
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Início" },
    { href: "/transacoes", label: "Transações" },
    { href: "/fundo", label: "Fundo" },
    { href: "/mercado", label: "Mercado" },
    { href: "/simulador", label: "Simulador" },
    { href: "/doacoes", label: "Doações" },
    { href: "/conquistas", label: "Conquistas" },
    { href: "/amigos", label: "Amigos" },
    { href: "/sobre", label: "Sobre" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-primary">
              <Image
                src="/cashview-logo.png"
                alt="CashView"
                width={40}
                height={40}
                priority
              />
            </div>
            <span className="text-xl font-bold text-gradient-primary">CashView</span>
          </Link>

          {/* Desktop Navigation */}
          {session && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            {isPending ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <>
                <Link href="/perfil">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {session.user.name}
                    </span>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {session && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-foreground mb-2">{session.user.name}</p>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                    Sair
                  </Button>
                </div>
              </>
            )}
            {!session && !isPending && (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};