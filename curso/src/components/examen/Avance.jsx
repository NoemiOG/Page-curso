import React from 'react';
import styles from './Avance.module.sass';

const Avance = ({ cursos = [], userAnswers = {}, onContinuar }) => {

  const calcularResultado = (curso) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return null;

    let aciertos = 0;
    const totalPreguntas = examen.preguntas.length;

    const revision = examen.preguntas.map(pregunta => {
      // --- CAMBIO CLAVE AQUÍ ---
      // Buscamos en userAnswers usando la combinación de curso.id y pregunta.id
      const idCompuesto = `${curso.id}_${pregunta.id}`;
      const respuestaUsuario = userAnswers[idCompuesto]; 
      const respuestaCorrecta = pregunta.respuestaCorrecta;
      
      let esCorrecta = false;

      // 1. Lógica de validación (Simple vs Múltiple)
      if (pregunta.esMultiple) {
        esCorrecta = Array.isArray(respuestaUsuario) &&
          Array.isArray(respuestaCorrecta) &&
          respuestaUsuario.length === respuestaCorrecta.length &&
          respuestaUsuario.every(val => respuestaCorrecta.includes(val));
      } else {
        // Usamos == para permitir comparación flexible
        esCorrecta = respuestaUsuario == respuestaCorrecta;
      }
      
      if (esCorrecta) aciertos++;

      const obtenerTexto = (val) => {
        // Verificamos si realmente hay una respuesta
        if (val === undefined || val === null) return "Sin responder";
        if (Array.isArray(val)) {
          return val.map(idx => pregunta.opciones[idx]).join(", ");
        }
        return pregunta.opciones[val] || "Opción no encontrada";
      };

      return {
        texto: pregunta.texto,
        tuRespuesta: obtenerTexto(respuestaUsuario),
        respuestaCorrecta: obtenerTexto(respuestaCorrecta),
        esCorrecta,
        respondida: respuestaUsuario !== undefined // Flag para saber si se intentó
      };
    });

    const porcentaje = Math.round((aciertos / totalPreguntas) * 100);
    
    return { 
      porcentaje, 
      aprobado: porcentaje >= 80, 
      revision,
      // Ahora validamos si el usuario respondió al menos una pregunta de ESTE curso
      intentado: revision.some(r => r.respondida) 
    };
  };

  return (
    <div className={styles.progresoContainer}>
      <h1 className={styles.mainTitle}>RESUMEN DE RESULTADOS</h1>

      <div className={styles.cursosGrid}>
        {cursos.map(curso => {
          const res = calcularResultado(curso);
          
          // Si el curso no tiene examen o no se ha intentado responder nada, no mostramos la card
          if (!res || !res.intentado) return null;

          return (
            <div key={curso.id} className={styles.cursoCardRevision}>
              <header className={styles.headerRevision}>
                <div>
                  <h3>{curso.titulo}</h3>
                  <span className={res.aprobado ? styles.statusPass : styles.statusFail}>
                    {res.aprobado ? 'CURSO APROBADO' : 'REQUIERE REPASO'}
                  </span>
                </div>
                <div className={styles.porcentajeCircle}>
                  <span className={res.aprobado ? styles.txtPass : styles.txtFail}>
                    {res.porcentaje}%
                  </span>
                </div>
              </header>

              <div className={styles.listaRevision}>
                <h4>Retroalimentación Detallada:</h4>
                {res.revision.map((item, i) => (
                  <div key={i} className={item.esCorrecta ? styles.itemCorrecto : styles.itemErroneo}>
                    <p className={styles.preguntaTexto}><strong>{i + 1}.</strong> {item.texto}</p>
                    <div className={styles.respuestasComparadas}>
                      <p><span>Tu selección:</span> {item.tuRespuesta}</p>
                      {!item.esCorrecta && (
                        <p className={styles.solucion}>
                          <span>La correcta era:</span> {item.respuestaCorrecta}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerAvance}>
        <button onClick={onContinuar} className={styles.btnContinuar}>
          VOLVER AL PANEL DE CURSOS
        </button>
      </div>
    </div>
  );
};

export default Avance;