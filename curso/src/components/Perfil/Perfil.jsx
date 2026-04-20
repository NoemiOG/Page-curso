import React from 'react';
import styles from './Perfil.module.sass';

const Perfil = ({ usuario, onBack, cursos = [], userAnswers = {} }) => {
  
  const inicial = usuario?.nombre?.charAt(0) || "U";

  // --- NUEVA LÓGICA DE CÁLCULO EN TIEMPO REAL ---
  const calcularMetricasGlobales = () => {
    let totalIntentados = 0;
    let sumaPorcentajes = 0;

    cursos.forEach(curso => {
      const examen = curso.secciones?.find(s => s.tipo === 'examen');
      if (!examen) return;

      let aciertos = 0;
      let tieneRespuestas = false;

      examen.preguntas.forEach(p => {
        const respUser = userAnswers[`${curso.id}_${p.id}`];
        if (respUser !== undefined) {
          tieneRespuestas = true;
          if (respUser == p.respuestaCorrecta) aciertos++;
        }
      });

      if (tieneRespuestas) {
        totalIntentados++;
        sumaPorcentajes += (aciertos / examen.preguntas.length) * 100;
      }
    });

    return {
      total: totalIntentados,
      promedio: totalIntentados > 0 ? Math.round(sumaPorcentajes / totalIntentados) : 0
    };
  };

  const { total, promedio } = calcularMetricasGlobales();

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
      <header className={styles.perfilHeader}>
        <div className={styles.avatar}>
          {usuario?.avatar ? <img src={usuario.avatar} alt="Avatar" /> : inicial}
        </div>
        <div className={styles.info}>
          <h2>{usuario?.nombre || "Estudiante"}</h2>
          <p>{usuario?.email || "Sin correo registrado"}</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Exámenes Realizados</span>
          <p className={styles.statValue}>{total}</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Promedio General</span>
          <p className={styles.statValue}>{promedio}%</p>
        </div>
      </div>

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

      <div className={styles.footer} style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={onBack} className={styles.btnVolver}>
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
};

export default Perfil;