import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  PlayCircle,
  Circle,
  Trash2,
  Edit2,
  X,
  RefreshCcw,
  LogOut,
  UserPlus,
} from "lucide-react";

import "./App.css";
import logo from "./assets/logo_mgc_holding_transparent.png";
import Login from "./Login";
import { supabase } from "./lib/supabase";

// ---------------------------
//  MAPEAR BANCO → FRONT
// ---------------------------
function fromDbRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    description: row.description || "",
    startDate: row.startDate || "",
    endDate: row.endDate || "",
    status: row.status || "inicio",
    type: "interno",
    areaSolicitante: row.areaSolicitante || "",
    responsavelSolicitacao: row.responsavelSolicitacao || "",
    responsavelExecucao: row.responsavelExecucao || "",
    priority: row.priority || "media",
    progresso: row.progresso || 0,
    classificacao:
      row.classificacao !== null && row.classificacao !== undefined
        ? String(row.classificacao)
        : "",
  };
}

// ---------------------------
//  MAPEAR FRONT → BANCO
// ---------------------------
function toDbPayload(formData) {
  return {
    name: formData.name,
    description: formData.description,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    status: formData.status,
    areaSolicitante: formData.areaSolicitante || null,
    responsavelSolicitacao: formData.responsavelSolicitacao || null,
    responsavelExecucao: formData.responsavelExecucao || null,
    priority: formData.priority || null,
    progresso:
      formData.progresso !== "" && formData.progresso !== null
        ? Number(formData.progresso)
        : 0,
    classificacao:
      formData.classificacao !== "" &&
      formData.classificacao !== null &&
      !isNaN(Number(formData.classificacao))
        ? Number(formData.classificacao)
        : null,
  };
}

