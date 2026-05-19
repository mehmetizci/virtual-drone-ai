import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,

  setProjects: (projects) => set({ projects }),

  setSelectedProject: (project) => set({ selectedProject: project }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates, updated_at: new Date().toISOString() }
          : state.selectedProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    })),
}));
