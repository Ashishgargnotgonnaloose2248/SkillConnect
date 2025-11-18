import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + Math.random() * 20, 100);
        if (newProgress === 100) {
          clearInterval(timer);
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <img
        src="/logo.jpg"
        alt="SkillConnect Logo"
        className="w-32 h-32 object-contain"
        style={{ animation: 'jump 2.2s ease-in-out infinite' }}
      />
      <div className="w-64 h-2 bg-gray-200 rounded-full mt-8">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 text-gray-600">Loading... {Math.round(progress)}%</p>
    </div>
  );
};

export default LoadingScreen;