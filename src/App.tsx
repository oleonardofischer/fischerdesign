/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import Lenis from "lenis";
import { Menu, X, ArrowUpRight, Github, Instagram, Linkedin, Mail, ArrowLeft, ChevronRight } from "lucide-react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { PROJECTS, Project } from "./constants";
import { fetchProjectsFromSheets } from "./services/sheetsService";

// --- Context for Projects ---
interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
}
const ProjectsContext = createContext<ProjectsContextType>({ projects: PROJECTS, loading: false });
export const useProjects = () => useContext(ProjectsContext);

// --- Context for Lenis ---
const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

// --- Shared Components ---

const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '#video', '?video', 'type=video', '#mp4'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const resolveGoogleDriveUrl = (url: string, forceImage = false): string => {
  if (!url) return url;
  
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    let fileId = "";
    
    // Pattern 1: /file/d/FILE_ID
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      // Pattern 2: ?id=FILE_ID or &id=FILE_ID
      const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        fileId = idParamMatch[1];
      }
    }
    
    if (fileId) {
      if (isVideo(url) && !forceImage) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  
  return url;
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const MediaRenderer = ({ url, className, isAutoPlay = true }: { url: string, className?: string, isAutoPlay?: boolean }) => {
  const resolvedUrl = resolveGoogleDriveUrl(url);
  const ytId = getYouTubeId(resolvedUrl);
  
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=${isAutoPlay ? 1 : 0}&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1`}
        className={`${className} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // If it's a Google Drive preview/iframe URL (containing /preview)
  if (resolvedUrl.includes("drive.google.com") && resolvedUrl.includes("/preview")) {
    return (
      <iframe
        src={resolvedUrl}
        className={`${className} border-0 w-full aspect-video`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }

  // If it's a Google Drive URL requesting an embedded preview iframe player explicitly
  if (url.includes("drive.google.com") && (url.toLowerCase().includes('#iframe') || url.toLowerCase().includes('#embed') || url.toLowerCase().includes('#preview'))) {
    return (
      <iframe
        src={resolvedUrl}
        className={`${className} border-0 w-full aspect-video`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }

  if (isVideo(url) || isVideo(resolvedUrl)) {
    return (
      <video
        src={resolvedUrl}
        autoPlay={isAutoPlay}
        muted
        loop
        playsInline
        className={className}
      />
    );
  }

  return (
    <img 
      src={resolvedUrl} 
      className={className} 
      referrerPolicy="no-referrer"
      alt="Media content"
    />
  );
};

const BackButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => (
  <button 
    onClick={onClick}
    className={`group flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#C8B991] hover:text-[#D9D9D9] transition-all ${className}`}
  >
    <motion.div
      animate={{ x: [0, -6, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArrowLeft size={16} />
    </motion.div>
    <span className="font-bold underline underline-offset-4 decoration-[#C8B991]/30 group-hover:decoration-current">VOLTAR</span>
  </button>
);

const DesignElement = ({ type, x, y, delay }: { type: 'rect' | 'circle' | 'triangle' | 'guide' | 'fibonacci' | 'sine' | 'angle' | 'hexagon' | 'pentagon' | 'dot' | 'dashedLine', x: number, y: number, delay: number }) => {
  const size = 12 + Math.random() * 18;
  const accentColor = "#C8B991";

  if (type === 'guide') {
    const isVertical = Math.random() > 0.5;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.05, 0] }}
        transition={{ duration: 8, delay, repeat: Infinity, repeatDelay: Math.random() * 12 }}
        className="absolute pointer-events-none font-mono text-[8px]"
        style={{ 
          left: isVertical ? `${x}%` : 0, 
          top: isVertical ? 0 : `${y}%`,
          width: isVertical ? "1px" : "100%",
          height: isVertical ? "100%" : "1px",
          backgroundColor: `${accentColor}22`
        }}
      >
        <span className="absolute p-1 text-[#C8B991] opacity-40">
          {isVertical ? `X: ${Math.round(x * 10)}px` : `Y: ${Math.round(y * 10)}px`}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: [0, 0.25, 0.25, 0], scale: [0.9, 1, 1, 1.05] }}
      transition={{ duration: 12, delay, repeat: Infinity, repeatDelay: Math.random() * 10 }}
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size * 10, height: size * 10 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        {type === 'fibonacci' && (
          <motion.path
            d="M 50 50 A 1 1 0 0 1 51 51 A 2 2 0 0 1 49 53 A 3 3 0 0 1 46 50 A 5 5 0 0 1 51 45 A 8 8 0 0 1 59 53 A 13 13 0 0 1 46 66 A 21 21 0 0 1 25 45"
            fill="transparent"
            stroke={accentColor}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 8, delay: delay + 1, repeat: Infinity }}
          />
        )}

        {type === 'sine' && (
          <motion.path
            d="M 0 50 Q 25 10 50 50 T 100 50"
            fill="transparent"
            stroke={accentColor}
            strokeWidth="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], x: [-10, 10] }}
            transition={{ duration: 6, delay: delay + 1, repeat: Infinity }}
          />
        )}

        {type === 'angle' && (
          <g>
            <motion.path d="M 10 90 L 90 90 M 10 90 L 70 20" fill="transparent" stroke={accentColor} strokeWidth="0.5" />
            <motion.path d="M 30 90 A 20 20 0 0 0 25 72" fill="transparent" stroke={accentColor} strokeWidth="0.3" strokeDasharray="1,1" />
            <text x="35" y="80" fill={accentColor} fontSize="5" className="font-mono opacity-60">48.2°</text>
          </g>
        )}

        {type === 'hexagon' && (
          <motion.path
            d="M 50 10 L 85 27.5 L 85 72.5 L 50 90 L 15 72.5 L 15 27.5 Z"
            fill="transparent"
            stroke={accentColor}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 5, delay: delay + 1, repeat: Infinity }}
          />
        )}

        {type === 'pentagon' && (
          <motion.path
            d="M 50 10 L 90 40 L 75 90 L 25 90 L 10 40 Z"
            fill="transparent"
            stroke={accentColor}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 5, delay: delay + 1, repeat: Infinity }}
          />
        )}

        {type === 'dot' && (
          <circle cx="50" cy="50" r="1.5" fill={accentColor} />
        )}

        {type === 'dashedLine' && (
          <motion.line
            x1="0" y1="50" x2="100" y2="50"
            stroke={accentColor}
            strokeWidth="0.3"
            strokeDasharray="4,4"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {(type === 'rect' || type === 'circle' || type === 'triangle') && (
          <motion.path
            d={type === 'rect' ? "M 10 10 H 90 V 90 H 10 Z" : type === 'circle' ? "M 50 50 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0" : "M 50 10 L 90 90 L 10 90 Z"}
            fill="transparent"
            stroke={accentColor}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 1] }}
            transition={{ duration: 4, delay: delay + 1 }}
          />
        )}
        
        {/* Bounding Box (Dashed) - only for shapes */}
        {type !== 'sine' && type !== 'dashedLine' && type !== 'dot' && (
          <>
            <rect x="5" y="5" width="90" height="90" fill="transparent" stroke={accentColor} strokeWidth="0.2" strokeDasharray="2,2" opacity="0.3" />
            {[[5, 5], [50, 5], [95, 5], [5, 50], [95, 50], [5, 95], [50, 95], [95, 95]].map(([hx, hy], i) => (
              <rect key={i} x={hx - 1.5} y={hy - 1.5} width="3" height="3" fill={accentColor} opacity="0.5" />
            ))}
          </>
        )}
      </svg>
    </motion.div>
  );
};

