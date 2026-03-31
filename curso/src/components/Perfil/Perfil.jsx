import React from 'react';
import styles from './Perfil.module.sass';

/**
 * Componente funcional que gestiona la visualización del perfil del usuario.
 * Centraliza la información personal, estadísticas de desempeño y el estado de los módulos.
 */
const Perfil = ({ usuario, stats, onBack, cursos = [], userAnswers = {} }) => {
  
  /**
   * Genera un identificador visual de reserva (fallback).
   * Extrae el primer carácter del nombre del usuario para su visualización en el avatar.
   */
  const inicial = usuario?.nombre?.charAt(0) || "U";

  /**
   * Evalúa el progreso académico de un curso específico.
   * Contrasta las respuestas almacenadas en el estado global contra las soluciones correctas del examen,
   * determinando el estado de aprobación basado en un umbral del 80%.
   */
  const verificarEstadoCurso = (curso) => {
    // Localiza la sección evaluativa dentro del esquema del curso.
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return "Sin examen";

    let aciertos = 0;
    
    /**
     * Itera sobre el conjunto de preguntas para validar las respuestas del usuario.
     * Utiliza una llave compuesta para localizar la respuesta específica en el objeto 'userAnswers'.
     */
    examen.preguntas.forEach(p => {
      const respUser = userAnswers[`${curso.id}_${p.id}`];
      if (respUser == p.respuestaCorrecta) aciertos++;
    });

    // Calcula el valor porcentual del éxito obtenido.
    const porcentaje = (aciertos / examen.preguntas.length) * 100;
    return porcentaje >= 80 ? "Completado ✓" : "Pendiente ✗";
  };

  return (
    <div className={styles.perfilContainer}>
      {/* SECCIÓN DE IDENTIDAD: Presenta la representación gráfica y datos identificativos del usuario */}
      <header className={styles.perfilHeader}>
        <div className={styles.avatar}>
          {/* Renderizado condicional: prioriza la imagen de perfil sobre la inicial generada */}
          {usuario?.avatar ? <img src={usuario.avatar} alt="Avatar" /> : inicial}
        </div>
        <div className={styles.info}>
          <h2>{usuario?.nombre || "Estudiante"}</h2>
          <p>{usuario?.email || "Sin correo registrado"}</p>
        </div>
      </header>

      {/* MÉTRICAS GLOBALES: Estructura de rejilla para la visualización de indicadores clave de rendimiento (KPIs) */}
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

      {/* LISTADO DE MÓDULOS: Desglose detallado del estatus de cada curso disponible en la plataforma */}
      <section className={styles.cursosListSection}>
        <h3 className={styles.sectionTitle}>Estado de tus Módulos</h3>
        <div className={styles.listaCursosPerfil}>
          {/* Procesa la colección de cursos para generar filas informativas individuales */}
          {cursos.map(curso => {
            const estado = verificarEstadoCurso(curso);
            const esCompletado = estado === "Completado ✓";

            return (
              <div key={curso.id} className={styles.cursoFila}>
                <span className={styles.nombreCurso}>{curso.titulo}</span>
                {/* Aplica estilos semánticos (éxito o pendiente) según el resultado de la validación */}
                <span className={esCompletado ? styles.badgeCompletado : styles.badgePendiente}>
                  {estado}
                </span>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* SECCIÓN DE NAVEGACIÓN: Provee el mecanismo de retorno al flujo principal de la aplicación */}
      <div className={styles.footer}>
        <button onClick={onBack} className={styles.btnVolver}>
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
};

export default Perfil;