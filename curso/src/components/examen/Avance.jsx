import React, { useState } from 'react';
import styles from './Avance.module.sass';

// Recibe adicionalmente 'cursoActualId' para filtrar la visualización inmediata.
const Avance = ({ cursos = [], userAnswers = {}, onContinuar, onResetExamen, cursoActualId }) => {
  const [cursoAbierto, setCursoAbierto] = useState(null);

  // Gestiona la apertura y cierre del acordeón de detalles para cada curso.
  const toggleDetalles = (cursoId) => {
    setCursoAbierto(cursoAbierto === cursoId ? null : cursoId);
  };

  // Procesa las respuestas del usuario y calcula el porcentaje de éxito comparando contra las respuestas correctas.
  const calcularResultado = (curso) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return null;

    let aciertos = 0;
    const totalPreguntas = examen.preguntas.length;

    const revision = examen.preguntas.map(pregunta => {
      const llave = `${curso.id}_${pregunta.id}`;
      const respuestaUsuario = userAnswers[llave]; 
      const respuestaCorrecta = pregunta.respuestaCorrecta;
      
      let esCorrecta = false;
      if (pregunta.esMultiple) {
        esCorrecta = Array.isArray(respuestaUsuario) &&
          Array.isArray(respuestaCorrecta) &&
          respuestaUsuario.length === respuestaCorrecta.length &&
          respuestaUsuario.every(val => respuestaCorrecta.includes(val));
      } else {
        esCorrecta = respuestaUsuario == respuestaCorrecta;
      }
      
      if (esCorrecta) aciertos++;

      // Transforma el índice o valor de la respuesta en el texto legible de la opción.
      const obtenerTexto = (val) => {
        if (val === undefined || val === null) return "Sin responder";
        if (Array.isArray(val)) {
          return val.map(idx => pregunta.opciones[idx]).join(", ");
        }
        return pregunta.opciones[val] || "Opción no encontrada";
      };

      return {
        texto: pregunta.texto,
        tuRespuesta: obtenerTexto(respuestaUsuario),
        esCorrecta,
        respondida: respuestaUsuario !== undefined
      };
    });

    const porcentaje = Math.round((aciertos / totalPreguntas) * 100);
    
    return { 
      porcentaje, 
      aprobado: porcentaje >= 80, 
      revision,
      intentado: revision.some(r => r.respondida) 
    };
  };

  // Filtra la lista de cursos para mostrar únicamente el que se está cursando actualmente.
  // Si no se proporciona cursoActualId, por seguridad muestra todos los intentados.
  const cursosAVisualizar = cursoActualId 
    ? cursos.filter(c => c.id === cursoActualId)
    : cursos;

  return (
    <div className={styles.progresoContainer}>
      <header className={styles.headerTop}>
        <h1 className={styles.mainTitle}>Resultado de la Evaluación</h1>
        <p className={styles.subtitle}>
          {cursoActualId ? "Revisa tu desempeño en este módulo." : "Resumen de tus cursos realizados."}
        </p>
      </header>

      <div className={styles.cursosGrid}>
        {cursosAVisualizar.map(curso => {
          const res = calcularResultado(curso);
          if (!res || !res.intentado) return null;

          const isOpen = cursoAbierto === curso.id;

          return (
            <div key={curso.id} className={styles.cursoCardRevision}>
              <div className={styles.headerRevision}>
                <div className={styles.infoCurso}>
                  <h3>{curso.titulo}</h3>
                  <div className={res.aprobado ? styles.badgePass : styles.badgeFail}>
                    {res.aprobado ? 'Completado ✓' : 'Pendiente ✗'}
                  </div>
                </div>
                <div className={`${styles.porcentajeBox} ${res.aprobado ? styles.bgPass : styles.bgFail}`}>
                  {res.porcentaje}%
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.btnToggle} onClick={() => toggleDetalles(curso.id)}>
                  {isOpen ? "Cerrar detalles ▲" : "Revisar mis respuestas ▼"}
                </button>

                {/* Renderizado condicional del botón de reinicio basado en el estado de aprobación. */}
                {!res.aprobado && (
                  <button className={styles.btnReset} onClick={() => onResetExamen(curso.id)}>
                    Intentar de nuevo ↻
                  </button>
                )}
              </div>

              <div className={`${styles.listaRevision} ${isOpen ? styles.show : styles.hide}`}>
                {res.revision.map((item, i) => (
                  <div key={i} className={item.esCorrecta ? styles.itemCorrecto : styles.itemErroneo}>
                    <div className={styles.preguntaStatus}>
                      <p className={styles.preguntaTexto}>{item.texto}</p>
                    </div>
                    <div className={styles.tuEleccion}>
                      <p>Elegiste: <strong>{item.tuRespuesta}</strong></p>
                      {!item.esCorrecta && (
                        <span className={styles.mensajeError}>Incorrecto.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <footer className={styles.footerAvance}>
        <button onClick={onContinuar} className={styles.btnHome}>
          Volver a mis cursos
        </button>
      </footer>
    </div>
  );
};

export default Avance;