import React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Icon } from "@iconify/react";
import "./landing.css";

const openCloud = () => {
  window.location.assign("https://cloudnimbus.in");
};

// ══════════════════════════════════════════════════════
// ADVANCED INTERACTIVE COMPONENTS
// ══════════════════════════════════════════════════════

// ─── Spotlight Cursor Effect ───
const CursorSpotlight = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="landing-spotlight-layer" aria-hidden="true">
      <div
        className="landing-spotlight"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />
    </div>
  );
};

// ─── 3D Tilt Card ───
const TiltCard = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`landing-tilt-card ${className}`}
    >
      <div className="landing-tilt-card-inner">
        <div className="landing-beam-effect" style={{ "--beam-delay": `${delay}s` }} />
        <div className="landing-tilt-card-content" style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Particle Field Background ───
const ParticleField = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.5 ? "rgba(0, 212, 255," : "rgba(167, 139, 250,", // Cyan & Purple mix
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Mouse interaction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0 && dist < 150) {
          const force = (150 - dist) / 150;
          p.vx -= (dx / dist) * force * 0.1;
          p.vy -= (dy / dist) * force * 0.1;
        }

        // Return to base speed limits
        p.vx = p.vx * 0.95 + (Math.random() - 0.5) * 0.05;
        p.vy = p.vy * 0.95 + (Math.random() - 0.5) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        // Highlight particle if near mouse
        let currentOpacity = dist < 150 ? Math.min(1, p.opacity + 0.3) : p.opacity;
        ctx.fillStyle = `${p.color} ${currentOpacity})`;
        ctx.fill();

        // Lines between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (dist2 < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist2 / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    resize();
    createParticles();
    draw();
    const handleResize = () => {
      resize();
      createParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-particles-canvas" aria-hidden="true" />;
};

// ─── Shimmering Text ───
const ShimmerText = ({ children, className = "" }) => (
  <span className={`landing-shimmer-text ${className}`}>{children}</span>
);

// ─── Glowing Button ───
const GlowButton = ({ children, onClick, className = "", size = "lg" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`landing-glow-btn landing-glow-btn--${size} ${className}`}
    >
      <span className="landing-glow-btn__glow" />
      <span className="landing-glow-btn__content">
        {children}
        <motion.span
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ display: "inline-flex" }}
        >
          <Icon icon="lucide:arrow-right" width={size === "lg" ? 20 : 16} />
        </motion.span>
      </span>
    </motion.button>
  );
};

// ─── Animated Counter ───
const AnimatedNumber = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let animationId;
    const end = parseInt(value, 10);
    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease out
      setDisplay(Math.floor(eased * end));
      if (progress < 1) animationId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animationId);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

// ─── Retro Grid ───
const RetroGrid = () => (
  <div className="landing-retro-grid" aria-hidden="true">
    <div className="landing-retro-grid__inner" />
  </div>
);

