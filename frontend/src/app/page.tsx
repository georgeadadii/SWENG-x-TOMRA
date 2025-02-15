'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [tags, setTags] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);
  const [blurPosition, setBlurPosition] = useState({ x: 50, y: 50 });
  const [showContent, setShowContent] = useState(false);

  const updatePositions = useCallback(() => {
    setTags(prevTags => prevTags.map(tag => ({
      ...tag,
      x: Math.max(10, Math.min(90, tag.x + (Math.random() - 0.5) * 2)), // Movement of tags
      y: Math.max(10, Math.min(90, tag.y + (Math.random() - 0.5) * 2)), 
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
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black font-orbitron overflow-hidden relative">
      <div 
        className="absolute inset-0 opacity-50" 
        style={{
          background: `radial-gradient(circle at ${blurPosition.x}% ${blurPosition.y}%, rgba(138, 43, 226, 0.8), rgba(0, 0, 255, 0.8))`, 
          filter: 'blur(100px)',
          transition: 'all 3s ease-in-out' 
        }}
      />
      <Navbar />
      <div className="flex-grow flex items-center justify-center w-full p-5 relative z-10">
        <div className="text-center w-[60vw] max-w-full h-[30vh] flex flex-col justify-between">
          <div 
            className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent inline-block">
              Image Classification Engine
            </h1>
            <p className="text-lg md:text-xl text-white max-w-lg mx-auto mt-4 opacity-80">
              A powerful tool for automated image recognition and classification
            </p>
            <div className="mt-10">
              <button
                className="mt-4 bg-purple-700 text-white px-6 py-3 rounded-lg border-2 border-white transition-transform opacity-30 hover:scale-110 hover:bg-purple-400 hover:text-purple-900 hover:opacity-80"
                onClick={() => router.push('/dashboard/images')}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="absolute text-white bg-white/10 px-4 py-2 rounded-xl text-sm transition-all duration-2000 hover:scale-[2]" 
          style={{ 
            top: `${tag.y}%`, 
            left: `${tag.x}%`,
            backdropFilter: 'blur(4px)',
            transition: 'all 3s ease-in-out', 
            cursor: 'pointer'
          }}
        >
          {tag.text}
        </span>
      ))}
    </div>
  );
}
