"use strict";

/* =============================================================
   Lịch trình cho bạn
   A dependency-free weekly planner with streaks, journal,
   congratulations letters and an animated ocean.
   ============================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const pad2 = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseKey = (k) => {
  const [y, m, d] = String(k).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return keyOf(d);
};
const weekdayOf = (k) => parseKey(k).getDay();
const monthKeyOf = (k) => k.slice(0, 7);
const escapeHtml = (v) =>
  String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

function startOfWeek(k) {
  const d = parseKey(k);
  const shift = (d.getDay() + 6) % 7; // Monday is the first day
  d.setDate(d.getDate() - shift);
  return keyOf(d);
}

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)] || "";
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
let idSeq = 0;
function uid(prefix) {
  idSeq = (idSeq + 1) % 999;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}-${Math.random().toString(36).slice(2, 6)}`;
}

/* --------------------------------------------------------------- language */

const LANG_KEY = "lich-trinh-cho-ban.lang";
const SUPPORTED_LANGS = ["en", "vi", "ja", "es"];
const TITLES = {
  en: "Lịch trình cho bạn — Weekly planner",
  vi: "Lịch trình cho bạn — Lịch tuần & nhật ký",
  ja: "Lịch trình cho bạn — 週間プランナー",
  es: "Lịch trình cho bạn — Planificador semanal"
};

function readLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

let lang = readLang();

function t(key, params) {
  const dict = window.I18N || {};
  const local = dict[lang] || {};
  const fallback = dict.en || {};
  let value = local[key] != null ? local[key] : fallback[key];
  if (value == null) value = key;
  if (params) {
    value = String(value).replace(/\{(\w+)\}/g, (m, name) =>
      params[name] == null ? m : String(params[name])
    );
  }
  return String(value);
}

function D() {
  return (window.I18N && window.I18N[lang]) || window.I18N.en;
}

function getList(key) {
  const local = D()[key];
  if (Array.isArray(local) && local.length) return local;
  return (window.I18N.en && window.I18N.en[key]) || [];
}

function fullDate(k) {
  const d = parseKey(k);
  return `${D().weekdaysFull[d.getDay()]} · ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function shortDate(k) {
  const d = parseKey(k);
  return `${D().weekdaysShort[d.getDay()]} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}
function monthName(m) {
  return D().monthsFull[m];
}
function shortMonth(m) {
  return D().monthsShort[m];
}
function timeHM(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
  } catch {
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
}
function dateTimeLabel(ts) {
  if (!ts) return fullDate(todayKey());
  return `${fullDate(keyOf(new Date(ts)))} · ${timeHM(ts)}`;
}

/* --------------------------------------------------------------- catalog */

const CATEGORIES = [
  { id: "it", emoji: "💻", color: "#2dd4bf" },
  { id: "language", emoji: "🗣️", color: "#60a5fa" },
  { id: "health", emoji: "🏃", color: "#34d399" },
  { id: "skill", emoji: "🎨", color: "#f472b6" },
  { id: "work", emoji: "🧭", color: "#f59e0b" },
  { id: "relax", emoji: "🌿", color: "#a78bfa" },
  { id: "mind", emoji: "🧘", color: "#fbbf24" }
];

const ACTIVITIES = [
  ["python", "it", "🐍"], ["javascript", "it", "🟨"], ["typescript", "it", "🔷"],
  ["react", "it", "⚛️"], ["node", "it", "🟢"], ["htmlcss", "it", "🧱"],
  ["sql", "it", "🗃️"], ["database", "it", "🗄️"], ["dsa", "it", "🧮"],
  ["oop", "it", "🧩"], ["git", "it", "🔀"], ["linux", "it", "🐧"],
  ["docker", "it", "🐳"], ["devops", "it", "♻️"], ["cloud", "it", "☁️"],
  ["network", "it", "🌐"], ["security", "it", "🛡️"], ["ai", "it", "🤖"],
  ["deep", "it", "🧠"], ["data", "it", "📊"], ["nlp", "it", "💬"],
  ["cv", "it", "👁️"], ["mobile", "it", "📱"], ["game", "it", "🎮"],
  ["uiux", "it", "🖌️"], ["testing", "it", "🧪"], ["api", "it", "🔌"],
  ["architecture", "it", "🏛️"], ["blockchain", "it", "⛓️"], ["iot", "it", "📡"],
  ["prompt", "it", "✨"], ["leetcode", "it", "🏆"],

  ["english", "language", "🇬🇧"], ["vocab", "language", "🔤"], ["podcast", "language", "🎧"],
  ["ielts", "language", "📝"], ["japanese", "language", "🇯🇵"], ["korean", "language", "🇰🇷"],
  ["chinese", "language", "🇨🇳"], ["speaking", "language", "🗣️"], ["movie", "language", "🎬"],

  ["morning", "health", "🌅"], ["run", "health", "🏃"], ["gym", "health", "🏋️"],
  ["yoga", "health", "🧘"], ["swim", "health", "🏊"], ["steps", "health", "👟"],
  ["water", "health", "💧"], ["sleep", "health", "😴"],

  ["read", "skill", "📖"], ["journaling", "skill", "✍️"], ["draw", "skill", "🖌️"],
  ["instrument", "skill", "🎸"], ["photo", "skill", "📷"], ["public", "skill", "🎤"],
  ["chess", "skill", "♟️"], ["cooking", "skill", "🍳"],

  ["deepwork", "work", "🎯"], ["project", "work", "🛠️"], ["meeting", "work", "👥"],
  ["email", "work", "📧"], ["research", "work", "🔬"], ["portfolio", "work", "💼"],
  ["relax-networking", "work", "🤝"],

  ["music", "relax", "🎵"], ["movie-relax", "relax", "🍿"], ["gaming", "relax", "🕹️"],
  ["family", "relax", "👨‍👩‍👧"], ["friends", "relax", "👋"], ["coffee", "relax", "☕"],
  ["nature", "relax", "🌳"],

  ["meditate", "mind", "🧘"], ["breathe", "mind", "🌬️"], ["gratitude", "mind", "🙏"],
  ["detox", "mind", "📵"], ["reflect", "mind", "🌙"], ["planweek", "mind", "🗓️"]
].map(([id, cat, emoji]) => ({ id, cat, emoji }));

const LEGACY_CATS = { study: "it", custom: "skill" };

function catById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
function catName(id) {
  return catById(id) ? t(`cat.${id}`) : String(id || "");
}
function catColor(id) {
  return (catById(id) || {}).color || "#7dd3fc";
}
function actTitle(a) {
  return a && a.custom ? (a.title || "") : t(`act.${a ? a.id : ""}`);
}
function activityById(id) {
  return ACTIVITIES.find((a) => a.id === id) || state.customActivities.find((a) => a.id === id) || null;
}
function allActivities() {
  return [...ACTIVITIES, ...state.customActivities];
}
function taskInfo(task) {
  const act = task && task.libId ? activityById(task.libId) : null;
  if (act) {
    return { title: actTitle(act), emoji: act.emoji, cat: act.cat };
  }
  return {
    title: (task && task.title) || "—",
    emoji: (task && task.emoji) || "•",
    cat: (task && task.cat) || "it"
  };
}

/* --------------------------------------------------------------- storage */

const STORAGE_KEY = "lich-trinh-cho-ban.v2";
const LEGACY_KEY = "nhip-song.v1";
const PROFILE_KEY = "lich-trinh-cho-ban.google";
const FILE_KEY = "lich-trinh-cho-ban.drive-file";
const TOKEN_KEY = "lich-trinh-cho-ban.token";

function defaultState() {
  return {
    tasks: {},
    customActivities: [],
    journals: {},
    letters: [],
    monthLetters: {},
    missedDays: {},
    resolvedMissed: {},
    protectedDays: {},
    penaltyLog: [],
    best: 0,
    tokens: 0,
    nextTokenAt: 7,
    lastPenaltyPrompt: null,
    updatedAt: 0
  };
}

function normalizeCat(cat) {
  const fixed = LEGACY_CATS[cat] || cat;
  return catById(fixed) ? fixed : "skill";
}

function normalizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  const done = !!raw.done;
  return {
    id: raw.id || uid("task"),
    libId: raw.libId || null,
    title: raw.title || raw.name || null,
    emoji: raw.emoji || null,
    cat: raw.cat ? normalizeCat(raw.cat) : null,
    done,
    createdAt: Number(raw.createdAt) || Date.now(),
    doneAt: done ? (Number(raw.doneAt) || Number(raw.createdAt) || Date.now()) : null,
    missed: !!raw.missed,
    movedTo: raw.movedTo || null,
    movedFrom: raw.movedFrom || null
  };
}

function normalizeLetter(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = raw.type === "month" ? "month" : "day";
  const dayKey = /^\d{4}-\d{2}-\d{2}$/.test(raw.dayKey || "") ? raw.dayKey : todayKey();
  return {
    id: raw.id || uid("letter"),
    type,
    dayKey,
    monthKey: raw.monthKey || monthKeyOf(dayKey),
    titleKey: raw.titleKey || "letter.t1",
    count: Number(raw.count) || 0,
    planned: Number(raw.planned) || 0,
    streak: Number(raw.streak) || 0,
    first: !!raw.first,
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.slice(0, 40).map((x) => ({
          libId: x && x.libId ? x.libId : null,
          title: x && x.title ? String(x.title) : null,
          emoji: x && x.emoji ? String(x.emoji) : null
        }))
      : [],
    read: !!raw.read,
    createdAt: Number(raw.createdAt) || Date.now()
  };
}

function normalizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;

  if (raw.tasks && typeof raw.tasks === "object") {
    Object.keys(raw.tasks).forEach((k) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      const list = Array.isArray(raw.tasks[k]) ? raw.tasks[k] : [];
      const clean = list.map(normalizeTask).filter(Boolean);
      if (clean.length) base.tasks[k] = clean;
    });
  }

  if (Array.isArray(raw.customActivities)) {
    base.customActivities = raw.customActivities
      .filter((c) => c && typeof c === "object" && (c.title || c.name))
      .slice(0, 200)
      .map((c) => ({
        id: c.id || uid("custom"),
        custom: true,
        cat: normalizeCat(c.cat),
        emoji: String(c.emoji || "✨").slice(0, 4),
        title: String(c.title || c.name).slice(0, 60),
        createdAt: Number(c.createdAt) || Date.now()
      }));
  }

  if (raw.journals && typeof raw.journals === "object") {
    Object.keys(raw.journals).forEach((k) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      const j = raw.journals[k];
      if (!j || typeof j !== "object") return;
      const text = String(j.text || "");
      const mood = Number.isFinite(Number(j.mood)) && j.mood !== null ? clamp(Number(j.mood), 0, 4) : null;
      if (!text.trim() && mood === null) return;
      base.journals[k] = { text, mood, updatedAt: Number(j.updatedAt) || Date.now() };
    });
  }

  if (Array.isArray(raw.letters)) {
    base.letters = raw.letters.map(normalizeLetter).filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 120);
  }

  if (raw.monthLetters && typeof raw.monthLetters === "object") {
    Object.keys(raw.monthLetters).forEach((k) => {
      if (/^\d{4}-\d{2}$/.test(k) && raw.monthLetters[k]) base.monthLetters[k] = true;
    });
  }
  if (raw.missedDays && typeof raw.missedDays === "object") {
    Object.keys(raw.missedDays).forEach((k) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && raw.missedDays[k]) base.missedDays[k] = true;
    });
  }
  if (raw.resolvedMissed && typeof raw.resolvedMissed === "object") {
    Object.keys(raw.resolvedMissed).forEach((k) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && raw.resolvedMissed[k]) {
        base.resolvedMissed[k] = String(raw.resolvedMissed[k]);
      }
    });
  }
  if (raw.protectedDays && typeof raw.protectedDays === "object") {
    Object.keys(raw.protectedDays).forEach((k) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && raw.protectedDays[k]) base.protectedDays[k] = true;
    });
  }

  if (Array.isArray(raw.penaltyLog)) {
    base.penaltyLog = raw.penaltyLog.filter((p) => p && p.text).slice(-100).map((p) => ({
      text: String(p.text),
      at: Number(p.at) || Date.now(),
      days: Array.isArray(p.days) ? p.days.slice(0, 14) : []
    }));
  }

  base.best = Math.max(0, Number(raw.best) || 0);
  base.tokens = Math.max(0, Number(raw.tokens) || 0);
  base.nextTokenAt = Math.max(7, Number(raw.nextTokenAt) || 7);
  base.lastPenaltyPrompt = raw.lastPenaltyPrompt || null;
  base.updatedAt = Number(raw.updatedAt) || 0;
  return base;
}

