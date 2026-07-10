import { useState } from "react";
import ReactMarkdown from "react-markdown";

const API_BASE = "http://localhost:8000";

// ─── Reusable Components ───────────────────────────────────────────────────

function Navbar({ page, setPage }) {
  const tabs = [
    { id: "analyze", label: "Player Analysis" },
    { id: "compare", label: "Compare Players" },
    { id: "predict", label: "Match Prediction" },
  ];
  return (
    <nav className="bg-gray-900 border-b border-green-500 px-6 py-4 flex items-center gap-8">
      <span className="text-green-400 font-bold text-xl tracking-wide">
        🏏 Cricket AI Analyst
      </span>
      <div className="flex gap-2 ml-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setPage(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              page === t.id
                ? "bg-green-500 text-gray-900"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
      />
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold px-6 py-2 rounded-md transition-colors"
    >
      {loading ? "Analyzing..." : label}
    </button>
  );
}

function ResultBox({ result }) {
  if (!result) return null;
  return (
    <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-5">
      <h3 className="text-green-400 font-semibold mb-3 text-sm uppercase tracking-wider">
        AI Analysis
      </h3>
      <div className="text-gray-200 text-sm leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="mt-4 bg-red-900/40 border border-red-600 rounded-md px-4 py-3 text-red-300 text-sm">
      {error}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────

function AnalyzePage() {
  const [player, setPlayer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!player.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch(
        `${API_BASE}/analyze-player/${encodeURIComponent(player)}`
      );
      const data = await res.json();
      if (data.analysis) setResult(data.analysis);
      else setError("No analysis returned. Try a different player name.");
    } catch {
      setError("Could not connect to backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-white mb-1">Player Analysis</h2>
      <p className="text-gray-400 text-sm mb-6">
        Get a detailed AI-powered T20 analysis using live statistics.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Player Name"
          value={player}
          onChange={setPlayer}
          placeholder="e.g. Virat Kohli"
        />
        <SubmitButton loading={loading} label="Analyze Player" />
      </form>
      <ErrorBox error={error} />
      <ResultBox result={result} />
    </div>
  );
}

function ComparePage() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch(
        `${API_BASE}/compare-players?player1=${encodeURIComponent(
          player1
        )}&player2=${encodeURIComponent(player2)}`
      );
      const data = await res.json();
      if (data.comparison) setResult(data.comparison);
      else setError("No comparison returned.");
    } catch {
      setError("Could not connect to backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-white mb-1">Compare Players</h2>
      <p className="text-gray-400 text-sm mb-6">
        Head-to-head T20 comparison using real stats for both players.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Player 1"
          value={player1}
          onChange={setPlayer1}
          placeholder="e.g. Virat Kohli"
        />
        <Input
          label="Player 2"
          value={player2}
          onChange={setPlayer2}
          placeholder="e.g. Rohit Sharma"
        />
        <SubmitButton loading={loading} label="Compare Players" />
      </form>
      <ErrorBox error={error} />
      <ResultBox result={result} />
    </div>
  );
}

function PredictPage() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [venue, setVenue] = useState("");
  const [team1Players, setTeam1Players] = useState("");
  const [team2Players, setTeam2Players] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team1.trim() || !team2.trim() || !venue.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const params = new URLSearchParams({
        team1,
        team2,
        venue,
        team1_players: team1Players,
        team2_players: team2Players,
      });
      const res = await fetch(`${API_BASE}/match-analysis?${params}`);
      const data = await res.json();
      if (data.analysis) setResult(data.analysis);
      else setError("No prediction returned.");
    } catch {
      setError("Could not connect to backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-white mb-1">Match Prediction</h2>
      <p className="text-gray-400 text-sm mb-6">
        Predict match outcomes using live player stats and venue analysis.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Team 1" value={team1} onChange={setTeam1} placeholder="e.g. India" />
          <Input label="Team 2" value={team2} onChange={setTeam2} placeholder="e.g. Australia" />
        </div>
        <Input label="Venue" value={venue} onChange={setVenue} placeholder="e.g. Wankhede Stadium" />
        <Input
          label="Team 1 Key Players (comma separated)"
          value={team1Players}
          onChange={setTeam1Players}
          placeholder="e.g. Virat Kohli, Rohit Sharma"
        />
        <Input
          label="Team 2 Key Players (comma separated)"
          value={team2Players}
          onChange={setTeam2Players}
          placeholder="e.g. David Warner, Steve Smith"
        />
        <p className="text-xs text-gray-500 -mt-2">
          Adding key players fetches their live stats for a more accurate prediction.
        </p>
        <SubmitButton loading={loading} label="Predict Match" />
      </form>
      <ErrorBox error={error} />
      <ResultBox result={result} />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("analyze");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar page={page} setPage={setPage} />
      {page === "analyze" && <AnalyzePage />}
      {page === "compare" && <ComparePage />}
      {page === "predict" && <PredictPage />}
    </div>
  );
}
