import React, { useState } from "react";
import { Clipboard, CheckCircle } from "lucide-react";

const ButtonCopyToRemNote = ({ copyText, buttonText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(copyText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = copyText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
  
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  
  

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 transition-all duration-300">
      {copied ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <Clipboard className="w-5 h-5" />
          {buttonText}
        </>
      )}
    </button>
  );
};

export default ButtonCopyToRemNote;