let firstRun = false;
let state = defaultState();

function loadState() {
  let rawNew = null;
  let rawOld = null;
  try {
    rawNew = localStorage.getItem(STORAGE_KEY);
    rawOld = localStorage.getItem(LEGACY_KEY);
  } catch (err) {
    console.warn("Could not read saved data", err);
  }

  if (rawNew) {
    try {
      return normalizeState(JSON.parse(rawNew));
    } catch (err) {
      console.warn("Saved data was corrupted", err);
    }
  }

  if (rawOld) {
    try {
      const migrated = normalizeState(JSON.parse(rawOld));
      migrated.letters = [];
      migrated.monthLetters = {};
      migrated.missedDays = {};
      migrated.resolvedMissed = {};
      migrated.protectedDays = {};
      migrated.lastPenaltyPrompt = null;
      return migrated;
    } catch (err) {
      console.warn("Old saved data was corrupted", err);
    }
  }

  firstRun = true;
  return defaultState();
}

function persistLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Could not save locally", err);
  }
}

function save() {
  state.updatedAt = Date.now();
  persistLocal();
  scheduleSync();
}

function hasStateData(s) {
  if (!s) return false;
  return (
    Object.values(s.tasks || {}).some((list) => Array.isArray(list) && list.length) ||
    (s.letters || []).length > 0 ||
    Object.keys(s.journals || {}).length > 0 ||
    (s.customActivities || []).length > 0
  );
}
function hasLocalData() {
  return hasStateData(state);
}

function mergeStates(local, remote) {
  const merged = defaultState();

  const dayKeys = new Set([...Object.keys(local.tasks || {}), ...Object.keys(remote.tasks || {})]);
  dayKeys.forEach((key) => {
    const map = new Map();
    [...(remote.tasks[key] || []), ...(local.tasks[key] || [])].forEach((raw) => {
      const task = normalizeTask(raw);
      if (!task) return;
      const cur = map.get(task.id);
      if (!cur) {
        map.set(task.id, task);
      } else {
        map.set(task.id, {
          ...cur,
          ...task,
          done: cur.done || task.done,
          doneAt: Math.max(cur.doneAt || 0, task.doneAt || 0) || null,
          missed: cur.missed || task.missed,
          title: cur.title || task.title,
          emoji: cur.emoji || task.emoji
        });
      }
    });
    if (map.size) merged.tasks[key] = [...map.values()];
  });

  const custom = new Map();
  [...(remote.customActivities || []), ...(local.customActivities || [])].forEach((c) => {
    if (!custom.has(c.id)) custom.set(c.id, c);
  });
  merged.customActivities = [...custom.values()];

  const journals = {};
  new Set([...Object.keys(local.journals || {}), ...Object.keys(remote.journals || {})]).forEach((k) => {
    const a = local.journals[k];
    const b = remote.journals[k];
    if (!a) journals[k] = b;
    else if (!b) journals[k] = a;
    else journals[k] = (Number(a.updatedAt) || 0) >= (Number(b.updatedAt) || 0) ? a : b;
  });
  merged.journals = journals;

  const letters = new Map();
  [...(remote.letters || []), ...(local.letters || [])].forEach((raw) => {
    const letter = normalizeLetter(raw);
    if (!letter) return;
    const cur = letters.get(letter.id);
    if (!cur) letters.set(letter.id, letter);
    else letters.set(letter.id, { ...cur, ...letter, read: cur.read || letter.read, createdAt: Math.min(cur.createdAt, letter.createdAt) });
  });
  merged.letters = [...letters.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 120);

  merged.monthLetters = { ...(remote.monthLetters || {}), ...(local.monthLetters || {}) };
  merged.missedDays = { ...(remote.missedDays || {}), ...(local.missedDays || {}) };
  merged.resolvedMissed = { ...(remote.resolvedMissed || {}), ...(local.resolvedMissed || {}) };
  merged.protectedDays = { ...(remote.protectedDays || {}), ...(local.protectedDays || {}) };
  merged.penaltyLog = [...(remote.penaltyLog || []), ...(local.penaltyLog || [])].slice(-100);
  merged.best = Math.max(Number(local.best) || 0, Number(remote.best) || 0);
  merged.tokens = Math.max(Number(local.tokens) || 0, Number(remote.tokens) || 0);
  merged.nextTokenAt = Math.max(7, Number(local.nextTokenAt) || 0, Number(remote.nextTokenAt) || 0);
  merged.lastPenaltyPrompt = local.lastPenaltyPrompt || remote.lastPenaltyPrompt || null;
  merged.updatedAt = Date.now();
  return merged;
}

/* --------------------------------------------------------------- clock */

let today = todayKey();
let lastKnownToday = today;
let selectedKey = today;
let viewStart = startOfWeek(today);
let pendingWeekScroll = true;
let journalDraft = null;
let journalTimer = null;
let activeLetter = null;
let activeCat = "all";
let activeSuggest = "reading";
let penaltyIndex = 0;
let dragLibId = null;

/* --------------------------------------------------------------- calculations */

function getTasks(key) {
  if (!state.tasks[key]) state.tasks[key] = [];
  return state.tasks[key];
}
function peekTasks(key) {
  return state.tasks[key] || [];
}
function taskCounts(key) {
  const list = peekTasks(key);
  if (!list.length) return { total: 0, done: 0, perfect: false, hasOpen: false };
  const done = list.filter((t) => t.done).length;
  return {
    total: list.length,
    done,
    perfect: done === list.length && key <= today,
    hasOpen: done < list.length
  };
}

function computeStreak() {
  let streak = 0;
  let guard = 0;
  let k = today;
  if (peekTasks(today).length && !peekTasks(today).every((t) => t.done)) {
    k = addDays(today, -1);
  }
  while (guard < 900) {
    guard++;
    if (state.protectedDays[k]) {
      k = addDays(k, -1);
      continue;
    }
    const list = peekTasks(k);
    if (!list.length) {
      k = addDays(k, -1);
      continue;
    }
    if (!list.every((t) => t.done)) break;
    streak++;
    k = addDays(k, -1);
  }
  return streak;
}

function tierFor(streak) {
  if (streak <= 0) return 0;
  if (streak <= 2) return 1;
  if (streak <= 6) return 2;
  if (streak <= 13) return 3;
  if (streak <= 29) return 4;
  return 5;
}

function unresolvedMissedKeys() {
  return Object.keys(state.tasks)
    .filter((k) =>
      k < today &&
      !state.protectedDays[k] &&
      !state.resolvedMissed[k] &&
      peekTasks(k).some((t) => !t.done)
    )
    .sort();
}

function cleanupEmptyDay(key) {
  state.tasks[key] = (state.tasks[key] || []).filter(Boolean);
  if (!state.tasks[key].length) {
    delete state.tasks[key];
    delete state.resolvedMissed[key];
  }
}

function awardTokens() {
  const streak = computeStreak();
  let earned = 0;
  while (streak >= state.nextTokenAt && earned < 100) {
    earned++;
    state.nextTokenAt += 7;
  }
  if (earned) state.tokens += earned;
  return earned;
}

/* --------------------------------------------------------------- rendering */

