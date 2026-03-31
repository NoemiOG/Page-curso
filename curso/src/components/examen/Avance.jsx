import React, { useState } from 'react';
import styles from './Avance.module.sass';

const Avance = ({ cursos = [], userAnswers = {}, onContinuar, onResetExamen }) => {
  const [cursoAbierto, setCursoAbierto] = useState(null);

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
      if (pregunta.esMultiple) {
        esCorrecta = Array.isArray(respuestaUsuario) &&
          Array.isArray(respuestaCorrecta) &&
          respuestaUsuario.length === respuestaCorrecta.length &&
          respuestaUsuario.every(val => respuestaCorrecta.includes(val));
      } else {
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

    const porcentaje = Math.round((aciertos / totalPreguntas) * 100);
    
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
        <h1 className={styles.mainTitle}>Estado de tus Evaluaciones</h1>
        <p className={styles.subtitle}>Supera el 80% para completar el curso.</p>
      </header>

      <div className={styles.cursosGrid}>
        {cursos.map(curso => {
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

                {/* BOTÓN CONDICIONAL: Solo aparece si NO ha aprobado */}
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