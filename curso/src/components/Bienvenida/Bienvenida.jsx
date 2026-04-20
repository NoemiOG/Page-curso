import React, { useMemo } from 'react';
import styles from './Bienvenido.module.sass';
import { Book, CheckCircle, PendingActions, School } from '@mui/icons-material';

const Bienvenido = ({ cursos = [], onSelectCurso, mode, progresoUpdate, userAnswers = {} }) => { 

  const cursosProcesados = useMemo(() => {
    return cursos.map(curso => {
      const key = `completado_${curso.id}`;
      const completados = JSON.parse(localStorage.getItem(key) || "[]");
      const lecciones = curso.secciones?.filter(s => s.tipo !== 'examen') || [];
      const totalLecciones = lecciones.length;
      const completadasCount = lecciones.filter(s => completados.includes(s.id)).length;
      const porcentajeTeoria = totalLecciones > 0 ? Math.round((completadasCount / totalLecciones) * 100) : 0;

      const examen = curso.secciones?.find(s => s.tipo === 'examen');
      let aprobado = false;
      if (examen) {
        let aciertos = 0;
        examen.preguntas.forEach(p => {
          const resp = userAnswers[`${curso.id}_${p.id}`];
          const correct = p.respuestaCorrecta;
          if (p.esMultiple) {
            if (Array.isArray(resp) && resp.length === correct.length && resp.every(v => correct.map(String).includes(String(v)))) aciertos++;
          } else if (resp !== undefined && String(resp) === String(correct)) aciertos++;
        });
        aprobado = ((aciertos / examen.preguntas.length) * 100) >= 80;
      }

      return {
        ...curso,
        totalLecciones,
        completadasCount,
        progreso: porcentajeTeoria,
        estado: aprobado ? "Completado" : (porcentajeTeoria > 0 ? "Pendiente" : "Sin iniciar")
      };
    });
  }, [cursos, progresoUpdate, userAnswers]);

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
      className={`${styles.cursoCard} ${styles[`card${curso.estado.replace(" ", "")}`]}`}
      onClick={() => onSelectCurso(curso)}
    >
      <div className={styles.cardTop}>
        <span className={styles.lessonBadge}>{curso.totalLecciones} Lecciones</span>
        <div className={styles.iconBox}>{curso.icono || '📖'}</div>
      </div>

      <div className={styles.cardBody}>
        <h3>{curso.titulo}</h3>
        <p className={styles.description}>{curso.descripcion || "Capacitación"}</p>
        
        <div className={styles.progressInfo}>
          <div className={styles.barLabels}>
            <span>Progreso</span>
            <span>{curso.progreso}%</span>
          </div>
          <div className={styles.fullBar}>
            <div className={`${styles.fill} ${curso.estado === 'Completado' ? styles.fillSuccess : ''}`} style={{ width: `${curso.progreso}%` }} />
          </div>
          <span className={styles.counterText}>
            {curso.completadasCount} de {curso.totalLecciones} completadas
          </span>
        </div>
      </div>

      <button className={styles.btnAction}>
        {curso.estado === "Completado" ? 'REPASAR MÓDULO' : 'CONTINUAR APRENDIZAJE'}
      </button>
    </article>
  );

  return (
    <div className={styles.welcomeContainer}>
      {/* 1. Header con Resumen General */}
      <header className={styles.dashboardHeader}>
        <div className={styles.textHero}>
          <h1>Panel de Aprendizaje</h1>
          <p>Bienvenido de nuevo. Aquí tienes un resumen de tu actividad.</p>
        </div>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Book className={styles.statIcon} />
            <div><strong>{stats.total}</strong> <span>Cursos Totales</span></div>
          </div>
          <div className={styles.statItem}>
            <PendingActions className={styles.statIcon} style={{color: '#ff9800'}} />
            <div><strong>{stats.enCurso}</strong> <span>En Proceso</span></div>
          </div>
          <div className={styles.statItem}>
            <CheckCircle className={styles.statIcon} style={{color: '#2ecc71'}} />
            <div><strong>{stats.completados}</strong> <span>Completados</span></div>
          </div>
        </div>
      </header>

      {/* 2. Secciones por Estado */}
      <div className={styles.sectionsList}>
        {Object.entries(secciones).map(([key, list]) => list.length > 0 && (
          <section key={key} className={styles.sectionGroup}>
            <h2 className={styles.groupTitle}>
              {key === 'pendientes' ? 'Continuar' : key === 'completados' ? 'completados' : 'iniciar'}
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