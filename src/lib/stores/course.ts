import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface ModuleProgress {
  completed: boolean;
  score: number;
  maxScore: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface CourseState {
  currentModule: number;
  modules: Record<number, ModuleProgress>;
  totalScore: number;
  badges: Badge[];
  vocabularyDismissed: string[];
  userName: string;
  startedAt: string;
}

const STORAGE_KEY = 'lua-nvim-forge-progress';
const TOTAL_MODULES = 8;

function getInitialState(): CourseState {
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // corrupted data, start fresh
      }
    }
  }
  return {
    currentModule: 1,
    modules: {},
    totalScore: 0,
    badges: [],
    vocabularyDismissed: [],
    userName: '',
    startedAt: new Date().toISOString()
  };
}

function createCourseStore() {
  const { subscribe, set, update } = writable<CourseState>(getInitialState());

  if (browser) {
    subscribe((state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
  }

  return {
    subscribe,
    setUserName(name: string) {
      update((s) => ({ ...s, userName: name }));
    },
    startModule(moduleId: number) {
      update((s) => {
        if (!s.modules[moduleId]) {
          s.modules[moduleId] = {
            completed: false,
            score: 0,
            maxScore: 0,
            startedAt: new Date().toISOString()
          };
        }
        return { ...s };
      });
    },
    completeModule(moduleId: number, score: number, maxScore: number) {
      update((s) => {
        s.modules[moduleId] = {
          completed: true,
          score,
          maxScore,
          startedAt: s.modules[moduleId]?.startedAt ?? new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

        const totalScore = Object.values(s.modules).reduce((sum, m) => sum + m.score, 0);
        const nextModule = Math.max(s.currentModule, moduleId + 1);

        return { ...s, totalScore, currentModule: Math.min(nextModule, TOTAL_MODULES + 1) };
      });
    },
    unlockBadge(badge: Badge) {
      update((s) => {
        if (s.badges.find((b) => b.id === badge.id)) return s;
        badge.unlockedAt = new Date().toISOString();
        return { ...s, badges: [...s.badges, badge] };
      });
    },
    dismissVocabulary(termId: string) {
      update((s) => {
        if (s.vocabularyDismissed.includes(termId)) return s;
        return { ...s, vocabularyDismissed: [...s.vocabularyDismissed, termId] };
      });
    },
    reset() {
      const fresh: CourseState = {
        currentModule: 1,
        modules: {},
        totalScore: 0,
        badges: [],
        vocabularyDismissed: [],
        userName: '',
        startedAt: new Date().toISOString()
      };
      set(fresh);
    }
  };
}

export const courseStore = createCourseStore();

export const progressPercent = derived(courseStore, ($store) => {
  const completed = Object.values($store.modules).filter((m) => m.completed).length;
  return Math.round((completed / TOTAL_MODULES) * 100);
});

export const totalModules = TOTAL_MODULES;

export const allBadges: Badge[] = [
  {
    id: 'aprendiz-lua',
    name: 'Aprendiz de Lua',
    icon: '🌙',
    description: 'Completaste los fundamentos de Lua'
  },
  {
    id: 'maestro-tablas',
    name: 'Maestro de Tablas',
    icon: '📊',
    description: 'Dominaste las tablas de Lua'
  },
  {
    id: 'closure-ninja',
    name: 'Closure Ninja',
    icon: '🥷',
    description: 'Entendiste funciones y closures'
  },
  {
    id: 'configurador',
    name: 'Configurador',
    icon: '⚙️',
    description: 'Creaste tu primer init.lua'
  },
  {
    id: 'api-explorer',
    name: 'API Explorer',
    icon: '🔍',
    description: 'Exploraste la API de Neovim'
  },
  {
    id: 'plugin-creator',
    name: 'Plugin Creator',
    icon: '🔨',
    description: 'Construiste el plugin Nota Flotante'
  },
  {
    id: 'pomodoro-master',
    name: 'Pomodoro Master',
    icon: '🍅',
    description: 'Construiste el plugin Pomodoro'
  },
  {
    id: 'forjador-completo',
    name: 'Forjador Completo',
    icon: '🏆',
    description: 'Completaste todos los modulos del curso'
  }
];
