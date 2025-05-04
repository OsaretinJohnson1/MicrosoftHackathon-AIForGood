import React, { useState, useEffect, useRef } from 'react';

interface TTSButtonProps {
  text: string;
  language?: string;
  className?: string;
  disabled?: boolean;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ 
  text, 
  language = 'en',
  className = '',
  disabled = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Clean up audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const handlePlay = async () => {
    if (!text || isPlaying) return;

    setIsPlaying(true);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={disabled || !text || isPlaying}
      className={`px-3 py-1 rounded-md transition-colors ${
        disabled || !text
          ? 'bg-gray-300 cursor-not-allowed'
          : isPlaying
          ? 'bg-yellow-500 hover:bg-yellow-600'
          : 'bg-green-500 hover:bg-green-600'
      } text-white ${className}`}
      aria-label={isPlaying ? 'Stop playback' : 'Play audio'}
    >
      {isPlaying ? (
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse delay-100"></span>
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse delay-200"></span>
        </span>
      ) : (
        'Listen'
      )}
    </button>
  );
};