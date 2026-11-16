
import { useCallback, useEffect, useRef, useState } from 'react'
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
  Trash2,
} from 'lucide-react'

import {
  equipmentService,
  type Equipment,
  type EquipmentType,
  type Maintenance,
} from './services/equipmentService'

import './App.css'

function formatMaintenanceDate(value: string) {
  return new Date(value).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
  })
}

function App() {
  const [vistaActiva, setVistaActiva] = useState('dashboard')
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false)
  const [equipos, setEquipos] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [tipos, setTipos] = useState<EquipmentType[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState<Equipment | null>(null)
  const [equipoEliminando, setEquipoEliminando] = useState<Equipment | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminacion, setErrorEliminacion] = useState('')
  const [equipoMantenimiento, setEquipoMantenimiento] = useState<Equipment | null>(null)
  const [descripcionMantenimiento, setDescripcionMantenimiento] = useState('')
  const [guardandoMantenimiento, setGuardandoMantenimiento] = useState(false)
  const [errorMantenimiento, setErrorMantenimiento] = useState('')
  const [exitoMantenimiento, setExitoMantenimiento] = useState('')
  const [confirmarMantenimiento, setConfirmarMantenimiento] = useState(false)
  const [equipoHistorial, setEquipoHistorial] = useState<Equipment | null>(null)
  const [historialMantenimientos, setHistorialMantenimientos] = useState<Maintenance[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState('')
  const [historialGeneral, setHistorialGeneral] = useState<Maintenance[]>([])
  const [cargandoHistorialGeneral, setCargandoHistorialGeneral] = useState(false)
  const [errorHistorialGeneral, setErrorHistorialGeneral] = useState('')
  const [filtroHistorial, setFiltroHistorial] = useState('')
  const [totalMantenimientos, setTotalMantenimientos] = useState<number | null>(null)
  const [cargandoTotalMantenimientos, setCargandoTotalMantenimientos] = useState(true)
  const [errorTotalMantenimientos, setErrorTotalMantenimientos] = useState('')
  const totalMantenimientosRequestId = useRef(0)
  const registroMantenimientoEnCurso = useRef(false)

  const [formulario, setFormulario] = useState({
    code: '',
    typeId: '',
    hourMeter: '',
  })

  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')

  const actualizarTotalMantenimientos = useCallback(async () => {
    const requestId = ++totalMantenimientosRequestId.current
    setCargandoTotalMantenimientos(true)
    setErrorTotalMantenimientos('')
    try {
      const total = await equipmentService.getMaintenanceCount()
      if (requestId === totalMantenimientosRequestId.current) {
        setTotalMantenimientos(total)
      }
    } catch (err) {
      if (requestId === totalMantenimientosRequestId.current) {
        setTotalMantenimientos(null)
        setErrorTotalMantenimientos(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el total de mantenimientos.',
        )
      }
    } finally {
      if (requestId === totalMantenimientosRequestId.current) {
        setCargandoTotalMantenimientos(false)
      }
    }
  }, [])

  useEffect(() => {
    void actualizarTotalMantenimientos()
  }, [actualizarTotalMantenimientos])

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

  useEffect(() => {
    if (vistaActiva !== 'historial' || loading) return

    let vigente = true
    setCargandoHistorialGeneral(true)
    setErrorHistorialGeneral('')

    Promise.all(
      equipos.map((equipo) => equipmentService.getMaintenanceHistory(equipo.id)),
    )
      .then((historiales) => {
        if (vigente) {
          setHistorialGeneral(
            historiales
              .flat()
              .sort(
                (a, b) =>
                  new Date(b.performedAt).getTime() -
                  new Date(a.performedAt).getTime(),
              ),
          )
        }
      })
      .catch((err: Error) => {
        if (vigente) setErrorHistorialGeneral(err.message)
      })
      .finally(() => {
        if (vigente) setCargandoHistorialGeneral(false)
      })

    return () => {
      vigente = false
    }
  }, [vistaActiva, equipos, loading])

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

  const mantenimientosFiltrados = historialGeneral.filter(
    (mantenimiento) =>
      !filtroHistorial || String(mantenimiento.equipmentId) === filtroHistorial,
  )

  const titulosVistas: Record<string, string> = {
    dashboard: 'Dashboard',
    equipos: 'Equipos',
    mantenimientos: 'Mantenimientos',
    historial: 'Historial',
    configuracion: 'Configuración',
  }

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
          <button type="button" title="Dashboard" aria-label="Dashboard" onClick={() => setVistaActiva('dashboard')} className={`sidebar-link ${vistaActiva === 'dashboard' ? 'active' : ''}`} aria-current={vistaActiva === 'dashboard' ? 'page' : undefined}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button type="button" title="Equipos" aria-label="Equipos" onClick={() => setVistaActiva('equipos')} className={`sidebar-link ${vistaActiva === 'equipos' ? 'active' : ''}`} aria-current={vistaActiva === 'equipos' ? 'page' : undefined}>
            <Truck size={18} />
            <span>Equipos</span>
          </button>

          <button type="button" title="Mantenimientos" aria-label="Mantenimientos" onClick={() => setVistaActiva('mantenimientos')} className={`sidebar-link ${vistaActiva === 'mantenimientos' ? 'active' : ''}`} aria-current={vistaActiva === 'mantenimientos' ? 'page' : undefined}>
            <Wrench size={18} />
            <span>Mantenimientos</span>
          </button>

          <button type="button" title="Historial" aria-label="Historial" onClick={() => setVistaActiva('historial')} className={`sidebar-link ${vistaActiva === 'historial' ? 'active' : ''}`} aria-current={vistaActiva === 'historial' ? 'page' : undefined}>
            <ClipboardList size={18} />
            <span>Historial</span>
          </button>

          <button type="button" title="Configuración" aria-label="Configuración" onClick={() => setVistaActiva('configuracion')} className={`sidebar-link ${vistaActiva === 'configuracion' ? 'active' : ''}`} aria-current={vistaActiva === 'configuracion' ? 'page' : undefined}>
            <Settings size={18} />
            <span>Configuración</span>
          </button>
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
            <div className="topbar-title">{titulosVistas[vistaActiva]}</div>
            <div className="topbar-subtitle">
              Gestión y monitoreo de equipos mineros
            </div>
          </div>

          <div
            className="topbar-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div className="notification-area">
              <button
                className="notification-button"
                type="button"
                aria-label={`Notificaciones${equiposMantenimiento ? `, ${equiposMantenimiento} equipos requieren mantenimiento` : ''}`}
                aria-expanded={notificacionesAbiertas}
                aria-controls="maintenance-notifications"
                onClick={() => setNotificacionesAbiertas((abiertas) => !abiertas)}
              >
                <Bell size={19} color="#758191" />
                {equiposMantenimiento > 0 && !loading && (
                  <span className="notification-badge">
                    {equiposMantenimiento > 99 ? '99+' : equiposMantenimiento}
                  </span>
                )}
              </button>
              {notificacionesAbiertas && (
                <section
                  className="notification-panel"
                  id="maintenance-notifications"
                  aria-label="Alertas de mantenimiento"
                >
                  <div className="notification-panel-header">
                    <strong>Alertas de mantenimiento</strong>
                    {!loading && <span>{equiposMantenimiento}</span>}
                  </div>
                  {loading ? (
                    <p className="notification-empty">Cargando equipos...</p>
                  ) : error ? (
                    <p className="notification-empty notification-error">
                      No se pudieron cargar las alertas: {error}
                    </p>
                  ) : equiposMantenimiento === 0 ? (
                    <p className="notification-empty">
                      No hay equipos que requieran mantenimiento.
                    </p>
                  ) : (
                    <ul className="notification-list">
                      {equipos
                        .filter((equipo) => equipo.requiresMaintenance)
                        .map((equipo) => (
                          <li key={equipo.id}>
                            <button
                              className="notification-item"
                              type="button"
                              onClick={() => {
                                setEquipoMantenimiento(equipo)
                                setDescripcionMantenimiento('')
                                setErrorMantenimiento('')
                                setExitoMantenimiento('')
                                setConfirmarMantenimiento(false)
                                setNotificacionesAbiertas(false)
                              }}
                            >
                              <Wrench size={16} />
                              <span>
                                <strong>{equipo.code}</strong>
                                <small>
                                  {equipo.hourMeter.toLocaleString('es-PE')} h ·
                                  requiere mantenimiento
                                </small>
                              </span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                  <button
                    className="notification-footer"
                    type="button"
                    onClick={() => {
                      setVistaActiva('mantenimientos')
                      setNotificacionesAbiertas(false)
                    }}
                  >
                    Ver mantenimientos
                  </button>
                </section>
              )}
            </div>

            <div
              className="topbar-user"
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

              <span className="topbar-user-name" style={{ fontSize: 12, fontWeight: 500 }}>
                Administrador
              </span>

              <ChevronDown size={15} color="#758191" />
            </div>
          </div>
        </header>

        <div className="page-content">
          {vistaActiva === 'dashboard' && <>
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
              <div className="kpi-value">
                {cargandoTotalMantenimientos
                  ? '...'
                  : totalMantenimientos ?? '—'}
              </div>
              <div className="kpi-description">
                {errorTotalMantenimientos || 'Total de intervenciones registradas'}
              </div>
            </article>
          </section>
          </>}

          {exitoMantenimiento && (
            <div className="success-message" role="status" aria-live="polite">
              {exitoMantenimiento}
            </div>
          )}

          {vistaActiva === 'equipos' && <>
          <section className="page-header">
            <div><h1>Equipos</h1><p>Consulta y administra los equipos registrados.</p></div>
            <button className="btn btn-primary" type="button" onClick={() => { setEquipoEditando(null); setFormulario({ code: '', typeId: '', hourMeter: '' }); setErrorFormulario(''); setModalAbierto(true) }}>
              <Plus size={16} /> Registrar equipo
            </button>
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

            <div className="table-container equipment-table-container">
              <table className="data-table equipment-table">
                <colgroup>
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '34%' }} />
                </colgroup>
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
                      <td colSpan={7}>
                        <div className="empty-state">
                          Cargando equipos...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          Error al cargar los equipos: {error}
                        </div>
                      </td>
                    </tr>
                  ) : equiposFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
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
                          <div className="equipment-actions">
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
                            <button
                              className="btn btn-danger"
                              type="button"
                              onClick={() => {
                                setEquipoEliminando(equipo)
                                setErrorEliminacion('')
                              }}
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => {
                                setEquipoMantenimiento(equipo)
                                setDescripcionMantenimiento('')
                                setErrorMantenimiento('')
                                setExitoMantenimiento('')
                                setConfirmarMantenimiento(false)
                              }}
                            >
                              <Wrench size={14} />
                              Mantenimiento
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={async () => {
                                setEquipoHistorial(equipo)
                                setCargandoHistorial(true)
                                setErrorHistorial('')
                                try {
                                  const historial = await equipmentService.getMaintenanceHistory(equipo.id)
                                  setHistorialMantenimientos(historial)
                                } catch (err) {
                                  setErrorHistorial(
                                    err instanceof Error
                                      ? err.message
                                      : 'No se pudo cargar el historial.',
                                  )
                                } finally {
                                  setCargandoHistorial(false)
                                }
                              }}
                            >
                              <ClipboardList size={14} />
                              Historial
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          </>}

          {vistaActiva === 'mantenimientos' && <>
            <section className="page-header"><div><h1>Mantenimientos</h1><p>Equipos que requieren atención según su horómetro.</p></div></section>
            {error && <div className="empty-state">Error al cargar los equipos: {error}</div>}
            {loading ? <div className="empty-state">Cargando equipos...</div> : equiposMantenimiento === 0 ? (
              <section className="content-section"><div className="empty-state"><Wrench size={28} /><p>No hay equipos que requieran mantenimiento.</p></div></section>
            ) : (
              <section className="content-section"><div className="table-container"><table className="data-table">
                <thead><tr><th>Equipo</th><th>Tipo</th><th>Horómetro actual</th><th>Último mantenimiento</th><th>Acción</th></tr></thead>
                <tbody>{equipos.filter((equipo) => equipo.requiresMaintenance).map((equipo) => <tr key={equipo.id}>
                  <td><strong>{equipo.code}</strong></td><td>{equipo.typeName}</td><td>{equipo.hourMeter.toLocaleString('es-PE')} h</td><td>{equipo.lastMaintenanceHourMeter.toLocaleString('es-PE')} h</td>
                  <td><button className="btn btn-primary" type="button" onClick={() => { setEquipoMantenimiento(equipo); setDescripcionMantenimiento(''); setErrorMantenimiento(''); setExitoMantenimiento(''); setConfirmarMantenimiento(false) }}><Wrench size={14} /> Registrar mantenimiento</button></td>
                </tr>)}</tbody>
              </table></div></section>
            )}
          </>}

          {vistaActiva === 'historial' && <>
            <section className="page-header"><div><h1>Historial de mantenimientos</h1><p>Registros reales consultados para cada equipo.</p></div>
              <select className="form-control history-filter" aria-label="Filtrar historial por equipo" value={filtroHistorial} onChange={(event) => setFiltroHistorial(event.target.value)}>
                <option value="">Todos los equipos</option>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.code}</option>)}
              </select>
            </section>
            <section className="content-section"><div className="table-container"><table className="data-table">
              <thead><tr><th>Fecha</th><th>Equipo</th><th>Horómetro</th><th>Descripción</th></tr></thead>
              <tbody>{loading || cargandoHistorialGeneral ? <tr><td colSpan={4}><div className="empty-state">Consultando historial...</div></td></tr> : errorHistorialGeneral ? <tr><td colSpan={4}><div className="empty-state">No se pudo cargar el historial: {errorHistorialGeneral}</div></td></tr> : mantenimientosFiltrados.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><ClipboardList size={28} /><p>No hay mantenimientos registrados para esta selección.</p></div></td></tr> : mantenimientosFiltrados.map((mantenimiento) => <tr key={mantenimiento.id}>
                <td>{formatMaintenanceDate(mantenimiento.performedAt)}</td><td><strong>{mantenimiento.equipmentCode}</strong></td><td>{mantenimiento.hourMeter.toLocaleString('es-PE')} h</td><td>{mantenimiento.description}</td>
              </tr>)}</tbody>
            </table></div></section>
          </>}

          {vistaActiva === 'configuracion' && <>
            <section className="page-header"><div><h1>Configuración</h1><p>Información general de la plataforma.</p></div></section>
            <section className="content-section"><div className="section-header"><h2>Sistema de gestión minera</h2></div><div className="section-body system-info-grid">
              <article><span>Aplicación</span><strong>Mining Equipment Management</strong></article>
              <article><span>Frontend</span><strong>React 19 · TypeScript · Vite</strong></article>
              <article><span>Backend</span><strong>Java 21 · Spring Boot</strong></article>
              <article><span>Base de datos</span><strong>PostgreSQL</strong></article>
              <article><span>Despliegue</span><strong>Vercel · Render · Neon</strong></article>
            </div></section>
          </>}
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

        {equipoEliminando && (
          <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
              <div className="modal-header">
                <h2 id="delete-modal-title">Confirmar eliminación</h2>
              </div>

              <div className="modal-body">
                <p>
                  ¿Seguro que deseas eliminar el equipo{' '}
                  <strong>{equipoEliminando.code}</strong>? Esta acción no se puede
                  deshacer.
                </p>
                {errorEliminacion && (
                  <p style={{ color: '#b65c55', marginTop: 16 }}>
                    {errorEliminacion}
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={eliminando}
                  onClick={() => {
                    setEquipoEliminando(null)
                    setErrorEliminacion('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  type="button"
                  disabled={eliminando}
                  onClick={async () => {
                    setEliminando(true)
                    setErrorEliminacion('')
                    try {
                      await equipmentService.delete(equipoEliminando.id)
                      setEquipos((actuales) =>
                        actuales.filter((equipo) => equipo.id !== equipoEliminando.id),
                      )
                      setEquipoEliminando(null)
                    } catch (err) {
                      setErrorEliminacion(
                        err instanceof Error
                          ? err.message
                          : 'No se pudo eliminar el equipo.',
                      )
                    } finally {
                      setEliminando(false)
                    }
                  }}
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {equipoMantenimiento && (
          <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-modal-title">
              <div className="modal-header">
                <h2 id="maintenance-modal-title">
                  {confirmarMantenimiento ? 'Confirmar mantenimiento' : 'Registrar mantenimiento'}
                </h2>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!confirmarMantenimiento) {
                    setErrorMantenimiento('')
                    setConfirmarMantenimiento(true)
                    return
                  }
                  if (registroMantenimientoEnCurso.current) return
                  registroMantenimientoEnCurso.current = true
                  setGuardandoMantenimiento(true)
                  setErrorMantenimiento('')
                  try {
                    const mantenimiento = await equipmentService.registerMaintenance(
                      equipoMantenimiento.id,
                      descripcionMantenimiento.trim(),
                    )
                    setEquipos((actuales) =>
                      actuales.map((equipo) =>
                        equipo.id === equipoMantenimiento.id
                          ? {
                              ...equipo,
                              lastMaintenanceHourMeter: mantenimiento.hourMeter,
                              requiresMaintenance: false,
                            }
                          : equipo,
                      ),
                    )
                    setExitoMantenimiento(
                      `Mantenimiento de ${equipoMantenimiento.code} registrado. Último horómetro: ${mantenimiento.hourMeter.toLocaleString('es-PE')} h.`,
                    )
                    void actualizarTotalMantenimientos()
                    setEquipoMantenimiento(null)
                    setDescripcionMantenimiento('')
                    setConfirmarMantenimiento(false)
                  } catch (err) {
                    setErrorMantenimiento(
                      err instanceof Error
                        ? err.message
                        : 'No se pudo registrar el mantenimiento.',
                    )
                  } finally {
                    registroMantenimientoEnCurso.current = false
                    setGuardandoMantenimiento(false)
                  }
                }}
              >
                <div className="modal-body">
                  {confirmarMantenimiento ? (
                    <div className="confirmation-summary">
                      <p>Se registrará este mantenimiento en el historial:</p>
                      <dl>
                        <div><dt>Equipo</dt><dd>{equipoMantenimiento.code}</dd></div>
                        <div><dt>Horómetro que se guardará</dt><dd>{equipoMantenimiento.hourMeter.toLocaleString('es-PE')} h</dd></div>
                        <div><dt>Descripción</dt><dd>{descripcionMantenimiento.trim()}</dd></div>
                      </dl>
                      <p className="confirmation-note">Confirma que los datos sean correctos antes de guardar.</p>
                    </div>
                  ) : (
                    <>
                      <p>
                        Equipo: <strong>{equipoMantenimiento.code}</strong>
                      </p>
                      <p style={{ marginTop: 8, marginBottom: 18 }}>
                        Horómetro actual: <strong>{equipoMantenimiento.hourMeter.toLocaleString('es-PE')} h</strong>
                        <br />
                        Este valor se guardará automáticamente en el historial.
                      </p>
                      <div className="form-group">
                        <label htmlFor="maintenance-description">Descripción</label>
                        <textarea
                          id="maintenance-description"
                          className="form-control"
                          rows={4}
                          maxLength={1000}
                          placeholder="Describe el mantenimiento realizado..."
                          value={descripcionMantenimiento}
                          onChange={(e) => setDescripcionMantenimiento(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                  {errorMantenimiento && (
                    <p style={{ color: '#b65c55', marginTop: 16 }}>
                      {errorMantenimiento}
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={guardandoMantenimiento}
                    onClick={() => {
                      setEquipoMantenimiento(null)
                      setConfirmarMantenimiento(false)
                    }}
                  >
                    Cancelar
                  </button>
                  {confirmarMantenimiento && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={guardandoMantenimiento}
                      onClick={() => setConfirmarMantenimiento(false)}
                    >
                      Volver a editar
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={guardandoMantenimiento}
                  >
                    {guardandoMantenimiento
                      ? 'Guardando...'
                      : confirmarMantenimiento
                        ? 'Confirmar y registrar'
                        : 'Revisar registro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {equipoHistorial && (
          <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
              <div className="modal-header">
                <h2 id="history-modal-title">Historial: {equipoHistorial.code}</h2>
              </div>
              <div className="modal-body">
                {cargandoHistorial ? (
                  <div className="empty-state">Cargando historial...</div>
                ) : errorHistorial ? (
                  <p style={{ color: '#b65c55' }}>{errorHistorial}</p>
                ) : historialMantenimientos.length === 0 ? (
                  <div className="empty-state">Este equipo aún no tiene mantenimientos registrados.</div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Horómetro</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialMantenimientos.map((mantenimiento) => (
                          <tr key={mantenimiento.id}>
                            <td>{formatMaintenanceDate(mantenimiento.performedAt)}</td>
                            <td>{mantenimiento.hourMeter.toLocaleString('es-PE')} h</td>
                            <td>{mantenimiento.description || 'Sin descripción'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setEquipoHistorial(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
