import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  Clock3,
  FileText,
  Gauge,
  History,
  MessageSquare,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { AppFooter } from "../components/AppFooter";
import { PageClock } from "../components/PageClock";
import { PageHeader } from "../components/PageHeader";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { voiceService } from "../services/voice.service";

const PARAGRAPH_LIBRARY = [
  {
    id: "para-1",
    title: "Clear Communication in Interviews",
    text: "Clear communication helps interviewers understand your ideas quickly. A strong answer should begin with the main point, include one simple example, and end with a short conclusion. Candidates should speak at a calm pace and avoid filler words. With regular practice, answers become more natural, confident, and professional.",
    complexWords: ["organized", "professional", "equally", "fluency", "effectively"],
  },
  {
    id: "para-2",
    title: "Discussing a Project",
    text: "When describing a project, explain the problem first and then the approach you used. Mention the tools, your responsibilities, and the final result. A clear structure helps the interviewer understand your role and your thinking process. Practicing project answers makes you sound more confident and prepared.",
    complexWords: ["sequence", "responsibilities", "credible", "contribution", "preparation"],
  },
  {
    id: "para-3",
    title: "Handling Pressure",
    text: "Handling pressure means staying calm and organized when work becomes difficult. In interviews, candidates should explain how they manage tasks, communicate clearly, and focus on solutions. A balanced answer shows maturity and emotional control. Employers value people who can stay productive even during stressful situations.",
    complexWords: ["priorities", "productive", "maturity", "adaptability", "discipline"],
  },
  {
    id: "para-4",
    title: "Learning from Feedback",
    text: "Constructive feedback helps people grow and improve over time. In an interview, it is good to share an example of feedback you received and how you acted on it. This shows self-awareness, humility, and a willingness to learn. Employers appreciate candidates who can turn feedback into better performance.",
    complexWords: ["constructive", "defensive", "humility", "collaborative", "transform"],
  },
  {
    id: "para-5",
    title: "Importance of Preparation",
    text: "Preparation is one of the most reliable ways to reduce nervousness before an interview. Students who study the company, review common questions, and practice speaking aloud usually perform with greater confidence. Preparation does not mean memorizing every sentence. Instead, it means understanding your own strengths, achievements, and goals clearly enough to explain them naturally. Candidates should be ready to describe their projects, internships, academic background, and reasons for applying. They should also practice maintaining eye contact, speaking at a steady pace, and organizing answers logically. These habits improve both confidence and clarity. A prepared candidate appears more focused and professional because their answers sound thoughtful rather than rushed. Over time, consistent preparation builds communication skills that remain useful not only in interviews but also in presentations, meetings, and teamwork.",
    complexWords: ["reliable", "nervousness", "internships", "logically", "presentations"],
  },
  {
    id: "para-6",
    title: "Teamwork and Collaboration",
    text: "Teamwork is a critical skill in most professional environments because large goals are rarely achieved by one person alone. During interviews, candidates should explain how they contribute to group discussions, share responsibility, and support teammates when challenges arise. A strong teamwork response often includes an example where communication, patience, and cooperation helped a team complete a difficult task. It is also valuable to mention how disagreements were handled respectfully, because conflict management is an essential part of collaboration. Students who practice these answers learn how to present themselves as dependable and flexible team members. Interviewers appreciate candidates who can work independently while still valuing collective success. This balance shows maturity and professionalism, and it helps employers imagine how the candidate will contribute to a positive and productive workplace culture.",
    complexWords: ["environments", "cooperation", "respectfully", "dependable", "collective"],
  },
  {
    id: "para-7",
    title: "Adapting to New Technology",
    text: "Technology changes rapidly, so employers prefer candidates who are willing to learn continuously. In an interview, students may be asked how they adapt to new tools, frameworks, or working methods. A convincing answer should include curiosity, discipline, and a practical learning strategy. For example, a student might explain how they read documentation, build small experiments, and ask questions when facing unfamiliar systems. This shows initiative and independent thinking. Candidates should avoid sounding afraid of change; instead, they should present learning as an exciting opportunity to improve. Practicing such responses helps students sound more confident and future-ready. It also demonstrates that they can remain effective in dynamic environments where constant improvement is necessary. In modern careers, adaptability is not only useful but often essential for long-term growth and professional relevance.",
    complexWords: ["continuously", "frameworks", "documentation", "initiative", "adaptability"],
  },
  {
    id: "para-8",
    title: "Building Confidence While Speaking",
    text: "Confidence in speaking does not come only from talent; it grows through consistent practice and self-awareness. Many students feel nervous because they focus on mistakes instead of improvement. A better approach is to practice regularly, listen to recorded responses, and notice areas that need refinement. Speaking confidently means using complete sentences, pausing at the right moments, and expressing ideas with clarity. It does not require speaking very fast or using complicated language. In fact, simple and direct communication is often more effective. Students should also learn to control filler words, because excessive hesitation can make answers sound uncertain. Over time, repeated practice builds familiarity and reduces fear. As confidence improves, students become better at interviews, presentations, and group discussions, which strengthens both academic and professional communication.",
    complexWords: ["consistent", "self-awareness", "refinement", "complicated", "excessive"],
  },
  {
    id: "para-9",
    title: "Problem Solving Approach",
    text: "Problem solving is one of the most valuable skills employers look for in candidates across different industries. A good answer about problem solving should explain how you identify the issue, study the available information, compare possible solutions, and choose the most practical option. It is helpful to include an example from academics, internships, or projects to make the answer believable. Interviewers want to hear not only what decision you made, but also why you made it. This reveals your reasoning process. Students who practice such answers become more comfortable discussing challenges without sounding confused or defensive. They learn how to present obstacles as opportunities to think clearly and act responsibly. In professional settings, strong problem solving supports better decisions, smoother teamwork, and more successful project outcomes.",
    complexWords: ["industries", "available", "believable", "reasoning", "obstacles"],
  },
  {
    id: "para-10",
    title: "Professional Communication",
    text: "Professional communication is more than speaking politely; it involves clarity, respect, and awareness of the listener’s needs. In interviews, candidates should choose words carefully, avoid unnecessary repetition, and maintain a tone that sounds confident but respectful. This combination helps create trust. Professional communication also includes listening attentively and responding directly to the question that was asked. Students sometimes prepare long answers but forget to stay relevant, which can weaken their message. Practicing with different topics helps them become more precise and adaptable. As they improve, they learn how to express ideas with maturity and structure. These communication habits are valuable far beyond interviews. They support better teamwork, stronger presentations, and more effective interactions with managers, clients, and colleagues in a professional environment.",
    complexWords: ["awareness", "unnecessary", "attentively", "adaptable", "interactions"],
  },
  {
    id: "para-11",
    title: "Career Goals and Motivation",
    text: "Interviewers often ask about career goals to understand whether a candidate has direction and motivation. A good answer should show ambition, but it should also sound realistic and connected to the role being discussed. Students can explain the skills they want to develop, the kind of responsibilities they hope to handle, and the type of impact they wish to create in the future. This helps the interviewer see purpose behind the application. At the same time, candidates should avoid giving answers that feel vague or overly dramatic. Clear and thoughtful communication is more convincing than impressive-sounding language. Practicing this topic helps students organize their thoughts and speak with confidence about their future. It also encourages self-reflection, which is useful for better decision making and long-term career planning.",
    complexWords: ["ambition", "responsibilities", "application", "convincing", "self-reflection"],
  },
  {
    id: "para-12",
    title: "Time Management Skills",
    text: "Time management is essential for students and professionals because responsibilities often compete for attention. In an interview, a candidate should explain how they prioritize tasks, plan schedules, and avoid unnecessary delays. A strong example might include balancing coursework, project deadlines, and personal commitments without missing important targets. This demonstrates discipline and reliability. Interviewers value time management because it reflects how well a person can handle pressure and remain organized. Students who practice discussing this skill become more confident because they can connect daily habits with professional expectations. They also learn to highlight practical strategies such as setting deadlines, using task lists, and reviewing progress regularly. In the workplace, good time management improves productivity, reduces stress, and helps teams complete objectives more efficiently.",
    complexWords: ["prioritize", "commitments", "discipline", "expectations", "productivity"],
  },
];

