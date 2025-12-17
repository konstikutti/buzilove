import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  signInWithCustomToken,
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
  Maximize,
  Columns,
  Database,
  ZoomIn,
  X,
  Camera,
  Move,
  Star,
  CheckCircle,
  XCircle,
  Italic,
  Bold,
  AlertTriangle,
  Info,
  Save,
  Search,
  Map as MapIcon,
  Grid,
  Globe,
  Navigation,
  Calendar,
  ArrowRight,
} from "lucide-react";

// --- Firebase Konfiguration ---
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

const FONT_OPTIONS = [
  { id: "font-sans", name: "Modern" },
  { id: "font-serif", name: "Buch" },
  { id: "font-handwriting", name: "Hand" },
  { id: "font-mono", name: "Mono" },
];

// --- Simple Static City Database for Map ---
const CITY_COORDS = {
  // Germany / DACH
  Berlin: { lat: 52.52, lng: 13.405 },
  München: { lat: 48.135, lng: 11.582 },
  Munich: { lat: 48.135, lng: 11.582 },
  Hamburg: { lat: 53.551, lng: 9.993 },
  Köln: { lat: 50.937, lng: 6.96 },
  Cologne: { lat: 50.937, lng: 6.96 },
  Frankfurt: { lat: 50.11, lng: 8.682 },
  Stuttgart: { lat: 48.775, lng: 9.182 },
  Düsseldorf: { lat: 51.227, lng: 6.773 },
  Leipzig: { lat: 51.339, lng: 12.373 },
  Dresden: { lat: 51.05, lng: 13.737 },
  Hannover: { lat: 52.375, lng: 9.732 },
  Nürnberg: { lat: 49.452, lng: 11.076 },
  Wien: { lat: 48.208, lng: 16.373 },
  Vienna: { lat: 48.208, lng: 16.373 },
  Zürich: { lat: 47.376, lng: 8.541 },
  Zurich: { lat: 47.376, lng: 8.541 },
  Bern: { lat: 46.948, lng: 7.447 },
  Salzburg: { lat: 47.809, lng: 13.055 },
  Innsbruck: { lat: 47.269, lng: 11.404 },
  Basel: { lat: 47.559, lng: 7.588 },
  // International
  Paris: { lat: 48.856, lng: 2.352 },
  London: { lat: 51.507, lng: -0.127 },
  Rom: { lat: 41.902, lng: 12.496 },
  Rome: { lat: 41.902, lng: 12.496 },
  Barcelona: { lat: 41.385, lng: 2.173 },
  Madrid: { lat: 40.416, lng: -3.703 },
  Mallorca: { lat: 39.695, lng: 3.017 },
  Palma: { lat: 39.569, lng: 2.65 },
  Amsterdam: { lat: 52.367, lng: 4.904 },
  Prag: { lat: 50.075, lng: 14.437 },
  Prague: { lat: 50.075, lng: 14.437 },
  Budapest: { lat: 47.497, lng: 19.04 },
  NewYork: { lat: 40.712, lng: -74.006 },
  NYC: { lat: 40.712, lng: -74.006 },
  Dubai: { lat: 25.204, lng: 55.27 },
  Bangkok: { lat: 13.756, lng: 100.501 },
  Tokio: { lat: 35.676, lng: 139.65 },
  Tokyo: { lat: 35.676, lng: 139.65 },
  Sydney: { lat: -33.868, lng: 151.209 },
  Kapstadt: { lat: -33.924, lng: 18.424 },
  Gardasee: { lat: 45.604, lng: 10.635 },
  Venedig: { lat: 45.44, lng: 12.315 },
  Mailand: { lat: 45.464, lng: 9.19 },
};

const getCoordinates = (locationName) => {
  if (!locationName) return null;
  const normalized = locationName.trim();
  const keys = Object.keys(CITY_COORDS);
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];
  const found = keys.find((k) => normalized.includes(k));
  if (found) return CITY_COORDS[found];
  return null;
};

// --- Helper Functions ---
const formatDateSafe = (dateInput) => {
  if (!dateInput) return "";
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
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

const getDateObj = (d) => {
  if (!d) return new Date(0);
  if (d.toDate) return d.toDate();
  return new Date(d);
};

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

const fetchSingleImage = async (id) => {
  if (!id) return null;
  if (typeof id !== "string") return null;
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
    return snapshot.exists() ? snapshot.data().imageData : null;
  } catch (e) {
    console.error("Error fetching image:", id);
    return null;
  }
};