// ─── Floating Element ───
const FloatingElement = ({ children, delay = 0, yOffset = 20, duration = 3, className = "" }) => {
  return (
    <motion.div
      animate={{ y: [0, -yOffset, 0] }}
      transition={{
        repeat: Infinity,
        duration: duration,
        delay: delay,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════
// SECTION COMPONENTS
// ══════════════════════════════════════════════════════

// ─── Navbar ───
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className={`landing-navbar ${scrolled ? "landing-navbar--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="landing-navbar__inner">
        <div className="landing-navbar__logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="landing-navbar__logo-icon">
            <Icon icon="fluent:cloud-flow-24-filled" width={22} />
          </div>
          <span className="landing-navbar__logo-text">Nimbus</span>
        </div>

        <div className="landing-navbar__links">
          {['Features', 'How It Works', 'Stats'].map((item) => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(/ /g, '-'))} className="landing-navbar__link group relative">
              {item}
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
            </button>
          ))}
        </div>

        <GlowButton size="sm" onClick={openCloud}>
          Access Cloud
        </GlowButton>
      </div>
    </motion.nav>
  );
};

// ─── Hero Section ───
const HeroSection = () => {
  return (
    <section className="landing-hero">
      <ParticleField />
      <RetroGrid />
      <div className="landing-hero__glow" />

      {/* Floating abstract elements */}
      <FloatingElement delay={0} yOffset={30} duration={6} className="absolute left-[10%] top-[20%] opacity-30 blur-sm mix-blend-screen pointer-events-none hidden md:block">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-transparent" />
      </FloatingElement>
      <FloatingElement delay={2} yOffset={40} duration={8} className="absolute right-[15%] top-[30%] opacity-20 blur-md mix-blend-screen pointer-events-none hidden md:block">
        <div className="w-48 h-48 rounded-full bg-gradient-to-bl from-purple-500 to-transparent" />
      </FloatingElement>

      <div className="landing-hero__content">
        <motion.div
          className="landing-hero__badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="landing-hero__badge-dot" />
          Powered by Telegram MTProto
        </motion.div>

        <motion.h1
          className="landing-hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <ShimmerText>Unlimited Cloud Storage</ShimmerText>
        </motion.h1>

        <motion.p
          className="landing-hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Your files. Your Telegram. Zero limits. TeleCloud Nimbus transforms
          your Telegram account into a blazing-fast, private cloud drive—free
          forever.
        </motion.p>

        <motion.div
          className="landing-hero__actions"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
        >
          <GlowButton onClick={openCloud}>
            Get Started — It's Free
          </GlowButton>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="landing-hero__secondary-btn"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Icon icon="lucide:sparkles" width={18} className="text-purple-400" />
            Explore Magic
          </motion.button>
        </motion.div>

        <motion.div
          className="landing-hero__trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          {['End-to-End Encrypted', 'Unlimited Storage', 'Lightning Fast'].map((text, i) => (
            <React.Fragment key={text}>
              <div className="landing-hero__trust-item group cursor-default">
                <Icon icon={i === 0 ? "lucide:shield-check" : i === 1 ? "lucide:infinity" : "lucide:zap"} width={16} className="text-cyan-400 group-hover:scale-125 transition-transform" />
                {text}
              </div>
              {i < 2 && <div className="landing-hero__trust-divider" />}
            </React.Fragment>
          ))}
        </motion.div>
      {/* Scroll Down Indicator */}
      <motion.button
        type="button"
        aria-label="Scroll to features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="landing-hero__scroll"
        onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Icon icon="lucide:chevron-down" width={20} />
        </motion.div>
      </motion.button>
      </div>
    </section>
  );
};

// ─── Features Bento Grid ───
const features = [
  { icon: "lucide:shield-check", title: "Secure MTProto Gateway", desc: "Your credentials never leave the server. All Telegram communication passes through a hardened gateway.", size: "large", color: "cyan" },
  { icon: "lucide:hard-drive", title: "Zero-Cost Storage", desc: "Telegram provides virtually unlimited storage with a beautiful interface.", size: "medium", color: "purple" },
  { icon: "lucide:eye-off", title: "End-to-End Privacy", desc: "No third-party servers ever touch your files. Data flows directly to Telegram.", size: "medium", color: "green" },
  { icon: "lucide:folder-tree", title: "Smart Organization", desc: "Folders, tags, starring, and instant search — organize naturally.", size: "medium", color: "amber" },
  { icon: "lucide:file-scan", title: "File Preview & OCR", desc: "Preview documents inline. Built-in OCR extracts text instantly.", size: "medium", color: "pink" },
  { icon: "lucide:smartphone", title: "Access Anywhere", desc: "Responsive design ensures your cloud drive looks flawless on any device.", size: "large", color: "blue" },
];

const colorMap = {
  cyan: "var(--landing-cyan)",
  purple: "#a78bfa",
  green: "#34d399",
  amber: "#fbbf24",
  pink: "#f472b6",
  blue: "#60a5fa",
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="landing-features" ref={ref}>
      <motion.div
        className="landing-section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="landing-section-label">Features</span>
        <h2 className="landing-section-title">
          Everything you need. <br className="hidden sm:block" />
          <span className="landing-section-title--accent">Nothing you don't.</span>
        </h2>
      </motion.div>

      <div className="landing-bento-grid">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.1 * i, duration: 0.6, type: "spring" }}
            className={`landing-bento-item--${f.size}`}
          >
            <TiltCard delay={i * 0.4}>
              <div className="landing-bento-icon" style={{ "--icon-color": colorMap[f.color] }}>
                <Icon icon={f.icon} width={28} />
              </div>
              <h3 className="landing-bento-title">{f.title}</h3>
              <p className="landing-bento-desc">{f.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── How It Works (Interactive) ───
const steps = [
  { num: "01", icon: "lucide:fingerprint", title: "Secure Authentication", desc: "Sign in securely via QR or OTP. Your session remains heavily encrypted on the backend." },
  { num: "02", icon: "lucide:cloud-lightning", title: "Chunked Uploads", desc: "Files are optimized, chunked, and streamed blazingly fast into Telegram Saved Messages." },
  { num: "03", icon: "lucide:globe", title: "Universal Access", desc: "Access, stream, and manage your files instantly from any browser globally." },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="how-it-works" className="landing-how" ref={ref}>
      <motion.div
        className="landing-section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="landing-section-label landing-section-label--purple">Architecture</span>
        <h2 className="landing-section-title">
          Three steps to <span className="text-purple-400">infinite storage</span>
        </h2>
      </motion.div>

      <div className="landing-steps-container">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className={`landing-interactive-step ${activeStep === i ? "active" : ""}`}
            onClick={() => setActiveStep(i)}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 * i, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="landing-step-indicator">
              <motion.div
                className="landing-step-progress"
                initial={{ height: 0 }}
                animate={{ height: activeStep === i ? '100%' : '0%' }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>
            <div className="landing-step-content-wrap">
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${activeStep === i ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "bg-zinc-800/50 text-zinc-500"}`}>
                  <Icon icon={s.icon} width={24} />
                </div>
                <h3 className={`text-xl font-bold transition-colors ${activeStep === i ? "text-white" : "text-zinc-500"}`}>{s.title}</h3>
              </div>
              <p className={`pl-16 text-sm transition-colors ${activeStep === i ? "text-zinc-300" : "text-zinc-600"}`}>{s.desc}</p>
            </div>
          </motion.div>
        ))}

        {/* Abstract connection visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="landing-steps-visualizer hidden lg:flex"
        >
          <div className="visualizer-globe">
            <Icon icon={steps[activeStep].icon} width={80} className="text-purple-400 animate-pulse" />
            <div className="visualizer-rings">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Stats Section ───
const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="stats" className="landing-stats" ref={ref}>
      <motion.div
        className="landing-section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="landing-section-label">By the Numbers</span>
        <h2 className="landing-section-title">
          Built for people who <span className="landing-section-title--accent">refuse limits</span>
        </h2>
      </motion.div>

      <div className="landing-stats__grid">
        {[
          { value: "100", suffix: "%", label: "Free Forever" },
          { value: "0", suffix: " GB", label: "Storage Limit" },
          { value: "256", suffix: "-bit", label: "AES Encryption" },
          { value: "99", suffix: ".9%", label: "Uptime SLA" },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="landing-stat-card"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 * i, duration: 0.5, type: "spring" }}
          >
            <div className="landing-stat-card__value">
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div className="landing-stat-card__label">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── CTA Banner ───
const CTABanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="landing-cta" ref={ref}>
      <motion.div
        className="landing-cta__inner overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7 }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-cyan-900/40 opacity-50 animate-[landing-shimmer_8s_linear_infinite] bg-[length:200%_100%]" />

        <div className="landing-cta__glow" />
        <h2 className="landing-cta__title relative z-10">
          Ready to Claim Your <ShimmerText>Unlimited Cloud</ShimmerText>?
        </h2>
        <p className="landing-cta__desc relative z-10">
          Join the next generation of cloud storage. No credit card required,
          no storage limits, no compromises.
        </p>
        <div className="relative z-10">
          <GlowButton onClick={openCloud}>
            Launch Nimbus — Free
          </GlowButton>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-3xl m-4" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-3xl m-4" />
      </motion.div>
    </section>
  );
};

// ─── Footer ───
const Footer = () => (
  <footer className="landing-footer">
    <div className="landing-footer__inner">
      <div className="landing-footer__brand group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <div className="landing-navbar__logo-icon group-hover:rotate-12 transition-transform">
          <Icon icon="fluent:cloud-flow-24-filled" width={18} />
        </div>
        <span className="landing-footer__brand-text group-hover:text-white transition-colors">TeleCloud Nimbus</span>
      </div>
      <p className="landing-footer__copy">
        © {new Date().getFullYear()} KMAN Studio. All rights reserved.
      </p>
      <div className="landing-footer__links">
        <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="landing-footer__link" aria-label="Telegram">
          <Icon icon="logos:telegram" width={18} className="grayscale group-hover:grayscale-0" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="landing-footer__link hover:text-white" aria-label="GitHub">
          <Icon icon="mdi:github" width={20} />
        </a>
      </div>
    </div>
  </footer>
);

// ══════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ══════════════════════════════════════════════════════

const Landing = () => {
  return (
    <div className="landing-page selection:bg-cyan-500/30">
      <CursorSpotlight />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Landing;