const BackgroundLines = () => {
  const [elements] = useState(() => {
    const types: ('rect' | 'circle' | 'triangle' | 'guide' | 'fibonacci' | 'sine' | 'angle' | 'hexagon' | 'pentagon' | 'dot' | 'dashedLine')[] = 
      ['rect', 'circle', 'triangle', 'guide', 'fibonacci', 'sine', 'angle', 'hexagon', 'pentagon', 'dot', 'dashedLine'];
    return [...Array(24)].map((_, i) => ({
      id: i,
      type: types[i % types.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      delay: i * 1.5,
    }));
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Refined Wave Grid Mask Effect */}
      <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect x="35" y="35" width="10" height="10" fill="#C8B991" fillOpacity="0.4" />
          </pattern>
          <mask id="waveMask">
            <motion.path
              initial={{ d: "M 0 -30 Q 25 -15 50 -30 T 100 -30 V 130 H 0 Z" }}
              animate={{ 
                d: [
                  "M 0 -40 Q 25 -20 50 -40 T 100 -40 V 140 H 0 Z",
                  "M 0 110 Q 25 130 50 110 T 100 110 V 140 H 0 Z",
                  "M 0 -40 Q 25 -20 50 -40 T 100 -40 V 140 H 0 Z"
                ]
              }}
              transition={{ 
                duration: 12, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              fill="white"
            />
          </mask>
        </defs>
        
        {/* The Grid Area - using a large rect with coordinates that ensure the mask works over the full viewport but the pattern stays fixed */}
        <rect width="100%" height="100%" fill="url(#dotGrid)" mask="url(#waveMask)" />
        
        {/* The Wave Edge (Foam Line) */}
        <motion.path
          fill="none"
          stroke="#C8B991"
          strokeWidth="1"
          opacity="0.4"
          vectorEffect="non-scaling-stroke"
          animate={{ 
            d: [
              "M 0 -40 Q 25 -20 50 -40 T 100 -40",
              "M 0 110 Q 25 130 50 110 T 100 110",
              "M 0 -40 Q 25 -20 50 -40 T 100 -40"
            ]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </svg>

      {/* Static Background Texture */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(${ "#C8B991" } 1px, transparent 0)`,
          backgroundSize: "40px 40px" 
        }} 
      />
      
      {elements.map((el) => (
        <DesignElement key={el.id} {...el} />
      ))}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12 md:mb-20">
    <motion.p
      initial={{ opacity: 0, x: -5 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="text-[10px] uppercase tracking-[0.4em] text-[#C8B991] mb-6 font-bold"
    >
      {subtitle || "SELECTED WORKS"}
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-6xl font-bold tracking-tighter"
    >
      {title}
    </motion.h2>
  </div>
);

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  return (
    <Link to={`/project/${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="group cursor-pointer relative"
      >
        <div className="overflow-hidden aspect-[4/5] bg-[#2F353C]/20 mb-8 rounded-[2rem] glass p-4">
          <div className="w-full h-full overflow-hidden rounded-[1.5rem] relative">
            <MediaRenderer url={project.imageUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8 pointer-events-none">
              <p className="text-sm text-white/80 leading-relaxed max-w-[200px]">
                {project.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start px-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-2 uppercase">{project.title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#D9D9D9]/40">{project.category}</p>
          </div>
          <span className="text-[10px] font-bold text-[#C8B991] tracking-widest">{project.year}</span>
        </div>
      </motion.div>
    </Link>
  );
};

// --- Page Components ---

const Home = () => {
  const lenis = useLenis();
  const { projects } = useProjects();
  
  useEffect(() => {
    // Scroll to top or specific section if hash exists
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element && lenis) {
        setTimeout(() => {
          lenis.scrollTo(element, { offset: -100, duration: 2 });
        }, 100);
      }
    } else {
      if (lenis) lenis.scrollTo(0, { duration: 1.5 });
    }
  }, [lenis]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section */}
      <header className="h-[90vh] flex flex-col justify-center px-6 md:px-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8B991]">2d | 3d designer</span>
            <div className="w-12 h-[1px] bg-[#C8B991]/30" />
          </div>
          <h1 className="text-6xl md:text-[min(11vw,130px)] font-bold leading-[0.9] tracking-tighter mb-12">
            design <br />
            <span className="text-outline hover:text-[#D9D9D9] transition-all duration-700 cursor-default">destaque</span> <br />
            diferenciação
          </h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8, duration: 1 }}
            className="text-sm md:text-lg text-[#D9D9D9]/50 max-w-xl leading-relaxed"
          >
            Cuidamos de marcas e negócios desde a criação do logotipo até os projetos mais complexos como editoriais, animações, simulações, catálogos digitais, infográficos...  
          </motion.p>
        </motion.div>
      </header>

      {/* Projects Grid */}
      <section id="projects" className="px-6 md:px-12 py-32 bg-[#2F353C]/10 rounded-t-[4rem]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <SectionHeader title="PROJETOS RECENTES" subtitle="Estas peças são importantes para nossos clientes, então são importantíssimas para nós!" />
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-4 text-[10px] tracking-widest uppercase text-[#D9D9D9]/40 mb-20 md:mb-0"
          >
            <span>Arraste para explorar</span>
            <div className="w-8 h-[1px] bg-[#D9D9D9]/20" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {projects.map((project, index) => (
            <div key={project.id}>
              <ProjectCard project={project} index={index} />
            </div>
          ))}
        </div>
      </section>

      {/* About / Philosophy Section */}
      <section id="philosophy" className="px-6 md:px-12 py-40 border-y border-white/5 bg-[#2F353C]/20">
        <div className="max-w-4xl">
          <SectionHeader title="Como a gente vê a sua marca?" subtitle="Nossa mente" />
          <p className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[#D9D9D9]">
            Conversamos contigo com suprema <span className="text-[#C8B991]">empatia</span>, <span className="text-[#C8B991]">precisão</span>, e com <span className="text-[#C8B991]">fino tato</span> construindo desde a prancheta juntos, até a entrega final em processos claros e sinceros.
          </p>
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "OUVIR", desc: "todas as tuas necessidades, detalhes e dores. Qual o PROBLEMA?" },
              { label: "PLANEJAR", desc: "cada ação baseada nos princípios do design, olhando a SOLUÇÃO." },
              { label: "CRIAR", desc: "Criação não é só sobre ter uma ideia. É construir o raciocínio com lógica e inteligência, baseado nos dados coletados." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl"
              >
                <h4 className="text-xs uppercase tracking-widest text-[#C8B991] mb-4">{item.label}</h4>
                <p className="text-sm text-[#D9D9D9]/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const GlowBackground = ({ src }: { src: string }) => {
  const resolvedSrc = resolveGoogleDriveUrl(src, true);
  const [loaded, setLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(resolvedSrc);

  if (resolvedSrc !== prevSrc) {
    setPrevSrc(resolvedSrc);
    setLoaded(false);
  }

  return (
    <motion.img 
      key={resolvedSrc}
      src={resolvedSrc}
      alt=""
      onLoad={() => setLoaded(true)}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 0.8 : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full object-cover filter blur-[50px]"
      referrerPolicy="no-referrer"
    />
  );
};

const ExpandableText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div 
        className={`text-base md:text-lg text-[#D9D9D9]/70 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
          isExpanded ? "" : "line-clamp-4 overflow-hidden"
        }`}
      >
        {text}
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs uppercase tracking-widest text-[#C8B991] hover:text-[#D9D9D9] font-mono border border-[#C8B991]/20 hover:border-[#C8B991]/50 rounded-full px-5 py-2.5 transition-all bg-[#2F353C]/10 hover:bg-[#2F353C]/30 flex items-center gap-2 group shadow-sm"
        >
          {isExpanded ? (
            <>
              <span>Menos</span>
              <span className="text-[10px] text-[#C8B991]/50 group-hover:text-current px-1 transition-colors">|x|</span>
              <span>Less</span>
            </>
          ) : (
            <>
              <span>Ler Mais</span>
              <span className="text-[10px] text-[#C8B991]/50 group-hover:text-current px-1 transition-colors">|+|</span>
              <span>Read More</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lenis = useLenis();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { duration: 1.2, immediate: true });
  }, [id, lenis]);

  if (!project) return <div>Project not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 md:px-12 py-32 relative"
    >
      {/* Dynamic Project Background Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      >
        <div className="absolute inset-0 grayscale-[0.3] overflow-hidden">
          <GlowBackground src={project.imageUrl} />
        </div>
        <div className="absolute inset-0 bg-[#1A1D23] opacity-40 mix-blend-multiply" />
      </motion.div>

      <BackButton onClick={() => navigate(-1)} className="mb-12" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <SectionHeader title={project.title.toUpperCase()} subtitle={project.category} />
          <div className="space-y-8">
            <p className="text-xl md:text-2xl font-semibold text-[#D9D9D9] leading-relaxed tracking-tight whitespace-pre-wrap">
              {project.description}
            </p>
            <ExpandableText text={project.detailedDescription || "This project represents a fusion of technical precision and aesthetic experimentation. The goal was to create a visual language that feels both futuristic and grounded, utilizing high-contrast lighting and deep textural depth."} />
          </div>
        </div>

        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[3rem] overflow-hidden glass p-4 w-full h-auto flex items-center justify-center"
          >
            <MediaRenderer url={project.imageUrl} className="w-full h-auto max-h-[80vh] rounded-[2.5rem] object-contain" />
          </motion.div>

          {/* Gallery items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.gallery && project.gallery.length > 0 ? (
              project.gallery.map((url, index) => (
                <div key={index} className="rounded-[2rem] overflow-hidden glass p-3 aspect-square">
                  <MediaRenderer url={url} className="w-full h-full object-cover rounded-[1.5rem]" />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 glass rounded-[2rem] opacity-30">
                <p className="text-[10px] uppercase tracking-widest">Mais detalhes em breve</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-32 pt-16 border-t border-white/5 flex justify-center">
        <BackButton onClick={() => navigate(-1)} />
      </div>
    </motion.div>
  );
};

// --- Layout & Main App ---

const sortProjects = (list: Project[]): Project[] => {
  return [...list].sort((a, b) => {
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
  });
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>(() => sortProjects(PROJECTS));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const fetchedProjects = await fetchProjectsFromSheets();
        setProjectsList(sortProjects(fetchedProjects));
      } catch (error) {
        console.error("Failed to load projects from sheets, using fallback content.", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element && lenis) {
        lenis.scrollTo(element, {
          offset: -100,
          duration: 2,
        });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <LenisContext.Provider value={lenis}>
      <ProjectsContext.Provider value={{ projects: projectsList, loading: isLoading }}>
        <div className="min-h-screen selection:bg-[#C8B991] selection:text-black bg-[#1A1D23] text-[#D9D9D9]">
      <div className="noise-overlay" />
      <BackgroundLines />
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-6 flex justify-between items-center ${
          isScrolled ? "glass py-4 translate-y-2 mx-auto w-[calc(100%-24px)] md:w-[calc(100%-48px)] rounded-2xl" : "bg-transparent"
        }`}
      >
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold tracking-tighter"
          >
            FISCHER DESIGN
          </motion.div>
        </Link>

        <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#D9D9D9]/60">
          <Link to="/#projects" onClick={(e) => handleSmoothScroll(e, 'projects')} className="hover:text-[#C8B991] transition-colors">PROJETOS</Link>
          <Link to="/#philosophy" onClick={(e) => handleSmoothScroll(e, 'philosophy')} className="hover:text-[#C8B991] transition-colors">FILOSOFIA</Link>
          <Link to="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="hover:text-[#C8B991] transition-colors">CONTATO</Link>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[#D9D9D9]"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-[#1A1D23]/90 z-40 flex flex-col justify-center items-center gap-8"
          >
            <Link to="/#projects" onClick={(e) => handleSmoothScroll(e, 'projects')} className="text-5xl font-bold tracking-tighter hover:text-[#C8B991] transition-colors">PROJETOS</Link>
            <Link to="/#philosophy" onClick={(e) => handleSmoothScroll(e, 'philosophy')} className="text-5xl font-bold tracking-tighter hover:text-[#C8B991] transition-colors">FILOSOFIA</Link>
            <Link to="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-5xl font-bold tracking-tighter hover:text-[#C8B991] transition-colors">CONTATO</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} className="relative z-10">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Contact Section (Shared Footer) */}
      <footer id="contact" className="px-6 md:px-12 py-32 relative z-10">
        <div className="glass p-12 md:p-24 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-10 w-96 h-96 bg-[#C8B991]/10 blur-[120px] rounded-full -translate-y-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12">
              PRONTO PARA <br />COMEÇAR?
            </h2>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <a 
                href="mailto:oleonardofischer@gmail.com"
                className="text-base min-[375px]:text-lg sm:text-2xl md:text-4xl font-bold tracking-tight hover:text-[#C8B991] transition-all flex items-center gap-2 sm:gap-4 group break-all sm:break-normal"
              >
                oleonardofischer@gmail.com
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
              </a>
              
              <div className="flex gap-4">
                {[Instagram, Linkedin, Github, Mail].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[#C8B991] hover:text-black transition-all"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 flex justify-between items-center text-[10px] uppercase tracking-widest text-[#D9D9D9]/30">
          <p>© 2026 FISCHER DESIGN</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#D9D9D9]">Política de Privacidade</a>
            <a href="#" className="hover:text-[#D9D9D9]">Termos de Serviço</a>
          </div>
        </div>
      </footer>
    </div>
      </ProjectsContext.Provider>
    </LenisContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