function App() {
  // Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true"
  );
  const [currentUser, setCurrentUser] = useState(null);

  // Dados
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal de projeto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "inicio",
    type: "interno",
    areaSolicitante: "",
    responsavelSolicitacao: "",
    responsavelExecucao: "",
    priority: "media",
    progresso: 0,
    classificacao: "",
  });

  // Filtros
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterArea, setFilterArea] = useState([]);
  const [filterPriority, setFilterPriority] = useState("todas");
  const [filterExecutor, setFilterExecutor] = useState("todos");
  const [filterClassificacao, setFilterClassificacao] = useState("todas");

  // Modal de novo usuário
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
  });
  const [userMessage, setUserMessage] = useState("");

  // ---------------------------
  //  Carregar usuário salvo
  // ---------------------------
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // ---------------------------
  //  Buscar Projetos do Supabase
  // ---------------------------
  const fetchProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("classificacao", { ascending: true, nullsFirst: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar projetos do Supabase:", error);
        return;
      }

      const mapped = (data || []).map(fromDbRow);
      setProjects(mapped);
    } catch (err) {
      console.error("Erro inesperado ao buscar projetos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchProjects();
    }
  }, [isAuthenticated, currentUser]);

  // ---------------------------
  //  Fechar Modal de Projeto
  // ---------------------------
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "inicio",
      type: "interno",
      areaSolicitante: "",
      responsavelSolicitacao: "",
      responsavelExecucao: "",
      priority: "media",
      progresso: 0,
      classificacao: "",
    });
  };

  // ---------------------------
  //  Salvar Projeto
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const basePayload = toDbPayload(formData);

      if (editingProject) {
        // UPDATE
        const { data, error } = await supabase
          .from("projetos")
          .update(basePayload)
          .eq("id", editingProject.id)
          .eq("user_id", currentUser.id)
          .select()
          .single();

        if (error) {
          console.error("Erro ao atualizar projeto:", error);
        } else if (data) {
          setProjects((prev) =>
            prev.map((p) => (p.id === data.id ? fromDbRow(data) : p))
          );
        }
      } else {
        // INSERT (com user_id)
        const payload = {
          ...basePayload,
          user_id: currentUser.id,
        };

        const { data, error } = await supabase
          .from("projetos")
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar projeto:", error);
        } else if (data) {
          setProjects((prev) => [fromDbRow(data), ...prev]);
        }
      }
    } catch (err) {
      console.error("Erro inesperado ao salvar projeto:", err);
    }

    handleCloseModal();
  };

  // ---------------------------
  //  Editar Projeto
  // ---------------------------
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      classificacao: project.classificacao || "",
    });
    setIsModalOpen(true);
  };

  // ---------------------------
  //  Deletar Projeto
  // ---------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    if (!currentUser) return;

    const { error } = await supabase
      .from("projetos")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } else {
      console.error("Erro ao excluir projeto:", error);
    }
  };

  const handleRefresh = () => fetchProjects();

  // ---------------------------
  //  Ícones / Cores de status
  // ---------------------------
  const getStatusIcon = (status) => {
    switch (status) {
      case "inicio":
        return <Circle className="w-4 h-4" />;
      case "andamento":
        return <PlayCircle className="w-4 h-4" />;
      case "fim":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "inicio":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "andamento":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "fim":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "inicio":
        return "Aguardando Início";
      case "andamento":
        return "Em Andamento";
      case "fim":
        return "Finalizado";
      default:
        return status;
    }
  };

  // ---------------------------
  //  Novo Usuário (Supabase Auth)
  // ---------------------------
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (error) {
        console.error("Erro ao criar usuário:", error);
        setUserMessage("Erro ao criar usuário: " + error.message);
      } else {
        setUserMessage("Usuário criado com sucesso! Peça para ele confirmar o e-mail (se exigido).");
        setNewUser({ email: "", password: "" });
      }
    } catch (err) {
      console.error("Erro inesperado ao criar usuário:", err);
      setUserMessage("Erro inesperado ao criar usuário.");
    }
  };

  // ---------------------------
  //  Logout
  // ---------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProjects([]);
  };

  // ---------------------------
  //  Usuário não autenticado → Tela de Login
  // ---------------------------
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={() => {
          setIsAuthenticated(true);
          const storedUser = sessionStorage.getItem("currentUser");
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
        }}
      />
    );
  }

  // ---------------------------
  //  Filtros
  // ---------------------------
  const uniqueAreas = Array.from(
    new Set(projects.map((p) => p.areaSolicitante || "").filter(Boolean))
  );
  const uniqueExecutores = Array.from(
    new Set(projects.map((p) => p.responsavelExecucao || "").filter(Boolean))
  );
  const uniqueClassificacoes = Array.from(
    new Set(
      projects
        .map((p) => (p.classificacao ? String(p.classificacao) : ""))
        .filter(Boolean)
    )
  ).sort((a, b) => Number(a) - Number(b));

  const filteredProjects = projects
    .filter((p) => (filterStatus === "todos" ? true : p.status === filterStatus))
    .filter((p) =>
      filterPriority === "todas" ? true : p.priority === filterPriority
    )
    .filter((p) =>
      filterExecutor === "todos"
        ? true
        : p.responsavelExecucao === filterExecutor
    )
    .filter((p) =>
      filterArea.length === 0
        ? true
        : filterArea.includes(p.areaSolicitante || "")
    )
    .filter((p) => {
      if (filterClassificacao === "todas") return true;
      return String(p.classificacao) === filterClassificacao;
    })
    .sort((a, b) => {
      const ca = a.classificacao ? Number(a.classificacao) : 999999;
      const cb = b.classificacao ? Number(b.classificacao) : 999999;
      return ca - cb;
    });

  // ---------------------------
  //  RENDERIZAÇÃO
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MGC HOLDING" className="h-10" />
            <div>
              <h1 className="text-2xl text-white font-bold">
                Controle de Projetos
              </h1>
              <p className="text-sm text-gray-400">
                Sistema de Gestão de Projetos — MGC HOLDING
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {currentUser && (
              <p className="text-xs text-gray-400 mb-1">
                Usuário: <span className="font-semibold">{currentUser.email}</span>
              </p>
            )}
            <div className="flex gap-2">
              <button
                className="btn-green"
                onClick={() => setIsUserModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" /> Novo Usuário
              </button>
              <button className="btn-purple" onClick={handleRefresh}>
                <RefreshCcw className="w-4 h-4" /> Atualizar
              </button>
              <button className="btn-red" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Sair
              </button>
              <button
                className="btn-blue"
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" /> Novo Projeto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR - FILTROS */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          <h2 className="text-white font-semibold text-lg mb-2">Filtros</h2>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Status do Projeto
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-600 text-gray-100 text-sm px-2 py-1"
            >
              <option value="todos">Todos</option>
              <option value="inicio">Aguardando Início</option>
              <option value="andamento">Em Andamento</option>
              <option value="fim">Finalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Prioridade
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-600 text-gray-100 text-sm px-2 py-1"
            >
              <option value="todas">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Executor
            </label>
            <select
              value={filterExecutor}
              onChange={(e) => setFilterExecutor(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-600 text-gray-100 text-sm px-2 py-1"
            >
              <option value="todos">Todos</option>
              {uniqueExecutores.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Área Solicitante
            </label>
            <select
              multiple
              value={filterArea}
              onChange={(e) =>
                setFilterArea(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              className="w-full rounded-md bg-gray-900 border border-gray-600 text-gray-100 text-sm px-2 py-1 h-24"
            >
              {uniqueAreas.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Use CTRL (ou CMD no Mac) para selecionar várias áreas.
            </p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Classificação
            </label>
            <select
              value={filterClassificacao}
              onChange={(e) => setFilterClassificacao(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-600 text-gray-100 text-sm px-2 py-1"
            >
              <option value="todas">Todas</option>
              {uniqueClassificacoes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTA DE PROJETOS */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-white text-center py-10">Carregando...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-gray-800 p-10 rounded-lg text-center border border-gray-700">
              <p className="text-gray-400 mb-4">Nenhum projeto encontrado.</p>
              <button
                className="btn-blue"
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
              >
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-4"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl text-white font-bold">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                      <span
                        className={`status-badge inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusIcon(project.status)}{" "}
                        {getStatusLabel(project.status)}
                      </span>

                      <span className="badge bg-gray-700 border border-gray-500 text-xs px-2 py-1 rounded-full">
                        {project.priority === "alta"
                          ? "🔴 Alta"
                          : project.priority === "media"
                          ? "🟡 Média"
                          : "🟢 Baixa"}
                      </span>

                      {project.classificacao && (
                        <span className="badge bg-gray-700 border border-gray-500 text-xs px-2 py-1 rounded-full">
                          Classificação {project.classificacao}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-gray-400 text-sm">
                      <p>
                        <strong>Área:</strong> {project.areaSolicitante}
                      </p>
                      <p>
                        <strong>Executor:</strong> {project.responsavelExecucao}
                      </p>
                      <p>
                        <strong>Responsável pela Solicitação:</strong>{" "}
                        {project.responsavelSolicitacao}
                      </p>
                      <p>
                        <strong>Período:</strong>{" "}
                        {project.startDate || "-"} até {project.endDate || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      className="btn-blue small"
                      onClick={() => handleEdit(project)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-red small"
                      onClick={() => handleDelete(project.id)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE PROJETO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-white font-bold">
                {editingProject ? "Editar Projeto" : "Novo Projeto"}
              </h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={handleCloseModal}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Área Solicitante
                  </label>
                  <input
                    type="text"
                    value={formData.areaSolicitante}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        areaSolicitante: e.target.value,
                      })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Responsável pela Solicitação
                  </label>
                  <input
                    type="text"
                    value={formData.responsavelSolicitacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsavelSolicitacao: e.target.value,
                      })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Responsável pela Execução
                  </label>
                  <input
                    type="text"
                    value={formData.responsavelExecucao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsavelExecucao: e.target.value,
                      })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Início
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Fim
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  >
                    <option value="inicio">Aguardando Início</option>
                    <option value="andamento">Em Andamento</option>
                    <option value="fim">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Classificação (número)
                  </label>
                  <input
                    type="number"
                    value={formData.classificacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classificacao: e.target.value,
                      })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Progresso (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progresso}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progresso: e.target.value,
                      })
                    }
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn-gray"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-blue">
                  {editingProject ? "Salvar Alterações" : "Criar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO USUÁRIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-white font-bold">Novo Usuário</h2>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  setIsUserModalOpen(false);
                  setUserMessage("");
                }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full rounded-md bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 text-sm"
                  required
                />
              </div>

              {userMessage && (
                <div className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded-md px-3 py-2">
                  {userMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn-gray"
                  onClick={() => {
                    setIsUserModalOpen(false);
                    setUserMessage("");
                  }}
                >
                  Fechar
                </button>
                <button type="submit" className="btn-green">
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// update


export default App;
