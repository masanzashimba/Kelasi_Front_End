import {
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useRef, useEffect } from "react";
import { useLoginForm } from "../../features/auth/hooks/useLoginForm";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import eleveImage from "../../assets/images/eleve.jpg";

// ─── Easing curves ─────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.4, 0, 0.2, 1];

// ─── Shared variants ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: (delay = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO, delay },
  }),
};

const fadeLeft = {
  hidden: { x: -32, opacity: 0 },
  visible: (delay = 0) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO, delay },
  }),
};

// ─── Floating particle component ───────────────────────────────────────────────
const Particle = ({ x, y, size, delay, duration }) => (
  <motion.div
    className="absolute rounded-full bg-white/15 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// ─── Animated gradient orb ─────────────────────────────────────────────────────
const GradientOrb = ({ className, delay }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// ─── Tilt card wrapper ──────────────────────────────────────────────────────────
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 20 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateX.set(((e.clientY - cy) / (rect.height / 2)) * -6);
    rotateY.set(((e.clientX - cx) / (rect.width / 2)) * 6);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Stat card with counter ────────────────────────────────────────────────────
const StatCard = ({ value, label, delay }) => (
  <motion.div
    initial={{ y: 24, opacity: 0, scale: 0.9 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: EASE_OUT_EXPO }}
    whileHover={{
      scale: 1.07,
      y: -4,
      backgroundColor: "rgba(255,255,255,0.2)",
    }}
    whileTap={{ scale: 0.97 }}
    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 cursor-pointer transition-colors duration-200"
    style={{ transformStyle: "preserve-3d" }}
  >
    <motion.div
      className="text-xl font-bold text-white"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.15, duration: 0.4 }}
    >
      {value}
    </motion.div>
    <div className="text-blue-100 text-xs mt-0.5">{label}</div>
  </motion.div>
);

// ─── Animated logo mark ────────────────────────────────────────────────────────
const LogoMark = ({ dark = false }) => (
  <motion.div
    whileHover={{ scale: 1.08, rotate: 4 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
    className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${
      dark ? "bg-[#0b57cd]" : "bg-white/20 backdrop-blur-sm"
    }`}
  >
    <motion.div
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      }}
    >
      <GraduationCap className="w-6 h-6 text-white" />
    </motion.div>
  </motion.div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { register, handleSubmit, isLoading, error, getFieldError } =
    useLoginForm();

  const particles = [
    { x: 10, y: 20, size: 8, delay: 0, duration: 4 },
    { x: 80, y: 10, size: 12, delay: 0.5, duration: 5 },
    { x: 60, y: 70, size: 6, delay: 1, duration: 3.5 },
    { x: 25, y: 85, size: 10, delay: 1.5, duration: 4.5 },
    { x: 90, y: 55, size: 7, delay: 0.8, duration: 3.8 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center overflow-hidden"
    >
      <div className="w-full h-full bg-white shadow-xl overflow-hidden lg:h-screen">
        <div className="grid lg:grid-cols-2 h-full">
          {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
            className="hidden lg:flex relative bg-gradient-to-br from-[#0b57cd] to-[#0947ab] p-8 flex-col justify-between overflow-hidden"
          >
            {/* Floating particles */}
            {particles.map((p, i) => (
              <Particle key={i} {...p} />
            ))}

            {/* Pulsing orbs */}
            <GradientOrb
              className="w-64 h-64 bg-white top-[-60px] right-[-60px]"
              delay={0}
            />
            <GradientOrb
              className="w-80 h-80 bg-white bottom-[-80px] left-[-80px]"
              delay={1.5}
            />
            <GradientOrb
              className="w-40 h-40 bg-blue-300 top-[40%] right-[5%]"
              delay={0.8}
            />

            {/* Brand */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-2 mb-6">
                <LogoMark />
                <motion.h1
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  Kelasi
                </motion.h1>
              </div>

              {/* Headline — chars stagger in */}
              <motion.h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                {[
                  "Bienvenue sur votre",
                  "plateforme de gestion",
                  "scolaire",
                ].map((line, li) => (
                  <motion.span
                    key={li}
                    className="block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + li * 0.12,
                      duration: 0.5,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    {line}
                  </motion.span>
                ))}
              </motion.h2>

              <motion.p
                className="text-blue-100 text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.78, duration: 0.5 }}
              >
                Gérez votre école de manière simple et efficace
              </motion.p>
            </motion.div>

            {/* Image card with reveal wipe */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.65, ease: EASE_OUT_EXPO }}
              className="relative z-10 my-4"
            >
              <TiltCard className="rounded-xl overflow-hidden shadow-2xl">
                <div className="relative">
                  {/* Shimmer reveal overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      delay: 0.8,
                      duration: 1.1,
                      ease: EASE_IN_OUT,
                    }}
                  />
                  <img
                    src={eleveImage}
                    alt="Élèves"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </TiltCard>
            </motion.div>

            {/* Stats */}
            <div className="relative z-10 grid grid-cols-3 gap-3">
              {[
                { value: "500+", label: "Écoles", delay: 0.65 },
                { value: "50K+", label: "Élèves", delay: 0.75 },
                { value: "98%", label: "Satisfaction", delay: 0.85 },
              ].map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
            className="flex items-center justify-center p-6 lg:p-8 overflow-y-auto"
          >
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="lg:hidden flex items-center gap-2 mb-6"
              >
                <LogoMark dark />
                <h1 className="text-xl font-bold text-gray-900">Kelasi</h1>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25,
                  duration: 0.55,
                  ease: EASE_OUT_EXPO,
                }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Connexion
                </h2>
                <p className="text-sm text-gray-500">
                  Connectez-vous pour accéder à votre espace
                </p>
              </motion.div>

              {/* Error banner */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE_IN_OUT }}
                    className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.35,
                    duration: 0.5,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <Input
                    label="Adresse email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={getFieldError("email")}
                    disabled={isLoading}
                    required
                    {...register("email")}
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.45,
                    duration: 0.5,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <Input
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={getFieldError("password")}
                    disabled={isLoading}
                    required
                    {...register("password")}
                  />
                </motion.div>

                {/* Remember & forgot */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isLoading}
                      className="w-4 h-4 text-[#0b57cd] border-gray-300 rounded focus:ring-[#0b57cd] disabled:opacity-50 disabled:cursor-not-allowed"
                      {...register("remember")}
                    />
                    <span className="text-sm text-gray-700">
                      Se souvenir de moi
                    </span>
                  </label>

                  <motion.a
                    whileHover={{ scale: 1.04, color: "#0947ab" }}
                    whileTap={{ scale: 0.95 }}
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-[#0b57cd] transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Mot de passe oublié ?
                  </motion.a>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.65,
                    duration: 0.5,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <motion.div
                    whileHover={!isLoading ? { scale: 1.015 } : {}}
                    whileTap={!isLoading ? { scale: 0.985 } : {}}
                  >
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={isLoading}
                      rightIcon={
                        !isLoading && (
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        )
                      }
                      className="mt-4"
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isLoading ? "loading" : "idle"}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </motion.span>
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.5, ease: EASE_IN_OUT }}
                className="relative my-7"
                style={{ transformOrigin: "left" }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">
                    Première connexion ?
                  </span>
                </div>
              </motion.div>

              {/* Help text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="text-center text-xs text-gray-500"
              >
                Contactez votre administrateur pour obtenir vos identifiants
              </motion.p>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="mt-6 pt-4 border-t border-gray-100"
              >
                <p className="text-center text-xs text-gray-400">
                  © 2026 Kelasi. Tous droits réservés.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
