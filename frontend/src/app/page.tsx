'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [tags, setTags] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  useEffect(() => {
    const sampleTags = ["Cat", "Dog", "Car", "Tree", "Building", "Person", "Bird"];
    const newTags = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      text: sampleTags[Math.floor(Math.random() * sampleTags.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }));
    setTags(newTags);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black font-orbitron overflow-hidden relative">
      <Navbar />
      <div className="flex-grow flex items-center justify-center w-full p-5 relative z-10">
        <div className="text-center w-[60vw] max-w-full h-[30vh] flex flex-col justify-between">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-4">
            Image Classification Engine
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto">
            A powerful tool for automated image recognition and classification
          </p>
          <div className="mt-10">
            <button
              className="mt-4 bg-purple-700 text-white px-6 py-3 rounded-lg border-2 border-white transition-transform hover:scale-110 hover:bg-purple-400 hover:text-black"
              onClick={() => router.push('/dashboard/images')}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="absolute text-white/30 p-2 rounded-xl text-sm transition-transform hover:scale-150"
          style={{ top: `${tag.y}%`, left: `${tag.x}%` }}
        >
          {tag.text}
        </span>
      ))}
    </div>
  );
}