function renderWeek() {
  viewStart = startOfWeek(viewStart);
  const start = viewStart;
  const end = addDays(start, 6);
  const a = parseKey(start);
  const b = parseKey(end);

  $("#weekTitle").textContent = (() => {
    const months = D().monthsShort;
    if (a.getFullYear() !== b.getFullYear()) {
      return `${shortDate(start)}/${a.getFullYear()} – ${shortDate(end)}/${b.getFullYear()}`;
    }
    switch (lang) {
      case "vi":
        return `${a.getDate()}/${a.getMonth() + 1} – ${b.getDate()}/${b.getMonth() + 1}, ${b.getFullYear()}`;
      case "ja":
        return `${b.getFullYear()}年${a.getMonth() + 1}月${a.getDate()}日〜${b.getMonth() + 1}月${b.getDate()}日`;
      case "es":
        return `${a.getDate()} ${months[a.getMonth()]} – ${b.getDate()} ${months[b.getMonth()]}, ${b.getFullYear()}`;
      default:
        return `${months[a.getMonth()]} ${a.getDate()} – ${months[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
    }
  })();

  let total = 0;
  let done = 0;
  const cards = [];
  for (let i = 0; i < 7; i++) {
    const key = addDays(start, i);
    const list = peekTasks(key);
    const counts = taskCounts(key);
    total += counts.total;
    done += counts.done;
    cards.push(dayCard(key, list, counts));
  }

  $("#weekSub").textContent = total
    ? t("week.progress", { done, total, percent: Math.round((done / total) * 100) })
    : t("week.empty");

  const prevScroll = $("#weekGrid").scrollLeft;
  $("#weekGrid").innerHTML = cards.join("");
  $("#weekGrid").scrollLeft = prevScroll;

  if (pendingWeekScroll) {
    pendingWeekScroll = false;
    const grid = $("#weekGrid");
    const card = grid.querySelector(`[data-day="${selectedKey}"]`);
    if (card && grid.scrollWidth > grid.clientWidth) {
      grid.scrollTo({ left: Math.max(0, card.offsetLeft - grid.offsetLeft - 8), behavior: "smooth" });
    }
  }

  const isThis = viewStart === startOfWeek(today);
  $("#btnThisWeek").disabled = isThis;
  $("#btnThisWeek").style.opacity = isThis ? ".5" : "";
}

function dayCard(key, list, counts) {
  const d = parseKey(key);
  const isToday = key === today;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const isSelected = key === selectedKey;
  const missed = key < today && counts.hasOpen && !state.protectedDays[key] && !state.resolvedMissed[key];
  const classes = ["day-card"];
  if (isWeekend) classes.push("is-weekend");
  if (isToday) classes.push("is-today");
  if (isSelected) classes.push("is-selected");
  if (counts.perfect) classes.push("is-perfect");
  if (missed) classes.push("is-missed");

  const chips = list.slice(0, 3).map((task) => taskChip(task, key)).join("");
  const more = list.length > 3 ? `<span class="chip-more">+${list.length - 3}</span>` : "";
  const tasksHtml = list.length
    ? chips + more
    : `<div class="day-empty">${escapeHtml(t("week.add"))}</div>`;

  const flags = [];
  if (isToday) flags.push(`<span class="day-badge">${escapeHtml(t("week.today"))}</span>`);
  if (counts.perfect) flags.push(`<span class="day-flag" title="${escapeHtml(t("week.perfect"))}">🔥</span>`);
  if (missed) flags.push(`<span class="day-flag is-warn" title="${escapeHtml(t("week.missed"))}">⚠</span>`);

  const openCount = counts.total - counts.done;
  const completeBtn = openCount > 0
    ? `<button class="day-act act-complete" type="button" data-act="complete" data-day="${key}" title="${escapeHtml(t("week.completeAll"))}" aria-label="${escapeHtml(t("week.completeAll"))}">✓</button>`
    : "";
  const clearBtn = counts.total > 0
    ? `<button class="day-act act-clear" type="button" data-act="clear" data-day="${key}" title="${escapeHtml(t("week.clear"))}" aria-label="${escapeHtml(t("week.clear"))}">×</button>`
    : "";

  return `
    <article class="${classes.join(" ")}" data-day="${key}" tabindex="0" aria-label="${escapeHtml(fullDate(key))} — ${counts.done}/${counts.total}">
      <div class="day-head">
        <div class="day-date">
          <span class="day-name">${escapeHtml(D().weekdaysShort[d.getDay()])}</span>
          <span class="day-num">${pad2(d.getDate())}</span>
          <span class="day-month">${escapeHtml(shortMonth(d.getMonth()))}</span>
        </div>
        <div class="day-flags">${flags.join("")}</div>
      </div>
      <div class="day-meter"><span style="width:${counts.total ? Math.round((counts.done / counts.total) * 100) : 0}%"></span></div>
      <div class="day-tasks">${tasksHtml}</div>
      <div class="day-foot">
        <span class="day-count">${counts.total ? `${counts.done}/${counts.total}` : escapeHtml(t("week.empty"))}</span>
        <div class="day-actions">
          <button class="day-act" type="button" data-act="add" data-day="${key}" title="${escapeHtml(t("week.add"))}" aria-label="${escapeHtml(t("week.add"))}">＋</button>
          ${completeBtn}
          ${clearBtn}
        </div>
      </div>
    </article>
  `;
}

function taskChip(task, key) {
  const info = taskInfo(task);
  const missed = !task.done && (key < today || task.missed) && !state.protectedDays[key] && !state.resolvedMissed[key];
  return `
    <div class="task-chip ${task.done ? "is-done" : ""} ${missed ? "is-missed" : ""}">
      <button class="chip-check" type="button" data-toggle-task="${escapeHtml(task.id)}" data-day="${key}" aria-pressed="${task.done}" aria-label="${escapeHtml(t("task.toggle"))}">${task.done ? "✓" : ""}</button>
      <span class="chip-label">${escapeHtml(info.title)}</span>
      <button class="chip-remove" type="button" data-remove-task="${escapeHtml(task.id)}" data-day="${key}" title="${escapeHtml(t("task.remove"))}" aria-label="${escapeHtml(t("task.remove"))}">×</button>
    </div>
  `;
}

function renderStreak(grew) {
  const streak = computeStreak();
  const tier = tierFor(streak);
  const card = $("#streakCard");
  for (let i = 0; i <= 5; i++) card.classList.remove(`tier-${i}`);
  card.classList.add(`tier-${tier}`);

  $("#streakNumber").textContent = streak;
  $("#streakTier").textContent = t(`tier.${tier}`);
  if (streak > state.best) state.best = streak;
  $("#bestStreak").textContent = Math.max(streak, state.best || 0);
  $("#tokenCount").textContent = state.tokens;

  if (grew && streak > 0 && lastRenderedStreak !== null && streak > lastRenderedStreak) {
    card.classList.remove("is-growing");
    void card.offsetWidth;
    card.classList.add("is-growing");
    setTimeout(() => card.classList.remove("is-growing"), 1400);
  }
  lastRenderedStreak = streak;
  return streak;
}
let lastRenderedStreak = null;

function renderLibrary() {
  if (activeCat !== "all" && !catById(activeCat)) activeCat = "all";

  const tabs = [`<button class="cat-tab ${activeCat === "all" ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeCat === "all"}" data-cat="all"><span class="cat-dot" style="--cat-color:#7dd3fc"></span>${escapeHtml(t("library.all"))}<span class="cat-count">${allActivities().length}</span></button>`];
  CATEGORIES.forEach((cat) => {
    const count = allActivities().filter((a) => a.cat === cat.id).length;
    tabs.push(`<button class="cat-tab ${activeCat === cat.id ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeCat === cat.id}" data-cat="${cat.id}"><span class="cat-dot" style="--cat-color:${cat.color}"></span>${escapeHtml(t(`cat.${cat.id}`))}<span class="cat-count">${count}</span></button>`);
  });
  $("#categoryTabs").innerHTML = tabs.join("");
  $("#libraryTarget").textContent = t("library.addTo", { date: shortDate(selectedKey) });

  const q = $("#librarySearch").value.trim().toLowerCase();
  const planned = new Set(peekTasks(selectedKey).map((task) => task.libId));
  const list = allActivities().filter((a) => {
    if (activeCat !== "all" && a.cat !== activeCat) return false;
    if (!q) return true;
    return `${actTitle(a)} ${catName(a.cat)}`.toLowerCase().includes(q);
  });

  $("#libraryGrid").innerHTML = list.map((a) => {
    const cat = catById(a.cat) || { color: "#7dd3fc" };
    return `
      <button class="lib-card ${planned.has(a.id) ? "is-planned" : ""}" type="button" draggable="true" data-add-activity="${escapeHtml(a.id)}" style="--cat-color:${cat.color}" title="${escapeHtml(actTitle(a))}">
        <span class="lib-emoji" aria-hidden="true">${escapeHtml(a.emoji)}</span>
        <span class="lib-info">
          <span class="lib-name">${escapeHtml(actTitle(a))}</span>
          <span class="lib-cat">${escapeHtml(catName(a.cat))}</span>
        </span>
        <span class="lib-plus" aria-hidden="true">${planned.has(a.id) ? "✓" : "＋"}</span>
      </button>
    `;
  }).join("");

  $("#libraryEmpty").hidden = list.length > 0;
}

function renderQuickGrid() {
  const q = $("#quickSearch").value.trim().toLowerCase();
  const addedIds = new Set(peekTasks(selectedKey).map((task) => task.libId));
  const groups = [];

  CATEGORIES.forEach((cat) => {
    const list = allActivities().filter((a) => {
      if (a.cat !== cat.id) return false;
      if (!q) return true;
      return `${actTitle(a)} ${catName(a.cat)}`.toLowerCase().includes(q);
    });
    if (!list.length) return;
    groups.push(`
      <div class="quick-group">
        <h4><span class="cat-dot" style="--cat-color:${cat.color}"></span>${escapeHtml(t(`cat.${cat.id}`))}</h4>
        <div class="quick-cards">
          ${list.map((a) => `
            <button class="quick-card ${addedIds.has(a.id) ? "is-added" : ""}" type="button" data-add-activity="${escapeHtml(a.id)}">
              <span class="lib-emoji" aria-hidden="true">${escapeHtml(a.emoji)}</span>
              <span class="lib-info">
                <span class="lib-name">${escapeHtml(actTitle(a))}</span>
              </span>
              <span class="quick-check" aria-hidden="true">${addedIds.has(a.id) ? "✓" : "＋"}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `);
  });

  $("#quickGrid").innerHTML = groups.join("");
  $("#quickEmpty").hidden = groups.length > 0;
}

const SUGGEST_TABS = [
  { id: "reading", icon: "📚", label: "suggest.read" },
  { id: "music", icon: "🎧", label: "suggest.listen" },
  { id: "learn", icon: "💻", label: "suggest.learn" }
];
const SUGGEST_COLORS = { reading: "#fbbf24", music: "#a78bfa", learn: "#34d399" };
const SUGGEST_ICONS = { reading: "📖", music: "🎵", learn: "🧑‍💻" };

function renderSuggestions() {
  $("#suggestTabs").innerHTML = SUGGEST_TABS.map((tab) => `
    <button class="suggest-tab ${activeSuggest === tab.id ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeSuggest === tab.id}" data-suggest="${tab.id}">
      ${tab.icon} ${escapeHtml(t(tab.label))}
    </button>
  `).join("");

  const list = getList(activeSuggest);
  const color = SUGGEST_COLORS[activeSuggest] || "#7dd3fc";
  const icon = SUGGEST_ICONS[activeSuggest] || "✨";
  $("#suggestList").innerHTML = list.map((item) => `
    <a class="suggest-item" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="--suggest-color:${color}" aria-label="${escapeHtml(`${item.title} — ${t("suggest.open")}`)}">
      <span class="suggest-icon" aria-hidden="true">${icon}</span>
      <span class="suggest-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.desc)}</small>
      </span>
      <span class="suggest-arrow" aria-hidden="true">↗</span>
    </a>
  `).join("");
}

function renderJournal() {
  if (!journalDraft || journalDraft.key !== selectedKey) {
    const entry = state.journals[selectedKey];
    journalDraft = {
      key: selectedKey,
      text: entry ? entry.text : "",
      mood: entry && entry.mood !== null ? entry.mood : null
    };
  }

  $("#journalFor").textContent = shortDate(selectedKey);
  const prompts = getList("prompts");
  if (prompts.length) {
    let h = 0;
    for (const ch of selectedKey) h = (h * 31 + ch.charCodeAt(0)) | 0;
    $("#journalPrompt").textContent = prompts[Math.abs(h) % prompts.length];
  }

  const moods = getList("moods");
  $("#journalMood").innerHTML = moods.map((label, i) => `
    <button class="mood-chip ${journalDraft.mood === i ? "is-active" : ""}" type="button" data-mood="${i}" aria-pressed="${journalDraft.mood === i}">
      <span class="mood-emoji" aria-hidden="true">${["😄", "🙂", "😐", "😔", "😣"][i] || "•"}</span>
      <span>${escapeHtml(label)}</span>
    </button>
  `).join("");

  if ($("#journalText").value !== journalDraft.text) $("#journalText").value = journalDraft.text;

  const entry = state.journals[selectedKey];
  $("#journalHint").textContent = entry ? t("journal.savedAt", { time: timeHM(entry.updatedAt) }) : "";
  $("#btnDeleteJournal").hidden = !entry && !journalDraft.text.trim() && journalDraft.mood === null;

  renderJournalRecent();
}

function renderJournalRecent() {
  const keys = Object.keys(state.journals)
    .filter((k) => {
      const entry = state.journals[k];
      return entry && ((entry.text || "").trim() || entry.mood !== null);
    })
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 12);

  $("#journalRecent").innerHTML = keys.length
    ? keys.map((k) => {
        const entry = state.journals[k];
        const label = (entry.text || "").trim()
          ? entry.text.replace(/\s+/g, " ").slice(0, 90)
          : (getList("moods")[entry.mood] || t("journal.noEntries"));
        return `
          <button class="journal-mini" type="button" data-journal-day="${k}">
            <span class="jm-date">${escapeHtml(shortDate(k))}</span>
            <span class="jm-text">${escapeHtml(label)}</span>
          </button>
        `;
      }).join("")
    : `<p class="empty-note" style="font-size:10px">${escapeHtml(t("journal.empty"))}</p>`;
}

function collectHistory() {
  const rows = [];
  Object.keys(state.tasks).forEach((key) => {
    peekTasks(key).forEach((task) => {
      if (!task) return;
      if (task.done) {
        rows.push({ key, task, done: true, time: task.doneAt });
      } else if (key < today && !state.protectedDays[key]) {
        rows.push({ key, task, done: false, time: 0 });
      }
    });
  });
  rows.sort((a, b) => {
    if (a.key !== b.key) return b.key.localeCompare(a.key);
    if (a.done !== b.done) return a.done ? -1 : 1;
    return (b.time || 0) - (a.time || 0);
  });
  return rows;
}

function groupHistory(rows, limitDays) {
  const groups = [];
  const byKey = new Map();
  rows.forEach((row) => {
    let group = byKey.get(row.key);
    if (!group) {
      if (limitDays && groups.length >= limitDays) return;
      group = { key: row.key, rows: [] };
      byKey.set(row.key, group);
      groups.push(group);
    }
    group.rows.push(row);
  });
  return groups;
}

function historyRowsHtml(rows) {
  return rows.map((row) => {
    const info = taskInfo(row.task);
    return `
      <div class="log-entry">
        <span class="log-emoji" aria-hidden="true">${escapeHtml(info.emoji)}</span>
        <span class="log-name">${escapeHtml(info.title)}</span>
        <span class="log-tag ${row.done ? "is-done" : "is-missed"}">${escapeHtml(t(row.done ? "log.done" : "log.missed"))}</span>
        <time>${row.done ? escapeHtml(timeHM(row.time)) : ""}</time>
      </div>
    `;
  }).join("");
}

function renderLog() {
  const rows = collectHistory();
  const groups = groupHistory(rows, 6);
  $("#logEmpty").hidden = groups.length > 0;
  $("#activityLog").innerHTML = groups.map((group) => {
    const done = group.rows.filter((r) => r.done).length;
    return `
      <div class="log-day">
        <div class="log-day-head">
          <strong>${escapeHtml(fullDate(group.key))}</strong>
          <span>${escapeHtml(t("log.xDone", { n: done }))}</span>
        </div>
        ${historyRowsHtml(group.rows)}
      </div>
    `;
  }).join("");
}

function renderHistory() {
  const groups = groupHistory(collectHistory(), 0);
  $("#historyList").innerHTML = groups.length
    ? groups.map((group) => {
        const done = group.rows.filter((r) => r.done).length;
        return `
          <article class="hist-day">
            <div class="hist-head">
              <strong>${escapeHtml(fullDate(group.key))}</strong>
              <span>${escapeHtml(t("log.xDone", { n: done }))}</span>
            </div>
            ${group.rows.map((row) => {
              const info = taskInfo(row.task);
              return `
                <div class="hist-entry">
                  <span class="log-emoji" aria-hidden="true">${escapeHtml(info.emoji)}</span>
                  <span class="log-name">${escapeHtml(info.title)}</span>
                  <span class="hist-tag ${row.done ? "is-done" : "is-missed"}">${escapeHtml(t(row.done ? "log.done" : "log.missed"))}</span>
                  <time>${row.done ? escapeHtml(timeHM(row.time)) : ""}</time>
                </div>
              `;
            }).join("")}
          </article>
        `;
      }).join("")
    : `<p class="empty-note">${escapeHtml(t("history.empty"))}</p>`;
}

function letterHeading(letter) {
  if (letter.type === "month") {
    const m = parseKey(letter.monthKey ? `${letter.monthKey}-01` : letter.dayKey);
    return t("letter.monthTitle", { month: monthName(m.getMonth()) });
  }
  return t(letter.titleKey || "letter.t1");
}

function letterDateLabel(letter) {
  if (letter.type === "month") {
    const m = parseKey(letter.monthKey ? `${letter.monthKey}-01` : letter.dayKey);
    return t("letter.monthDate", { month: monthName(m.getMonth()), year: m.getFullYear() });
  }
  return fullDate(letter.dayKey);
}

function letterTaskLabel(entry) {
  const act = entry.libId ? activityById(entry.libId) : null;
  if (act) return { title: actTitle(act), emoji: act.emoji };
  return { title: entry.title || "—", emoji: entry.emoji || "•" };
}

function buildLetterBody(letter) {
  const streak = Number.isFinite(Number(letter.streak)) ? Number(letter.streak) : computeStreak();
  const paras = [];

  if (letter.type === "month") {
    const m = parseKey(letter.monthKey ? `${letter.monthKey}-01` : letter.dayKey);
    paras.push(t("letter.monthP1", {
      month: monthName(m.getMonth()),
      done: letter.count || 0,
      planned: letter.planned || 0
    }));
    paras.push(t("letter.monthP2", { streak }));
    paras.push(t("letter.monthP3"));
  } else {
    const date = fullDate(letter.dayKey);
    paras.push(t(letter.dayKey === today ? "letter.todayP" : "letter.pastP", {
      date,
      count: letter.count || 0
    }));
    if (letter.first) paras.push(t("letter.firstP"));
    if (streak > 0) paras.push(t("letter.streakP", { streak }));
  }

  const html = paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  if (letter.type === "day" && letter.tasks && letter.tasks.length) {
    const rows = letter.tasks.map((entry) => {
      const info = letterTaskLabel(entry);
      return `<li><span aria-hidden="true">${escapeHtml(info.emoji)}</span>${escapeHtml(info.title)}</li>`;
    }).join("");
    return `${html}<ul class="letter-list">${rows}</ul>`;
  }
  return html;
}

function renderLetter(letter) {
  if (!letter) return;
  const streak = Number.isFinite(Number(letter.streak)) ? Number(letter.streak) : computeStreak();
  $("#letterDate").textContent = letterDateLabel(letter);
  $("#letterTitle").textContent = letterHeading(letter);
  $("#letterBody").innerHTML = buildLetterBody(letter);
  $("#letterSign").textContent = t("letter.sign", { streak });
  $("#btnDeleteLetter").setAttribute("aria-label", t("mail.delete"));
}

function renderMail() {
  const letters = [...state.letters].sort((a, b) => b.createdAt - a.createdAt);
  if (!letters.length) {
    $("#mailList").innerHTML = `<div class="mail-empty"><span aria-hidden="true">✉️</span>${escapeHtml(t("mail.empty"))}</div>`;
    return;
  }
  $("#mailList").innerHTML = letters.map((letter) => {
    const meta = letter.type === "month"
      ? `${letterDateLabel(letter)} · ${t("mail.month")}`
      : `${letterDateLabel(letter)} · ${t("mail.streak", { n: letter.streak || 0 })}`;
    return `
      <div class="mail-item ${letter.read ? "" : "is-unread"}">
        <span class="mail-seal" aria-hidden="true">🔥</span>
        <button class="mail-main" type="button" data-open-letter="${escapeHtml(letter.id)}">
          <span class="mail-top">
            <span class="mail-title">${escapeHtml(letterHeading(letter))}</span>
            <span class="mail-tag ${letter.read ? "is-read" : "is-unread"}">${escapeHtml(t(letter.read ? "mail.read" : "mail.unread"))}</span>
          </span>
          <span class="mail-meta">${escapeHtml(meta)}</span>
        </button>
        <button class="mail-del" type="button" data-del-letter="${escapeHtml(letter.id)}" title="${escapeHtml(t("mail.delete"))}" aria-label="${escapeHtml(t("mail.delete"))}">✕</button>
      </div>
    `;
  }).join("");
}

function updateBadges() {
  const unread = state.letters.filter((l) => !l.read).length;
  const badge = $("#mailCount");
  badge.textContent = unread;
  badge.hidden = unread === 0;
  $("#btnMail").setAttribute("aria-label", unread ? `${t("nav.mail")} · ${unread}` : t("nav.mail"));

  const missed = unresolvedMissedKeys();
  $("#btnMissed").hidden = missed.length === 0;
  $("#missedCount").textContent = missed.length;
  $("#btnMissed").setAttribute("title", t("week.missed"));
}

function renderAll(grew) {
  renderWeek();
  renderLibrary();
  renderStreak(grew);
  renderLog();
  renderJournal();
  renderSuggestions();
  updateBadges();
}

/* --------------------------------------------------------------- actions */

function selectDay(key, opts = {}) {
  if (!key) return;
  if (key === selectedKey && !opts.force) {
    if (opts.focusJournal) $("#journalText").focus();
    return;
  }
  commitJournalDraft();
  selectedKey = key;
  viewStart = startOfWeek(key);
  pendingWeekScroll = true;
  journalDraft = null;
  renderAll();
  if (opts.focusJournal) {
    $("#journalText").focus();
    $("#journalText").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (opts.focusLibrary) {
    $("#libraryGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function activityTask(a) {
  return {
    id: uid("task"),
    libId: a.id,
    title: a.custom ? a.title : null,
    emoji: a.emoji,
    cat: a.cat,
    done: false,
    createdAt: Date.now(),
    doneAt: null,
    missed: false,
    movedTo: null,
    movedFrom: null
  };
}

function addActivityToDay(activityId, key = selectedKey, opts = {}) {
  const act = activityById(activityId);
  if (!act) return false;
  const list = getTasks(key);
  if (list.some((task) => task.libId === activityId)) {
    if (!opts.silent) toast(t("toast.alreadyAdded", { title: actTitle(act) }), "warn", "👀");
    return false;
  }
  list.push(activityTask(act));
  if (state.resolvedMissed[key]) delete state.resolvedMissed[key];
  if (list.length === 1 && state.protectedDays[key]) delete state.protectedDays[key];
  save();
  renderWeek();
  renderLibrary();
  updateBadges();
  if (isOpen("quickModal")) renderQuickGrid();
  if (!opts.silent) toast(t("toast.added", { title: actTitle(act), date: shortDate(key) }), "success", "＋");
  return true;
}

function addCustomActivity(name, emoji, cat) {
  const a = {
    id: uid("custom"),
    custom: true,
    cat: normalizeCat(cat),
    emoji: (emoji || "✨").slice(0, 4),
    title: name.slice(0, 60),
    createdAt: Date.now()
  };
  state.customActivities.push(a);
  save();
  renderLibrary();
  toast(t("toast.customAdded", { name: a.title }), "success", "✨");
  return a;
}

function removeTask(key, taskId) {
  const task = peekTasks(key).find((x) => x.id === taskId);
  if (!task) return;
  const info = taskInfo(task);
  state.tasks[key] = peekTasks(key).filter((x) => x.id !== taskId);
  cleanupEmptyDay(key);
  save();
  renderAll();
  toast(t("toast.removed", { title: info.title }), "info", "−");
}

function toggleTask(key, taskId) {
  const task = peekTasks(key).find((x) => x.id === taskId);
  if (!task) return;
  const before = computeStreak();
  task.done = !task.done;
  task.doneAt = task.done ? Date.now() : null;
  if (task.done) task.missed = false;
  afterTaskChange(key, before);
}

function completeDay(key) {
  const list = peekTasks(key);
  const open = list.filter((t) => !t.done);
  if (!open.length) return;
  const before = computeStreak();
  open.forEach((task) => {
    task.done = true;
    task.doneAt = Date.now();
    task.missed = false;
  });
  toast(t("toast.completed", { n: open.length }), "success", "🎉");
  afterTaskChange(key, before);
}

function clearDay(key) {
  const list = peekTasks(key);
  if (!list.length) return;
  if (!window.confirm(t("confirm.clearDay", { n: list.length, date: shortDate(key) }))) return;
  delete state.tasks[key];
  delete state.resolvedMissed[key];
  save();
  renderAll();
  toast(t("toast.dayCleared"), "info", "🧹");
}

function afterTaskChange(key, beforeStreak) {
  const after = computeStreak();
  const earned = awardTokens();
  save();
  renderAll(after > beforeStreak);
  renderMail();
  updateBadges();

  if (after > beforeStreak && after > 0) {
    toast(t("toast.streakUp", { n: after }), "success", "🔥");
    burstConfetti({ count: after >= 7 ? 150 : 100 });
  }
  if (earned > 0) {
    toast(t("toast.tokenEarned", { n: earned }), "success", "🪙");
    burstConfetti({ count: 50, y: innerHeight * 0.55 });
  }

  const letter = maybeCelebrate(key);
  if (letter) {
    save();
    renderMail();
    updateBadges();
    setTimeout(() => openLetter(letter), 380);
  }
}

function suggestPlan(key) {
  const list = getTasks(key);
  if (list.length) {
    const picks = ["python", "english", "run", "read"];
    const existing = new Set(list.map((t) => t.libId));
    if (picks.every((id) => existing.has(id))) {
      toast(t("toast.suggestEnough"), "info", "🌱");
      return;
    }
  }
  const starters = ["python", "english", "run", "read"];
  let added = 0;
  starters.forEach((id) => {
    const act = activityById(id);
    if (!act) return;
    if (getTasks(key).some((t) => t.libId === id)) return;
    getTasks(key).push(activityTask(act));
    added++;
  });
  if (!added) {
    toast(t("toast.suggestEnough"), "info", "🌱");
    return;
  }
  if (state.resolvedMissed[key]) delete state.resolvedMissed[key];
  save();
  renderAll();
  toast(t("toast.suggested", { n: added, date: shortDate(key) }), "success", "🌱");
}

/* --------------------------------------------------------------- journal */

function commitJournalDraft(opts = {}) {
  if (!journalDraft) return "none";
  const key = journalDraft.key;
  const text = String(journalDraft.text || "");
  const mood = journalDraft.mood;
  const existing = state.journals[key];
  const hasContent = text.trim().length > 0 || mood !== null;

  if (!hasContent && !existing && !opts.explicit) return "none";
  if (!hasContent && !existing && opts.explicit) return "empty";

  if (existing &&
      existing.text === text &&
      existing.mood === mood &&
      !opts.force) {
    return "same";
  }

  state.journals[key] = {
    text,
    mood,
    updatedAt: Date.now()
  };
  save();
  if (key === selectedKey) {
    $("#journalHint").textContent = t("journal.savedAt", { time: timeHM(state.journals[key].updatedAt) });
    $("#btnDeleteJournal").hidden = false;
    renderJournalRecent();
  }
  return "saved";
}

function saveJournal() {
  const text = $("#journalText").value;
  journalDraft.text = text;
  const result = commitJournalDraft({ explicit: true, force: true });
  if (result === "empty") {
    toast(t("journal.empty"), "warn", "📝");
    return;
  }
  renderJournal();
  toast(t("toast.journalSaved", { date: shortDate(selectedKey) }), "success", "📝");
}

function deleteJournal() {
  if (!state.journals[selectedKey]) {
    journalDraft = { key: selectedKey, text: "", mood: null };
    $("#journalText").value = "";
    renderJournal();
    return;
  }
  if (!window.confirm(t("confirm.deleteJournal", { date: shortDate(selectedKey) }))) return;
  delete state.journals[selectedKey];
  journalDraft = { key: selectedKey, text: "", mood: null };
  $("#journalText").value = "";
  save();
  renderJournal();
  toast(t("toast.journalDeleted"), "info", "🧹");
}

/* --------------------------------------------------------------- letters */

function titleKeyForStreak(streak) {
  if (streak >= 30) return "letter.t30";
  if (streak >= 14) return "letter.t14";
  if (streak >= 7) return "letter.t7";
  if (streak >= 3) return "letter.t3";
  return "letter.t1";
}

function maybeCelebrate(key) {
  if (key > today) return null;
  const list = peekTasks(key);
  if (!list.length || !list.every((task) => task.done)) return null;
  if (state.letters.some((l) => l.type === "day" && l.dayKey === key)) return null;

  const streak = computeStreak();
  const first = !state.letters.some((l) => l.type === "day");
  const letter = {
    id: uid("letter"),
    type: "day",
    dayKey: key,
    monthKey: monthKeyOf(key),
    titleKey: titleKeyForStreak(streak),
    count: list.length,
    planned: 0,
    streak,
    first,
    tasks: list.slice(0, 40).map((task) => {
      const info = taskInfo(task);
      return { libId: task.libId || null, title: task.libId ? null : info.title, emoji: info.emoji };
    }),
    read: false,
    createdAt: Date.now()
  };
  state.letters.unshift(letter);
  state.letters = state.letters.slice(0, 120);
  return letter;
}

function maybeMonthlyLetter() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mKey = `${prev.getFullYear()}-${pad2(prev.getMonth() + 1)}`;
  if (state.monthLetters[mKey]) return null;

  const keys = Object.keys(state.tasks)
    .filter((k) => k.startsWith(`${mKey}-`) && peekTasks(k).length)
    .sort();
  if (keys.length < 3) return null;
  if (!keys.every((k) => peekTasks(k).every((task) => task.done))) return null;

  const count = keys.reduce((n, k) => n + peekTasks(k).length, 0);
  const last = keys[keys.length - 1];
  const letter = {
    id: uid("letter"),
    type: "month",
    dayKey: last,
    monthKey: mKey,
    titleKey: "letter.monthTitle",
    count,
    planned: keys.length,
    streak: computeStreak(),
    first: false,
    tasks: [],
    read: false,
    createdAt: Date.now()
  };
  state.monthLetters[mKey] = true;
  state.letters.unshift(letter);
  state.letters = state.letters.slice(0, 120);
  return letter;
}

function openLetter(letter) {
  if (!letter) return;
  if (!letter.read) {
    letter.read = true;
    save();
  }
  activeLetter = letter;
  renderLetter(letter);
  openOverlay("letterModal");
  renderMail();
  updateBadges();
}

function closeLetter() {
  closeOverlay("letterModal");
  activeLetter = null;
  setTimeout(maybeAutoPunish, 420);
}

function deleteActiveLetter() {
  if (!activeLetter) return;
  if (!window.confirm(t("confirm.deleteLetter"))) return;
  state.letters = state.letters.filter((l) => l.id !== activeLetter.id);
  activeLetter = null;
  closeOverlay("letterModal");
  save();
  renderMail();
  updateBadges();
  toast(t("toast.letterDeleted"), "info", "🗑");
  setTimeout(maybeAutoPunish, 420);
}

function deleteLetterById(id) {
  const letter = state.letters.find((l) => l.id === id);
  if (!letter) return;
  if (!window.confirm(t("confirm.deleteLetter"))) return;
  state.letters = state.letters.filter((l) => l.id !== id);
  if (activeLetter && activeLetter.id === id) {
    activeLetter = null;
    closeOverlay("letterModal");
  }
  save();
  renderMail();
  updateBadges();
  toast(t("toast.letterDeleted"), "info", "🗑");
}

/* --------------------------------------------------------------- punishment */

function openPunishment(force = false) {
  const keys = unresolvedMissedKeys();
  if (!keys.length) {
    if (force) toast(t("punish.noMissed"), "success", "🕊️");
    return;
  }
  penaltyIndex = rand(Math.max(1, getList("penalties").length));
  renderPunishContent();
  openOverlay("punishModal");
  state.lastPenaltyPrompt = today;
  save();
}

function renderPunishContent() {
  const keys = unresolvedMissedKeys();
  const open = keys.reduce((n, k) => n + peekTasks(k).filter((task) => !task.done).length, 0);
  const labels = keys.slice(0, 3).map(shortDate).join(", ");
  $("#punishSummary").innerHTML = t("punish.summary", {
    open,
    days: keys.length,
    labels: labels ? ` (${escapeHtml(labels)})` : ""
  });

  const penalties = getList("penalties");
  if (penalties.length) {
    const p = penalties[Math.abs(penaltyIndex) % penalties.length];
    $("#penaltyEmoji").textContent = p.emoji || "⚡";
    $("#penaltyText").textContent = p.text || "";
  }

  const tokenLabel = $("#punishToken");
  tokenLabel.textContent = t("punish.token", { n: state.tokens });
  $("#btnUseToken").disabled = state.tokens <= 0 || keys.length === 0;

  const input = $("#rescheduleDate");
  input.min = today;
  if (!input.value || input.value < today) input.value = today;
  $("#btnAcceptPenalty").disabled = keys.length === 0;
  $("#btnMoveToday").disabled = keys.length === 0;
  $("#btnReschedule").disabled = keys.length === 0;
  $("#btnReplan").disabled = keys.length === 0;
}

function acceptPenalty() {
  const keys = unresolvedMissedKeys();
  if (!keys.length) {
    closeOverlay("punishModal");
    return;
  }
  const penalties = getList("penalties");
  const p = penalties[Math.abs(penaltyIndex) % Math.max(1, penalties.length)] || { text: "" };
  keys.forEach((k) => { state.resolvedMissed[k] = "punished"; });
  state.penaltyLog.push({ text: p.text || "", at: Date.now(), days: keys.slice(0, 14) });
  state.penaltyLog = state.penaltyLog.slice(-100);
  save();
  closeOverlay("punishModal");
  renderAll();
  toast(t("toast.penaltySaved"), "info", "💪");
}

function rescheduleMissed(target) {
  const keys = unresolvedMissedKeys();
  if (!keys.length) {
    closeOverlay("punishModal");
    toast(t("punish.nothingMoved"), "info", "✅");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(target || "")) {
    toast(t("punish.invalidDate"), "warn", "📅");
    return;
  }
  if (target < today) {
    toast(t("punish.pastDate"), "warn", "📅");
    return;
  }

  let moved = 0;
  keys.forEach((key) => {
    const open = peekTasks(key).filter((task) => !task.done);
    if (!open.length) return;
    open.forEach((task) => {
      const copy = {
        ...task,
        id: uid("task"),
        done: false,
        doneAt: null,
        missed: false,
        movedFrom: key,
        createdAt: Date.now()
      };
      getTasks(target).push(copy);
      task.missed = true;
      task.movedTo = target;
      moved++;
    });
    state.resolvedMissed[key] = "moved";
    cleanupEmptyDay(key);
  });

  if (!moved) {
    closeOverlay("punishModal");
    toast(t("punish.nothingMoved"), "info", "✅");
    return;
  }

  if (state.resolvedMissed[target]) delete state.resolvedMissed[target];
  if (state.protectedDays[target]) delete state.protectedDays[target];
  commitJournalDraft();
  clearTimeout(journalTimer);
  selectedKey = target;
  viewStart = startOfWeek(target);
  pendingWeekScroll = true;
  journalDraft = null;
  save();
  closeOverlay("punishModal");
  renderAll();
  toast(t("punish.moved", { n: moved, date: shortDate(target) }), "success", "➡️");
}

function useToken() {
  const keys = unresolvedMissedKeys();
  if (!keys.length) {
    closeOverlay("punishModal");
    return;
  }
  if (state.tokens <= 0) {
    toast(t("punish.noTokens"), "warn", "🪙");
    return;
  }
  state.tokens--;
  keys.forEach((k) => {
    state.protectedDays[k] = true;
    state.resolvedMissed[k] = "protected";
  });
  save();
  closeOverlay("punishModal");
  renderAll();
  toast(t("punish.tokenUsed"), "success", "🪙");
  burstConfetti({ count: 60 });
}

function replanFromPunishment() {
  closeOverlay("punishModal");
  commitJournalDraft();
  clearTimeout(journalTimer);
  selectedKey = today;
  viewStart = startOfWeek(today);
  pendingWeekScroll = true;
  journalDraft = null;
  save();
  renderAll();
  openQuickAdd(today);
}

function maybeAutoPunish() {
  if (unresolvedMissedKeys().length && state.lastPenaltyPrompt !== today && !anyOverlayOpen()) {
    openPunishment();
    state.lastPenaltyPrompt = today;
    save();
  }
}

/* --------------------------------------------------------------- overlays */

function anyOverlayOpen() {
  return $$(".modal-layer.open, .letter-layer.open").length > 0;
}

let lastFocused = null;

function openOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!anyOverlayOpen()) lastFocused = document.activeElement;
  el.classList.add("open");
  el.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const target = el.querySelector("[data-autofocus]") ||
    el.querySelector(".modal-close") ||
    el.querySelector("button, input, select, textarea, a[href]");
  if (target) setTimeout(() => target.focus({ preventScroll: true }), 40);
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  el.setAttribute("aria-hidden", "true");
  if (!anyOverlayOpen()) {
    document.body.style.overflow = "";
    if (lastFocused && document.contains(lastFocused)) {
      try { lastFocused.focus({ preventScroll: true }); } catch { /* ignore */ }
    }
    lastFocused = null;
    setTimeout(maybeShowPendingSync, 380);
  }
}

function isOpen(id) {
  const el = document.getElementById(id);
  return !!el && el.classList.contains("open");
}

function openQuickAdd(key) {
  commitJournalDraft();
  clearTimeout(journalTimer);
  selectedKey = key;
  viewStart = startOfWeek(key);
  pendingWeekScroll = true;
  journalDraft = null;
  renderAll();
  $("#quickDateLabel").textContent = t("quick.eyebrow", { date: shortDate(key).toUpperCase() });
  $("#quickSearch").value = "";
  renderQuickGrid();
  openOverlay("quickModal");
  setTimeout(() => $("#quickSearch").focus(), 80);
}

function openHistory() {
  renderHistory();
  openOverlay("historyModal");
}

function openMailbox() {
  renderMail();
  openOverlay("mailModal");
}

function openSetup() {
  openOverlay("setupModal");
}

/* --------------------------------------------------------------- toasts + confetti */

function toast(message, kind = "info", icon = "•", ms = 3800) {
  const host = $("#toasts");
  if (!host) return;
  const el = document.createElement("div");
  el.className = `toast ${kind === "error" ? "is-error" : ""}`;
  const i = document.createElement("span");
  i.className = "toast-icon";
  i.textContent = icon;
  const text = document.createElement("span");
  text.textContent = message;
  el.append(i, text);
  host.appendChild(el);
  setTimeout(() => {
    el.classList.add("is-out");
    setTimeout(() => el.remove(), 300);
  }, ms);
}

const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let fxCanvas = null;
let fxCtx = null;
let fxParticles = [];
let fxRunning = false;
let fxLast = 0;
const FX_COLORS = ["#fbbf24", "#34d399", "#7dd3fc", "#f472b6", "#f97316", "#fef3c7", "#a78bfa"];

function resizeFx() {
  if (!fxCanvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  fxCanvas.width = Math.floor(innerWidth * dpr);
  fxCanvas.height = Math.floor(innerHeight * dpr);
  fxCanvas.style.width = `${innerWidth}px`;
  fxCanvas.style.height = `${innerHeight}px`;
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burstConfetti({ count = 120, x = innerWidth / 2, y = innerHeight * 0.35 } = {}) {
  if (reduceMotion || !fxCtx) return;
  fxParticles = fxParticles.slice(-320);
  for (let i = 0; i < count; i++) {
    fxParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 11,
      vy: -(Math.random() * 7.5 + 2),
      g: 0.2 + Math.random() * 0.1,
      w: 3 + Math.random() * 6,
      h: 5 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      color: pick(FX_COLORS),
      life: 1
    });
  }
  if (!fxRunning) {
    fxRunning = true;
    fxLast = performance.now();
    requestAnimationFrame(fxTick);
  }
}

function fxTick(now) {
  const dt = Math.min(2.2, (now - fxLast) / 16.67 || 1);
  fxLast = now;
  fxCtx.clearRect(0, 0, innerWidth, innerHeight);
  fxParticles = fxParticles.filter((p) => p.y < innerHeight + 50 && p.life > 0);
  for (const p of fxParticles) {
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
    p.life -= 0.0025 * dt;
    fxCtx.save();
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);
    fxCtx.globalAlpha = clamp(p.life, 0, 1);
    fxCtx.fillStyle = p.color;
    fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    fxCtx.restore();
  }
  if (fxParticles.length) {
    requestAnimationFrame(fxTick);
  } else {
    fxCtx.clearRect(0, 0, innerWidth, innerHeight);
    fxRunning = false;
  }
}

