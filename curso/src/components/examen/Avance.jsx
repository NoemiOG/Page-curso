import React, { useState } from 'react';
import styles from './Avance.module.sass';

const Avance = ({ cursos = [], userAnswers = {}, onContinuar, onResetExamen }) => {
  const [detalleCursoId, setDetalleCursoId] = useState(null);

  const calcularResultado = (curso) => {
    const examen = curso.secciones.find(s => s.tipo === 'examen');
    if (!examen) return null;

    let aciertos = 0;
    const revision = examen.preguntas.map(pregunta => {
      const respuestaUsuario = userAnswers[pregunta.id];
      const respuestaCorrecta = pregunta.respuesta ?? pregunta.respuestaCorrecta;
      const esCorrecta = respuestaUsuario === respuestaCorrecta;
      
      if (esCorrecta) aciertos++;

      return {
        texto: pregunta.texto,
        tuRespuesta: pregunta.opciones[respuestaUsuario] || "Sin responder",
        respuestaCorrecta: pregunta.opciones[respuestaCorrecta],
        esCorrecta
      };
    });

    const porcentaje = Math.round((aciertos / examen.preguntas.length) * 100);
    return { porcentaje, aprobado: porcentaje >= 70, revision, examenId: examen.id };
  };

  return (
    <div className={styles.progresoContainer}>
      <h1 className={styles.mainTitle}>PROGRESO</h1>

      {cursos.map(curso => {
        const res = calcularResultado(curso);
        if (!res) return null;

        return (
          <div key={curso.id} className={styles.cursoCardRevision}>
            <div className={styles.headerRevision}>
              <h3>{curso.titulo}</h3>
              <span className={res.aprobado ? styles.passBadge : styles.failBadge}>
                {res.porcentaje}% - {res.aprobado ? 'APROBADO' : 'REPROBADO'}
              </span>
            </div>

            <div className={styles.botonesAccion}>
              <button 
                onClick={() => setDetalleCursoId(detalleCursoId === curso.id ? null : curso.id)}
                className={styles.btnReview}
              >
                {detalleCursoId === curso.id ? "Ocultar Errores" : "Ver Retroalimentación"}
              </button>
              
              <button 
                onClick={() => onResetExamen(curso.id)} 
                className={styles.btnRepeat}
              >
                Repetir Examen 🔄
              </button>
            </div>

            {/* LISTA DE ERRORES / ACIERTOS */}
            {detalleCursoId === curso.id && (
              <div className={styles.listaRevision}>
    {res.revision.map((item, i) => (
      <div 
        key={i} 
        className={item.esCorrecta ? styles.itemCorrecto : styles.itemErroneo}
      >
        <p><strong>Pregunta {i + 1}:</strong> {item.texto}</p>
        
        <div className={styles.statusBadge}>
          {item.esCorrecta ? (
            <span className={styles.txtCorrecto}>● CORRECTA</span>
          ) : (
            <span className={styles.txtIncorrecto}>● INCORRECTA</span>
          )}
        </div>

        {/* Ya no mostramos ni 'Tu respuesta' ni 'Respuesta Correcta' */}
      </div>
    ))}
  </div>
            )}
          </div>
        );
      })}

      <button onClick={onContinuar} className={styles.btnContinuar}>Volver al Curso</button>
    </div>
  );
};

export default Avance;