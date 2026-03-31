import React from 'react';
import styles from './Perfil.module.sass';

const Perfil = ({ usuario, stats, onBack, cursos = [], userAnswers = {} }) => {
  // Obtiene la inicial del nombre del usuario para mostrarla como avatar por defecto.
  const inicial = usuario?.nombre?.charAt(0) || "U";

  // Determina si un curso específico ha sido aprobado comparando los aciertos contra el total de preguntas.
  const verificarEstadoCurso = (curso) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return "Sin examen";

    let aciertos = 0;
    examen.preguntas.forEach(p => {
      const respUser = userAnswers[`${curso.id}_${p.id}`];
      if (respUser == p.respuestaCorrecta) aciertos++;
    });

    const porcentaje = (aciertos / examen.preguntas.length) * 100;
    return porcentaje >= 80 ? "Completado ✓" : "Pendiente ✗";
  };

  return (
    <div className={styles.perfilContainer}>
      {/* SECCIÓN DE IDENTIDAD: Muestra el avatar y la información básica del usuario */}
      <header className={styles.perfilHeader}>
        <div className={styles.avatar}>
          {usuario?.avatar ? <img src={usuario.avatar} alt="Avatar" /> : inicial}
        </div>
        <div className={styles.info}>
          <h2>{usuario?.nombre || "Estudiante"}</h2>
          <p>{usuario?.email || "Sin correo registrado"}</p>
        </div>
      </header>

      {/* MÉTRICAS GLOBALES: Visualiza el resumen del desempeño académico general */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Exámenes Realizados</span>
          <p className={styles.statValue}>{stats?.totalIniciados || 0}</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Promedio General</span>
          <p className={styles.statValue}>{stats?.promedioGeneral || 0}%</p>
        </div>
      </div>

      {/* LISTADO GENERAL DE CURSOS: Despliega el estado actual de cada módulo disponible */}
      <section className={styles.cursosListSection}>
        <h3 className={styles.sectionTitle}>Estado de tus Módulos</h3>
        <div className={styles.listaCursosPerfil}>
          {cursos.map(curso => {
            const estado = verificarEstadoCurso(curso);
            const esCompletado = estado === "Completado ✓";

            return (
              <div key={curso.id} className={styles.cursoFila}>
                <span className={styles.nombreCurso}>{curso.titulo}</span>
                <span className={esCompletado ? styles.badgeCompletado : styles.badgePendiente}>
                  {estado}
                </span>
              </div>
            );
          })}
        </div>
      </section>
      
      <div className={styles.footer}>
        <button onClick={onBack} className={styles.btnVolver}>
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
};

export default Perfil;