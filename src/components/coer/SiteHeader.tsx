import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";

const navItems = [
  { to: "/#comites", label: "Comitês" },
  { to: "/#candidatura", label: "Candidatar-se" },
  { to: "/admin", label: "Secretaria" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu ao navegar
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Bloqueia scroll do body quando menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="border-b border-hairline bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70 sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group min-w-0">
          <Logo variant="compact" />
          <div className="hidden sm:flex flex-col leading-tight border-l border-hairline pl-3 sm:pl-4 min-w-0">
            <span className="font-serif text-[0.95rem] sm:text-[1.05rem] font-semibold text-ink tracking-tight">
              COER
            </span>
            <span className="hidden md:block text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft max-w-[28ch] truncate">
              Associação Nacional de Cooperação em Rastreamento
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft hover:text-ink transition-colors relative group"
            >
              {item.label}
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </NavLink>
          ))}
        </nav>

        {/* Botão menu mobile */}
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-hairline text-ink"
        >
          <span className="sr-only">Menu</span>
          <div className="relative w-5 h-4">
            <span
              className={`absolute left-0 right-0 top-0 h-px bg-current transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-current transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 right-0 bottom-0 h-px bg-current transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-hairline bg-paper">
          <nav className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 border-b border-hairline last:border-b-0 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink hover:text-gold-deep transition-colors"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};