'use client';

import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Zap, BarChart2, MessageSquare, Cloud, Shield } from "lucide-react";
import Image from "next/image";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

export default function About() {
  const router = useRouter();

  const features = [
    {
      title: "Near Real-Time Image Classification",
      description: "Classify images in near real-time using pre-trained models.",
      icon: <Zap className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "Performance Monitoring",
      description: "Continuously track the performance of the classification engine.",
      icon: <BarChart2 className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "User Feedback Mechanism",
      description: "Allow users to provide feedback on misclassifications to improve model accuracy.",
      icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "Hybrid Deployment",
      description: "Deploy the classification engine across both edge and cloud environments.",
      icon: <Cloud className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "Secure Secret Management",
      description: "Utilize Azure Key Vault for secure storage and retrieval of sensitive credentials and keys.",
      icon: <Shield className="w-8 h-8 text-purple-400" />,
    },
  ];

  const mentors = [
    { name: "Amrish Kulasekaran", role: "Industrial Mentor", year: "", image: "/Amrish.png" }
  ]

  const teamLeads = [
    { name: "Radi (Leila) Adil", role: "Team Lead", year: "3rd Year", image: "/Radi (Leila) Adil.png" },
    { name: "Cindy Ariyo", role: "Team Lead", year: "3rd Year", image: "/Cindy Ariyo.png" },
    { name: "Victor Dalessandris", role: "Team Lead", year: "3rd Year", image: "/Victor Dalessandris.jpg" },
    { name: "Ayomide Ifedolapo Oyelakun", role: "Team Lead", year: "3rd Year", image: "/Ayomide Ifedolapo Oyelakun.jpg" },
  ];

  const frontendTeam = [
    { name: "Patrick Phibbs", role: "Frontend Developer", year: "2nd Year", image: "/Patrick Phibbs.jpg" },
    { name: "Hong Shen", role: "Frontend Developer", year: "2nd Year", image: "/HS.jpg" },
  ];

  const backendTeam = [
    { name: "George Diarmuid Levins", role: "Backend Developer", year: "2nd Year", image: "/George Diarmuid Levins.jpg" },
    { name: "Ionut George Adadi", role: "Backend Developer", year: "2nd Year", image: "/Ionut George Adadi.jpg" },
    { name: "Junyi Xia", role: "Backend Developer", year: "2nd Year", image: "/Junyi Xia.jpg" },
  ];

  return (
    <div className={`flex flex-col items-center w-full bg-black overflow-x-hidden ${roboto.className}`}>
      {/* Hero Section */}
      <div className="min-h-screen w-full relative flex flex-col">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.8), rgba(0, 0, 255, 0.8))`,
            filter: 'blur(100px)',
          }}
        />
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center w-full p-5 relative z-10">
          <motion.div
            className="relative z-50 mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="text-6xl md:text-7xl font-black leading-snug bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent inline-block text-center">
              About Us
            </h1>
          </motion.div>

          <motion.div
            className="text-center w-[90vw] max-w-4xl mx-auto mt-12 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-lg md:text-xl text-white opacity-90 leading-relaxed">
              We are group 6, a team of passionate developers and AI enthusiasts dedicated to making image classification accessible and efficient for everyone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-white/80">
                  Developed in collaboration with TOMRA Sorting Ltd, this project focuses on leveraging pre-trained models to classify images and improve model accuracy through user feedback.
                </p>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-white/80">
                  The system is designed to be near real-time, and deployed across both edge and cloud environments, ensuring scalability and flexibility.
                </p>
              </motion.div>
            </div>

            {/* Key Features Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 mt-20 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 + (index * 0.1) }}
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-900/30 p-3 rounded-lg mr-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-white/70">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Meet the Team Section */}
            <motion.div
              className="mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-12 mt-20 text-center">Meet the Team</h2>
              {/* Mentors */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Industrial Mentor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-8">
                  {mentors.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 2.2 + (index * 0.1) }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                    >
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={128} 
                            height={128} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-white/50 text-sm">Photo</span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white text-center">{member.name}</h4>
                      <p className="text-purple-300 text-center">{member.role}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              {/* Team Leads */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Team Leads</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {teamLeads.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 2.2 + (index * 0.1) }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                    >
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={128} 
                            height={128} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-white/50 text-sm">Photo</span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white text-center">{member.name}</h4>
                      <p className="text-purple-300 text-center">{member.role}</p>
                      <p className="text-white/70 text-center">{member.year}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Frontend Team */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.4 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Frontend Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  {frontendTeam.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 2.6 + (index * 0.1) }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                    >
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={128} 
                            height={128} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-white/50 text-sm">Photo</span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white text-center">{member.name}</h4>
                      <p className="text-purple-300 text-center">{member.role}</p>
                      <p className="text-white/70 text-center">{member.year}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Backend Team */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.8 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Backend Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {backendTeam.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 3.0 + (index * 0.1) }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                    >
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={128} 
                            height={128} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-white/50 text-sm">Photo</span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white text-center">{member.name}</h4>
                      <p className="text-purple-300 text-center">{member.role}</p>
                      <p className="text-white/70 text-center">{member.year}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-12 flex gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <button
                className="bg-purple-700 text-white px-8 py-4 rounded-lg border-2 border-white transition-all hover:bg-purple-400 hover:text-purple-900 hover:opacity-90 font-bold text-lg"
                onClick={() => router.push('/')}
              >
                Return to Home
              </button>
              <button
                className="bg-white/10 text-white px-8 py-4 rounded-lg border-2 border-white transition-all hover:bg-white/20 font-bold text-lg"
                onClick={() => router.push('/dashboard/images')}
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 