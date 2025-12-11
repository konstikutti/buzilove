import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Heart,
  MapPin,
  Plus,
  Image as ImageIcon,
  Layout,
  Type,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  Maximize2,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Play,
  Palette,
  Minus,
  Quote,
  PanelLeft,
  PanelRight,
  Maximize,
  BoxSelect,
  Columns,
  ArrowRight as ArrowRightIcon,
  Database,
  ArrowLeft as ArrowLeftIcon,
  ZoomIn,
  X,
  Camera,
  Move,
  Star,
} from "lucide-react";

// --- Firebase Konfiguration ---
// WICHTIG: Ersetze dies mit deinen ECHTEN Daten von der Firebase-Konsole
const firebaseConfig = {
  apiKey: "AIzaSyAB1iMD8eqVJIgFOW5OLJP0v3SPF02RIVc",
  authDomain: "buzi-tagebuch.firebaseapp.com",
  projectId: "buzi-tagebuch",
  storageBucket: "buzi-tagebuch.firebasestorage.app",
  messagingSenderId: "1090406194300",
  appId: "1:1090406194300:web:f48ff12c0ec1248a2d3df9",
  measurementId: "G-5R85SV3KXC",
};

// --- Firebase Initialisierung ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = "buzi-tagebuch-live";

// --- Konstanten & Design ---
const ACCENT_COLORS = [
  { id: "indigo", name: "Sophie-Lila", hex: "#6366f1", class: "indigo" },
  { id: "rose", name: "Buzi-Pink", hex: "#e11d48", class: "rose" },
  { id: "emerald", name: "Konstantin-Grün", hex: "#059669", class: "emerald" },
  { id: "amber", name: "Gold", hex: "#d97706", class: "amber" },
  { id: "slate", name: "Dark Mode", hex: "#0f172a", class: "slate" },
  { id: "cyan", name: "Cyan", hex: "#06b6d4", class: "cyan" },
];

const BG_STYLES = [
  {
    id: "clean",
    name: "Clean",
    desc: "Weiß",
    css: "bg-white border-slate-200",
  },
  {
    id: "soft",
    name: "Soft",
    desc: "Verlauf",
    css: "bg-gradient-to-br from-white via-indigo-50/50 to-white border-indigo-100",
  },
  {
    id: "mesh",
    name: "Mesh",
    desc: "Nebel",
    css: "bg-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-100/20 to-transparent border-purple-100",
  },
];

// --- Helfer: Sicheres Datum (Verhindert "Invalid Date") ---
const formatDateSafe = (dateInput) => {
  if (!dateInput) return "";
  try {
    // Wenn es ein Firestore Timestamp ist (hat .toDate())
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);

    // Prüfen ob das Datum gültig ist
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

// --- Helfer: Intelligente Bildkomprimierung ---
const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 1. Skalierung
        if (width > maxWidth) {
          const scaleSize = maxWidth / width;
          width = maxWidth;
          height = height * scaleSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let dataUrl = canvas.toDataURL("image/jpeg", currentQuality);

        while (dataUrl.length > 950000 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
        }

        if (dataUrl.length > 950000) {
          const scale = 0.5;
          canvas.width = width * scale;
          canvas.height = height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        }

        resolve(dataUrl);
      };
    };
  });
};

// --- DATA LOGIC ---

const fetchAssets = async (assetIds) => {
  if (!assetIds || assetIds.length === 0) return [];

  const promises = assetIds.map(async (id) => {
    if (id.startsWith("data:") || id.startsWith("http")) return id;
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "memory_assets",
        id
      );
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) return snapshot.data().imageData;
      return null;
    } catch (e) {
      console.error("Bildfehler:", id);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean);
};

const hydrateBlocks = (blocks, images) => {
  if (!blocks) return [];
  return blocks.map((block) => {
    const newBlock = { ...block };
    const resolveContent = (content) => {
      if (typeof content === "string" && content.startsWith("IMG_REF_")) {
        const index = parseInt(content.replace("IMG_REF_", ""), 10);
        return images[index] || "";
      }
      return content;
    };
    if (block.type === "image" || block.type === "image-pair") {
      newBlock.content = resolveContent(block.content);
      if (block.content2) newBlock.content2 = resolveContent(block.content2);
    }
    return newBlock;
  });
};

const dehydrateBlocks = (blocks, images) => {
  return blocks.map((block) => {
    const newBlock = { ...block };
    const makeRef = (content) => {
      const index = images.indexOf(content);
      if (index !== -1) return `IMG_REF_${index}`;
      return content;
    };
    if (block.type === "image" || block.type === "image-pair") {
      if (block.content && block.content.length > 100)
        newBlock.content = makeRef(block.content);
      if (block.content2 && block.content2.length > 100)
        newBlock.content2 = makeRef(block.content2);
    }
    return newBlock;
  });
};

