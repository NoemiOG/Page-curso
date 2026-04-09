import React, { useState } from 'react';
import styles from './Avance.module.sass';

/**
 * Componente funcional que gestiona la visualización del progreso y resultados de evaluaciones.
 * Muestra todos los cursos o solo uno específico si se recibe cursoIdFiltrado.
 */
const Avance = ({ cursos, userAnswers, onContinuar, onResetExamen, cursoIdFiltrado = null }) => {
  const [cursoAbierto, setCursoAbierto] = useState(null);

  // --- 1. LÓGICA DE FILTRADO CORREGIDA ---
  // Si cursoIdFiltrado existe (viniendo de un examen recién hecho), mostramos solo ese.
  // Si es null, mostramos todos los cursos que tengan al menos una respuesta guardada.
  const cursosAVisualizar = cursoIdFiltrado 
    ? cursos.filter(c => c.id.toString() === cursoIdFiltrado.toString())
    : cursos.filter(c => {
        const examen = c.secciones?.find(s => s.tipo === 'examen');
        return examen?.preguntas.some(p => userAnswers[`${c.id}_${p.id}`] !== undefined);
      });

  const toggleDetalles = (cursoId) => {
    setCursoAbierto(cursoAbierto === cursoId ? null : cursoId);
  };

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
      
      // Validación robusta para respuestas múltiples o simples
      if (pregunta.esMultiple) {
        esCorrecta = Array.isArray(respuestaUsuario) &&
          Array.isArray(respuestaCorrecta) &&
          respuestaUsuario.length === respuestaCorrecta.length &&
          respuestaUsuario.every(val => respuestaCorrecta.includes(val));
      } else {
        // Usamos == para permitir comparación de string/number si el JSON varía
        esCorrecta = respuestaUsuario == respuestaCorrecta;
      }
      
      if (esCorrecta) aciertos++;

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

    const porcentaje = totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
    
    return { 
      porcentaje, 
      aprobado: porcentaje >= 80, 
      revision,
      intentado: revision.some(r => r.respondida) 
    };
  };

  return (
    <div className={styles.progresoContainer}>
      <header className={styles.headerTop}>
        <h1 className={styles.mainTitle}>
          {cursoIdFiltrado ? "Resultado de tu Evaluación" : "Tu Progreso Académico"}
        </h1>
        <p className={styles.subtitle}>
          {cursoIdFiltrado 
            ? "Revisa tus respuestas a continuación." 
            : "Resumen detallado de tus módulos concluidos e iniciados."}
        </p>
      </header>

      <div className={styles.cursosGrid}>
        {cursosAVisualizar.length > 0 ? (
          cursosAVisualizar.map(curso => {
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

                  {/* El botón de repetir solo sale si no has aprobado (menos de 80%) */}
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
                          <span className={styles.mensajeError}>Respuesta incorrecta.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <p>Aún no has realizado evaluaciones.</p>
          </div>
        )}
      </div>

      <footer className={styles.footerAvance}>
        <button onClick={onContinuar} className={styles.btnHome}>
          {cursoIdFiltrado ? "Finalizar y volver a mis cursos" : "Volver al inicio"}
        </button>
      </footer>
    </div>
  );
};

export default Avance;