const MODES = {
  paragraph: "paragraph",
  question: "question",
};

const getWordCount = (text = "") =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const calculateWordsPerMinute = (text = "", durationSeconds = 0) => {
  const wordCount = getWordCount(text);
  if (!wordCount || durationSeconds <= 0) {
    return 0;
  }

  return Math.round(wordCount / (durationSeconds / 60));
};

const formatSeconds = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
};

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const getConfidenceLabel = (value = 0) => {
  if (value >= 0.75) return "High";
  if (value >= 0.45) return "Medium";
  return "Low";
};

const getErrorMessage = (errorCode = "") => {
  switch (errorCode) {
    case "audio-capture":
      return "No microphone was detected. Please connect a microphone and try again.";
    case "not-allowed":
      return "Microphone access was blocked. Please allow microphone permission in your browser.";
    case "network":
      return "Speech recognition had a network issue. Please try again.";
    case "no-speech":
      return "No speech was detected. Please speak clearly and try again.";
    default:
      return "Speech recognition could not continue. Please try again.";
  }
};

const PracticeModeButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
      active
        ? "border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/30"
        : "border-white/40 bg-white/60 text-slate-700 hover:border-teal-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-teal-700"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const MetricCard = ({ icon: Icon, label, value, helper }) => (
  <div className="min-h-[180px] rounded-2xl border border-white/50 bg-white/65 p-5 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/65">
    <div className="mb-3 flex items-center gap-2 text-slate-600 dark:text-slate-300">
      <Icon size={17} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="break-words text-[2rem] font-bold leading-tight text-slate-900 dark:text-white md:text-[2.2rem]">
      {value}
    </p>
    {helper ? (
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {helper}
      </p>
    ) : null}
  </div>
);

