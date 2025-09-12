import { cn } from "@/lib/utils";
import { motion} from "motion/react";;

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName
}) => {
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const renderWords = () => {
    return (
      <div className="inline-block">
        {wordsArray.map((word, idx) => {
          return (
            <span key={`word-${idx}`} className="inline">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`text-primary`, word.className)}>
                  {char}
                </span>
              ))}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("inline-flex items-baseline", className)}>
      <motion.div
        className="overflow-hidden"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}>
        <div
          className="text-3xl md:text-5xl lg:text-6xl leading-tight"
          style={{
            whiteSpace: "nowrap",
          }}>
          {renderWords()}
        </div>
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm lg:w-[4px] w-[2px] h-6 md:h-10 lg:h-12 bg-blue-900 ml-1",
          cursorClassName
        )}></motion.span>
    </div>
  );
};