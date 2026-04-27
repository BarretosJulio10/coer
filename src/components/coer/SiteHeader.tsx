import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";

const navItems = [
  { to: "/#comites", label: "Comitês" },
  { to: "/#candidatura", label: "Candidatar-se" },
  { to: "/admin", label: "Secretaria" },
];

export const SiteHeader = () => {
  return (
    <header className="border-b border-hairline bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70 sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-4 group">
          <Logo variant="compact" />
          <div className="hidden md:flex flex-col leading-tight border-l border-hairline pl-4">
            <span className="font-serif text-[1.05rem] font-semibold text-ink tracking-tight">
              COER
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft max-w-[28ch]">
              Associação Nacional de Cooperação em Rastreamento
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
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
      </div>
    </header>
  );
};