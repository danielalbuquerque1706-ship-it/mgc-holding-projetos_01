import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Edit2, Trash2, LogOut, UserPlus } from 'lucide-react'
import './App.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sua-chave-publica'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projects, setProjects] = useState([])
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPriority, setFilterPriority] = useState('todas')
  const [filterArea, setFilterArea] = useState([])
  const [filterExecutor, setFilterExecutor] = useState('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'inicio',
    priority: 'media',
    areaSolicitante: '',
    responsavelExecucao: '',
    progresso: 0
  })

  // Carregar projetos do Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
    }
  }, [isAuthenticated])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    
    if (username === 'Projetosmgc_2025' && password === 'Proje@2025') {
      setIsAuthenticated(true)
      sessionStorage.setItem('isAuthenticated', 'true')
    } else {
      alert('Credenciais inválidas!')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('isAuthenticated')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData])
        
        if (error) throw error
      }
      
      loadProjects()
      setIsModalOpen(false)
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'inicio',
        priority: 'media',
        areaSolicitante: '',
        responsavelExecucao: '',
        progresso: 0
      })
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      alert('Erro ao salvar projeto')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este projeto?')) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        loadProjects()
      } catch (error) {
        console.error('Erro ao deletar projeto:', error)
        alert('Erro ao deletar projeto')
      }
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData(project)
    setIsModalOpen(true)
  }

  const filteredProjects = projects.filter(p => {
    const statusMatch = filterStatus === 'todos' || p.status === filterStatus
    const priorityMatch = filterPriority === 'todas' || p.priority === filterPriority
    const areaMatch = filterArea.length === 0 || filterArea.includes(p.areaSolicitante)
    const executorMatch = filterExecutor === 'todos' || p.responsavelExecucao === filterExecutor
    
    return statusMatch && priorityMatch && areaMatch && executorMatch
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">MGC HOLDING</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Usuário</label>
              <input
                type="text"
                name="username"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                placeholder="Projetosmgc_2025"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Senha</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                placeholder="Proje@2025"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">MGC HOLDING - Controle de Projetos</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Filtros</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Status</h3>
                {['todos', 'inicio', 'andamento', 'finalizado'].map(status => (
                  <label key={status} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={filterStatus === status}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300 text-sm">
                      {status === 'todos' ? 'Todos' : status === 'inicio' ? 'Aguardando Início' : status === 'andamento' ? 'Em Andamento' : 'Finalizados'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Prioridade</h3>
                {['todas', 'alta', 'media', 'baixa'].map(priority => (
                  <label key={priority} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={filterPriority === priority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300 text-sm">
                      {priority === 'todas' ? 'Todas' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Responsável</h3>
                {['todos', 'Marcos', 'Thiago', 'Geovanna Martins', 'INEX', 'Paganini'].map(executor => (
                  <label key={executor} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="executor"
                      value={executor}
                      checked={filterExecutor === executor}
                      onChange={(e) => setFilterExecutor(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300 text-sm">
                      {executor === 'todos' ? 'Todos' : executor}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Status: {project.status}</span>
                    <span>Prioridade: {project.priority}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progresso || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{project.progresso || 0}% completo</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nome do Projeto"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                required
              />
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              >
                <option value="inicio">Aguardando Início</option>
                <option value="andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              <select
                value={formData.responsavelExecucao}
                onChange={(e) => setFormData({...formData, responsavelExecucao: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              >
                <option value="">Selecione o responsável</option>
                <option value="Marcos">Marcos</option>
                <option value="Thiago">Thiago</option>
                <option value="Geovanna Martins">Geovanna Martins</option>
                <option value="INEX">INEX</option>
                <option value="Paganini">Paganini</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progresso}
                onChange={(e) => setFormData({...formData, progresso: parseInt(e.target.value)})}
                className="w-full"
              />
              <p className="text-gray-400 text-sm">Progresso: {formData.progresso}%</p>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProject(null)
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
