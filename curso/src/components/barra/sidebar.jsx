import React from 'react';
import styles from './bar.module.sass';
import { FaBookOpen, FaFileAlt, FaLock } from "react-icons/fa";

const Sidebar = ({ cursoActual, activeId, onSelect, onShowProgress, userAnswers = {} }) => {
  if (!cursoActual) return null;

  // 1. Cálculo del puntaje real para el estado del curso
  const calcularEstadoExamen = (curso, respuestas) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return { porcentaje: 0, aprobado: false };

    let aciertos = 0;
    examen.preguntas.forEach(p => {
      const respUser = respuestas[`${curso.id}_${p.id}`];
      // Validación flexible (doble igual para strings/numbers)
      if (respUser == p.respuestaCorrecta) aciertos++;
    });

    const porcentaje = Math.round((aciertos / examen.preguntas.length) * 100);
    return { porcentaje, aprobado: porcentaje >= 80 };
  };

  const { porcentaje, aprobado } = calcularEstadoExamen(cursoActual, userAnswers);

  // 2. Lógica de bloqueo del examen
  // Se desbloquea si: ya está aprobado O si el usuario está viendo la última lección de contenido
  const lecciones = cursoActual.secciones.filter(s => s.tipo !== 'examen');
  const ultimaLeccionId = lecciones[lecciones.length - 1]?.id;
  
  // El examen se habilita solo cuando el usuario llega a la última lección de texto
  const contenidoRevisado = activeId === ultimaLeccionId || aprobado;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>{cursoActual.titulo}</h2>
      </div>

      <nav className={styles.navLista}>
        {cursoActual.secciones.map((seccion) => {
          const esExamen = seccion.tipo === 'examen';
          
          // REGLA: Si ya aprobó, el examen desaparece de la lista
          if (esExamen && aprobado) return null;

          // Bloqueo visual y funcional si no ha llegado al final del contenido
          const bloqueado = esExamen && !contenidoRevisado;

          return (
            <button
              key={seccion.id}
              disabled={bloqueado}
              className={`${styles.navItem} ${activeId === seccion.id ? styles.active : ''} ${bloqueado ? styles.locked : ''}`}
              onClick={() => !bloqueado && onSelect(seccion)}
            >
              <span className={styles.itemLabel}>
                {bloqueado ? <FaLock /> : (esExamen ? <FaFileAlt /> : <FaBookOpen />)}
                {seccion.label || seccion.tituloTema}
              </span>
            </button>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.btnProgreso} onClick={onShowProgress}>
          {/* TEXTO DINÁMICO SEGÚN TU SOLICITUD */}
          {aprobado ? "ESTADO: APROBADO" : `FALTA POR APROBAR`}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;