/* --------------------------------------------------------------- google drive */

const DRIVE_FILE = "lich-trinh-cho-ban-backup.json";
const DRIVE_SCOPE = "openid email profile https://www.googleapis.com/auth/drive.appdata";

let gsiPromise = null;
let profile = null;
let accessToken = "";
let tokenExpiresAt = 0;
let driveFileId = null;
let authStatus = "local";
let pendingRemote = null;
let popoverOpen = false;
let authBusy = false;
let syncTimer = null;
let syncErrorNotified = false;
let syncSuppressed = false;

function getClientId() {
  const cfg = window.APP_CONFIG || {};
  return String(cfg.googleClientId || "").trim();
}

function isHttp() {
  return location.protocol === "http:" || location.protocol === "https:";
}

function setAuthStatus(status) {
  authStatus = status;
  renderAuth();
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function persistProfile() {
  try {
    if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_KEY);
  } catch { /* ignore */ }
}

function loadToken() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
    if (raw && raw.token && Number(raw.expiresAt) > Date.now() + 30000) {
      accessToken = raw.token;
      tokenExpiresAt = Number(raw.expiresAt);
      return true;
    }
  } catch { /* ignore */ }
  sessionStorage.removeItem(TOKEN_KEY);
  accessToken = "";
  tokenExpiresAt = 0;
  return false;
}