const hydrateBlocks = (blocks, images) => {
  if (!blocks) return [];
  return blocks.map((block) => {
    const newBlock = { ...block };
    const resolveContent = (content) => {
      if (typeof content === "string" && content.startsWith("IMG_REF_")) {
        const index = parseInt(content.replace("IMG_REF_", ""), 10);
        const item = images[index];
        if (!item) return "";
        const val = typeof item === "object" ? item?.url || "" : item;
        return typeof val === "string" ? val : "";
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
      const index = images.findIndex((img) => {
        const url = typeof img === "object" ? img.url : img;
        return url === content;
      });
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

// --- BASE COMPONENTS ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-slate-800";
  const icon =
    type === "error" ? (
      <AlertTriangle size={18} />
    ) : type === "success" ? (
      <CheckCircle size={18} />
    ) : (
      <Info size={18} />
    );

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white mb-2 animate-in slide-in-from-bottom-5 fade-in ${bg} max-w-sm`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm font-medium">{String(message)}</span>
      <button onClick={onClose} className="ml-auto">
        <X size={14} className="opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
};

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

const LazyInput = ({ value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);
  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };
  const handleBlur = (e) => {
    if (onChange && localValue !== value)
      onChange({ target: { value: localValue } });
  };
  return (
    <input
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
};

const LazyTextarea = ({ value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);
  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };
  const handleBlur = (e) => {
    if (onChange && localValue !== value)
      onChange({ target: { value: localValue } });
  };
  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
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
    {type === "text" && typeof onChange === "function" ? (
      <LazyInput
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
    ) : (
      <input
        name={name}
        type={type}
        {...(value !== undefined ? { value } : {})}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-slate-700 ${
          error
            ? "border-red-300 focus:ring-red-200 bg-red-50"
            : "border-slate-200 focus:ring-indigo-500"
        }`}
      />
    )}
  </div>
);

// --- NEW COMPONENT: Address Autocomplete ---
const AddressAutocomplete = ({ value, onChange, label, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (e) {
      console.warn("Autocomplete fetch error", e);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(e);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.length > 2) {
      timerRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 500);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    onChange({ target: { value: item.display_name } });
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-700"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 border-b last:border-0 border-slate-50 flex items-start gap-2"
            >
              <MapPin
                size={16}
                className="text-indigo-400 mt-0.5 flex-shrink-0"
              />
              <span className="leading-snug">{s.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DraggableImage = ({
  src,
  position = "center",
  onPositionChange,
  className,
}) => {
  const imgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isPending =
    src && typeof src === "string" && src.startsWith("PENDING_REF");

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!isPending) setIsDragging(true);
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
      className={`relative overflow-hidden cursor-move group ${className} ${
        isPending ? "bg-slate-100 flex items-center justify-center" : ""
      }`}
      ref={imgRef}
      onMouseDown={handleMouseDown}
    >
      {isPending ? (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-[10px] font-bold">Lade Bild...</span>
        </div>
      ) : (
        <>
          <img
            src={src}
            className="w-full h-full object-cover pointer-events-none select-none"
            style={{ objectPosition: position }}
            alt=""
          />
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
          >
            <div className="bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
              <Move size={12} /> Ziehen zum Ausrichten
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- TILE MAP COMPONENTS ---

const TILE_SIZE = 256;

// Memoized Marker to prevent re-render on map move unless pos changes
const MapMarker = React.memo(({ x, y, loc, isSelected, onClick, children }) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group z-20 hover:z-30 transition-transform duration-200 ease-out"
    style={{ left: x, top: y }}
    onClick={onClick}
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
    {children}
  </div>
));

// Memoized Tile to prevent flicker
const MapTile = React.memo(({ src, style }) => (
  <img
    src={src}
    style={style}
    className="select-none grayscale-[0.2] contrast-[1.05] absolute"
    alt=""
    draggable={false}
    onDragStart={(e) => e.preventDefault()}
  />
));

const InteractiveMap = ({ memories, onNavigate }) => {
  const [center, setCenter] = useState({ lat: 51.1657, lng: 10.4515 });
  const [zoom, setZoom] = useState(6);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fetchedCoords, setFetchedCoords] = useState({});
  const [selectedLoc, setSelectedLoc] = useState(null);

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const stateRef = useRef({ zoom: 6, center: { lat: 51.1657, lng: 10.4515 } });

  useEffect(() => {
    stateRef.current = { zoom, center };
  }, [zoom, center]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Geocoding & Data Processing
  const geocodeLocation = async (loc) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          loc
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.warn("Geocoding failed for", loc, e);
    }
    return null;
  };

  const locationData = useMemo(() => {
    const mapped = [];
    const unmapped = [];

    // Step 1: Process each memory individually to find a coordinate source
    memories.forEach((mem) => {
      // Prioritize explicit address (private) over location (public)
      const queryName = mem.address || mem.location;

      if (!queryName) return;
      const normalizedName = queryName.trim();

      const cached =
        CITY_COORDS[normalizedName] || fetchedCoords[normalizedName];
      const coords = getCoordinates(normalizedName) || cached;

      if (coords) {
        // Create a temporary object for every memory with its coords
        mapped.push({
          lat: coords.lat,
          lng: coords.lng,
          memory: mem,
          // Use display location for the name in the marker logic
          displayName: mem.location,
        });
      } else {
        const existing = unmapped.find((u) => u.name === normalizedName);
        if (!existing) {
          unmapped.push({ name: normalizedName, memories: [mem] });
        }
      }
    });

    return { mapped, unmapped };
  }, [memories, fetchedCoords]);

  // Fetch unmapped locations
  useEffect(() => {
    const unmappedNames = locationData.unmapped.map((u) => u.name);
    if (unmappedNames.length === 0) return;

    const fetchNext = async () => {
      const target = unmappedNames.find(
        (name) => fetchedCoords[name] === undefined
      );
      if (!target) return;

      setFetchedCoords((prev) => ({ ...prev, [target]: null })); // Mark as fetching/failed
      const coords = await geocodeLocation(target);
      if (coords) {
        setFetchedCoords((prev) => ({ ...prev, [target]: coords }));
      }
    };

    const timer = setTimeout(fetchNext, 1000);
    return () => clearTimeout(timer);
  }, [locationData.unmapped, fetchedCoords]);

  // Projection Math
  const project = useCallback((lat, lng, z) => {
    const scale = 256 * Math.pow(2, z);
    let siny = Math.sin((lat * Math.PI) / 180);
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
    return {
      x: scale * (0.5 + lng / 360),
      y: scale * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
    };
  }, []);

  const unproject = useCallback((x, y, z) => {
    const scale = 256 * Math.pow(2, z);
    const lng = (x / scale - 0.5) * 360;
    const n = Math.PI - 2 * Math.PI * (y / scale);
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return { lat, lng };
  }, []);

  const centerPx = project(center.lat, center.lng, zoom);
  const worldWidth = 256 * Math.pow(2, zoom);

  // --- Unified Interaction Logic (Touch + Mouse) ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startCenterPx = { x: 0, y: 0 };

    // Pinch / Touch variables
    let initialDist = 0;
    let initialZoom = 0;
    let isPinching = false;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // --- MOUSE HANDLERS ---
    const onMouseDown = (e) => {
      if (e.target.closest(".map-popup")) return;
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const currZ = stateRef.current.zoom;
      const currC = stateRef.current.center;
      startCenterPx = project(currC.lat, currC.lng, currZ);
      if (contentRef.current) contentRef.current.style.transition = "none";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const onMouseUp = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        const currZ = stateRef.current.zoom;
        const startPx = startCenterPx;
        const newCx = startPx.x - dx;
        const newCy = startPx.y - dy;
        let newCenter = unproject(newCx, newCy, currZ);

        if (newCenter.lat > 85) newCenter.lat = 85;
        if (newCenter.lat < -85) newCenter.lat = -85;

        setCenter(newCenter);
      }

      isDragging = false;
      if (contentRef.current) {
        contentRef.current.style.transform = "";
        contentRef.current.style.transition = "";
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    // --- TOUCH HANDLERS (Native for passive: false) ---
    const onTouchStart = (e) => {
      if (e.target.closest(".map-popup")) return;
      if (e.touches.length === 1) {
        isDragging = true;
        isPinching = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        const currZ = stateRef.current.zoom;
        const currC = stateRef.current.center;
        startCenterPx = project(currC.lat, currC.lng, currZ);
        if (contentRef.current) contentRef.current.style.transition = "none";
      } else if (e.touches.length === 2) {
        isPinching = true;
        isDragging = false;
        initialDist = getDistance(e.touches);
        initialZoom = stateRef.current.zoom;
        e.preventDefault();
      }
    };

    const onTouchMove = (e) => {
      if (e.target.closest(".map-popup")) return;
      e.preventDefault();
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (contentRef.current) {
          contentRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      } else if (isPinching && e.touches.length === 2) {
        const dist = getDistance(e.touches);
        if (initialDist > 0) {
          const ratio = dist / initialDist;
          const zoomDelta = Math.log2(ratio);
          let newZoom = initialZoom + zoomDelta;
          newZoom = Math.max(2, Math.min(newZoom, 19));
          setZoom(newZoom);
        }
      }
    };

    const onTouchEnd = (e) => {
      if (isDragging && e.touches.length === 0) {
        if (contentRef.current) {
          const style = window.getComputedStyle(contentRef.current);
          let dx = 0,
            dy = 0;
          try {
            const matrix = new (window.DOMMatrix || window.WebKitCSSMatrix)(
              style.transform
            );
            dx = matrix.m41;
            dy = matrix.m42;
          } catch (err) {}

          if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
            const currZ = stateRef.current.zoom;
            const startPx = startCenterPx;
            const newCx = startPx.x - dx;
            const newCy = startPx.y - dy;
            let newCenter = unproject(newCx, newCy, currZ);

            if (newCenter.lat > 85) newCenter.lat = 85;
            if (newCenter.lat < -85) newCenter.lat = -85;
            setCenter(newCenter);
          }
          contentRef.current.style.transform = "";
          contentRef.current.style.transition = "";
        }
        isDragging = false;
      }
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
      }
    };

    const onWheel = (e) => {
      if (e.target.closest(".map-popup")) return;
      e.preventDefault();
      const delta = -e.deltaY;
      const speed = e.ctrlKey ? 0.01 : 0.002;
      setZoom((z) => Math.min(Math.max(z + delta * speed, 2), 19));
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [project, unproject]);

  // --- Rendering ---
  const getTilesForZoom = useCallback(
    (targetZoom) => {
      if (dimensions.width === 0) return [];

      const tileZoom = Math.round(targetZoom);
      const scale = Math.pow(2, zoom - tileZoom);
      const centerPxInt = project(center.lat, center.lng, tileZoom);

      const viewLeftInt = centerPxInt.x - dimensions.width / 2 / scale;
      const viewTopInt = centerPxInt.y - dimensions.height / 2 / scale;
      const viewRightInt = centerPxInt.x + dimensions.width / 2 / scale;
      const viewBottomInt = centerPxInt.y + dimensions.height / 2 / scale;

      const minX = Math.floor(viewLeftInt / TILE_SIZE) - 1;
      const maxX = Math.floor(viewRightInt / TILE_SIZE) + 1;
      const minY = Math.floor(viewTopInt / TILE_SIZE) - 1;
      const maxY = Math.floor(viewBottomInt / TILE_SIZE) + 1;
      const maxTiles = Math.pow(2, tileZoom);

      const t = [];
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          if (y < 0 || y >= maxTiles) continue;

          const tileX = ((x % maxTiles) + maxTiles) % maxTiles;
          const left = (x * TILE_SIZE - viewLeftInt) * scale;
          const top = (y * TILE_SIZE - viewTopInt) * scale;

          t.push({
            key: `${tileZoom}-${x}-${y}`,
            src: `https://tile.openstreetmap.org/${tileZoom}/${tileX}/${y}.png`,
            style: {
              left: left,
              top: top,
              width: Math.ceil(TILE_SIZE * scale),
              height: Math.ceil(TILE_SIZE * scale),
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden",
            },
          });
        }
      }
      return t;
    },
    [center, zoom, dimensions, project]
  );

  const primaryTiles = useMemo(
    () => getTilesForZoom(zoom),
    [getTilesForZoom, zoom]
  );
  const fallbackTiles = useMemo(() => {
    const z = Math.round(zoom) - 1;
    return z >= 0 ? getTilesForZoom(z) : [];
  }, [getTilesForZoom, zoom]);

  // --- CLUSTERING LOGIC ---
  const clusteredMarkers = useMemo(() => {
    if (dimensions.width === 0) return [];

    // 1. Calculate pixel positions for all mapped items
    const points = locationData.mapped
      .map((item) => {
        const px = project(item.lat, item.lng, zoom);
        // Normalize X for world wrap
        let deltaX = px.x - centerPx.x;
        const worldWidth = 256 * Math.pow(2, zoom);
        while (deltaX > worldWidth / 2) deltaX -= worldWidth;
        while (deltaX < -worldWidth / 2) deltaX += worldWidth;

        const x = dimensions.width / 2 + deltaX;
        const y = px.y - (centerPx.y - dimensions.height / 2);

        return { ...item, x, y };
      })
      .filter(
        (p) =>
          p.x > -100 &&
          p.x < dimensions.width + 100 &&
          p.y > -100 &&
          p.y < dimensions.height + 100
      );

    // 2. Greedy clustering
    const clusters = [];
    const CLUSTER_RADIUS = 60; // Pixels distance to merge

    points.forEach((point) => {
      // Find an existing cluster that is close enough
      const cluster = clusters.find((c) => {
        const dx = c.x - point.x;
        const dy = c.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS;
      });

      if (cluster) {
        cluster.memories.push(point.memory);
        // Average the position slightly towards new point (optional, keeps cluster stable if we don't)
        // For stability, we often keep the first point's position or average.
        // Let's keep first point to avoid jumping
      } else {
        clusters.push({
          x: point.x,
          y: point.y,
          lat: point.lat,
          lng: point.lng,
          name: point.displayName, // Use display name of first item
          memories: [point.memory],
        });
      }
    });

    // Sort memories inside clusters by date
    clusters.forEach((c) => {
      c.memories.sort((a, b) => getDateObj(b.date) - getDateObj(a.date));
      c.count = c.memories.length;

      // Collect unique locations
      const locs = new Set(c.memories.map((m) => m.location).filter(Boolean));
      c.uniqueLocations = Array.from(locs);

      // Use the location name of the newest entry for the cluster label
      // if distinct
      if (c.count === 1) {
        c.name = c.memories[0].location;
      } else {
        c.name = `${c.count} Stories`;
      }
    });

    return clusters;
  }, [locationData.mapped, zoom, centerPx, dimensions, project]);

  const markers = clusteredMarkers.map((loc, i) => {
    const latestMemory = loc.memories[0];
    const thumbUrl =
      latestMemory.previewImage ||
      (latestMemory.images && latestMemory.images.length > 0
        ? latestMemory.images[0]
        : null);
    const count = loc.count;

    return (
      <MapMarker
        key={`${i}-${loc.name}-${count}`}
        x={loc.x}
        y={loc.y}
        loc={loc}
        isSelected={selectedLoc === loc}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLoc(loc);
        }}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={`relative transition-all duration-300 ${
              selectedLoc === loc ? "scale-125 z-50" : "hover:scale-110 z-20"
            }`}
          >
            {/* Cluster Backing Effect for multiple items */}
            {count > 1 && (
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 z-[-1] scale-110"></div>
            )}
            <div
              className={`relative z-10 w-12 h-12 rounded-full border-4 shadow-lg overflow-hidden bg-white ${
                selectedLoc === loc
                  ? "border-indigo-600 ring-2 ring-indigo-200"
                  : "border-white"
              }`}
            >
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  className="w-full h-full object-cover"
                  alt={loc.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                  <MapPin size={20} fill="currentColor" />
                </div>
              )}
            </div>
            {count > 1 && (
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-20">
                {count}
              </div>
            )}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white absolute left-1/2 -translate-x-1/2 -bottom-2 drop-shadow-sm"></div>
          </div>
        </div>
      </MapMarker>
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-100 relative">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#cad2d3]"
        style={{ touchAction: "none" }}
        onClick={() => setSelectedLoc(null)}
      >
        <div ref={contentRef} className="absolute inset-0 w-full h-full">
          {fallbackTiles.map((t) => (
            <MapTile key={`fb-${t.key}`} {...t} />
          ))}
          {primaryTiles.map((t) => (
            <MapTile key={t.key} {...t} />
          ))}

          {markers}
        </div>

        <div className="absolute bottom-1 right-1 bg-white/70 px-1 text-[10px] text-slate-600 pointer-events-none z-10 rounded">
          © OpenStreetMap contributors
        </div>

        <div className="absolute right-6 bottom-8 flex flex-col gap-2 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(z + 1, 19));
            }}
            className="bg-white p-2 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(z - 1, 2));
            }}
            className="bg-white p-2 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(5.5);
              setCenter({ lat: 51.1657, lng: 10.4515 });
            }}
            className="bg-white p-2 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700"
          >
            <Navigation size={20} />
          </button>
        </div>

        {selectedLoc && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-4 fade-in map-popup"
            style={{ touchAction: "pan-y" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-600 p-3 flex justify-between items-start text-white shadow-md">
              {selectedLoc.count > 1 ? (
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">
                    {selectedLoc.count} Stories in dieser Region
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedLoc.uniqueLocations.slice(0, 3).map((loc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded border border-white/10"
                      >
                        {loc}
                      </span>
                    ))}
                    {selectedLoc.uniqueLocations.length > 3 && (
                      <span className="text-[10px] opacity-80 self-center">
                        +{selectedLoc.uniqueLocations.length - 3} weitere
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="line-clamp-1">{selectedLoc.name}</span>
                </div>
              )}
              <button
                onClick={() => setSelectedLoc(null)}
                className="hover:bg-indigo-700 rounded-full p-1 -mt-1 -mr-1 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
              {selectedLoc.memories.map((mem) => {
                const thumb = mem.previewImage || mem.images?.[0];
                return (
                  <div
                    key={mem.id}
                    onClick={() => onNavigate(mem)}
                    className="flex gap-3 items-center p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border-b last:border-0 border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100">
                      {thumb ? (
                        <img
                          src={thumb}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">
                        {mem.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar size={10} />
                        <span>{formatDateSafe(mem.date)}</span>
                        <span className="text-slate-300">|</span>
                        <span>{mem.location}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- EDITOR SUB-COMPONENTS ---

const ImageSelector = React.memo(({ current, onSelect, uploadedImages }) => (
  <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin">
    {uploadedImages.map((img, i) => {
      const isPending =
        typeof img === "object" && img.url && img.url.startsWith("PENDING_REF");
      return (
        <div
          key={i}
          onClick={() => onSelect(typeof img === "object" ? img.url : img)}
          className={`w-10 h-10 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
            current === (typeof img === "object" ? img.url : img)
              ? "border-indigo-500 ring-2 ring-indigo-200"
              : "border-transparent"
          } ${
            isPending ? "bg-slate-100 flex items-center justify-center" : ""
          }`}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-slate-300" />
          ) : (
            <img
              src={typeof img === "object" ? img.url : img}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      );
    })}
    {uploadedImages.length === 0 && (
      <span className="text-xs text-slate-400">Keine Fotos verfügbar.</span>
    )}
  </div>
));

const BlockItem = React.memo(
  ({
    block,
    index,
    total,
    updateBlock,
    removeBlock,
    moveBlock,
    uploadedImages,
  }) => {
    return (
      <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-all">
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur p-1 rounded-lg border border-slate-100 shadow-sm z-20">
          <Button
            variant="icon"
            className="!p-1 h-6 w-6"
            onClick={() => moveBlock(index, "up")}
            disabled={index === 0}
          >
            <ChevronUp size={14} />
          </Button>
          <Button
            variant="icon"
            className="!p-1 h-6 w-6"
            onClick={() => moveBlock(index, "down")}
            disabled={index === total - 1}
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

        <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-slate-50 pb-2 pr-24 relative">
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
          {/* ... */}
          {(["header", "text", "quote", "note"].includes(block.type) ||
            (block.type === "image" &&
              (block.layout === "left" || block.layout === "right"))) && (
            <>
              <div className="flex bg-slate-50 rounded border p-0.5 ml-2">
                <select
                  value={block.font || "font-sans"}
                  onChange={(e) =>
                    updateBlock(block.id, { font: e.target.value })
                  }
                  className="text-xs bg-transparent border-none focus:ring-0 py-1 pl-2 pr-6 cursor-pointer"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1 ml-1">
                <button
                  onClick={() => updateBlock(block.id, { bold: !block.bold })}
                  className={`p-1.5 rounded border ${
                    block.bold
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                  title="Fett"
                >
                  <Bold size={12} />
                </button>
                <button
                  onClick={() =>
                    updateBlock(block.id, { italic: !block.italic })
                  }
                  className={`p-1.5 rounded border ${
                    block.italic
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                  title="Kursiv"
                >
                  <Italic size={12} />
                </button>
              </div>
            </>
          )}
          {["header", "text", "quote"].includes(block.type) && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
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
            </>
          )}
          {block.type === "image" && (
            <div className="flex bg-slate-50 rounded border p-0.5 ml-2">
              <button
                onClick={() => updateBlock(block.id, { layout: "left" })}
                className={`p-1 rounded ${
                  block.layout === "left"
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-400"
                }`}
                title="Bild Links + Text"
              >
                <AlignLeft size={12} />
              </button>
              <button
                onClick={() => updateBlock(block.id, { layout: "center" })}
                className={`p-1 rounded ${
                  block.layout === "center"
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                <Maximize size={12} />
              </button>
              <button
                onClick={() => updateBlock(block.id, { layout: "right" })}
                className={`p-1 rounded ${
                  block.layout === "right"
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-400"
                }`}
                title="Bild Rechts + Text"
              >
                <AlignRight size={12} />
              </button>
              <button
                onClick={() => updateBlock(block.id, { layout: "full" })}
                className={`p-1 rounded ${
                  block.layout === "full"
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                <Maximize2 size={12} />
              </button>
            </div>
          )}
        </div>

        {block.type === "header" && (
          <LazyInput
            value={block.content || ""}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Überschrift..."
            className={`w-full text-xl font-bold bg-transparent border-none focus:ring-0 px-0 text-${
              block.align
            } ${block.font || "font-sans"} ${block.italic ? "italic" : ""}`}
          />
        )}
        {block.type === "text" && (
          <LazyTextarea
            value={block.content || ""}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Erzähl die Story..."
            className={`w-full min-h-[80px] bg-transparent border-none focus:ring-0 resize-none px-0 text-${
              block.align
            } ${block.font || "font-sans"} ${block.italic ? "italic" : ""} ${
              block.bold ? "font-bold" : ""
            }`}
          />
        )}
        {block.type === "quote" && (
          <div className="bg-slate-50 p-4 rounded border-l-4 border-indigo-200">
            <LazyTextarea
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Insider / Zitat..."
              className={`w-full bg-transparent text-lg border-none focus:ring-0 text-center ${
                block.font || "font-serif"
              } ${block.italic ? "italic" : ""} ${
                block.bold ? "font-bold" : ""
              }`}
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
            <LazyTextarea
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Randnotiz..."
              className={`w-full bg-transparent text-amber-900 border-none focus:ring-0 text-sm ${
                block.font || "font-sans"
              } ${block.italic ? "italic" : ""} ${
                block.bold ? "font-bold" : ""
              }`}
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
              uploadedImages={uploadedImages}
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
                {(block.layout === "left" || block.layout === "right") && (
                  <div className="mt-2 border-t pt-2 border-slate-100">
                    <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">
                      Text daneben (mittig)
                    </label>
                    <LazyTextarea
                      value={block.sideText || ""}
                      onChange={(e) =>
                        updateBlock(block.id, { sideText: e.target.value })
                      }
                      placeholder="Schreib etwas zum Bild..."
                      className={`w-full text-sm bg-white border border-slate-200 rounded p-2 focus:ring-1 focus:ring-indigo-200 min-h-[60px] ${
                        block.font || "font-sans"
                      } ${block.italic ? "italic" : ""} ${
                        block.bold ? "font-bold" : ""
                      }`}
                    />
                  </div>
                )}
                <LazyInput
                  value={block.caption || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { caption: e.target.value })
                  }
                  placeholder="Bildunterschrift (unten)..."
                  className="text-xs bg-white border p-2 rounded w-full mt-1"
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
                uploadedImages={uploadedImages}
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
                uploadedImages={uploadedImages}
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
    );
  },
  (prev, next) => {
    return (
      prev.block === next.block &&
      prev.index === next.index &&
      prev.total === next.total &&
      prev.uploadedImages === next.uploadedImages
    );
  }
);

const BlockEditor = ({ blocks, onChange, uploadedImages }) => {
  const addBlock = (type) =>
    onChange([
      ...blocks,
      {
        id: Date.now(),
        type,
        content: "",
        content2: "",
        sideText: "",
        animation: "none",
        align: "left",
        layout: "center",
        imgStyle: "rounded",
        focus: "50% 50%",
        focus2: "50% 50%",
        font: "font-sans",
        italic: false,
        bold: false,
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

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <BlockItem
          key={block.id}
          block={block}
          index={i}
          total={blocks.length}
          updateBlock={updateBlock}
          removeBlock={removeBlock}
          moveBlock={moveBlock}
          uploadedImages={uploadedImages}
        />
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
  const [progress, setProgress] = useState("");
  const fileInput = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);
    const newImgs = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress(`${i + 1} von ${files.length}`);
      await new Promise((resolve) => setTimeout(resolve, 20));

      try {
        const data = await compressImage(f, 1600, 0.8);
        newImgs.push({ id: null, url: data });
      } catch (err) {
        console.error("Fehler beim Bild:", f.name, err);
      }
    }

    onChange([...images, ...newImgs]);
    setLoading(false);
    setProgress("");
    fileInput.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => !loading && fileInput.current?.click()}
        className={`border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${
          loading
            ? "cursor-wait opacity-70"
            : "cursor-pointer hover:border-indigo-500 hover:bg-indigo-50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInput}
          onChange={handleFiles}
          disabled={loading}
        />
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-500 mb-2" />
            <span className="text-xs font-bold text-indigo-600 animate-pulse">
              Verarbeite Bild {progress}...
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Bitte warten...
            </span>
          </div>
        ) : (
          <>
            <Upload className="text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-600">
              Fotos hochladen (High Quality)
            </span>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => {
          const isPending =
            typeof img === "object" &&
            img.url &&
            img.url.startsWith("PENDING_REF");
          return (
            <div
              key={i}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                (typeof img === "object" ? img.url : img) === coverImage
                  ? "border-amber-400 ring-2 ring-amber-100"
                  : "border-transparent bg-slate-100"
              } ${isPending ? "flex items-center justify-center" : ""}`}
            >
              {isPending ? (
                <Loader2 size={24} className="animate-spin text-slate-300" />
              ) : (
                <img
                  src={typeof img === "object" ? img.url : img}
                  className="w-full h-full object-cover"
                />
              )}
              {!isPending && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(images.filter((_, idx) => idx !== i));
                      if (
                        coverImage === (typeof img === "object" ? img.url : img)
                      )
                        onSetCover(null);
                    }}
                    className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 hover:text-red-500"
                    title="Löschen"
                  >
                    <X size={12} />
                  </button>
                  <button
                    onClick={() =>
                      onSetCover(typeof img === "object" ? img.url : img)
                    }
                    className={`absolute bottom-1 right-1 p-1.5 rounded-full shadow transition-all ${
                      (typeof img === "object" ? img.url : img) === coverImage
                        ? "bg-amber-400 text-white opacity-100"
                        : "bg-white text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                    }`}
                    title="Als Titelbild"
                  >
                    <Star
                      size={12}
                      fill={
                        (typeof img === "object" ? img.url : img) === coverImage
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
      classes += "flex flex-col md:flex-row items-center gap-8 clear-both";
      imgStyle += "rounded-2xl shadow-md w-full";
    } else if (layout === "right") {
      classes +=
        "flex flex-col md:flex-row-reverse items-center gap-8 clear-both";
      imgStyle += "rounded-2xl shadow-md w-full";
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
            ["header", "quote", "divider"].includes(b.type) ? "clear-both" : ""
          } text-${b.align || "left"} ${b.font || "font-sans"} ${
            b.italic ? "italic" : ""
          } ${b.bold ? "font-bold" : ""}`}
        >
          {b.type === "header" && (
            <h3
              className={`text-2xl font-bold mb-4 pt-4 leading-tight ${
                theme === "cinema" ? "text-white italic" : "text-slate-900"
              }`}
            >
              {String(b.content || "")}
            </h3>
          )}
          {b.type === "text" && (
            <p
              className={`whitespace-pre-wrap leading-relaxed mb-4 ${
                theme === "cinema" ? "text-slate-300" : "text-slate-700 text-lg"
              }`}
            >
              {String(b.content || "")}
            </p>
          )}
          {b.type === "quote" && (
            <blockquote
              className={`text-3xl italic text-center font-serif py-8 ${
                theme === "cinema" ? "text-white" : "text-slate-800"
              }`}
              style={{ color: theme !== "cinema" ? accentHex : undefined }}
            >
              "{String(b.content || "")}"
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
              {String(b.content || "")}
            </div>
          )}
          {b.type === "image" &&
            b.content &&
            (() => {
              const { classes, imgStyle } = getLayoutClasses(
                b.layout,
                b.imgStyle
              );
              const isSideLayout = b.layout === "left" || b.layout === "right";
              return (
                <div
                  className={
                    isSideLayout ? classes : `my-6 relative ${classes}`
                  }
                >
                  <div className={isSideLayout ? "w-full md:w-1/2" : "w-full"}>
                    <figure>
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
                  </div>
                  {isSideLayout && (
                    <div className="w-full md:w-1/2 flex items-center justify-center p-4">
                      <div
                        className={`text-lg leading-relaxed whitespace-pre-wrap ${
                          b.font || "font-sans"
                        } ${b.italic ? "italic" : ""} ${
                          b.bold ? "font-bold" : ""
                        } ${
                          theme === "cinema"
                            ? "text-slate-300"
                            : "text-slate-700"
                        }`}
                      >
                        {String(b.sideText || "")}
                      </div>
                    </div>
                  )}
                </div>
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
  const { title, author, date, endDate, theme, location, blocks } = memory;
  const images = memory.images || [];
  const previewImage =
    memory.coverImage ||
    memory.previewImage ||
    (images.length > 0 ? images[0] : "");

  const getPreviewText = () => {
    if (!blocks) return "";
    const hydrated = hydrateBlocks(blocks, images);
    const textBlock = hydrated.find(
      (b) =>
        ((b.type === "text" || b.type === "quote" || b.type === "note") &&
          b.content &&
          b.content.trim().length > 0) ||
        (b.sideText && b.sideText.trim().length > 0)
    );
    return textBlock ? textBlock.content || textBlock.sideText : "";
  };
  const previewText = getPreviewText();

  const renderDate = () => {
    const start = formatDateSafe(date);
    if (endDate) {
      const end = formatDateSafe(endDate);
      return `${start} – ${end}`;
    }
    return start;
  };

  const Container = ({ children, className }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer transform transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );

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
              <span>{renderDate()}</span>
            </div>
          </div>
        </div>
      </Container>
    );
  }

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
          <div className="text-white/60 text-xs">{renderDate()}</div>
        </div>
      </Container>
    );
  }

  if (theme === "journal") {
    return (
      <Container className="bg-[#fdfbf7] p-6 rounded-sm shadow-sm border border-slate-200 hover:shadow-md group">
        <div className="border-b-2 border-slate-800 pb-2 mb-4">
          <div className="text-[10px] font-serif italic text-slate-500 text-center">
            {renderDate()}
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
        {previewText && (
          <p className="font-serif text-sm text-slate-700 leading-snug line-clamp-3 text-justify">
            {previewText}
          </p>
        )}
      </Container>
    );
  }

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
          {renderDate()}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
          <MapPin size={14} /> {location}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
          {title}
        </h3>
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

const MemoryDetail = ({ memory, onBack, onEdit, isAuthor }) => {
  // --- SCROLL FIX START ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // --- SCROLL FIX END ---

  const [hydratedImages, setHydratedImages] = useState(() =>
    new Array(memory.images?.length || 0).fill(null)
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const totalImages = memory.images?.length || 0;

  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (distance > minSwipeDistance) {
      if (activeImg < hydratedImages.length - 1)
        setActiveImg((prev) => prev + 1);
    }
    if (distance < -minSwipeDistance) {
      if (activeImg > 0) setActiveImg((prev) => prev - 1);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!memory.images || memory.images.length === 0) return;

    const priorityIndices = new Set();
    if (memory.images.length > 0) priorityIndices.add(0);
    memory.blocks?.forEach((block) => {
      const checkForRef = (content) => {
        if (typeof content === "string" && content.startsWith("IMG_REF_")) {
          const idx = parseInt(content.replace("IMG_REF_", ""), 10);
          if (!isNaN(idx) && idx < memory.images.length)
            priorityIndices.add(idx);
        }
      };
      checkForRef(block.content);
      checkForRef(block.content2);
    });

    const allIndices = memory.images.map((_, i) => i);
    const priorityList = Array.from(priorityIndices);
    const backgroundList = allIndices.filter((i) => !priorityIndices.has(i));

    const loadIndex = async (index) => {
      const url = await fetchSingleImage(memory.images[index]);
      if (isMounted && url) {
        setHydratedImages((prev) => {
          const next = [...prev];
          next[index] = url;
          return next;
        });
        setLoadedCount((prev) => prev + 1);
      }
    };

    const loadAll = async () => {
      await Promise.all(priorityList.map(loadIndex));
      for (const idx of backgroundList) {
        if (!isMounted) return;
        await loadIndex(idx);
        await new Promise((r) => setTimeout(r, 10));
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, [memory]);

  const contentBlocks = useMemo(() => {
    if (!memory.blocks)
      return [{ id: 1, type: "text", content: memory.content || "" }];
    return hydrateBlocks(memory.blocks, hydratedImages);
  }, [memory.blocks, memory.content, hydratedImages]);

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
  const renderDate = () => {
    const start = formatDateSafe(memory.date);
    if (memory.endDate) {
      const end = formatDateSafe(memory.endDate);
      return `${start} – ${end}`;
    }
    return start;
  };
  const currentHeroImage =
    hydratedImages.length > 0 && hydratedImages[0]
      ? hydratedImages[0]
      : memory.previewImage || "";

  return (
    <div className={`min-h-screen ${getBg()}`}>
      {loadedCount < totalImages && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur border shadow-lg p-3 rounded-full flex items-center gap-3 text-xs font-bold text-indigo-600 z-50 animate-in slide-in-from-bottom-4">
          <Loader2 size={16} className="animate-spin" />
          <span>
            Lade Fotos ({loadedCount}/{totalImages})...
          </span>
        </div>
      )}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-50"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={32} />
          </button>
          <div
            className="w-full h-full flex items-center justify-center relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              className="hidden md:block absolute left-8 text-white/50 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImg((prev) =>
                  prev > 0 ? prev - 1 : hydratedImages.length - 1
                );
              }}
            >
              <ChevronLeft size={48} />
            </button>
            {hydratedImages[activeImg] ? (
              <img
                src={hydratedImages[activeImg]}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="text-white flex flex-col items-center">
                <Loader2 size={48} className="animate-spin mb-4" />
                <span>Lade Bild...</span>
              </div>
            )}
            <button
              className="hidden md:block absolute right-8 text-white/50 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImg((prev) =>
                  prev < hydratedImages.length - 1 ? prev + 1 : 0
                );
              }}
            >
              <ChevronRight size={48} />
            </button>
          </div>
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
        {currentHeroImage ? (
          <div
            className="relative w-full h-full group cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={currentHeroImage}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {hydratedImages.length > 0 && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                  <Maximize2 size={32} />
                </div>
              </div>
            )}
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
                {memory.location} • {renderDate()}
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
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
                Galerie ({loadedCount} / {hydratedImages.length})
              </h4>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {hydratedImages.map((img, i) => (
                  <div key={i} className="break-inside-avoid mb-4">
                    <button
                      onClick={() => {
                        setActiveImg(i);
                        setIsLightboxOpen(true);
                      }}
                      className={`w-full relative group rounded-xl overflow-hidden transition-all ${
                        activeImg === i
                          ? "ring-2 ring-offset-2"
                          : "opacity-90 hover:opacity-100 hover:scale-[1.02]"
                      } ${
                        !img ? "animate-pulse bg-slate-100 aspect-square" : ""
                      }`}
                      style={{
                        borderColor:
                          activeImg === i ? accent.hex : "transparent",
                        "--tw-ring-color": accent.hex,
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          className="w-full h-auto object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      {img && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
                          <ZoomIn
                            className="text-white drop-shadow-md"
                            size={24}
                          />
                        </div>
                      )}
                    </button>
                  </div>
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
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [toasts, setToasts] = useState([]);

  // New States
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'map'

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    address: "", // NEU: Genaue Adresse
    content: "",
    theme: "modern",
    accentColor: "indigo",
    bgStyle: "clean",
    heroStyle: "compact",
    images: [],
    blocks: [],
    date: new Date().toISOString().split("T")[0],
    endDate: "",
    coverImage: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg: String(msg), type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const hasChanges = React.useMemo(() => {
    if (!editingId) return true;
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData, editingId]);

  const openDetail = (memory) => {
    setSelectedMemory(memory);
    setView("detail");
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (err) {
          console.warn(
            "Auth with custom token failed (likely config mismatch), falling back to anonymous:",
            err
          );
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
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
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Strict sorting: Newest first (Left to right flow in standard grid)
      const sorted = data.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
        return dateB - dateA;
      });

      setMemories(sorted);
    });
  }, [user]);

  useEffect(() => {
    if (view === "editor") {
      const draftKey = editingId ? `buzi_draft_${editingId}` : "buzi_draft_new";
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      } catch (e) {
        console.warn("Local storage full, skipping auto-save");
      }
    }
  }, [formData, view, editingId]);

  useEffect(() => {
    if (view === "editor" && formData.images) {
      const pendingIndices = formData.images
        .map((img, i) =>
          img.url &&
          typeof img.url === "string" &&
          img.url.startsWith("PENDING_REF")
            ? i
            : -1
        )
        .filter((i) => i !== -1);
      if (pendingIndices.length > 0) {
        const usedIndices = new Set();
        formData.blocks?.forEach((block) => {
          const checkRef = (content) => {
            if (
              typeof content === "string" &&
              content.startsWith("PENDING_REF_")
            ) {
              const idx = parseInt(content.replace("PENDING_REF_", ""), 10);
              if (!isNaN(idx)) usedIndices.add(idx);
            }
          };
          checkRef(block.content);
          checkRef(block.content2);
        });
        let nextIndex = pendingIndices.find((idx) => usedIndices.has(idx));
        if (nextIndex === undefined) nextIndex = pendingIndices[0];

        const loadNext = async () => {
          const idx = nextIndex;
          const imgObj = formData.images[idx];
          const realUrl = await fetchSingleImage(imgObj.id);
          if (realUrl) {
            setFormData((prev) => {
              const newImages = [...prev.images];
              newImages[idx] = { ...newImages[idx], url: realUrl };
              const oldRef = `PENDING_REF_${idx}`;
              const newBlocks = prev.blocks.map((b) => {
                const nb = { ...b };
                if (nb.content === oldRef) nb.content = realUrl;
                if (nb.content2 === oldRef) nb.content2 = realUrl;
                return nb;
              });
              let newCover = prev.coverImage;
              if (newCover === oldRef) newCover = realUrl;
              return {
                ...prev,
                images: newImages,
                blocks: newBlocks,
                coverImage: newCover,
              };
            });
          } else {
            setFormData((prev) => {
              const newImages = [...prev.images];
              newImages[idx] = { ...newImages[idx], url: null };
              return { ...prev, images: newImages };
            });
          }
        };
        loadNext();
      }
    }
  }, [view, formData.images]);

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
    const savedDraft = localStorage.getItem("buzi_draft_new");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (
          window.confirm(
            "Es gibt einen ungespeicherten Entwurf für einen neuen Eintrag. Möchtest du ihn laden?"
          )
        ) {
          setFormData(parsed);
          setOriginalData(parsed);
          setView("editor");
          return;
        } else {
          localStorage.removeItem("buzi_draft_new");
        }
      } catch (e) {}
    }
    const initial = {
      title: "",
      location: "",
      address: "",
      content: "",
      theme: "modern",
      accentColor: "indigo",
      bgStyle: "clean",
      heroStyle: "compact",
      images: [],
      blocks: [{ id: 1, type: "text", content: "" }],
      date: new Date().toISOString().split("T")[0],
      endDate: "",
      coverImage: "",
    };
    setFormData(initial);
    setOriginalData(initial);
    setView("editor");
  };

  const startEdit = (memory) => {
    setEditingId(memory.id);
    const savedDraft = localStorage.getItem(`buzi_draft_${memory.id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (
          window.confirm(
            "Du hast ungespeicherte Änderungen an diesem Eintrag. Laden?"
          )
        ) {
          setFormData(parsed);
          setOriginalData(parsed);
          setView("editor");
          return;
        } else {
          localStorage.removeItem(`buzi_draft_${memory.id}`);
        }
      } catch (e) {}
    }
    const initialImages = (memory.images || []).map((id, index) => {
      if (typeof id === "string" && id.startsWith("data:"))
        return { id: null, url: id };
      return { id: id, url: `PENDING_REF_${index}` };
    });
    const editableBlocks = memory.blocks
      ? hydrateBlocks(memory.blocks, initialImages)
      : [{ id: 1, type: "text", content: memory.content || "" }];
    const data = {
      ...memory,
      address: memory.address || "", // Handle legacy data without address
      images: initialImages,
      blocks: editableBlocks,
      date: memory.date?.toDate
        ? memory.date.toDate().toISOString().split("T")[0]
        : memory.date,
      endDate: memory.endDate
        ? memory.endDate.toDate
          ? memory.endDate.toDate().toISOString().split("T")[0]
          : memory.endDate
        : "",
      coverImage: memory.coverImage || "",
    };
    setFormData(data);
    setOriginalData(data);
    setView("editor");
  };

  const handleExitEditor = () => {
    if (editingId && hasChanges) {
      if (
        window.confirm("Du hast ungespeicherte Änderungen. Wirklich verlassen?")
      ) {
        setView("home");
      }
    } else {
      setView("home");
    }
  };

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const currentData = formDataRef.current;
    if (!currentData.title) {
      addToast("Titel fehlt! Bitte gib einen Titel ein.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const firstImageObj =
        currentData.images.length > 0 ? currentData.images[0] : null;
      let sourceImage = currentData.coverImage;
      if (!sourceImage && firstImageObj) {
        sourceImage = firstImageObj.url;
      }

      let previewImage = "";
      if (sourceImage && sourceImage.startsWith("data:")) {
        const blob = await fetch(sourceImage).then((r) => r.blob());
        previewImage = await compressImage(blob, 800, 0.7);
      } else if (sourceImage && !sourceImage.startsWith("PENDING_REF")) {
        previewImage = sourceImage;
      }

      const imageIds = [];
      for (const imgObj of currentData.images) {
        const isObj = typeof imgObj === "object";
        const existingId = isObj ? imgObj.id : null;
        const dataUrl = isObj ? imgObj.url : imgObj;
        if (existingId) {
          imageIds.push(existingId);
        } else if (dataUrl && dataUrl.startsWith("data:")) {
          const assetDoc = await addDoc(
            collection(
              db,
              "artifacts",
              appId,
              "public",
              "data",
              "memory_assets"
            ),
            { imageData: dataUrl, createdAt: serverTimestamp() }
          );
          imageIds.push(assetDoc.id);
        }
      }
      const savedBlocks = dehydrateBlocks(
        currentData.blocks,
        currentData.images
      );
      const payload = {
        title: currentData.title,
        location: currentData.location,
        address: currentData.address || "", // Save Address
        date: new Date(currentData.date),
        endDate: currentData.endDate ? new Date(currentData.endDate) : null,
        author: user.displayName,
        theme: currentData.theme,
        accentColor: currentData.accentColor,
        bgStyle: currentData.bgStyle,
        heroStyle: currentData.heroStyle,
        images: imageIds,
        previewImage: previewImage,
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

      const draftKey = editingId ? `buzi_draft_${editingId}` : "buzi_draft_new";
      localStorage.removeItem(draftKey);
      setView("home");
      addToast("Erfolgreich gespeichert!", "success");
    } catch (err) {
      console.error(err);
      addToast("Fehler beim Speichern: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerDelete = () => {
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "memories", editingId)
      );
      localStorage.removeItem(`buzi_draft_${editingId}`);
      setShowDeleteConfirm(false);
      setView("home");
      addToast("Eintrag gelöscht.", "info");
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      addToast("Fehler: " + error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering logic
  const filteredMemories = useMemo(() => {
    if (!searchTerm) return memories;
    const lower = searchTerm.toLowerCase();
    return memories.filter(
      (m) =>
        m.title?.toLowerCase().includes(lower) ||
        m.location?.toLowerCase().includes(lower) ||
        m.author?.toLowerCase().includes(lower)
    );
  }, [memories, searchTerm]);

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

  return (
    <div className="min-h-screen bg-[#fafaf9] relative">
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              message={t.msg}
              type={t.type}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>

      {view === "editor" ? (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50">
            <div className="flex gap-4 items-center">
              <Button variant="ghost" onClick={handleExitEditor}>
                <ChevronLeft />
              </Button>
              <div className="flex flex-col">
                <h2 className="font-bold">
                  {editingId ? "Eintrag bearbeiten" : "Neuer Eintrag"}
                </h2>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Save size={10} /> Entwurf wird lokal gespeichert
                </span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-xs text-slate-400 mr-2 flex items-center gap-1">
                <Database size={12} /> Bilder extern
              </div>
              {editingId &&
                (showDeleteConfirm ? (
                  <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg border border-red-100 animate-in fade-in slide-in-from-right-4">
                    <span className="text-xs text-red-600 font-bold ml-2">
                      Wirklich?
                    </span>
                    <button
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-white text-slate-500 p-1.5 rounded border hover:bg-slate-50 transition-colors"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={triggerDelete}>
                    <Trash2 size={16} />
                  </Button>
                ))}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || (editingId && !hasChanges)}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Speichere...
                  </>
                ) : editingId ? (
                  "Speichern"
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
                  <div className="mb-4 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {formData.endDate ? "Zeitraum" : "Datum"}
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-400 cursor-pointer hover:text-indigo-600">
                        <input
                          type="checkbox"
                          className="accent-indigo-600 rounded"
                          checked={!!formData.endDate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              endDate: e.target.checked ? formData.date : "",
                            });
                          }}
                        />{" "}
                        Zeitraum?
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-700"
                        />
                      </div>
                      {formData.endDate && (
                        <>
                          <div className="flex items-center text-slate-400">
                            <ArrowRight size={16} />
                          </div>
                          <div className="flex-1">
                            <input
                              type="date"
                              value={formData.endDate}
                              min={formData.date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  endDate: e.target.value,
                                })
                              }
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-700"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <AddressAutocomplete
                  label="Genaue Adresse (Optional, für Karte)"
                  placeholder="z.B. Hasenweg 3 Germering (wird nicht angezeigt)"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <Input
                  label="Ort (Wird angezeigt)"
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
                <div className="space-y-6">
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
      ) : view === "detail" ? (
        <MemoryDetail
          memory={selectedMemory}
          onBack={() => setView("home")}
          onEdit={startEdit}
          isAuthor={true}
        />
      ) : (
        <div>
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b px-6 h-20 flex items-center justify-between">
            <div
              onClick={() => {
                setView("home");
                setViewMode("grid");
                setSearchTerm("");
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="text-indigo-600" />
              <span className="font-serif text-xl font-bold text-slate-800 hidden md:block">
                BUZI Tagebuch
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 rounded-full text-sm transition-all outline-none border w-32 focus:w-64"
                />
              </div>

              {/* View Toggles */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "map"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Map View"
                >
                  <MapIcon size={18} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200"></div>

              <Button onClick={startCreate}>
                <Plus size={18} /> <span className="hidden md:inline">Neu</span>
              </Button>
            </div>
          </nav>

          {viewMode === "map" ? (
            <InteractiveMap
              memories={filteredMemories}
              onNavigate={(mem) => openDetail(mem)}
              onSelectLocation={(locName) => {
                setSearchTerm(locName);
              }}
            />
          ) : (
            <main className="max-w-6xl mx-auto p-6 pt-12">
              <header className="mb-16 text-center max-w-2xl mx-auto">
                <h2 className="text-5xl font-serif text-slate-900 mb-6">
                  {searchTerm ? `Suche: "${searchTerm}"` : "Unsere Stories"}
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  {searchTerm
                    ? `${filteredMemories.length} Treffer gefunden.`
                    : "Das geheime Archiv für unsere Insider, Abenteuer und alles, was wir nicht vergessen wollen."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                  >
                    Suche zurücksetzen
                  </button>
                )}
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMemories.map((mem) => (
                  <MemoryCard
                    key={mem.id}
                    memory={mem}
                    onClick={() => openDetail(mem)}
                  />
                ))}
              </div>
              {filteredMemories.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl mt-8">
                  <p className="text-slate-400 mb-4">
                    {searchTerm
                      ? "Nichts gefunden. Probier was anderes!"
                      : "Noch gähnende Leere hier."}
                  </p>
                  <Button variant="secondary" onClick={startCreate}>
                    Trau dich Buzi
                  </Button>
                </div>
              )}
            </main>
          )}
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;700&display=swap'); .font-serif { font-family: 'Playfair Display', serif; } .font-handwriting { font-family: 'Caveat', cursive; } body { font-family: 'Inter', sans-serif; } .animate-fade-in { animation: fadeIn 0.3s forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-slide-up { animation: slideUp 1s forwards; } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}