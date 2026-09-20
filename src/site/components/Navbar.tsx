import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import clinexusLogoWhite from "@/assets/site/clinexus-logo-white.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Industries", to: "/industries" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const isDark = (pathname: string) =>
  [
"/",
"/about",
"/contact",
"/industries",
"/privacy",
"/terms",
"/industries/eye-clinics",
"/industries/eye-clinics/features",
  ].includes(pathname);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const darkHero = isDark(location.pathname) && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-xl"
          : darkHero
          ? "border-b border-white/10 bg-transparent"
          : "border-b border-border/40 bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={clinexusLogoWhite}
            alt="Clinexus"
            className="h-8 transition-all duration-300"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center md:flex">
          <div className="flex items-center rounded-sm border border-border/50 bg-background/60 px-1 py-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-sm px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? darkHero
                      ? "bg-white/15 text-white shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : darkHero
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <a href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-sm text-sm font-medium ${
                darkHero ? "text-white/80 hover:text-white hover:bg-white/10" : ""
              }`}
            >
              Log In
            </Button>
          </a>
          <a href="https://wa.me/2349017758165" target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="gap-1.5 rounded-sm bg-primary px-5 text-white shadow-sm hover:opacity-90"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button
              className={`rounded-xl p-2 transition-colors ${
                darkHero ? "text-white hover:bg-white/10" : "hover:bg-muted"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center border-b border-border px-6 py-4">
                <Link to="/" onClick={() => setOpen(false)}>
                  <img src={clinexusLogoWhite} alt="Clinexus" className="h-8" />
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        location.pathname === link.to
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-border px-4 py-4">
                <div className="flex flex-col gap-2">
                  <a href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-md">Log In</Button>
                  </a>
                  <a href="https://wa.me/2349017758165" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <Button className="w-full gap-2 rounded-md bg-primary text-white hover:opacity-90">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
