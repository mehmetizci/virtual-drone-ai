'use client';

import { useProjectStore } from '@/stores/projectStore';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Settings } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ProjectGrid() {
  const { projects, setProjects } = useProjectStore();
  const [creatingProject, setCreatingProject] = useState(false);

  const createNewProject = async () => {
    setCreatingProject(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const newProject = {
        user_id: session.user.id,
        title: 'Yeni Proje',
        description: '',
        status: 'draft' as const,
        geojson_data: null,
        parcel_data: null,
        narration_text: '',
        voice_url: null,
        video_url: null,
        thumbnail_url: null,
        render_config: {
          format: '1080x1920' as const,
          fps: 30,
          duration: 60,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();

      if (error) throw error;

      setProjects([data, ...projects]);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* New Project Card */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={createNewProject}
        disabled={creatingProject}
        className="rounded-xl border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/50 bg-gray-800/30 hover:bg-gray-800/50 transition-all p-8 flex flex-col items-center justify-center gap-3 min-h-64"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <p className="text-lg font-semibold text-cyan-300">Yeni Proje Oluştur</p>
        <p className="text-sm text-gray-400">GeoJSON yükleyerek başlayın</p>
      </motion.button>

      {/* Project Cards */}
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group rounded-xl border border-cyan-400/20 bg-gradient-to-br from-gray-900/40 to-gray-950/40 backdrop-blur-sm hover:border-cyan-400/40 overflow-hidden transition-all"
        >
          {/* Thumbnail */}
          <div className="relative w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="text-4xl">🚁</div>
                <p className="text-xs">Önizleme yok</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed'
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : project.status === 'processing'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                }`}
              >
                {project.status === 'completed' ? '✓ Tamamlandı' : project.status === 'processing' ? '⏳ İşleniyor' : '⚫ Taslak'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-100 mb-1 truncate">{project.title}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description || 'Açıklama yok'}</p>

            {/* Meta */}
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <p>Oluşturma: {new Date(project.created_at).toLocaleDateString('tr-TR')}</p>
              {project.video_url && <p className="text-green-400">Video hazır ✓</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="flex-1 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                Aç
              </Link>

              <button
                onClick={() => deleteProject(project.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button className="p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
