import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";

export default function OTPInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  className = "",
}) {
  const [otp, setOtp] = useState(new Array(length).fill(""));

  const inputsRef = useRef([]);

  // INIT VALUE (si valeur externe)
  useEffect(() => {
    if (value) {
      const arr = value.split("").slice(0, length);
      setOtp([...arr, ...Array(length - arr.length).fill("")]);
    }
  }, [value, length]);

  const handleChange = (element, index) => {
    const val = element.target.value;

    if (!/^[0-9]?$/.test(val)) return; // chiffres only

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    onChange?.(newOtp.join(""));

    // auto next
    if (val && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    // complete
    if (newOtp.every((v) => v !== "")) {
      onComplete?.(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length).split("");

    const newOtp = [...otp];

    pasted.forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });

    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    const lastIndex = pasted.length >= length ? length - 1 : pasted.length;
    inputsRef.current[lastIndex]?.focus();

    if (newOtp.every((v) => v !== "")) {
      onComplete?.(newOtp.join(""));
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((data, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={data}
          maxLength={1}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            `
            w-12
            h-12
            text-center
            text-lg
            font-semibold
            border
            border-slate-300
            rounded-lg
            outline-none
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-500/20
            transition
            `,
          )}
        />
      ))}
    </div>
  );
}
