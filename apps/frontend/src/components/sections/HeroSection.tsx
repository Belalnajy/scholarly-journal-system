import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { motion } from "framer-motion";

interface HeroContent {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  verificationBadge: string;
  verificationText: string;
}

interface Stat {
  value: string;
  label: string;
}

interface HeroSectionProps {
  content: HeroContent;
  stats: Stat[];
  backgroundImage?: string;
  featureImage?: string;
}

export function HeroSection({ content, stats, backgroundImage, featureImage }: HeroSectionProps) {
  const navigate = useNavigate();

  const handleSubmitResearch = () => {
    const isLoggedIn = authService.isAuthenticated();
    if (isLoggedIn) {
      navigate('/submit-research');
    } else {
      navigate('/login', { state: { from: '/submit-research' } });
    }
  };

  return (
    <section className="mt-16 py-8 sm:mt-20 sm:py-12 lg:mt-[141px] lg:py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative min-h-[500px] w-full max-w-[1360px] mx-auto overflow-hidden rounded-2xl sm:min-h-[600px] lg:h-[765px]"
        >
          {/* Background Image with Overlay */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl"
          >
            <img
              src={backgroundImage || "/hero-bg.png"}
              alt=""
              className="size-full rounded-2xl object-cover opacity-65"
            />
            <div className="absolute inset-0 rounded-2xl bg-[#093059] bg-opacity-85" />
          </motion.div>

          {/* Content Container */}
          <div className="relative flex h-full flex-col items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-center md:justify-between md:gap-8 lg:gap-16 lg:px-10">
            {/* Feature Image with Badge - Left Side */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[400px] sm:max-w-[500px] md:h-[350px] md:w-[45%] lg:h-[473px] lg:w-[630px]"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-[300px] w-full overflow-hidden rounded-2xl sm:h-[350px] md:h-full"
              >
                <img
                  src={featureImage || "/hero-bg-2.png"}
                  alt=""
                  className="size-full rounded-2xl object-cover"
                />
              </motion.div>

              {/* Verification Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-4 -right-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg sm:gap-4 sm:px-5 sm:py-4 lg:-bottom-5 lg:-right-8 lg:gap-6 lg:px-6 lg:py-6"
              >
                <div className="flex flex-col items-end gap-1 text-right">
                  <p className="text-sm font-medium text-[#093059] sm:text-base lg:text-[22px]" dir="auto">
                    {content.verificationBadge}
                  </p>
                  <p className="text-xs text-[#999999] sm:text-sm lg:text-[16px]" dir="auto">
                    {content.verificationText}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f8f3ec] sm:size-12 lg:size-[60px]">
                  <CheckCircle className="size-6 text-[#b2823e] sm:size-8 lg:size-10" />
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex w-full flex-col items-end gap-6 md:w-[50%] lg:w-[628px] lg:gap-8"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center justify-end gap-2 rounded-[20px] border border-[#976e35] bg-[rgba(178,130,62,0.2)] px-2 py-2 lg:gap-3"
              >
                <p className="text-nowrap text-right text-base text-[#d7b98e] sm:text-lg lg:text-[22px]" dir="auto">
                  {content.badge}
                </p>
              </motion.div>

              {/* Main Content */}
              <div className="flex w-full flex-col items-end gap-6 lg:gap-8">
                {/* Title and Description */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex w-full flex-col items-end gap-2 text-right lg:gap-3"
                >
                  <h1 className="w-full text-3xl font-bold leading-[1.5] text-[#e8f2fd] sm:text-4xl md:text-5xl lg:w-[388px] lg:text-[64px]" dir="auto">
                    {content.title}
                  </h1>
                  <p className="w-full text-base leading-[1.4] text-[#f8f3ec] sm:text-lg lg:text-[24px]" dir="auto">
                    {content.description}
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 lg:gap-[33.25px]"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/issues" 
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f8f3ec] bg-[rgba(255,255,255,0.2)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.3)] sm:w-auto sm:min-w-[180px] lg:w-[249.375px] lg:rounded-[16.625px] lg:px-[9.975px] lg:py-[9.975px]"
                    >
                      <span className="text-nowrap text-right text-base text-[#f8f3ec] sm:text-lg lg:text-[19.95px]" dir="auto">
                        {content.secondaryCta}
                      </span>
                    </Link>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleSubmitResearch}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b2823e] px-4 py-3 transition-colors hover:bg-[#976e35] sm:w-auto sm:min-w-[180px] lg:w-[249.375px] lg:rounded-[16.625px] lg:px-[9.975px] lg:py-[9.975px]"
                  >
                    <span className="text-nowrap text-right text-base text-[#e8f2fd] sm:text-lg lg:text-[19.95px]">
                      {content.primaryCta}
                    </span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex w-full items-center justify-center gap-8 sm:justify-end sm:gap-12 lg:gap-20"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-end"
                  >
                    <div className="flex h-8 flex-col justify-center text-2xl text-[#b2823e] sm:h-10 sm:text-3xl lg:h-12 lg:text-[40px]">
                      <p className="text-center leading-[1.5]" dir="auto">{stat.value}</p>
                    </div>
                    <p className="text-sm text-[#b3b3b3] sm:text-base lg:text-[22px]" dir="auto">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