function saveToken() {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token: accessToken, expiresAt: tokenExpiresAt }));
  } catch { /* ignore */ }
}

function clearToken() {
  accessToken = "";
  tokenExpiresAt = 0;
  try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

function hasValidToken() {
  return !!accessToken && tokenExpiresAt > Date.now() + 10000;
}

function loadGsi() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi_load"));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

function requestGoogleToken() {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (!resp || resp.error || !resp.access_token) {
          reject(new Error((resp && resp.error) || "oauth"));
          return;
        }
        accessToken = resp.access_token;
        tokenExpiresAt = Date.now() + Math.max(60, Number(resp.expires_in) || 3500) * 1000;
        saveToken();
        resolve(resp);
      },
      error_callback: (err) => reject(new Error((err && err.type) || "popup_closed"))
    });
    client.requestAccessToken({ prompt: "" });
  });
}

async function fetchProfile() {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`profile_${res.status}`);
  const data = await res.json();
  return {
    email: data.email || "",
    name: data.name || data.email || "Google",
    picture: data.picture || ""
  };
}

async function apiGet(path) {
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("token_expired");
  }
  if (!res.ok) throw new Error(`drive_${res.status}`);
  return res.json();
}

async function findDriveFile() {
  const data = await apiGet("/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&pageSize=100");
  return (data.files || []).find((f) => f.name === DRIVE_FILE) || null;
}