// --- Components ---

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  style = {},
}) => {
  const base =
    "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const vars = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    icon: "p-2 aspect-square text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${vars[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  name,
  error,
}) => (
  <div className="mb-4 w-full">
    {label && (
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
    )}
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-slate-700 ${
        error
          ? "border-red-300 focus:ring-red-200 bg-red-50"
          : "border-slate-200 focus:ring-indigo-500"
      }`}
    />
  </div>
);

const DraggableImage = ({
  src,
  position = "center",
  onPositionChange,
  className,
}) => {
  const imgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = (e) => {
    if (!isDragging || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    onPositionChange(`${x.toFixed(0)}% ${y.toFixed(0)}%`);
  };
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div
      className={`relative overflow-hidden cursor-move group ${className}`}
      ref={imgRef}
      onMouseDown={handleMouseDown}
    >
      <img
        src={src}
        className="w-full h-full object-cover pointer-events-none select-none"
        style={{ objectPosition: position }}
        alt=""
      />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 shadow-lg font-bold">
          <Move size={12} /> Ziehen
        </div>
      </div>
    </div>
  );
};

// --- EDITOR & VIEWER ---

const BlockEditor = ({ blocks, onChange, uploadedImages }) => {
  const addBlock = (type) =>
    onChange([
      ...blocks,
      {
        id: Date.now(),
        type,
        content: "",
        content2: "",
        animation: "none",
        align: "left",
        layout: "center",
        imgStyle: "rounded",
        focus: "50% 50%",
        focus2: "50% 50%",
      },
    ]);
  const updateBlock = (id, upd) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...upd } : b)));
  const removeBlock = (id) => onChange(blocks.filter((b) => b.id !== id));

  const moveBlock = (idx, dir) => {
    const arr = [...blocks];
    if (dir === "up" && idx > 0)
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    if (dir === "down" && idx < arr.length - 1)
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onChange(arr);
  };

  const ImageSelector = ({ current, onSelect }) => (
    <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin">
      {uploadedImages.map((img, i) => (
        <div
          key={i}
          onClick={() => onSelect(img)}
          className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
            current === img
              ? "border-indigo-500 ring-2 ring-indigo-200"
              : "border-transparent"
          }`}
        >
          <img src={img} className="w-full h-full object-cover" />
        </div>
      ))}
      {uploadedImages.length === 0 && (
        <span className="text-xs text-slate-400">Erst Bilder hochladen.</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div
          key={block.id}
          className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-all"
        >
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur p-1 rounded-lg border border-slate-100 shadow-sm z-20">
            <Button
              variant="icon"
              className="!p-1 h-6 w-6"
              onClick={() => moveBlock(i, "up")}
              disabled={i === 0}
            >
              <ChevronUp size={14} />
            </Button>
            <Button
              variant="icon"
              className="!p-1 h-6 w-6"
              onClick={() => moveBlock(i, "down")}
              disabled={i === blocks.length - 1}
            >
              <ChevronDown size={14} />
            </Button>
            <div className="w-px bg-slate-200 mx-1"></div>
            <Button
              variant="icon"
              className="!p-1 h-6 w-6 text-red-500 hover:bg-red-50"
              onClick={() => removeBlock(block.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-slate-50 pb-2">
            <div className="relative">
              <select
                value={block.animation || "none"}
                onChange={(e) =>
                  updateBlock(block.id, { animation: e.target.value })
                }
                className="appearance-none bg-slate-50 text-xs font-medium text-slate-600 pl-6 pr-2 py-1 rounded border hover:border-slate-300"
              >
                <option value="none">Keine Anim</option>
                <option value="fade-in">Fade</option>
                <option value="slide-up">Slide</option>
                <option value="zoom-in">Zoom</option>
              </select>
              <Play
                size={10}
                className="absolute left-2 top-1.5 text-slate-400"
              />
            </div>
            {["header", "text", "quote"].includes(block.type) && (
              <div className="flex bg-slate-50 rounded border p-0.5">
                <button
                  onClick={() => updateBlock(block.id, { align: "left" })}
                  className={`p-1 rounded ${
                    block.align === "left"
                      ? "bg-white shadow text-black"
                      : "text-slate-400"
                  }`}
                >
                  <AlignLeft size={12} />
                </button>
                <button
                  onClick={() => updateBlock(block.id, { align: "center" })}
                  className={`p-1 rounded ${
                    block.align === "center"
                      ? "bg-white shadow text-black"
                      : "text-slate-400"
                  }`}
                >
                  <AlignCenter size={12} />
                </button>
                <button
                  onClick={() => updateBlock(block.id, { align: "right" })}
                  className={`p-1 rounded ${
                    block.align === "right"
                      ? "bg-white shadow text-black"
                      : "text-slate-400"
                  }`}
                >
                  <AlignRight size={12} />
                </button>
              </div>
            )}
            {block.type === "image" && (
              <div className="flex bg-slate-50 rounded border p-0.5">
                <button
                  onClick={() => updateBlock(block.id, { layout: "left" })}
                  className={`p-1 rounded ${
                    block.layout === "left"
                      ? "bg-white shadow text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  <PanelLeft size={12} />
                </button>
                <button
                  onClick={() => updateBlock(block.id, { layout: "center" })}
                  className={`p-1 rounded ${
                    block.layout === "center"
                      ? "bg-white shadow text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  <BoxSelect size={12} />
                </button>
                <button
                  onClick={() => updateBlock(block.id, { layout: "right" })}
                  className={`p-1 rounded ${
                    block.layout === "right"
                      ? "bg-white shadow text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  <PanelRight size={12} />
                </button>
                <button
                  onClick={() => updateBlock(block.id, { layout: "full" })}
                  className={`p-1 rounded ${
                    block.layout === "full"
                      ? "bg-white shadow text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  <Maximize size={12} />
                </button>
              </div>
            )}
          </div>

          {block.type === "header" && (
            <input
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Überschrift..."
              className={`w-full text-xl font-bold bg-transparent border-none focus:ring-0 px-0 text-${block.align}`}
            />
          )}
          {block.type === "text" && (
            <textarea
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Erzähl die Story..."
              className={`w-full min-h-[80px] bg-transparent border-none focus:ring-0 resize-none px-0 text-${block.align}`}
            />
          )}
          {block.type === "quote" && (
            <div className="bg-slate-50 p-4 rounded border-l-4 border-indigo-200">
              <textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                placeholder="Insider / Zitat..."
                className="w-full bg-transparent italic text-lg border-none focus:ring-0 text-center"
              />
            </div>
          )}
          {block.type === "divider" && (
            <div className="flex justify-center text-slate-300 py-2">
              <Minus /> ● <Minus />
            </div>
          )}
          {block.type === "note" && (
            <div className="bg-amber-50 p-3 rounded border border-amber-100">
              <textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                placeholder="Randnotiz..."
                className="w-full bg-transparent text-amber-900 border-none focus:ring-0 text-sm"
              />
            </div>
          )}

          {block.type === "image" && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                Bild
              </label>
              <ImageSelector
                current={block.content}
                onSelect={(img) => updateBlock(block.id, { content: img })}
              />
              {block.content && (
                <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-2 rounded">
                  <DraggableImage
                    src={block.content}
                    position={block.focus || "50% 50%"}
                    onPositionChange={(pos) =>
                      updateBlock(block.id, { focus: pos })
                    }
                    className="h-48 w-full rounded border border-slate-200"
                  />
                  <input
                    value={block.caption || ""}
                    onChange={(e) =>
                      updateBlock(block.id, { caption: e.target.value })
                    }
                    placeholder="Bildunterschrift..."
                    className="text-xs bg-white border p-2 rounded w-full"
                  />
                </div>
              )}
            </div>
          )}

          {block.type === "image-pair" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 block mb-2 font-bold">
                  Links
                </span>
                <ImageSelector
                  current={block.content}
                  onSelect={(img) => updateBlock(block.id, { content: img })}
                />
                {block.content ? (
                  <div className="mt-2">
                    <DraggableImage
                      src={block.content}
                      position={block.focus || "50% 50%"}
                      onPositionChange={(pos) =>
                        updateBlock(block.id, { focus: pos })
                      }
                      className="h-32 w-full rounded border border-slate-200"
                    />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center border-dashed border-2 rounded text-slate-300">
                    <ImageIcon />
                  </div>
                )}
              </div>
              <div className="p-3 border rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 block mb-2 font-bold">
                  Rechts
                </span>
                <ImageSelector
                  current={block.content2}
                  onSelect={(img) => updateBlock(block.id, { content2: img })}
                />
                {block.content2 ? (
                  <div className="mt-2">
                    <DraggableImage
                      src={block.content2}
                      position={block.focus2 || "50% 50%"}
                      onPositionChange={(pos) =>
                        updateBlock(block.id, { focus2: pos })
                      }
                      className="h-32 w-full rounded border border-slate-200"
                    />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center border-dashed border-2 rounded text-slate-300">
                    <ImageIcon />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-dashed">
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs"
          onClick={() => addBlock("header")}
        >
          <Type size={14} /> Titel
        </Button>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs"
          onClick={() => addBlock("text")}
        >
          <AlignLeft size={14} /> Text
        </Button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs text-blue-600"
          onClick={() => addBlock("image")}
        >
          <ImageIcon size={14} /> Bild
        </Button>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs text-blue-600"
          onClick={() => addBlock("image-pair")}
        >
          <Columns size={14} /> 2 Bilder
        </Button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs text-purple-600"
          onClick={() => addBlock("quote")}
        >
          <Quote size={14} /> Zitat
        </Button>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs"
          onClick={() => addBlock("divider")}
        >
          <Minus size={14} /> Linie
        </Button>
        <Button
          variant="secondary"
          className="!px-2 !py-1 text-xs text-amber-600"
          onClick={() => addBlock("note")}
        >
          <MessageSquare size={14} /> Notiz
        </Button>
      </div>
    </div>
  );
};

const ImageManager = ({ images, onChange, coverImage, onSetCover }) => {
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoading(true);
    const newImgs = [];
    for (const f of files) {
      const data = await compressImage(f, 1600, 0.8);
      newImgs.push(data);
    }
    onChange([...images, ...newImgs]);
    setLoading(false);
    fileInput.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInput.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInput}
          onChange={handleFiles}
        />
        {loading ? (
          <Loader2 className="animate-spin text-indigo-500 mb-2" />
        ) : (
          <Upload className="text-slate-400 mb-2" />
        )}
        <span className="text-sm font-medium text-slate-600">
          {loading ? "Verarbeite..." : "Fotos hochladen (High Quality)"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              img === coverImage
                ? "border-amber-400 ring-2 ring-amber-100"
                : "border-transparent bg-slate-100"
            }`}
          >
            <img src={img} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(images.filter((_, idx) => idx !== i));
                  if (coverImage === img) onSetCover(null);
                }}
                className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 hover:text-red-500"
                title="Löschen"
              >
                <X size={12} />
              </button>

              <button
                onClick={() => onSetCover(img)}
                className={`absolute bottom-1 right-1 p-1.5 rounded-full shadow transition-all ${
                  img === coverImage
                    ? "bg-amber-400 text-white opacity-100"
                    : "bg-white text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                }`}
                title="Als Titelbild"
              >
                <Star
                  size={12}
                  fill={img === coverImage ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- RENDERER ---
const BlockRenderer = ({ blocks, theme, accentHex }) => {
  if (!blocks || !blocks.length) return null;
  const getAnim = (a) =>
    a === "fade-in"
      ? "animate-fade-in"
      : a === "slide-up"
      ? "animate-slide-up"
      : a === "zoom-in"
      ? "animate-zoom-in"
      : "";

  const getLayoutClasses = (layout, style) => {
    let classes = "my-6 relative ";
    let imgStyle = "w-full object-cover ";
    if (layout === "full") {
      classes += "w-full block clear-both md:-mx-12 md:w-[calc(100%+6rem)]";
      imgStyle += "rounded-lg md:rounded-none h-[300px] md:h-[600px]";
    } else if (layout === "left") {
      classes += "float-left w-1/2 md:w-5/12 mr-6 mb-4 clear-left";
      imgStyle += "rounded-2xl shadow-md";
    } else if (layout === "right") {
      classes += "float-right w-1/2 md:w-5/12 ml-6 mb-4 clear-right";
      imgStyle += "rounded-2xl shadow-md";
    } else {
      classes += "w-full block clear-both";
      imgStyle += "rounded-2xl shadow-md";
    }

    if (style === "circle") imgStyle += " rounded-full aspect-square";
    if (style === "frame") imgStyle += " p-2 bg-white border shadow-md";
    return { classes, imgStyle };
  };

  return (
    <div className="space-y-6 flow-root">
      {blocks.map((b) => (
        <div
          key={b.id}
          className={`${getAnim(b.animation)} ${
            ["text", "header", "quote", "divider"].includes(b.type)
              ? "clear-both"
              : ""
          } text-${b.align || "left"}`}
        >
          {b.type === "header" && (
            <h3
              className={`text-2xl font-bold mb-4 pt-4 leading-tight ${
                theme === "cinema" ? "text-white italic" : "text-slate-900"
              }`}
            >
              {b.content}
            </h3>
          )}
          {b.type === "text" && (
            <p
              className={`whitespace-pre-wrap leading-relaxed mb-4 ${
                theme === "cinema" ? "text-slate-300" : "text-slate-700 text-lg"
              }`}
            >
              {b.content}
            </p>
          )}
          {b.type === "quote" && (
            <blockquote
              className={`text-3xl italic text-center font-serif py-8 ${
                theme === "cinema" ? "text-white" : "text-slate-800"
              }`}
              style={{ color: theme !== "cinema" ? accentHex : undefined }}
            >
              "{b.content}"
            </blockquote>
          )}
          {b.type === "divider" && (
            <div className="flex justify-center opacity-30 py-8">
              <div className="h-px w-20 bg-current"></div>
            </div>
          )}
          {b.type === "note" && (
            <div
              className={`p-6 my-6 rounded-r-lg border-l-4 ${
                theme === "cinema"
                  ? "bg-white/10 border-amber-500 text-amber-400"
                  : "bg-amber-50 border-amber-400 text-amber-900"
              }`}
            >
              {b.content}
            </div>
          )}

          {b.type === "image" &&
            b.content &&
            (() => {
              const { classes, imgStyle } = getLayoutClasses(
                b.layout,
                b.imgStyle
              );
              return (
                <figure className={classes}>
                  <img
                    src={b.content}
                    className={imgStyle}
                    style={{ objectPosition: b.focus || "50% 50%" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  {b.caption && (
                    <figcaption className="text-center text-xs text-slate-500 mt-2 italic">
                      {b.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })()}

          {b.type === "image-pair" && (
            <div className="grid grid-cols-2 gap-4 my-8 clear-both">
              <img
                src={b.content || "https://via.placeholder.com/400"}
                className={`w-full aspect-[4/3] object-cover ${
                  b.imgStyle === "circle"
                    ? "rounded-full"
                    : "rounded-2xl shadow-md"
                }`}
                style={{ objectPosition: b.focus || "50% 50%" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <img
                src={b.content2 || "https://via.placeholder.com/400"}
                className={`w-full aspect-[4/3] object-cover ${
                  b.imgStyle === "circle"
                    ? "rounded-full"
                    : "rounded-2xl shadow-md"
                }`}
                style={{ objectPosition: b.focus2 || "50% 50%" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              {b.caption && (
                <div className="col-span-2 text-center text-xs text-slate-500 italic">
                  {b.caption}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- VIEWS ---
const MemoryDetail = ({ memory, onBack, onEdit, isAuthor }) => {
  const [hydratedImages, setHydratedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (memory.images && memory.images.length > 0) {
        const assets = await fetchAssets(memory.images);
        setHydratedImages(assets);
      } else if (memory.imageUrl) {
        setHydratedImages([memory.imageUrl]);
      }
      setLoadingImages(false);
    };
    load();
  }, [memory]);

  const contentBlocks = loadingImages
    ? []
    : memory.blocks
    ? hydrateBlocks(memory.blocks, hydratedImages)
    : [{ id: 1, type: "text", content: memory.content || "" }];
  const accent =
    ACCENT_COLORS.find((c) => c.id === memory.accentColor) || ACCENT_COLORS[1];
  const isHeroFull = memory.heroStyle === "full";

  const getBg = () => {
    if (memory.theme === "cinema") return "bg-black text-white";
    if (memory.theme === "polaroid") return "bg-[#f0f0f0]";
    if (memory.theme === "journal") return "bg-[#fdfbf7]";
    if (memory.bgStyle === "soft")
      return `bg-gradient-to-br from-white via-${accent.class}-50/30 to-white`;
    return "bg-white";
  };

  const formatDate = (date) => {
    return formatDateSafe(date);
  };

  if (loadingImages)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );

  return (
    <div className={`min-h-screen ${getBg()}`}>
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImg((prev) =>
                prev > 0 ? prev - 1 : hydratedImages.length - 1
              );
            }}
          >
            <ChevronLeft size={48} />
          </button>
          <img
            src={hydratedImages[activeImg]}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImg((prev) =>
                prev < hydratedImages.length - 1 ? prev + 1 : 0
              );
            }}
          >
            <ChevronRight size={48} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-medium tracking-widest text-sm bg-black/50 px-4 py-1 rounded-full">
            {activeImg + 1} / {hydratedImages.length}
          </div>
        </div>
      )}

      <div
        className={`relative w-full ${
          isHeroFull
            ? "h-[70vh]"
            : "h-[50vh] max-w-6xl mx-auto mt-6 rounded-3xl overflow-hidden shadow-2xl"
        }`}
      >
        {hydratedImages.length > 0 ? (
          <div
            className="relative w-full h-full group cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={hydratedImages[activeImg]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                <Maximize2 size={32} />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <ImageIcon className="text-slate-300" size={64} />
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft />
            </Button>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            {isAuthor && (
              <Button
                variant="primary"
                style={{ backgroundColor: accent.hex }}
                onClick={() => onEdit(memory)}
                className="!py-2 !px-4 text-sm border-none"
              >
                Bearbeiten
              </Button>
            )}
          </div>
        </div>

        {isHeroFull && (
          <div className="absolute bottom-0 w-full p-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <div className="max-w-4xl mx-auto text-white">
              <h1 className="text-5xl font-bold mb-2">{memory.title}</h1>
              <div className="flex gap-4 opacity-80">
                <MapPin size={16} /> {memory.location}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`max-w-4xl mx-auto px-6 py-12 ${
          !isHeroFull ? "-mt-12 relative z-20" : ""
        }`}
      >
        <div
          className={`${
            !isHeroFull
              ? "bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/50"
              : ""
          }`}
        >
          {!isHeroFull && (
            <div className="mb-12 border-b pb-8">
              <div
                className="flex gap-2 text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: accent.hex }}
              >
                {memory.location} • {formatDate(memory.date)}
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                {memory.title}
              </h1>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: accent.hex }}
                >
                  {memory.author[0]}
                </div>
                <span className="font-bold text-slate-900">
                  {memory.author}
                </span>
              </div>
            </div>
          )}
          <BlockRenderer
            blocks={contentBlocks}
            theme={memory.theme}
            accentHex={accent.hex}
          />

          {hydratedImages.length > 1 && (
            <div className="mt-16 pt-8 border-t">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                Galerie ({hydratedImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hydratedImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImg(i);
                      setIsLightboxOpen(true);
                    }}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "ring-2 ring-offset-2"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: activeImg === i ? accent.hex : "transparent",
                      "--tw-ring-color": accent.hex,
                    }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white drop-shadow-md" size={24} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

const ThemeSelector = ({ selected, onSelect }) => {
  const themes = [
    { id: "modern", name: "Modern", icon: <Layout size={18} />, desc: "Clean" },
    {
      id: "polaroid",
      name: "Polaroid",
      icon: <Camera size={18} />,
      desc: "Retro",
    },
    {
      id: "cinema",
      name: "Cinema",
      icon: <ImageIcon size={18} />,
      desc: "Dark",
    },
    {
      id: "journal",
      name: "Journal",
      icon: <Type size={18} />,
      desc: "Classic",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            selected === theme.id
              ? "border-slate-900 bg-slate-900 text-white shadow-lg"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          <div className="mb-1">{theme.icon}</div>
          <div className="text-[10px] uppercase font-bold tracking-wide">
            {theme.name}
          </div>
        </button>
      ))}
    </div>
  );
};

const MemoryCard = ({ memory, onClick }) => {
  const { title, author, date, theme, location, blocks } = memory;
  // Hydrate images for preview (fallback empty if none)
  const images = memory.images || [];
  const previewImage =
    memory.previewImage || (images.length > 0 ? images[0] : "");

  // Extract text for preview
  const getPreviewContent = () => {
    if (!blocks) return "";
    const hydrated = hydrateBlocks(blocks, images);
    const textBlock = hydrated.find(
      (b) =>
        (b.type === "text" || b.type === "note" || b.type === "quote") &&
        b.content &&
        b.content.trim().length > 0
    );
    return textBlock ? textBlock.content : "";
  };
  const previewText = getPreviewContent();

  const formatDate = (timestamp) => {
    return formatDateSafe(timestamp);
  };

  const Container = ({ children, className }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer transform transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );

  // THEME: POLAROID
  if (theme === "polaroid") {
    return (
      <Container className="group relative">
        <div className="bg-white p-4 pb-8 shadow-md rotate-1 group-hover:rotate-0 transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-slate-100 relative z-10">
          <div className="aspect-square bg-slate-100 mb-4 overflow-hidden filter sepia-[.3] relative">
            {previewImage ? (
              <img src={previewImage} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300">
                <Camera size={32} />
              </div>
            )}
          </div>
          <div className="px-2">
            <h3 className="font-handwriting text-2xl text-slate-800 mb-2 font-bold">
              {title}
            </h3>
            <div className="flex justify-between items-center text-slate-400 font-handwriting text-sm mt-4">
              <span>{location}</span>
              <span>{formatDate(date)}</span>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // THEME: CINEMA
  if (theme === "cinema") {
    return (
      <Container className="relative rounded-xl overflow-hidden shadow-lg group bg-black aspect-[4/3]">
        <div className="absolute inset-0">
          {previewImage && (
            <img
              src={previewImage}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        <div className="absolute bottom-0 w-full p-6">
          <div className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-1">
            {location}
          </div>
          <h3 className="text-2xl font-serif italic text-white mb-2 leading-none">
            {title}
          </h3>
          <div className="text-white/60 text-xs">{formatDate(date)}</div>
        </div>
      </Container>
    );
  }

  // THEME: JOURNAL
  if (theme === "journal") {
    return (
      <Container className="bg-[#fdfbf7] p-6 rounded-sm shadow-sm border border-slate-200 hover:shadow-md group">
        <div className="border-b-2 border-slate-800 pb-2 mb-4">
          <div className="text-[10px] font-serif italic text-slate-500 text-center">
            {formatDate(date)}
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 text-center leading-tight mt-1">
            {title}
          </h3>
        </div>
        {previewImage && (
          <div className="h-40 grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden mb-4">
            <img src={previewImage} className="w-full h-full object-cover" />
          </div>
        )}
        {/* Conditional rendering for preview text */}
        {previewText && (
          <p className="font-serif text-sm text-slate-700 leading-snug line-clamp-3 text-justify">
            {previewText}
          </p>
        )}
      </Container>
    );
  }

  // THEME: MODERN (Default)
  return (
    <Container className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl group border border-slate-100 h-full flex flex-col">
      <div className="relative">
        {previewImage ? (
          <div className="h-56 overflow-hidden">
            <img
              src={previewImage}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-56 bg-slate-100 flex items-center justify-center text-slate-300">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {formatDate(date)}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
          <MapPin size={14} /> {location}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
          {title}
        </h3>
        {/* Conditional rendering for preview text */}
        {previewText && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {previewText}
          </p>
        )}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {author.charAt(0)}
          </div>
          <span className="text-sm text-slate-500">{author}</span>
        </div>
      </div>
    </Container>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  // Editor State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    content: "",
    theme: "modern",
    accentColor: "indigo",
    bgStyle: "clean",
    heroStyle: "compact",
    images: [],
    blocks: [],
    date: new Date().toISOString().split("T")[0],
    coverImage: "", // NEU: Speichert das ausgewählte Titelbild
  });
  const [isSaving, setIsSaving] = useState(false);

  // Detail State
  const [selectedMemory, setSelectedMemory] = useState(null);

  // Helper to open detail and switch view
  const openDetail = (memory) => {
    setSelectedMemory(memory);
    setView("detail");
  };

  useEffect(() => {
    const init = async () => {
      await signInAnonymously(auth);
    };
    init();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "memories")
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setMemories(data);
    });
  }, [user]);

  // Actions
  const handleLogin = (e) => {
    e.preventDefault();
    const usernameInput = e.target.elements.username;
    const codeInput = e.target.elements.code;
    const name = usernameInput ? usernameInput.value : "";
    const code = codeInput ? codeInput.value : "";

    if (code !== "buzilove") {
      setLoginError("Falscher Geheimcode!");
      return;
    }

    if (name.trim() && user) {
      updateProfile(user, { displayName: name }).then(() => {
        setUser({ ...user, displayName: name });
        setView("home");
      });
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      location: "",
      content: "",
      theme: "modern",
      accentColor: "indigo",
      bgStyle: "clean",
      heroStyle: "compact",
      images: [],
      blocks: [{ id: 1, type: "text", content: "" }],
      date: new Date().toISOString().split("T")[0],
      coverImage: "",
    });
    setView("editor");
  };

  const startEdit = async (memory) => {
    setEditingId(memory.id);
    setIsSaving(true); // Short loading indicator while fetching assets

    // Load real images to edit
    let imgs = memory.images || [];
    if (imgs.length > 0 && !imgs[0].startsWith("data:")) {
      imgs = await fetchAssets(imgs);
    }

    // Hydrate blocks with real images for the editor
    const editableBlocks = memory.blocks
      ? hydrateBlocks(memory.blocks, imgs)
      : [{ id: 1, type: "text", content: memory.content || "" }];

    setFormData({
      ...memory,
      images: imgs,
      blocks: editableBlocks,
      date: memory.date?.toDate
        ? memory.date.toDate().toISOString().split("T")[0]
        : memory.date,
      coverImage: memory.coverImage || "", // Ensure cover image is loaded
    });
    setIsSaving(false);
    setView("editor");
  };

  const handleSave = async () => {
    if (!formData.title) return alert("Titel fehlt!");
    setIsSaving(true);

    try {
      // 1. Create Preview Thumbnail (High Quality now)
      // Use selected COVER image, otherwise first image
      const sourceImage =
        formData.coverImage ||
        (formData.images.length > 0 ? formData.images[0] : null);

      let previewImage = "";
      if (sourceImage) {
        const blob = await fetch(sourceImage).then((r) => r.blob());
        // Increased quality for dashboard preview
        previewImage = await compressImage(blob, 800, 0.7);
      }

      // 2. Upload Large Images to separate docs & Get IDs
      const imageIds = [];
      for (const imgData of formData.images) {
        if (imgData.startsWith("data:")) {
          const assetDoc = await addDoc(
            collection(
              db,
              "artifacts",
              appId,
              "public",
              "data",
              "memory_assets"
            ),
            {
              imageData: imgData,
              createdAt: serverTimestamp(),
            }
          );
          imageIds.push(assetDoc.id);
        } else {
          const assetDoc = await addDoc(
            collection(
              db,
              "artifacts",
              appId,
              "public",
              "data",
              "memory_assets"
            ),
            {
              imageData: imgData,
              createdAt: serverTimestamp(),
            }
          );
          imageIds.push(assetDoc.id);
        }
      }

      // 3. Dehydrate Blocks
      const savedBlocks = dehydrateBlocks(formData.blocks, formData.images);

      const payload = {
        title: formData.title,
        location: formData.location,
        date: new Date(formData.date),
        author: user.displayName,
        theme: formData.theme,
        accentColor: formData.accentColor,
        bgStyle: formData.bgStyle,
        heroStyle: formData.heroStyle,
        images: imageIds, // Store IDs only
        previewImage: previewImage, // Good quality thumb from selected cover
        blocks: savedBlocks,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "memories", editingId),
          payload
        );
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "memories"),
          payload
        );
      }
      setView("home");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Löschen?")) {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "memories", editingId)
      );
      setView("home");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">Laden...</div>
    );

  if (view === "login")
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">BUZI Tagebuch</h1>
          <p className="text-slate-500 mb-6">Für Sophie & Konstantin.</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input name="username" placeholder="Wer bist du?" />
            <Input
              name="code"
              type="password"
              placeholder="Geheimcode"
              error={!!loginError}
            />
            {loginError && (
              <p className="text-red-500 text-sm font-medium animate-pulse">
                {loginError}
              </p>
            )}
            <Button type="submit" className="w-full">
              Eintreten
            </Button>
          </form>
        </div>
      </div>
    );

  if (view === "editor")
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50">
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={() => setView("home")}>
              <ChevronLeft />
            </Button>
            <h2 className="font-bold">Eintrag bearbeiten</h2>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-xs text-slate-400 mr-2 flex items-center gap-1">
              <Database size={12} /> Bilder werden extern gespeichert
            </div>
            {editingId && (
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 size={16} />
              </Button>
            )}
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Speichere...
                </>
              ) : (
                "Veröffentlichen"
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
          <div className="w-full lg:w-2/3 space-y-8 pb-20">
            <section className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Titel"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Input
                  label="Datum"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <Input
                label="Ort"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </section>
            <section className="bg-white p-8 rounded-2xl shadow-sm ring-4 ring-slate-100">
              <BlockEditor
                blocks={formData.blocks}
                onChange={(b) => setFormData({ ...formData, blocks: b })}
                uploadedImages={formData.images}
              />
            </section>
            <section className="bg-white p-6 rounded-2xl shadow-sm">
              <ImageManager
                images={formData.images}
                onChange={(i) => setFormData({ ...formData, images: i })}
                coverImage={formData.coverImage}
                onSetCover={(img) =>
                  setFormData({ ...formData, coverImage: img })
                }
              />
            </section>
          </div>
          <div className="w-full lg:w-1/3 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Palette size={14} /> Design
              </h3>

              {/* VORSCHAU-BEREICH FÜR DESIGN */}
              <div className="space-y-6">
                {/* 1. Akzentfarbe */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Akzentfarbe
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          setFormData({ ...formData, accentColor: c.id })
                        }
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.accentColor === c.id
                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Hintergrund */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Hintergrund
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BG_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() =>
                          setFormData({ ...formData, bgStyle: s.id })
                        }
                        className={`h-12 rounded-lg border flex items-center justify-center text-[10px] font-bold uppercase transition-all ${
                          formData.bgStyle === s.id
                            ? "ring-2 ring-indigo-500 border-transparent"
                            : "hover:border-slate-300"
                        }`}
                      >
                        {/* Mini-Vorschau des Hintergrunds */}
                        <div
                          className={`w-full h-full rounded-md ${
                            s.id === "soft"
                              ? "bg-gradient-to-br from-white via-slate-100 to-white"
                              : s.id === "mesh"
                              ? "bg-indigo-50"
                              : "bg-white"
                          }`}
                        ></div>
                        <span className="absolute">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Titelbild Größe */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Titelbild
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFormData({ ...formData, heroStyle: "compact" })
                      }
                      className={`flex-1 p-2 border rounded-lg flex flex-col items-center gap-2 ${
                        formData.heroStyle === "compact"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-8 bg-slate-200 rounded-md"></div>
                      <span className="text-[10px] font-bold">Kompakt</span>
                    </button>
                    <button
                      onClick={() =>
                        setFormData({ ...formData, heroStyle: "full" })
                      }
                      className={`flex-1 p-2 border rounded-lg flex flex-col items-center gap-2 ${
                        formData.heroStyle === "full"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-8 bg-slate-800 rounded-md"></div>
                      <span className="text-[10px] font-bold">Vollbild</span>
                    </button>
                  </div>
                </div>

                {/* 4. Karten-Stil */}
                <div className="border-t pt-4">
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Karten-Stil (Vorschau)
                  </label>
                  <ThemeSelector
                    selected={formData.theme}
                    onSelect={(t) => setFormData({ ...formData, theme: t })}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );

  if (view === "detail")
    return (
      <MemoryDetail
        memory={selectedMemory}
        onBack={() => setView("home")}
        onEdit={startEdit}
        isAuthor={true}
      />
    );

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b px-6 h-20 flex items-center justify-between">
        <div
          onClick={() => setView("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="text-indigo-600" />
          <span className="font-serif text-xl font-bold text-slate-800">
            BUZI Tagebuch
          </span>
        </div>
        <Button onClick={startCreate}>
          <Plus size={18} /> Neu
        </Button>
      </nav>
      <main className="max-w-6xl mx-auto p-6 pt-12">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-5xl font-serif text-slate-900 mb-6">
            Unsere Stories
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Das geheime Archiv für unsere Insider, Abenteuer und alles, was wir
            nicht vergessen wollen.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onClick={() => openDetail(mem)}
            />
          ))}
        </div>
        {memories.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl mt-8">
            <p className="text-slate-400 mb-4">Noch gähnende Leere hier.</p>
            <Button variant="secondary" onClick={startCreate}>
              Ersten Eintrag machen
            </Button>
          </div>
        )}
      </main>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;700&display=swap'); .font-serif { font-family: 'Playfair Display', serif; } .font-handwriting { font-family: 'Caveat', cursive; } body { font-family: 'Inter', sans-serif; } .animate-fade-in { animation: fadeIn 0.3s forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-slide-up { animation: slideUp 1s forwards; } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
