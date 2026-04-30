import React from 'react';
import styles from './Perfil.module.sass';

const Perfil = ({ usuario, onBack, cursos = [], userAnswers = {} }) => {
  
  const inicial = usuario?.nombre?.charAt(0) || "U";
  const userEmail = usuario?.email;

  // --- LÓGICA DE MÉTRICAS USANDO EL ESTADO GLOBAL ---
  const calcularMetricasGlobales = () => {
    let totalIntentados = 0;
    let sumaPorcentajes = 0;

    cursos.forEach(curso => {
      const puntaje = userAnswers[`puntaje_${curso.id}_${userEmail}`];
      
      if (puntaje !== undefined) {
        totalIntentados++;
        sumaPorcentajes += puntaje;
      }
    });

    return {
      total: totalIntentados,
      promedio: totalIntentados > 0 ? Math.round(sumaPorcentajes / totalIntentados) : 0
    };
  };

  const { total, promedio } = calcularMetricasGlobales();

  const verificarEstadoCurso = (curso) => {
    const puntaje = userAnswers[`puntaje_${curso.id}_${userEmail}`];
    
    if (puntaje === undefined) return "Pendiente ✗";
    return puntaje >= 80 ? "Completado ✓" : "No completado ✗";
  };

  return (
    <div className={styles.perfilContainer}>
      <header className={styles.perfilHeader}>
        <div className={styles.avatar}>
          {usuario?.avatar ? <img src={usuario.avatar} alt="Avatar" /> : inicial}
        </div>
        <div className={styles.info}>
          {/* El nombre del usuario actual */}
          <h2>{usuario?.nombre || "Empleado"}</h2>
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
          {cursos.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.6 }}>No hay cursos cargados.</p>
          ) : (
            cursos.map(curso => {
              const estado = verificarEstadoCurso(curso);
              const puntaje = userAnswers[`puntaje_${curso.id}_${userEmail}`] || 0;
              const esCompletado = estado === "Completado ✓";

              return (
                <div key={curso.id} className={styles.cursoFila}>
                  <div className={styles.infoFila}>
                    <span className={styles.nombreCurso}>{curso.titulo}</span>
                    <span className={styles.puntajeFila}>({puntaje}%)</span>
                  </div>
                  <span className={esCompletado ? styles.badgeCompletado : styles.badgePendiente}>
                    {estado}
                  </span>
                </div>
              );
            })
          )}
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