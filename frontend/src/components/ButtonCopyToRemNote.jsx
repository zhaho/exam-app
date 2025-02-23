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
      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
      onClick={handleCopy}
    >
      <span className="relative flex items-center gap-2 px-10 py-1 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent text-black hover:text-white">
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
      </span>
    </button>

  );
};

export default ButtonCopyToRemNote;
