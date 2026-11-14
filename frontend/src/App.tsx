
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Truck,
  Wrench,
  ClipboardList,
  Settings,
  Bell,
  Plus,
  Search,
  ChevronDown,
  HardHat,
  Activity,
} from 'lucide-react'

import {
  equipmentService,
  type Equipment,
  type EquipmentType,
} from './services/equipmentService'

import './App.css'

function App() {
  const [equipos, setEquipos] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [tipos, setTipos] = useState<EquipmentType[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState<Equipment | null>(null)

  const [formulario, setFormulario] = useState({
    code: '',
    typeId: '',
    hourMeter: '',
  })

  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')

  useEffect(() => {
    Promise.all([
      equipmentService.getAll(),
      equipmentService.getTypes(),
    ])
      .then(([equiposData, tiposData]) => {
        setEquipos(equiposData)
        setTipos(tiposData)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Indicadores del dashboard
  const totalEquipos = equipos.length

  const equiposOperativos = equipos.filter(
    (equipo) => !equipo.requiresMaintenance,
  ).length

  const equiposMantenimiento = equipos.filter(
    (equipo) => equipo.requiresMaintenance,
  ).length

  // Filtrar equipos por código o tipo
  const equiposFiltrados = equipos.filter((equipo) => {
    const termino = busqueda.toLowerCase()

    return (
      equipo.code.toLowerCase().includes(termino) ||
      equipo.typeName.toLowerCase().includes(termino)
    )
  })

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <HardHat size={27} />
          <div>
            <h2>MINING SYSTEM</h2>
            <span>Gestión de equipos</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="sidebar-link active">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a href="#equipos" className="sidebar-link">
            <Truck size={18} />
            <span>Equipos</span>
          </a>

          <a href="#mantenimientos" className="sidebar-link">
            <Wrench size={18} />
            <span>Mantenimientos</span>
          </a>

          <a href="#historial" className="sidebar-link">
            <ClipboardList size={18} />
            <span>Historial</span>
          </a>

          <a href="#configuracion" className="sidebar-link">
            <Settings size={18} />
            <span>Configuración</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          Sistema de gestión minera
          <br />
          Versión 1.0.0
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="topbar-title">Panel de control</div>
            <div className="topbar-subtitle">
              Gestión y monitoreo de equipos mineros
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <Bell size={19} color="#758191" />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#e8edf2',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#172b43',
                }}
              >
                <HardHat size={18} />
              </div>

              <span style={{ fontSize: 12, fontWeight: 500 }}>
                Administrador
              </span>

              <ChevronDown size={15} color="#758191" />
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* ENCABEZADO */}
          <section className="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>
                Resumen general del estado de los equipos y mantenimientos.
              </p>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                setErrorFormulario('')
                setModalAbierto(true)
              }}
            >
              <Plus size={16} />
              Registrar equipo
            </button>
          </section>

          {/* INDICADORES */}
          <section className="kpi-grid">
            <article className="kpi-card">
              <div className="kpi-label">Total de equipos</div>
              <div className="kpi-value">
                {loading ? '...' : totalEquipos}
              </div>
              <div className="kpi-description">
                Equipos registrados
              </div>
            </article>

            <article className="kpi-card">
              <div className="kpi-label">Operativos</div>
              <div className="kpi-value">
                {loading ? '...' : equiposOperativos}
              </div>
              <div className="kpi-description">
                Sin mantenimiento pendiente
              </div>
            </article>

            <article className="kpi-card">
              <div className="kpi-label">
                Requieren mantenimiento
              </div>
              <div className="kpi-value">
                {loading ? '...' : equiposMantenimiento}
              </div>
              <div className="kpi-description">
                Según el horómetro registrado
              </div>
            </article>

            <article className="kpi-card">
              <div className="kpi-label">
                Mantenimientos realizados
              </div>
              <div className="kpi-value">—</div>
              <div className="kpi-description">
                Registros históricos
              </div>
            </article>
          </section>

          {/* TABLA DE EQUIPOS */}
          <section className="content-section" id="equipos">
            <div className="section-header">
              <div>
                <h2>Equipos registrados</h2>
                <span
                  style={{
                    color: '#758191',
                    fontSize: 11,
                  }}
                >
                  Consulta y seguimiento de maquinaria
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid #e1e5e9',
                    borderRadius: 6,
                    padding: '0 10px',
                    background: '#fff',
                  }}
                >
                  <Search size={15} color="#758191" />

                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      minHeight: 36,
                      width: 150,
                      fontSize: 12,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo de equipo</th>
                    <th>Horómetro</th>
                    <th>Último mantenimiento</th>
                    <th>Intervalo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          Cargando equipos...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          Error al cargar los equipos: {error}
                        </div>
                      </td>
                    </tr>
                  ) : equiposFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <Activity
                            size={28}
                            color="#9ba5b1"
                          />
                          <p>
                            {busqueda
                              ? 'No se encontraron equipos con esa búsqueda.'
                              : 'No hay equipos registrados.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    equiposFiltrados.map((equipo) => (
                      <tr key={equipo.id}>
                        <td>
                          <strong>{equipo.code}</strong>
                        </td>

                        <td>{equipo.typeName}</td>

                        <td>
                          {equipo.hourMeter.toLocaleString('es-PE')} h
                        </td>

                        <td>
                          {equipo.lastMaintenanceHourMeter.toLocaleString(
                            'es-PE',
                          )}{' '}
                          h
                        </td>

                        <td>
                          {equipo.maintenanceIntervalHours} h
                        </td>

                        <td>
                          <span
                            className={`status ${
                              equipo.requiresMaintenance
                                ? 'status-danger'
                                : 'status-success'
                            }`}
                          >
                            {equipo.requiresMaintenance
                              ? 'Requiere mantenimiento'
                              : 'Operativo'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => {
                              setEquipoEditando(equipo)
                              setFormulario({
                                code: equipo.code,
                                typeId: String(
                                  tipos.find((tipo) => tipo.code === equipo.typeCode)?.id ?? '',
                                ),
                                hourMeter: String(equipo.hourMeter),
                              })
                              setErrorFormulario('')
                              setModalAbierto(true)
                            }}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* MODAL REGISTRAR EQUIPO */}
        {modalAbierto && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{equipoEditando ? 'Editar equipo' : 'Registrar nuevo equipo'}</h2>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setGuardando(true)
                  setErrorFormulario('')

                  try {
                    const datosEquipo = {
                      code: formulario.code.trim().toUpperCase(),
                      typeId: Number(formulario.typeId),
                      hourMeter: Number(formulario.hourMeter),
                    }

                    if (equipoEditando) {
                      await equipmentService.update(equipoEditando.id, datosEquipo)
                    } else {
                      await equipmentService.create(datosEquipo)
                    }

                    const equiposActualizados =
                      await equipmentService.getAll()

                    setEquipos(equiposActualizados)

                    setFormulario({
                      code: '',
                      typeId: '',
                      hourMeter: '',
                    })

                    setModalAbierto(false)
                    setEquipoEditando(null)
                  } catch (err) {
                    setErrorFormulario(
                      err instanceof Error
                        ? err.message
                        : 'No se pudo registrar el equipo.',
                    )
                  } finally {
                    setGuardando(false)
                  }
                }}
              >
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="code">Código del equipo</label>
                      <input
                        id="code"
                        className="form-control"
                        type="text"
                        placeholder="Ej. TRUCK-002"
                        value={formulario.code}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            code: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="typeId">Tipo de equipo</label>
                      <select
                        id="typeId"
                        className="form-control"
                        value={formulario.typeId}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            typeId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Seleccionar tipo</option>

                        {tipos.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="hourMeter">
                        Horómetro inicial
                      </label>
                      <input
                        id="hourMeter"
                        className="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej. 500"
                        value={formulario.hourMeter}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            hourMeter: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {errorFormulario && (
                    <p style={{ color: '#b65c55', marginTop: 16 }}>
                      {errorFormulario}
                    </p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={guardando}
                    onClick={() => {
                      setModalAbierto(false)
                      setEquipoEditando(null)
                      setErrorFormulario('')
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar equipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
