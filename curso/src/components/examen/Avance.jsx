import React, { useState } from 'react';
import styles from './Avance.module.sass';

/**
 * Componente funcional que gestiona la visualización del progreso y resultados de evaluaciones.
 * Permite la revisión detallada de respuestas y el cálculo dinámico de calificaciones.
 */
const Avance = ({ cursos = [], userAnswers = {}, onContinuar, onResetExamen, cursoActualId }) => {
  // Define el estado local para controlar la visibilidad de los detalles en la interfaz tipo acordeón.
  const [cursoAbierto, setCursoAbierto] = useState(null);

  /**
   * Alterna el estado de apertura de los detalles de un curso específico.
   * Si el identificador coincide con el actual, procede al cierre; de lo contrario, despliega la información.
   */
  const toggleDetalles = (cursoId) => {
    setCursoAbierto(cursoAbierto === cursoId ? null : cursoId);
  };

  /**
   * Ejecuta el procesamiento de las respuestas del usuario para determinar el rendimiento académico.
   * Realiza una comparación lógica entre las entradas del usuario y las soluciones correctas.
   */
  const calcularResultado = (curso) => {
    // Localiza la sección de tipo 'examen' dentro de la estructura de datos del curso.
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return null;

    let aciertos = 0;
    const totalPreguntas = examen.preguntas.length;

    // Genera una colección de revisión contrastando cada pregunta con su respuesta correspondiente.
    const revision = examen.preguntas.map(pregunta => {
      const llave = `${curso.id}_${pregunta.id}`;
      const respuestaUsuario = userAnswers[llave]; 
      const respuestaCorrecta = pregunta.respuestaCorrecta;
      
      let esCorrecta = false;
      
      /**
       * Validación lógica para preguntas de opción múltiple.
       * Verifica la igualdad de longitud y la presencia de todos los elementos requeridos.
       */
      if (pregunta.esMultiple) {
        esCorrecta = Array.isArray(respuestaUsuario) &&
          Array.isArray(respuestaCorrecta) &&
          respuestaUsuario.length === respuestaCorrecta.length &&
          respuestaUsuario.every(val => respuestaCorrecta.includes(val));
      } else {
        // Validación estándar para preguntas de respuesta única.
        esCorrecta = respuestaUsuario == respuestaCorrecta;
      }
      
      if (esCorrecta) aciertos++;

      /**
       * Función auxiliar para convertir valores de respuesta en cadenas de texto legibles.
       * Gestiona casos de respuestas nulas, arreglos o índices directos.
       */
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

    // Determina el puntaje final y establece el umbral de aprobación (80%).
    const porcentaje = Math.round((aciertos / totalPreguntas) * 100);
    
    return { 
      porcentaje, 
      aprobado: porcentaje >= 80, 
      revision,
      intentado: revision.some(r => r.respondida) 
    };
  };

  /**
   * Determina la colección de cursos a mostrar basándose en el contexto actual.
   * Prioriza el curso seleccionado o, en su defecto, la totalidad de los cursos disponibles.
   */
  const cursosAVisualizar = cursoActualId 
    ? cursos.filter(c => c.id === cursoActualId)
    : cursos;

  return (
    <div className={styles.progresoContainer}>
      {/* Cabecera del componente con información contextual sobre la evaluación */}
      <header className={styles.headerTop}>
        <h1 className={styles.mainTitle}>Resultado de la Evaluación</h1>
        <p className={styles.subtitle}>
          {cursoActualId ? "Revisa tu desempeño en este módulo." : "Resumen de tus cursos realizados."}
        </p>
      </header>

      <div className={styles.cursosGrid}>
        {/* Itera sobre la colección filtrada para renderizar las tarjetas de revisión */}
        {cursosAVisualizar.map(curso => {
          const res = calcularResultado(curso);
          
          // Omite la renderización si el curso no presenta intentos de evaluación previos.
          if (!res || !res.intentado) return null;

          const isOpen = cursoAbierto === curso.id;

          return (
            <div key={curso.id} className={styles.cursoCardRevision}>
              {/* Sección informativa del resultado general y estado de aprobación */}
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

              {/* Panel de acciones para la interacción con el desglose de respuestas */}
              <div className={styles.cardActions}>
                <button className={styles.btnToggle} onClick={() => toggleDetalles(curso.id)}>
                  {isOpen ? "Cerrar detalles ▲" : "Revisar mis respuestas ▼"}
                </button>

                {/* Renderizado condicional: habilita el reinicio únicamente si el curso no ha sido aprobado */}
                {!res.aprobado && (
                  <button className={styles.btnReset} onClick={() => onResetExamen(curso.id)}>
                    Intentar de nuevo ↻
                  </button>
                )}
              </div>

              {/* Listado detallado de reactivos, aplicando estilos diferenciados según el éxito de la respuesta */}
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

      {/* Pie de página con control de navegación global */}
      <footer className={styles.footerAvance}>
        <button onClick={onContinuar} className={styles.btnHome}>
          Volver a mis cursos
        </button>
      </footer>
    </div>
  );
};

export default Avance;