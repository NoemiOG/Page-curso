import React, { useMemo } from 'react';
import styles from './Bienvenido.module.sass';

// IMPORTACIONES DIRECTAS 
import Book from '@mui/icons-material/Book';
import CheckCircle from '@mui/icons-material/CheckCircle';
import PendingActions from '@mui/icons-material/PendingActions';
import ErrorIcon from '@mui/icons-material/Error';

const Bienvenido = ({ 
  cursos = [], 
  onSelectCurso, 
  userAnswers = {}, 
  userEmail, 
  progresoUpdate 
}) => { 

  const cursosProcesados = useMemo(() => {
    return cursos.map(curso => {
      // 1. Obtener progreso de lecciones (Teoría)
      const storageKey = `completado_${curso.id}_${userEmail}`;
      const completados = JSON.parse(localStorage.getItem(storageKey) || "[]");
      
      const lecciones = curso.secciones?.filter(s => s.tipo !== 'examen') || [];
      const totalLecciones = lecciones.length > 0 ? lecciones.length : (curso.totalLecciones || 1);
      const completadasCount = lecciones.filter(s => completados.includes(s.id)).length;
      
      const porcentajeTeoria = Math.round((completadasCount / totalLecciones) * 100);

      // 2. Obtener estado del examen
      const puntaje = userAnswers[`puntaje_${curso.id}_${userEmail}`];
      const aprobado = puntaje !== undefined && puntaje >= 80;
      const hizoExamen = puntaje !== undefined;

      // 3. Determinar estado visual
      let estadoActual = "Sin iniciar";
      let progresoVisual = porcentajeTeoria;

      if (aprobado) {
        estadoActual = "Completado";
        progresoVisual = 100;
      } else if (hizoExamen && !aprobado) {
        estadoActual = "Pendiente";
        progresoVisual = Math.min(porcentajeTeoria, 99); // No llega al 100 si no aprueba
      } else if (porcentajeTeoria > 0) {
        estadoActual = "Pendiente";
      }

      return {
        ...curso,
        totalLecciones,
        completadasCount: aprobado ? totalLecciones : completadasCount,
        progreso: progresoVisual,
        estado: estadoActual,
        nota: puntaje,
        aprobado
      };
    });
  }, [cursos, progresoUpdate, userAnswers, userEmail]);

  // Estadísticas para los cuadros superiores
  const stats = useMemo(() => ({
    total: cursosProcesados.length,
    completados: cursosProcesados.filter(c => c.estado === "Completado").length,
    enCurso: cursosProcesados.filter(c => c.estado === "Pendiente").length
  }), [cursosProcesados]);

  const secciones = {
    pendientes: cursosProcesados.filter(c => c.estado === "Pendiente"),
    sinIniciar: cursosProcesados.filter(c => c.estado === "Sin iniciar"),
    completados: cursosProcesados.filter(c => c.estado === "Completado")
  };

  const renderCard = (curso) => (
    <article 
      key={curso.id} 
      className={`${styles.cursoCard} ${styles[`card${curso.estado.replace(/\s/g, "")}`]}`}
      onClick={() => onSelectCurso(curso)}
    >
      <div className={styles.cardTop}>
        <span className={styles.lessonBadge}>{curso.totalLecciones} Lecciones</span>
        <div className={styles.iconBox}>{curso.icono || '📖'}</div>
      </div>

      <div className={styles.cardBody}>
        <h3>{curso.titulo}</h3>
        <p className={styles.description}>{curso.descripcion || "Capacitación técnica Chakray"}</p>
        
        <div className={styles.progressInfo}>
          <div className={styles.barLabels}>
            <span>Progreso</span>
            <span>{curso.progreso}%</span>
          </div>
          <div className={styles.fullBar}>
            <div 
              className={`${styles.fill} ${curso.estado === 'Completado' ? styles.fillSuccess : ''}`} 
              style={{ width: `${curso.progreso}%` }} 
            />
          </div>
          <span className={styles.counterText}>
            {curso.estado === "Completado" 
              ? `${curso.totalLecciones} de ${curso.totalLecciones} aprobado` 
              : `${curso.completadasCount} de ${curso.totalLecciones} completadas`}
          </span>
          
          {/* Alerta de examen reprobado */}
          {curso.nota !== undefined && !curso.aprobado && (
            <div className={styles.reprobadoAlert}>
              <ErrorIcon sx={{ fontSize: '14px', color: '#E11F26' }} /> 
              <span>REPETIR EXAMEN (Nota: {curso.nota}%)</span>
            </div>
          )}
        </div>
      </div>

      <button className={styles.btnAction}>
        {curso.estado === "Completado" ? 'REPASAR MÓDULO' : 
         curso.nota !== undefined && !curso.aprobado ? 'REINTENTAR EXAMEN' : 'CONTINUAR APRENDIZAJE'}
      </button>
    </article>
  );

  return (
    <div className={styles.welcomeContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.textHero}>
          <h1>Panel de Aprendizaje</h1>
          <p>Bienvenido. Aquí tienes el resumen de tus capacitaciones.</p>
        </div>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Book className={styles.statIcon} />
            <div><strong>{stats.total}</strong> <span>Módulos</span></div>
          </div>
          <div className={styles.statItem}>
            <PendingActions className={styles.statIcon} style={{color: '#ff9800'}} />
            <div><strong>{stats.enCurso}</strong> <span>En Proceso</span></div>
          </div>
          <div className={styles.statItem}>
            <CheckCircle className={styles.statIcon} style={{color: '#2ecc71'}} />
            <div><strong>{stats.completados}</strong> <span>Aprobado</span></div>
          </div>
        </div>
      </header>

      <div className={styles.sectionsList}>
        {Object.entries(secciones).map(([key, list]) => list.length > 0 && (
          <section key={key} className={styles.sectionGroup}>
            <h2 className={styles.groupTitle}>
              {key === 'pendientes' ? 'Continuar aprendiendo' : 
               key === 'completados' ? 'Cursos Aprobados' : 'Nuevas Capacitaciones'}
            </h2>
            <div className={styles.coursesGrid}>
              {list.map(renderCard)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Bienvenido;