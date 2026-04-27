import logo from "@/assets/coer-logo.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "compact";
}

export const Logo = ({ className = "", variant = "default" }: LogoProps) => {
  const size = variant === "compact" ? "h-10" : "h-14";
  return (
    <img
      src={logo}
      alt="COER — Associação Nacional de Cooperação em Rastreamento, Monitoramento, Pronta Resposta e Gerenciamento de Riscos"
      className={`${size} w-auto select-none ${className}`}
      draggable={false}
    />
  );
};