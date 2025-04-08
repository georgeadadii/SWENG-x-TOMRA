'use client';

import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

export default function About() {
  const router = useRouter();

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
            We are the developers of SixSense, a near real-time image classification engine designed to provide real-time image classification capabilities in a hybrid edge and cloud infrastructure. 
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
                The system is designed to be deployed across both edge and cloud environments, ensuring scalability and flexibility.
                </p>
              </motion.div>
            </div>

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