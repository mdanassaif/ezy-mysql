
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CommandCardProps {
  title: string;
  syntax: string;
  description: string;
  example: string;
}

export const CommandCard = ({ title, syntax, description, example }: CommandCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div
      className="group relative p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-fadeIn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      <h3 className="text-xl font-semibold mb-2 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      
      <div className="space-y-4">
        <div className="relative">
          <div className="bg-slate-100 rounded-lg p-4 font-mono text-sm text-slate-800">
            {syntax}
            <button
              onClick={() => copyToClipboard(syntax)}
              className="absolute top-2 right-2 p-2 text-slate-400 hover:text-primary transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">Example:</p>
          <code className="text-sm text-slate-700">{example}</code>
        </div>
      </div>
    </div>
  );
};