const StarRow = ({ label, stars }) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <span className="text-amber-500">{stars}</span>
  </div>
);

export const VoicePractice = () => {
  const { user, updateUser } = useAuth();
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const stopFallbackTimerRef = useRef(null);
  const shouldAnalyzeOnStopRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const confidenceSamplesRef = useRef([]);

  const [mode, setMode] = useState(MODES.paragraph);
  const [selectedParagraphId, setSelectedParagraphId] = useState(
    PARAGRAPH_LIBRARY[0].id,
  );
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [speechConfidence, setSpeechConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyMode, setHistoryMode] = useState(MODES.paragraph);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const selectedParagraph = useMemo(
    () =>
      PARAGRAPH_LIBRARY.find((item) => item.id === selectedParagraphId) ||
      PARAGRAPH_LIBRARY[0],
    [selectedParagraphId],
  );
  const activePrompt =
    mode === MODES.paragraph ? selectedParagraph.text : question;
  const liveTranscript = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
  const latestFeedback = feedback?.feedback || null;
  const latestMetrics = latestFeedback?.metrics || {};
  const latestGamification = latestFeedback?.gamification || {};
  const historySessions = useMemo(
    () => ({
      [MODES.paragraph]: history.filter((session) => session.mode === MODES.paragraph),
      [MODES.question]: history.filter((session) => session.mode === MODES.question),
    }),
    [history],
  );
  const selectedHistorySessions = historySessions[historyMode] || [];
  const latestWordsPerMinute =
    (latestMetrics.wordsPerMinute ?? 0) > 0
      ? latestMetrics.wordsPerMinute
      : calculateWordsPerMinute(transcript, durationSeconds);

  const confidencePercent = useMemo(
    () => Math.round(Math.max(0, Math.min(1, speechConfidence)) * 100),
    [speechConfidence],
  );
  const effectiveConfidenceScore =
    latestMetrics.speechConfidence && latestMetrics.speechConfidence > 0
      ? latestMetrics.speechConfidence
      : Math.round(confidencePercent / 10);

  const getCurrentDurationSeconds = () => {
    if (!startTimeRef.current) {
      return durationSeconds;
    }

    return Math.max(
      durationSeconds,
      Math.floor((Date.now() - startTimeRef.current) / 1000),
    );
  };

  const loadHistory = async () => {
    try {
      const data = await voiceService.getHistory();
      setHistory(data.sessions || []);
    } catch (historyError) {
      console.error("Failed to load voice history:", historyError);
    }
  };

  const loadQuestion = async () => {
    setIsLoadingQuestion(true);
    setError("");

    try {
      const data = await voiceService.getQuestion(question);
      setQuestion(data.question || "");
    } catch (questionError) {
      setError(
        questionError?.response?.data?.message ||
          questionError.message ||
          "Could not fetch a voice practice question.",
      );
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const resetPracticeState = () => {
    if (stopFallbackTimerRef.current) {
      window.clearTimeout(stopFallbackTimerRef.current);
      stopFallbackTimerRef.current = null;
    }

    setTranscript("");
    setInterimTranscript("");
    setDurationSeconds(0);
    setSpeechConfidence(0);
    setFeedback(null);
    setError("");
    setIsStopping(false);
    startTimeRef.current = null;
    stopRequestedRef.current = false;
    finalTranscriptRef.current = "";
    confidenceSamplesRef.current = [];
  };

  const submitForAnalysis = async (finalText, finalDurationSeconds) => {
    setIsAnalyzing(true);
    setError("");

    try {
      const data = await voiceService.analyzeSession({
        transcript: finalText,
        mode,
        questionOrParagraph: activePrompt,
        durationSeconds: finalDurationSeconds,
        speechConfidence,
      });

      setFeedback(data);
      if (typeof data.totalPoints === "number") {
        updateUser({
          ...user,
          points: data.totalPoints,
          totalPoints: data.totalPoints,
          level: data.level ?? user?.level ?? 1,
        });
      }
      await loadHistory();
    } catch (analysisError) {
      setError(
        analysisError?.response?.data?.message ||
          analysisError.message ||
          "Voice analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("This browser does not support the Web Speech API.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setIsStopping(false);
      stopRequestedRef.current = false;
      setError("");
    };

    recognition.onresult = (event) => {
      let nextFinalTranscript = "";
      let nextInterimTranscript = "";
      const confidenceSamples = [...confidenceSamplesRef.current];

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || "";

        if (result.isFinal) {
          nextFinalTranscript += `${text} `;
          if (typeof result[0]?.confidence === "number") {
            confidenceSamples.push(result[0].confidence);
          }
        } else {
          nextInterimTranscript += text;
        }
      }

      confidenceSamplesRef.current = confidenceSamples;
      if (confidenceSamples.length) {
        const averageConfidence =
          confidenceSamples.reduce((sum, value) => sum + value, 0) /
          confidenceSamples.length;
        setSpeechConfidence(averageConfidence);
      }

      finalTranscriptRef.current = nextFinalTranscript.trim();
      setTranscript(nextFinalTranscript.trim());
      setInterimTranscript(nextInterimTranscript.trim());
    };

    recognition.onerror = (event) => {
      setIsStopping(false);
      setError(getErrorMessage(event.error));
    };

    recognition.onend = async () => {
      setIsRecording(false);
      setIsStopping(false);
      setInterimTranscript("");

      if (stopFallbackTimerRef.current) {
        window.clearTimeout(stopFallbackTimerRef.current);
        stopFallbackTimerRef.current = null;
      }

      const finalDurationSeconds = startTimeRef.current
        ? Math.max(
            durationSeconds,
            Math.floor((Date.now() - startTimeRef.current) / 1000),
          )
        : durationSeconds;
      setDurationSeconds(finalDurationSeconds);

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;

      if (shouldAnalyzeOnStopRef.current) {
        shouldAnalyzeOnStopRef.current = false;
        const finalText = finalTranscriptRef.current.trim();

        if (!finalText) {
          setError("Transcript is empty. Please record a response before analysis.");
          return;
        }

        await submitForAnalysis(finalText, finalDurationSeconds);
      }
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    loadHistory();
    loadQuestion();

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (stopFallbackTimerRef.current) {
        window.clearTimeout(stopFallbackTimerRef.current);
      }
      recognition.abort();
    };
  }, []);

  useEffect(() => {
    if (mode === MODES.question && !question) {
      loadQuestion();
    }
  }, [mode, question]);

  const changeMode = (nextMode) => {
    if (isRecording) {
      return;
    }

    setMode(nextMode);
    resetPracticeState();
  };

  const startRecording = () => {
    if (isStopping) {
      setError("The current recording is still stopping. Please wait a moment.");
      return;
    }

    if (!recognitionRef.current || !isSupported) {
      setError("Speech recognition is not available in this browser.");
      return;
    }

    resetPracticeState();
    shouldAnalyzeOnStopRef.current = false;
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setDurationSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      recognitionRef.current.start();
    } catch {
      setError("Recording is already active. Please wait a moment and try again.");
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) {
      return;
    }

    shouldAnalyzeOnStopRef.current = true;
    stopRequestedRef.current = true;
    setIsStopping(true);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      recognitionRef.current.abort();
    }

    stopFallbackTimerRef.current = window.setTimeout(() => {
      if (!stopRequestedRef.current) {
        return;
      }

      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore abort issues from inconsistent browser implementations.
      }

      setIsRecording(false);
      setIsStopping(false);
      stopRequestedRef.current = false;
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_30%),linear-gradient(180deg,#f8fffe_0%,#ecfeff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.14),_transparent_22%),linear-gradient(180deg,#020617_0%,#082f49_50%,#020617_100%)]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Communication Lab"
            title="AI Voice Communication Practice"
            description="Practice interview speaking with live speech-to-text, filler-word tracking, speed analysis, and instant feedback."
            icon={Mic}
            backFallbackTo="/dashboard"
          />

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/60 bg-white/55 p-6 shadow-xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
                    <PracticeModeButton
                      active={mode === MODES.paragraph}
                      icon={FileText}
                      label="Paragraph Practice"
                      onClick={() => changeMode(MODES.paragraph)}
                    />
                    <PracticeModeButton
                      active={mode === MODES.question}
                      icon={MessageSquare}
                      label="AI Question Practice"
                      onClick={() => changeMode(MODES.question)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 bg-white/80 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:border-teal-400 hover:bg-teal-50 dark:border-teal-900 dark:bg-slate-900/70 dark:text-teal-300"
                  >
                    <History size={18} />
                    {isHistoryOpen ? "Hide History" : "View History"}
                  </button>
                </div>

                {isHistoryOpen ? (
                  <div className="mb-5 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-950/40">
                    <div className="flex flex-wrap items-center gap-3">
                      <PracticeModeButton
                        active={historyMode === MODES.paragraph}
                        icon={FileText}
                        label="Paragraph Practice"
                        onClick={() => setHistoryMode(MODES.paragraph)}
                      />
                      <PracticeModeButton
                        active={historyMode === MODES.question}
                        icon={MessageSquare}
                        label="AI Practice"
                        onClick={() => setHistoryMode(MODES.question)}
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedHistorySessions.length ? (
                        selectedHistorySessions.map((session) => (
                          <div
                            key={session._id}
                            className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/80"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                                  {historyMode === MODES.paragraph
                                    ? "Paragraph Practice"
                                    : "AI Practice"}
                                </p>
                                <p className="line-clamp-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                                  {session.questionOrParagraph}
                                </p>
                              </div>
                              <span className="inline-flex w-fit rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                {session.score}/10
                              </span>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                                Filler words: {session.fillerWordCount || 0}
                              </div>
                              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                                Speech speed: {session.wordsPerMinute || 0} WPM
                              </div>
                              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          No saved sessions yet for this practice type.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-white/80 to-teal-50/80 p-5 dark:border-teal-900/60 dark:from-slate-950/80 dark:to-teal-950/40">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                        {mode === MODES.paragraph ? "Read This Paragraph" : "Interview Question"}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {mode === MODES.paragraph
                          ? "Focus on clarity, pace, and full sentences."
                          : "Answer as if you are in a real interview."}
                      </h2>
                    </div>
                    {mode === MODES.question ? (
                      <button
                        type="button"
                        onClick={loadQuestion}
                        disabled={isLoadingQuestion || isRecording}
                        className="inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300"
                      >
                        <RefreshCw
                          size={16}
                          className={isLoadingQuestion ? "animate-spin" : ""}
                        />
                        New Question
                      </button>
                    ) : null}
                  </div>

                  {mode === MODES.paragraph ? (
                    <div className="grid gap-4 lg:grid-cols-[1.6fr_0.8fr]">
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="paragraph-select"
                            className="mb-2 block text-sm font-semibold text-teal-800 dark:text-teal-300"
                          >
                            Select a paragraph
                          </label>
                          <select
                            id="paragraph-select"
                            value={selectedParagraphId}
                            onChange={(event) =>
                              setSelectedParagraphId(event.target.value)
                            }
                            disabled={isRecording}
                            className="w-full rounded-2xl border border-teal-200 bg-white px-4 py-3 text-base font-medium text-slate-800 shadow-sm outline-none transition focus:border-teal-500 dark:border-teal-900 dark:bg-slate-900 dark:text-slate-100"
                          >
                            {PARAGRAPH_LIBRARY.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="rounded-2xl border border-cyan-200 bg-[linear-gradient(135deg,#f7fdff_0%,#eef9ff_55%,#e0f2fe_100%)] px-5 py-5 text-lg font-semibold leading-9 text-slate-900 shadow-lg shadow-cyan-200/60 dark:border-teal-800 dark:bg-gradient-to-r dark:from-teal-600 dark:to-emerald-500 dark:text-white dark:shadow-none md:px-6 md:py-6 md:text-2xl md:leading-10">
                          {selectedParagraph.text}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-teal-200/80 bg-white/80 p-5 shadow-sm dark:border-teal-900 dark:bg-slate-900/80">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Paragraph Details
                        </h3>
                        <div className="mt-4 space-y-3">
                          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Size
                            </p>
                            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                              {getWordCount(selectedParagraph.text)} words
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Complex Words
                            </p>
                            <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-200">
                              {selectedParagraph.complexWords.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-cyan-200 bg-[linear-gradient(135deg,#f7fdff_0%,#eef9ff_55%,#e0f2fe_100%)] px-5 py-5 text-lg font-semibold leading-9 text-slate-900 shadow-lg shadow-cyan-200/60 dark:border-teal-800 dark:bg-gradient-to-r dark:from-teal-600 dark:to-emerald-500 dark:text-white dark:shadow-none md:px-6 md:py-6 md:text-2xl md:leading-10">
                      {isLoadingQuestion
                        ? "Loading a fresh interview question..."
                        : activePrompt}
                    </p>
                  )}
                </div>

                <div className="mt-6 rounded-[2rem] border border-dashed border-cyan-300 bg-[linear-gradient(135deg,#f8fdff_0%,#f3fbff_52%,#e7f8ff_100%)] p-6 text-center shadow-inner shadow-cyan-100/70 dark:border-teal-800 dark:bg-gradient-to-br dark:from-teal-950/30 dark:via-slate-950/60 dark:to-emerald-950/20 dark:shadow-none">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-cyan-700 shadow-lg shadow-cyan-200/70 dark:bg-slate-900 dark:text-teal-300 dark:shadow-none">
                    {isRecording ? (
                      <span className="relative flex">
                        <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-rose-400 opacity-50" />
                        <Mic size={28} className="relative z-10 text-rose-500" />
                      </span>
                    ) : (
                      <MicOff size={28} />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isRecording
                      ? "Listening to your answer..."
                      : "Use your microphone to start practice"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The transcript appears live and feedback is generated when you stop recording.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!isSupported || isRecording || isAnalyzing || isStopping}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0891b2_0%,#0ea5e9_52%,#2563eb_100%)] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                    >
                      <Mic size={18} />
                      Start Recording
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      disabled={!isRecording || isStopping}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-white px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400 dark:disabled:border-slate-800 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                    >
                      <MicOff size={18} />
                      {isStopping ? "Stopping..." : "Stop Recording"}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Gauge size={18} className="text-teal-600 dark:text-teal-300" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Live Practice Stats
                    </h3>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <MetricCard
                      icon={Clock3}
                      label="Recording Timer"
                      value={formatSeconds(durationSeconds)}
                      helper="Tracks speaking duration"
                    />
                    <MetricCard
                      icon={Gauge}
                      label="Speech Confidence"
                      value={`${confidencePercent}%`}
                      helper={getConfidenceLabel(speechConfidence)}
                    />
                    <MetricCard
                      icon={Volume2}
                      label="Status"
                      value={isRecording ? "Listening" : "Ready"}
                      helper={isRecording ? "Speech recognition is active" : "Press start to begin"}
                    />
                  </div>
                </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-teal-600 dark:text-teal-300" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Live Transcript
                </h2>
              </div>

              <div className="min-h-48 rounded-2xl border border-slate-200 bg-white/90 p-5 text-base leading-8 text-slate-700 shadow-inner dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
                {liveTranscript || (
                  <span className="text-slate-400">
                    Your speech-to-text transcript will appear here while you speak.
                  </span>
                )}
              </div>

              {(error || isAnalyzing) && (
                <div
                  className={`mt-4 rounded-2xl border p-4 text-sm ${
                    error
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
                      : "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {error ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    <span>
                      {error || "Analyzing your speech for grammar, fluency, and confidence..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="mb-4 flex items-center gap-2">
                <Brain size={18} className="text-teal-600 dark:text-teal-300" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Feedback Summary
                </h2>
              </div>

              {latestFeedback ? (
                <div className="space-y-5">
                  <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
                    <MetricCard
                      icon={Trophy}
                      label="Overall Score"
                      value={`${latestFeedback.score}/10`}
                      helper="Interview communication score"
                    />
                    <MetricCard
                      icon={Sparkles}
                      label="Grammar"
                      value={latestFeedback.grammar}
                      helper="Sentence structure and correctness"
                    />
                    <MetricCard
                      icon={Volume2}
                      label="Pronunciation"
                      value={latestFeedback.pronunciation}
                      helper="Speech clarity estimate"
                    />
                    <MetricCard
                      icon={BadgeCheck}
                      label="Confidence"
                      value={latestFeedback.confidence}
                      helper="Delivery confidence band"
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                    <MetricCard
                      icon={Volume2}
                      label="Filler Words"
                      value={`${latestMetrics.fillerWordCount ?? 0}`}
                      helper="um, uh, like, basically"
                    />
                    <MetricCard
                      icon={Clock3}
                      label="Speech Speed"
                      value={`${latestWordsPerMinute} WPM`}
                      helper="Words per minute"
                    />
                    <MetricCard
                      icon={Gauge}
                      label="Browser Confidence"
                      value={`${effectiveConfidenceScore}/10`}
                      helper="Average recognition confidence"
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-950/60">
                      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                        Detected Issues
                      </h3>
                      <div className="space-y-2">
                        {(latestFeedback.detectedIssues || []).length ? (
                          latestFeedback.detectedIssues.map((issue) => (
                            <div
                              key={issue}
                              className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                            >
                              {issue}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            No major issues were detected in this attempt.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-950/60">
                      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                        Suggestions
                      </h3>
                      <div className="space-y-2">
                        {(latestFeedback.suggestions || []).map((suggestion) => (
                          <div
                            key={suggestion}
                            className="rounded-xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                      <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <BadgeCheck size={18} />
                        <h3 className="text-lg font-semibold">Gamification</h3>
                      </div>
                      <div className="mb-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm dark:bg-slate-900 dark:text-amber-300">
                        Points earned this session: +{feedback?.pointsEarned || 0}
                      </div>
                      <div className="grid gap-3 lg:grid-cols-3">
                      <StarRow
                        label="Fluency"
                        stars={latestGamification.fluency || "N/A"}
                      />
                      <StarRow
                        label="Grammar"
                        stars={latestGamification.grammar || "N/A"}
                      />
                      <StarRow
                        label="Confidence"
                        stars={latestGamification.confidence || "N/A"}
                      />
                    </div>
                    {feedback?.badgeUnlocked ? (
                      <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm dark:bg-slate-900 dark:text-amber-300">
                        Confident Speaker badge unlocked.
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Record a paragraph or interview answer to see grammar, pronunciation,
                  confidence, filler word count, and improvement tips.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="mb-4 flex items-center gap-2">
                <Gauge size={18} className="text-teal-600 dark:text-teal-300" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Confidence Meter
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800/70">
                <div className="mb-3 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500 transition-all"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    Browser signal
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {getConfidenceLabel(speechConfidence)} ({confidencePercent}%)
                  </span>
                </div>
              </div>
            </div>
          </section>

          <AppFooter />
        </div>
      </main>
    </div>
  );
};

export default VoicePractice;