async function createDriveFile() {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: DRIVE_FILE, parents: ["appDataFolder"] })
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("token_expired");
  }
  if (!res.ok) throw new Error(`drive_${res.status}`);
  const data = await res.json();
  return data.id;
}

async function downloadDriveFile() {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveFileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("token_expired");
  }
  if (!res.ok) throw new Error(`drive_${res.status}`);
  const text = await res.text();
  return JSON.parse(text || "{}");
}

async function ensureDriveFileId() {
  if (driveFileId) return driveFileId;
  const meta = await findDriveFile();
  if (meta) {
    driveFileId = meta.id;
    try { localStorage.setItem(FILE_KEY, driveFileId); } catch { /* ignore */ }
    return driveFileId;
  }
  driveFileId = await createDriveFile();
  try { localStorage.setItem(FILE_KEY, driveFileId); } catch { /* ignore */ }
  return driveFileId;
}

async function uploadToDrive({ silent = false } = {}) {
  if (!profile || !hasValidToken()) {
    if (profile) setAuthStatus("needs-auth");
    return false;
  }
  try {
    setAuthStatus("saving");
    await ensureDriveFileId();
    const payload = JSON.stringify({ app: "lich-trinh-cho-ban", syncedAt: Date.now(), state });
    let res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(driveFileId)}?uploadType=media`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: payload
    });
    if (res.status === 404) {
      driveFileId = null;
      await ensureDriveFileId();
      res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(driveFileId)}?uploadType=media`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: payload
      });
    }
    if (res.status === 401) {
      clearToken();
      throw new Error("token_expired");
    }
    if (!res.ok) throw new Error(`upload_${res.status}`);
    syncErrorNotified = false;
    setAuthStatus("saved");
    if (!silent) toast(t("toast.synced"), "success", "☁️");
    return true;
  } catch (err) {
    handleSyncError(err, !silent);
    return false;
  }
}

function scheduleSync() {
  if (syncSuppressed) return;
  clearTimeout(syncTimer);
  if (!profile) return;
  syncTimer = setTimeout(() => {
    if (!profile) return;
    if (!hasValidToken()) {
      setAuthStatus("needs-auth");
      return;
    }
    uploadToDrive({ silent: true });
  }, 2500);
}

