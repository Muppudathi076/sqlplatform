import { useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Rocket } from "lucide-react";

type LevelLockedPageProps = {
  message: string;
};

export default function LevelLockedPage({ message }: LevelLockedPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d1a] relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-md bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 sm:p-10 text-center backdrop-blur-xl animate-in zoom-in duration-500"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >

        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: "2s" }}></div>

          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-rose-900/30 border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse" style={{ animationDuration: "2.5s" }}>

            <div className="animate-shake">
              <LockKeyhole size={56} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" strokeWidth={2} />
            </div>

            <div className="absolute w-[120%] h-[2px] bg-red-500/40 -rotate-45 origin-center blur-[1px]"></div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
          Access Denied
        </h1>

        <div className="inline-block px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
          <p className="text-red-400 font-bold text-lg">
            {message}
          </p>
        </div>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed flex items-center justify-center gap-2">
          You must complete the previous level to unlock this one. Keep learning! <Rocket size={16} className="text-blue-400" />
        </p>

        <button
          onClick={() => navigate("/api/dashboard")}
          className="w-full py-3.5 rounded-xl text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #dc2626, #e11d48)",
            boxShadow: "0 4px 20px rgba(225, 29, 72, 0.4)"
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: translateX(4px) rotate(3deg); }
        }
        .animate-shake {
          animation: shake 2.5s cubic-bezier(.36,.07,.19,.97) infinite;
        }
      `}</style>
    </div>
  );
}
