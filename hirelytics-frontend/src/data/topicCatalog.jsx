import {
  Binary,
  BookOpen,
  Briefcase,
  Code2,
  Database,
  FileCode2,
  FolderKanban,
  GitBranch,
  GraduationCap,
  Layers3,
  Lightbulb,
  MonitorPlay,
  Users,
} from "lucide-react";
import {
  SiC,
  SiCplusplus,
  SiExpress,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiPython,
  SiReact,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";

const MernStackGlyph = ({ className = "text-white", size = 28 }) => (
  <div className={`grid grid-cols-2 gap-1 ${className}`} aria-hidden="true">
    <SiMongodb size={size * 0.48} />
    <SiExpress size={size * 0.48} />
    <SiReact size={size * 0.48} />
    <SiNodedotjs size={size * 0.48} />
  </div>
);

export const TECHNICAL_INTERVIEW_TOPICS = [
  {
    id: "javascript",
    name: "JavaScript",
    description: "Language fundamentals, ES6+, closures, and async flows",
    icon: SiJavascript,
    accent: "#facc15",
  },
  {
    id: "react",
    name: "React",
    description: "Components, hooks, rendering, and frontend architecture",
    icon: SiReact,
    accent: "#38bdf8",
  },
  {
    id: "nodejs",
    name: "Node.js",
    description: "Backend runtime, APIs, async I/O, and services",
    icon: SiNodedotjs,
    accent: "#65a30d",
  },
  {
    id: "mern",
    name: "MERN Stack",
    description: "Full-stack web development with MongoDB, Express, React, and Node",
    icon: MernStackGlyph,
    accent: "#10b981",
  },
  {
    id: "java",
    name: "Java",
    description: "OOP, collections, JVM basics, and enterprise coding patterns",
    icon: FaJava,
    accent: "#f97316",
  },
  {
    id: "python",
    name: "Python",
    description: "Core syntax, problem solving, libraries, and scripting",
    icon: SiPython,
    accent: "#60a5fa",
  },
  {
    id: "c",
    name: "C",
    description: "Pointers, memory, procedural programming, and fundamentals",
    icon: SiC,
    accent: "#94a3b8",
  },
  {
    id: "cplusplus",
    name: "C++",
    description: "STL, OOP, memory handling, and performance-oriented coding",
    icon: SiCplusplus,
    accent: "#3b82f6",
  },
  {
    id: "dbms",
    name: "SQL",
    description: "Database design, SQL, normalization, and transactions",
    icon: SiMysql,
    accent: "#06b6d4",
  },
  {
    id: "datastructures",
    name: "Data Structures",
    description: "Arrays, trees, graphs, hashing, and complexity",
    icon: GitBranch,
    accent: "#14b8a6",
  },
  {
    id: "oops",
    name: "OOPS",
    description: "Encapsulation, inheritance, polymorphism, and design",
    icon: Layers3,
    accent: "#a855f7",
  },
];

export const HR_INTERVIEW_TOPICS = [
  { id: "communication", name: "Communication", icon: Users },
  { id: "leadership", name: "Leadership", icon: Briefcase },
  { id: "conflict", name: "Conflict Handling", icon: Users },
  { id: "teamwork", name: "Teamwork", icon: Users },
  { id: "timemanagement", name: "Time Management", icon: Briefcase },
];

export const PREPARATION_CATEGORIES = [
  {
    name: "DSA",
    cardIcon: GitBranch,
    visualIcon: GitBranch,
    theme: ["#0f766e", "#14b8a6"],
  },
  {
    name: "HR",
    cardIcon: Briefcase,
    visualIcon: Briefcase,
    theme: ["#1d4ed8", "#60a5fa"],
  },
  {
    name: "Project Ideas",
    cardIcon: FolderKanban,
    visualIcon: Lightbulb,
    theme: ["#7c3aed", "#c084fc"],
  },
  {
    name: "MERN",
    cardIcon: MonitorPlay,
    visualIcon: MernStackGlyph,
    theme: ["#166534", "#4ade80"],
  },
  {
    name: "Java",
    cardIcon: GraduationCap,
    visualIcon: FaJava,
    theme: ["#9a3412", "#fb923c"],
  },
  {
    name: "JavaScript",
    cardIcon: FileCode2,
    visualIcon: SiJavascript,
    theme: ["#ca8a04", "#fde047"],
  },
  {
    name: "Python",
    cardIcon: Code2,
    visualIcon: SiPython,
    theme: ["#1d4ed8", "#60a5fa"],
  },
  {
    name: "C",
    cardIcon: Binary,
    visualIcon: SiC,
    theme: ["#334155", "#94a3b8"],
  },
  {
    name: "C++",
    cardIcon: Binary,
    visualIcon: SiCplusplus,
    theme: ["#1d4ed8", "#60a5fa"],
  },
  {
    name: "SQL",
    cardIcon: Database,
    visualIcon: SiMysql,
    theme: ["#0f766e", "#2dd4bf"],
  },
  {
    name: "OOPS",
    cardIcon: Layers3,
    visualIcon: Layers3,
    theme: ["#6d28d9", "#a78bfa"],
  },
  {
    name: "Important Programs",
    cardIcon: Code2,
    visualIcon: BookOpen,
    theme: ["#be123c", "#fb7185"],
  },
];

export const PREPARATION_CATEGORY_NAMES = PREPARATION_CATEGORIES.map(
  (category) => category.name,
);

export const PREPARATION_CATEGORY_MAP = Object.fromEntries(
  PREPARATION_CATEGORIES.map((category) => [category.name, category]),
);