function handleSyncError(err, notify) {
  console.warn("Drive sync:", err && err.message);
  if (String(err && err.message).includes("401") || String(err && err.message).includes("token")) {
    clearToken();
    setAuthStatus("needs-auth");
  } else {
    setAuthStatus("error");
  }
  if (notify && !syncErrorNotified) {
    syncErrorNotified = true;
    toast(t("toast.syncFailed"), "error", "⚠");
  }
}

async function signIn() {
  if (authBusy) return;
  if (!getClientId() || !isHttp()) {
    openSetup();
    return;
  }
  authBusy = true;
  closePopover();
  setAuthStatus("saving");
  try {
    await loadGsi();
    await requestGoogleToken();
    try {
      profile = await fetchProfile();
    } catch {
      profile = { email: "", name: "Google", picture: "" };
    }
    persistProfile();
    renderAuth();
    toast(t("toast.signedIn", { email: profile.email || profile.name || "Google" }), "success", "🔐");
    await syncAfterSignIn();
  } catch (err) {
    console.warn("Google sign-in failed", err);
    setAuthStatus(profile ? "needs-auth" : "local");
    toast(t("toast.syncFailed"), "error", "⚠");
  } finally {
    authBusy = false;
    renderAuth();
  }
}

async function syncAfterSignIn() {
  setAuthStatus("saving");
  try {
    const meta = await findDriveFile();
    if (!meta) {
      const ok = await uploadToDrive({ silent: true });
      if (ok) toast(t("auth.cloudUploaded"), "success", "☁️");
      return;
    }
    driveFileId = meta.id;
    try { localStorage.setItem(FILE_KEY, driveFileId); } catch { /* ignore */ }
    const remoteWrap = await downloadDriveFile();
    const remoteState = normalizeState(remoteWrap.state || remoteWrap);

    if (!hasLocalData() && hasStateData(remoteState)) {
      applyRemoteState(remoteState);
      toast(t("auth.cloudRestored"), "success", "☁️");
      setAuthStatus("saved");
      return;
    }
    if ((remoteState.updatedAt || 0) > (state.updatedAt || 0) + 1500 && hasLocalData()) {
      setAuthStatus("saved");
      openSyncChoice(remoteState);
      return;
    }
    const ok = await uploadToDrive({ silent: true });
    if (ok) toast(t("auth.cloudUploaded"), "success", "☁️");
  } catch (err) {
    handleSyncError(err, true);
  }
}

async function pullFromCloud() {
  if (!profile || !hasValidToken()) return;
  try {
    setAuthStatus("saving");
    const meta = await findDriveFile();
    if (!meta) {
      await uploadToDrive({ silent: true });
      return;
    }
    driveFileId = meta.id;
    try { localStorage.setItem(FILE_KEY, driveFileId); } catch { /* ignore */ }
    const remoteWrap = await downloadDriveFile();
    const remoteState = normalizeState(remoteWrap.state || remoteWrap);
    const remoteTs = remoteState.updatedAt || 0;

    if (remoteTs > (state.updatedAt || 0) + 3000) {
      if (hasLocalData()) {
        setAuthStatus("saved");
        openSyncChoice(remoteState);
      } else {
        applyRemoteState(remoteState);
      }
    } else if ((state.updatedAt || 0) > remoteTs + 3000) {
      await uploadToDrive({ silent: true });
    } else {
      setAuthStatus("saved");
    }
  } catch (err) {
    handleSyncError(err, false);
  }
}

async function manualSync() {
  if (authBusy) return;
  closePopover();
  if (!profile) {
    signIn();
    return;
  }
  if (!hasValidToken()) {
    signIn();
    return;
  }
  setAuthStatus("saving");
  try {
    const meta = await findDriveFile();
    if (!meta) {
      const ok = await uploadToDrive({ silent: true });
      if (ok) toast(t("toast.synced"), "success", "☁️");
      return;
    }
    driveFileId = meta.id;
    const remoteWrap = await downloadDriveFile();
    const remoteState = normalizeState(remoteWrap.state || remoteWrap);
    if ((remoteState.updatedAt || 0) > (state.updatedAt || 0) + 1500) {
      setAuthStatus("saved");
      openSyncChoice(remoteState);
      return;
    }
    const ok = await uploadToDrive({ silent: true });
    if (ok) toast(t("toast.synced"), "success", "☁️");
  } catch (err) {
    handleSyncError(err, true);
  }
}

function applyRemoteState(remoteState) {
  state = normalizeState(remoteState);
  persistLocal();
  today = todayKey();
  lastKnownToday = today;
  selectedKey = today;
  viewStart = startOfWeek(today);
  pendingWeekScroll = true;
  journalDraft = null;
  activeLetter = null;
  closeOverlay("letterModal");
  closeOverlay("syncModal");
  renderAll();
  renderMail();
  updateBadges();
  setAuthStatus("saved");
}

function openSyncChoice(remoteState) {
  pendingRemote = remoteState;
  $("#syncWhen").textContent = t("auth.syncBody", { date: dateTimeLabel(remoteState.updatedAt) });
  if (anyOverlayOpen()) return;
  openOverlay("syncModal");
}

function maybeShowPendingSync() {
  if (!pendingRemote || anyOverlayOpen() || isOpen("syncModal")) return;
  $("#syncWhen").textContent = t("auth.syncBody", { date: dateTimeLabel(pendingRemote.updatedAt) });
  openOverlay("syncModal");
}

function useCloudBackup() {
  if (!pendingRemote) {
    closeOverlay("syncModal");
    return;
  }
  const remote = pendingRemote;
  pendingRemote = null;
  applyRemoteState(remote);
  toast(t("auth.cloudRestored"), "success", "☁️");
}

async function keepLocalBackup() {
  pendingRemote = null;
  closeOverlay("syncModal");
  const ok = await uploadToDrive({ silent: true });
  if (ok) toast(t("auth.cloudUploaded"), "success", "☁️");
}

async function mergeCloudBackup() {
  if (!pendingRemote) {
    closeOverlay("syncModal");
    return;
  }
  const remote = pendingRemote;
  pendingRemote = null;
  state = mergeStates(state, remote);
  syncSuppressed = true;
  save();
  syncSuppressed = false;
  persistLocal();
  today = todayKey();
  selectedKey = today;
  viewStart = startOfWeek(today);
  pendingWeekScroll = true;
  journalDraft = null;
  renderAll();
  renderMail();
  updateBadges();
  closeOverlay("syncModal");
  toast(t("auth.cloudMerged"), "success", "🔀");
  await uploadToDrive({ silent: true });
}

function cancelSyncChoice() {
  pendingRemote = null;
  closeOverlay("syncModal");
}

function signOut() {
  const token = accessToken;
  clearToken();
  if (token && window.google && google.accounts && google.accounts.oauth2 && google.accounts.oauth2.revoke) {
    try { google.accounts.oauth2.revoke(token); } catch { /* ignore */ }
  }
  clearTimeout(syncTimer);
  profile = null;
  driveFileId = null;
  pendingRemote = null;
  popoverOpen = false;
  persistProfile();
  try { localStorage.removeItem(FILE_KEY); } catch { /* ignore */ }
  authStatus = "local";
  renderAuth();
  toast(t("toast.signedOut"), "info", "👋");
}

function closePopover() {
  popoverOpen = false;
  renderAuth();
}

function renderAuth() {
  const googleBtn = $("#btnGoogle");
  const chip = $("#accountChip");
  const pop = $("#accountPop");
  if (!googleBtn || !chip || !pop) return;

  googleBtn.hidden = !!profile;
  chip.hidden = !profile;
  pop.hidden = !(profile && popoverOpen);

  if (!profile) {
    $("#syncIndicator").textContent = "";
    $("#syncDot").className = "sync-dot";
    return;
  }

  const name = profile.name || profile.email || "Google";
  $("#accountName").textContent = name;
  $("#accountEmail").textContent = profile.email || "Google Drive";
  $("#accountStatus").textContent = statusLong();
  $("#syncIndicator").textContent = statusShort();
  $("#syncDot").className = "sync-dot" +
    (authStatus === "saving" ? " is-saving" : "") +
    (authStatus === "error" || authStatus === "needs-auth" ? " is-error" : "");
  $("#btnSyncNow").textContent = t("auth.syncNow");
  $("#btnSyncNow").disabled = authStatus === "saving";

  const avatar = $("#accountAvatar");
  const initial = String(name).trim().charAt(0).toUpperCase() || "G";
  avatar.textContent = initial;
  const pic = profile.picture || "";
  if (pic) {
    if (avatar.dataset.pic !== pic) {
      avatar.dataset.pic = pic;
      avatar.style.backgroundImage = "";
      avatar.classList.remove("has-photo");
      const img = new Image();
      img.onload = () => {
        avatar.style.backgroundImage = `url("${pic.replace(/"/g, "%22")}")`;
        avatar.classList.add("has-photo");
      };
      img.src = pic;
    }
  } else {
    avatar.dataset.pic = "";
    avatar.style.backgroundImage = "";
    avatar.classList.remove("has-photo");
  }
}

function statusShort() {
  switch (authStatus) {
    case "saving": return t("auth.saving");
    case "saved": return t("auth.saved");
    case "needs-auth": return t("auth.reconnect");
    case "error": return t("auth.error");
    default: return t("auth.local");
  }
}

function statusLong() {
  switch (authStatus) {
    case "needs-auth": return t("auth.syncNeeded");
    case "saved": return t("auth.saved");
    case "saving": return t("auth.working");
    case "error": return t("auth.error");
    default: return t("auth.local");
  }
}

function initAuth() {
  profile = loadProfile();
  try { driveFileId = localStorage.getItem(FILE_KEY) || null; } catch { driveFileId = null; }
  if (profile) {
    const valid = loadToken();
    setAuthStatus(valid ? "saved" : "needs-auth");
    if (valid) {
      setTimeout(pullFromCloud, 1600);
    }
  } else {
    setAuthStatus("local");
  }
}

/* --------------------------------------------------------------- language apply */

