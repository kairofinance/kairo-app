import { useState, useEffect, useCallback } from "react";

export function useTypingEffect(
  words: string[],
  typingSpeed = 100,
  pauseDuration = 1500,
  deletingSpeed = 100
) {
  const [currentWord, setCurrentWord] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing"
  );

  const nextWord = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    setCurrentWord("");
    setPhase("typing");
  }, [words.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const type = () => {
      const fullWord = words[currentIndex];

      switch (phase) {
        case "typing":
          if (currentWord !== fullWord) {
            setCurrentWord((prev) => fullWord.slice(0, prev.length + 1));
            timer = setTimeout(type, typingSpeed);
          } else {
            setPhase("pausing");
            timer = setTimeout(type, pauseDuration);
          }
          break;
        case "pausing":
          setPhase("deleting");
          timer = setTimeout(type, deletingSpeed);
          break;
        case "deleting":
          if (currentWord) {
            setCurrentWord((prev) => prev.slice(0, -1));
            timer = setTimeout(type, deletingSpeed);
          } else {
            nextWord();
            timer = setTimeout(type, typingSpeed);
          }
          break;
      }
    };

    timer = setTimeout(type, typingSpeed);

    return () => clearTimeout(timer);
  }, [
    currentIndex,
    phase,
    words,
    typingSpeed,
    pauseDuration,
    deletingSpeed,
    nextWord,
    currentWord,
  ]);

  return currentWord;
}
