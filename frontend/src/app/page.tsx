'use client';

import { Roboto } from "next/font/google";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// Animation variants for different elements
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
};

export default function Home() {
  const router = useRouter();
  const [tags, setTags] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);
  const [blurPosition, setBlurPosition] = useState({ x: 50, y: 50 });
  const [showContent, setShowContent] = useState(false);

  // Refs for scroll animation using Intersection Observer
  const [featuresHeaderRef, featuresHeaderInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [feature1Ref, feature1InView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [feature2Ref, feature2InView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [feature3Ref, feature3InView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const updatePositions = useCallback(() => {
    setTags(prevTags => prevTags.map(tag => ({
      ...tag,
      x: Math.max(10, Math.min(90, tag.x + (Math.random() - 0.5) * 1.2)),
      y: Math.max(10, Math.min(90, tag.y + (Math.random() - 0.5) * 1.2)),
    })));

    setBlurPosition({
      x: Math.max(0, Math.min(100, blurPosition.x + (Math.random() - 0.5) * 5)),
      y: Math.max(0, Math.min(100, blurPosition.y + (Math.random() - 0.5) * 5)),
    });
  }, [blurPosition]);

  useEffect(() => {
    const sampleTags = ["Cat", "Dog", "Car", "Tree", "Building", "Person", "Bird"];
    const newTags = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      text: sampleTags[Math.floor(Math.random() * sampleTags.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }));
    setTags(newTags);

    const interval = setInterval(updatePositions, 3000);
    setShowContent(true);
    return () => clearInterval(interval);
  }, [updatePositions]);

  return (
    <div className={`flex flex-col items-center w-full bg-black overflow-x-hidden ${roboto.className}`}>
      {/* Hero Section */}
      <div className="min-h-screen w-full relative flex flex-col">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${blurPosition.x}% ${blurPosition.y}%, rgba(138, 43, 226, 0.8), rgba(0, 0, 255, 0.8))`,
            filter: 'blur(100px)',
            transition: 'all 3s ease-in-out'
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
              Image Classification,<br /> Simplified.
            </h1>
          </motion.div>

          <motion.div 
            className="text-center w-[90vw] max-w-full h-[35vh] flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-sm md:text-xl text-white max-w-2xl mx-auto mt-6 opacity-90 leading-relaxed">
              Instantly detect objects with AI-driven image recognition and refine intelligent tags for precise, accurate datasets.
            </p>

            <div className="mt-6">
              <motion.button
                className="mt-4 bg-purple-700 text-white px-6 py-3 rounded-lg border-2 border-white transition-transform opacity-30 hover:scale-110 hover:bg-purple-400 hover:text-purple-900 hover:opacity-80"
                onClick={() => router.push('/dashboard/images')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>

        {tags.map((tag) => (
          <motion.span
            key={tag.id}
            className="absolute text-white bg-white/10 px-4 py-2 rounded-xl text-sm hover:scale-[2]"
            style={{
              top: `${tag.y}%`,
              left: `${tag.x}%`,
              backdropFilter: 'blur(4px)',
              opacity: 0.5,
              transition: 'all 3s ease-in-out, transform 0.3s ease-out',
              cursor: 'pointer'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: Math.random() * 1.5 }}
            whileHover={{ scale: 2 }}
          >
            {tag.text}
          </motion.span>
        ))}
      </div>

      {/* Features Section */}
      <div className="min-h-screen w-full relative px-4 py-24 bg-black">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 70% 30%, rgba(138, 43, 226, 0.6), rgba(0, 0, 255, 0.6))`,
            filter: 'blur(120px)',
          }}
        />
        
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            ref={featuresHeaderRef}
            className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-16"
            variants={fadeInUp}
            initial="hidden"
            animate={featuresHeaderInView ? "visible" : "hidden"}
          >
            Powerful Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Feature 1 */}
            <motion.div 
              ref={feature1Ref}
              className="flex flex-col space-y-6"
              variants={fadeInRight}
              initial="hidden"
              animate={feature1InView ? "visible" : "hidden"}
            >
              <motion.div 
                className="aspect-video rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                  <motion.div 
                    className="grid grid-cols-3 gap-2 p-4 w-4/5"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={feature1InView ? "visible" : "hidden"}
                  >
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <motion.div 
                        key={item} 
                        className="aspect-square bg-gray-800 rounded-lg border border-purple-400/30 relative overflow-hidden group"
                        variants={itemVariant}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-80"></div>
                        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 bg-purple-600/80 rounded-full text-xs text-white">Car</span>
                          <span className="px-2 py-0.5 bg-blue-600/80 rounded-full text-xs text-white">Vehicle</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Intuitive Image Swiper</h3>
                <p className="text-gray-300 leading-relaxed">
                  Quickly browse and classify your images with our fluid swipe interface. 
                  Assign tags with a simple gesture and let our AI suggest classifications 
                  in real-time, streamlining your workflow and increasing productivity.
                </p>
              </div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              ref={feature2Ref}
              className="flex flex-col space-y-6"
              variants={fadeInLeft}
              initial="hidden"
              animate={feature2InView ? "visible" : "hidden"}
            >
              <motion.div 
                className="aspect-video rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-6">
                  <div className="w-full h-full flex flex-col">
                    <motion.div 
                      className="bg-gray-800/80 rounded-lg p-3 mb-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={feature2InView ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="h-6 w-4/5 bg-purple-500/30 rounded mb-2"></div>
                      <div className="flex justify-between items-end h-32">
                        {[85, 65, 75, 45, 55, 70, 60].map((height, i) => (
                          <motion.div 
                            key={i} 
                            className="w-1/8 mx-0.5"
                            initial={{ height: 0 }}
                            animate={feature2InView ? { height: "auto" } : { height: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * i }}
                          >
                            <motion.div 
                              className="bg-gradient-to-t from-purple-600 to-blue-400 rounded-t"
                              initial={{ height: "0%" }}
                              animate={feature2InView ? { height: `${height}%` } : { height: "0%" }}
                              transition={{ duration: 0.8, delay: 0.3 + (0.1 * i) }}
                            ></motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    <div className="flex gap-2">
                      <motion.div 
                        className="bg-gray-800/80 rounded-lg p-3 flex-1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={feature2InView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <div className="h-4 w-3/4 bg-purple-500/30 rounded mb-2"></div>
                        <div className="h-16 flex items-center justify-center">
                          <motion.div 
                            className="h-16 w-16 rounded-full border-4 border-purple-500 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={feature2InView ? { scale: 1 } : { scale: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 200, 
                              damping: 15,
                              delay: 0.8 
                            }}
                          >
                            <motion.span 
                              className="text-white font-bold"
                              initial={{ opacity: 0 }}
                              animate={feature2InView ? { opacity: 1 } : { opacity: 0 }}
                              transition={{ duration: 0.2, delay: 1 }}
                            >
                              92%
                            </motion.span>
                          </motion.div>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="bg-gray-800/80 rounded-lg p-3 flex-1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={feature2InView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        <div className="h-4 w-3/4 bg-purple-500/30 rounded mb-2"></div>
                        <div className="flex flex-col gap-1">
                          {[75, 50, 30].map((width, i) => (
                            <motion.div 
                              key={i} 
                              className="h-4 flex items-center"
                              initial={{ width: 0, opacity: 0 }}
                              animate={feature2InView ? { width: "auto", opacity: 1 } : { width: 0, opacity: 0 }}
                              transition={{ duration: 0.3, delay: 0.8 + (0.1 * i) }}
                            >
                              <motion.div 
                                className="bg-blue-500 rounded h-2" 
                                initial={{ width: "0%" }}
                                animate={feature2InView ? { width: `${width}%` } : { width: "0%" }}
                                transition={{ duration: 0.6, delay: 0.9 + (0.1 * i) }}
                              ></motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Advanced Metrics</h3>
                <p className="text-gray-300 leading-relaxed">
                  Gain valuable insights with our comprehensive analytics dashboard. 
                  Track classification accuracy, monitor tag frequency, and visualize 
                  your dataset composition with beautiful, interactive charts that help 
                  identify patterns and improve your data quality.
                </p>
              </div>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              ref={feature3Ref}
              className="flex flex-col space-y-6 md:col-span-2 mt-8"
              variants={fadeInUp}
              initial="hidden"
              animate={feature3InView ? "visible" : "hidden"}
            >
              <motion.div 
                className="h-96 md:h-80 rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 max-w-4xl mx-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-4">
                  <motion.div 
                    className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 w-full h-full"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={feature3InView ? "visible" : "hidden"}
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      // Create a deterministic "random" color for each grid item
                      const hue = (i * 20) % 60;
                      const randomColor = `hsl(${240 + hue}, ${20 + (i % 3) * 10}%, ${20 + (i % 4) * 5}%)`;
                      
                      return (
                        <motion.div 
                          key={i} 
                          className="aspect-square bg-gray-800 rounded-lg border border-purple-400/30 relative group overflow-hidden"
                          variants={itemVariant}
                          whileHover={{ 
                            scale: 1.1, 
                            zIndex: 10,
                            boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div className="absolute inset-0 opacity-80">
                            {/* Simulate image with colored background */}
                            <div className="w-full h-full" style={{ background: randomColor }}></div>
                          </motion.div>
                          {i % 3 === 0 && (
                            <motion.div 
                              className="absolute bottom-1 left-1 right-1 flex gap-0.5"
                              initial={{ y: 10, opacity: 0 }}
                              animate={feature3InView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 * (i % 8) + 0.5 }}
                            >
                              <span className="px-1 py-0.5 bg-purple-600/80 rounded text-[0.5rem] text-white truncate">
                                {i % 2 === 0 ? "Person" : i % 5 === 0 ? "Building" : "Vehicle"}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Intelligent Image Grid</h3>
                <p className="text-gray-300 leading-relaxed">
                  Visualize your entire collection with our dynamic grid view. Sort, filter, 
                  and organize images based on tags, confidence scores, or custom criteria. 
                  The responsive layout adapts to any screen size while maintaining 
                  optimal performance even with thousands of images.
                </p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            ref={ctaRef}
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.button
              className="bg-purple-700 text-white px-8 py-4 rounded-lg border-2 border-white transition-all hover:bg-purple-400 hover:text-purple-900 hover:opacity-90 font-bold text-lg"
              onClick={() => router.push('/dashboard/images')}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Features
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}