function applyStaticTranslations() {
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  $$("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
  $$("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = TITLES[lang] || TITLES.en;
  applyStaticTranslations();
  $("#yearNow").textContent = new Date().getFullYear();
  renderCustomCategoryOptions();
  renderAll();

  if (isOpen("historyModal")) renderHistory();
  if (isOpen("quickModal")) renderQuickGrid();
  if (isOpen("punishModal")) renderPunishContent();
  if (activeLetter) renderLetter(activeLetter);
  if (pendingRemote && isOpen("syncModal")) {
    $("#syncWhen").textContent = t("auth.syncBody", { date: dateTimeLabel(pendingRemote.updatedAt) });
  }
  renderAuth();
  renderMail();
  updateBadges();
}

function setLanguage(next) {
  if (!SUPPORTED_LANGS.includes(next)) next = "en";
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  $("#langSelect").value = lang;
  applyLanguage();
}

function renderCustomCategoryOptions() {
  const sel = $("#customCategory");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = CATEGORIES.map((c) =>
    `<option value="${c.id}">${escapeHtml(t(`cat.${c.id}`))}</option>`
  ).join("");
  sel.value = CATEGORIES.some((c) => c.id === prev) ? prev : "it";
}

/* --------------------------------------------------------------- day / night */

function setDayNight() {
  const hour = new Date().getHours();
  const day = hour >= 6 && hour < 18;
  document.body.classList.toggle("is-day", day);
  document.body.classList.toggle("is-night", !day);
}

function checkDayChange() {
  const now = todayKey();
  if (now === lastKnownToday) return;
  lastKnownToday = now;
  today = now;
  const wasOnOldToday = selectedKey < today;
  if (wasOnOldToday) {
    commitJournalDraft();
    clearTimeout(journalTimer);
    selectedKey = today;
    viewStart = startOfWeek(today);
    pendingWeekScroll = true;
    journalDraft = null;
  }
  setDayNight();
  renderAll();
  updateBadges();
  renderMail();
}

/* --------------------------------------------------------------- events */

function bindEvents() {
  $("#langSelect").addEventListener("change", (e) => setLanguage(e.target.value));

  $("#btnPrevWeek").addEventListener("click", () => {
    commitJournalDraft();
    clearTimeout(journalTimer);
    viewStart = addDays(viewStart, -7);
    selectedKey = addDays(selectedKey, -7);
    pendingWeekScroll = true;
    journalDraft = null;
    renderAll();
  });
  $("#btnNextWeek").addEventListener("click", () => {
    commitJournalDraft();
    clearTimeout(journalTimer);
    viewStart = addDays(viewStart, 7);
    selectedKey = addDays(selectedKey, 7);
    pendingWeekScroll = true;
    journalDraft = null;
    renderAll();
  });
  $("#btnThisWeek").addEventListener("click", () => {
    commitJournalDraft();
    clearTimeout(journalTimer);
    selectedKey = today;
    viewStart = startOfWeek(today);
    pendingWeekScroll = true;
    journalDraft = null;
    renderAll();
    toast(t("toast.today"), "info", "🌊");
  });
  $("#btnSuggestWeek").addEventListener("click", () => suggestPlan(selectedKey));
  $("#btnMissed").addEventListener("click", () => openPunishment(true));

  const weekGrid = $("#weekGrid");
  weekGrid.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-toggle-task]");
    if (toggle) {
      toggleTask(toggle.dataset.day, toggle.dataset.toggleTask);
      return;
    }
    const remove = e.target.closest("[data-remove-task]");
    if (remove) {
      removeTask(remove.dataset.day, remove.dataset.removeTask);
      return;
    }
    const action = e.target.closest("[data-act]");
    if (action) {
      const key = action.dataset.day;
      if (action.dataset.act === "add") openQuickAdd(key);
      else if (action.dataset.act === "complete") {
        selectedKey = key;
        viewStart = startOfWeek(key);
        renderWeek();
        completeDay(key);
      } else if (action.dataset.act === "clear") {
        clearDay(key);
      }
      return;
    }
    const card = e.target.closest(".day-card");
    if (card) selectDay(card.dataset.day);
  });
  weekGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".day-card");
    if (!card || e.target !== card) return;
    e.preventDefault();
    selectDay(card.dataset.day);
  });

  weekGrid.addEventListener("dragover", (e) => {
    if (!dragLibId) return;
    const card = e.target.closest(".day-card");
    if (!card) return;
    e.preventDefault();
    $$(".day-card.is-drop-target", weekGrid).forEach((el) => el.classList.remove("is-drop-target"));
    card.classList.add("is-drop-target");
  });
  weekGrid.addEventListener("dragleave", (e) => {
    const card = e.target.closest(".day-card");
    if (card) card.classList.remove("is-drop-target");
  });
  weekGrid.addEventListener("drop", (e) => {
    if (!dragLibId) return;
    const card = e.target.closest(".day-card");
    if (!card) return;
    e.preventDefault();
    const id = dragLibId;
    dragLibId = null;
    $$(".day-card.is-drop-target", weekGrid).forEach((el) => el.classList.remove("is-drop-target"));
    commitJournalDraft();
    clearTimeout(journalTimer);
    selectedKey = card.dataset.day;
    viewStart = startOfWeek(selectedKey);
    journalDraft = null;
    addActivityToDay(id, selectedKey);
    renderAll();
  });

  const libraryGrid = $("#libraryGrid");
  libraryGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-add-activity]");
    if (!card) return;
    addActivityToDay(card.dataset.addActivity);
  });
  libraryGrid.addEventListener("dragstart", (e) => {
    const card = e.target.closest("[data-add-activity]");
    if (!card) return;
    dragLibId = card.dataset.addActivity;
    try {
      e.dataTransfer.setData("text/plain", dragLibId);
      e.dataTransfer.effectAllowed = "copy";
    } catch { /* ignore */ }
    card.classList.add("is-dragging");
  });
  libraryGrid.addEventListener("dragend", (e) => {
    const card = e.target.closest("[data-add-activity]");
    if (card) card.classList.remove("is-dragging");
    dragLibId = null;
    $$(".day-card.is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
  });

  $("#categoryTabs").addEventListener("click", (e) => {
    const tab = e.target.closest("[data-cat]");
    if (!tab) return;
    activeCat = tab.dataset.cat;
    renderLibrary();
  });
  $("#librarySearch").addEventListener("input", renderLibrary);

  const customForm = $("#customForm");
  $("#btnCustom").addEventListener("click", () => {
    customForm.hidden = !customForm.hidden;
    if (!customForm.hidden) {
      renderCustomCategoryOptions();
      $("#customEmoji").focus();
    }
  });
  $("#btnCustomClose").addEventListener("click", () => { customForm.hidden = true; });
  customForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#customName").value.trim();
    if (!name) return;
    const emoji = $("#customEmoji").value.trim() || "✨";
    const cat = $("#customCategory").value || "it";
    addCustomActivity(name, emoji, cat);
    $("#customName").value = "";
    $("#customEmoji").value = "";
    customForm.hidden = true;
    $("#librarySearch").value = "";
    activeCat = cat;
    renderLibrary();
  });

  $("#journalMood").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-mood]");
    if (!chip) return;
    const index = Number(chip.dataset.mood);
    journalDraft.mood = journalDraft.mood === index ? null : index;
    renderJournal();
  });
  $("#journalText").addEventListener("input", (e) => {
    journalDraft.text = e.target.value;
    $("#btnDeleteJournal").hidden = false;
    clearTimeout(journalTimer);
    journalTimer = setTimeout(() => {
      commitJournalDraft();
    }, 900);
  });
  $("#btnSaveJournal").addEventListener("click", saveJournal);
  $("#btnDeleteJournal").addEventListener("click", deleteJournal);
  $("#journalRecent").addEventListener("click", (e) => {
    const mini = e.target.closest("[data-journal-day]");
    if (mini) selectDay(mini.dataset.journalDay, { focusJournal: true });
  });

  $("#suggestTabs").addEventListener("click", (e) => {
    const tab = e.target.closest("[data-suggest]");
    if (!tab) return;
    activeSuggest = tab.dataset.suggest;
    renderSuggestions();
  });

  $("#btnAllHistory").addEventListener("click", openHistory);
  $("#btnMail").addEventListener("click", openMailbox);

  $("#mailList").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del-letter]");
    if (del) {
      deleteLetterById(del.dataset.delLetter);
      return;
    }
    const open = e.target.closest("[data-open-letter]");
    if (open) {
      const letter = state.letters.find((l) => l.id === open.dataset.openLetter);
      if (letter) openLetter(letter);
    }
  });

  $("#btnDeleteLetter").addEventListener("click", deleteActiveLetter);
  $("#btnCloseLetter").addEventListener("click", closeLetter);

  $("#btnReroll").addEventListener("click", () => {
    penaltyIndex++;
    renderPunishContent();
  });
  $("#btnAcceptPenalty").addEventListener("click", acceptPenalty);
  $("#btnMoveToday").addEventListener("click", () => rescheduleMissed(today));
  $("#btnReschedule").addEventListener("click", () => rescheduleMissed($("#rescheduleDate").value));
  $("#btnUseToken").addEventListener("click", useToken);
  $("#btnReplan").addEventListener("click", replanFromPunishment);

  $("#quickSearch").addEventListener("input", renderQuickGrid);
  $("#quickGrid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-add-activity]");
    if (card) addActivityToDay(card.dataset.addActivity, selectedKey);
  });

  $("#btnGoogle").addEventListener("click", signIn);
  $("#accountChip").addEventListener("click", (e) => {
    e.stopPropagation();
    popoverOpen = !popoverOpen;
    renderAuth();
  });
  $("#btnSyncNow").addEventListener("click", (e) => {
    e.stopPropagation();
    manualSync();
  });
  $("#btnSignOut").addEventListener("click", signOut);
  document.addEventListener("click", (e) => {
    if (popoverOpen && !e.target.closest(".auth-area")) {
      popoverOpen = false;
      renderAuth();
    }
  });

  $("#btnUseCloud").addEventListener("click", useCloudBackup);
  $("#btnKeepLocal").addEventListener("click", keepLocalBackup);
  $("#btnMergeCloud").addEventListener("click", mergeCloudBackup);
  $("#btnCancelSync").addEventListener("click", cancelSyncChoice);

  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close]");
    if (closer) {
      const id = closer.dataset.close;
      closeOverlay(id);
      if (id === "syncModal") pendingRemote = null;
    }
  });

  $$(".modal-layer").forEach((layer) => {
    layer.addEventListener("click", (e) => {
      if (e.target !== layer) return;
      if (layer.id === "syncModal") pendingRemote = null;
      closeOverlay(layer.id);
    });
  });
  $("#letterModal").addEventListener("click", (e) => {
    if (e.target === $("#letterModal")) closeLetter();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isOpen("letterModal")) {
      closeLetter();
      return;
    }
    const openLayers = $$(".modal-layer.open");
    if (openLayers.length) {
      const layer = openLayers[openLayers.length - 1];
      if (layer.id === "syncModal") pendingRemote = null;
      closeOverlay(layer.id);
    } else if (popoverOpen) {
      closePopover();
    }
  });

  window.addEventListener("resize", resizeFx);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      commitJournalDraft();
    } else {
      checkDayChange();
      if (journalDraft && document.activeElement !== $("#journalText")) renderJournal();
    }
  });

  window.addEventListener("beforeunload", () => {
    commitJournalDraft();
  });
}

/* --------------------------------------------------------------- service worker */

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !isHttp()) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}

/* --------------------------------------------------------------- init */

function init() {
  state = loadState();

  today = todayKey();
  lastKnownToday = today;
  selectedKey = today;
  viewStart = startOfWeek(today);

  fxCanvas = $("#fxCanvas");
  if (fxCanvas) {
    fxCtx = fxCanvas.getContext("2d");
    resizeFx();
  }
  setDayNight();
  $("#langSelect").value = lang;

  bindEvents();
  applyLanguage();
  renderMail();
  updateBadges();

  const monthLetter = maybeMonthlyLetter();
  if (monthLetter) {
    save();
    renderMail();
    updateBadges();
  }

  initAuth();
  registerServiceWorker();

  if (firstRun) {
    setTimeout(() => toast(t("toast.welcome"), "info", "🌊", 5200), 900);
  }

  setTimeout(() => {
    const unread = state.letters.filter((l) => !l.read)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (unread.length && !anyOverlayOpen()) {
      openLetter(unread[0]);
      return;
    }
    maybeAutoPunish();
  }, 1100);

  setInterval(() => {
    checkDayChange();
    setDayNight();
  }, 30000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
