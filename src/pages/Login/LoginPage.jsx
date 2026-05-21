import {
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginForm } from "../../features/auth/hooks/useLoginForm";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import eleveImage from "../../assets/images/eleve.jpg";

const LoginPage = () => {
  const { register, handleSubmit, isLoading, error, getFieldError } =
    useLoginForm();

  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const leftSideVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const rightSideVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center overflow-hidden"
    >
      <div className="w-full h-full max-w-full bg-white shadow-xl overflow-hidden lg:h-screen lg:my-auto">
        <div className="grid lg:grid-cols-2 h-full">
          {/* LEFT SIDE - IMAGE */}
          <motion.div
            variants={leftSideVariants}
            className="hidden lg:flex relative bg-gradient-to-br from-[#0b57cd] to-[#0947ab] p-8 flex-col justify-between overflow-hidden"
          >
            {/* Decorative circles animés */}
            <motion.div
              variants={circleVariants}
              className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"
            ></motion.div>
            <motion.div
              variants={circleVariants}
              transition={{ delay: 0.2 }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"
            ></motion.div>

            {/* Content */}
            <motion.div variants={itemVariants} className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 mb-6"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Kelasi</h1>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-white mb-3 leading-tight"
              >
                Bienvenue sur votre
                <br />
                plateforme de gestion
                <br />
                scolaire
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-blue-100 text-base"
              >
                Gérez votre école de manière simple et efficace
              </motion.p>
            </motion.div>

            {/* Image with shadow - Animation flottante */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative z-10 my-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative rounded-xl overflow-hidden shadow-2xl"
              >
                <img
                  src={eleveImage}
                  alt="Élèves"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </motion.div>
            </motion.div>

            {/* Stats animées */}
            <motion.div
              variants={statsVariants}
              className="relative z-10 grid grid-cols-3 gap-3"
            >
              {[
                { value: "500+", label: "Écoles" },
                { value: "50K+", label: "Élèves" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 cursor-pointer"
                >
                  <div className="text-xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-blue-100 text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - LOGIN FORM */}
          <motion.div
            variants={rightSideVariants}
            className="flex items-center justify-center p-6 lg:p-8 overflow-y-auto"
          >
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <motion.div
                variants={itemVariants}
                className="lg:hidden flex items-center gap-2 mb-6"
              >
                <div className="w-10 h-10 bg-[#0b57cd] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Kelasi</h1>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Connexion
                </h2>
                <p className="text-sm text-gray-600">
                  Connectez-vous pour accéder à votre espace
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
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
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
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

                {/* Remember & Forgot */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-[#0b57cd] hover:text-[#0947ab] transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Mot de passe oublié ?
                  </motion.a>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
                    className="mt-4"
                  >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative my-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">
                    Première connexion ?
                  </span>
                </div>
              </motion.div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-xs text-gray-600">
                  Contactez votre administrateur pour obtenir vos identifiants
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 pt-4 border-t border-gray-100"
              >
                <p className="text-center text-xs text-gray-500">
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
