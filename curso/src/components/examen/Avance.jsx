import React, { useState, useMemo } from 'react';
import styles from './Avance.module.sass';

// Importaciones directas (las más estables en Vite)
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Avance = ({ cursos, userAnswers, onContinuar, onResetExamen, cursoIdFiltrado = null }) => {
  const [cursoAbierto, setCursoAbierto] = useState(null);

  // Filtrado de cursos
  const cursosAVisualizar = useMemo(() => {
    if (cursoIdFiltrado) {
      return cursos.filter(c => c.id.toString() === cursoIdFiltrado.toString());
    }
    return cursos.filter(c => {
      const examen = c.secciones?.find(s => s.tipo === 'examen');
      return examen?.preguntas.some(p => userAnswers[`${c.id}_${p.id}`] !== undefined);
    });
  }, [cursos, userAnswers, cursoIdFiltrado]);

  const calcularResultado = (curso) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return null;

    const claveIntentos = `intentos_${curso.id}`;
    const intentosLlevados = parseInt(localStorage.getItem(claveIntentos)) || 0;
    const tieneOportunidades = intentosLlevados < 3;

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
          respuestaUsuario.every(val => respuestaCorrecta.map(String).includes(String(val)));
      } else {
        esCorrecta = respuestaUsuario !== undefined && String(respuestaUsuario) === String(respuestaCorrecta);
      }
      
      if (esCorrecta) aciertos++;

      const obtenerTexto = (val) => {
        if (val === undefined || val === null) return "Sin responder";
        if (Array.isArray(val)) return val.map(idx => pregunta.opciones[idx]).join(", ");
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
      intentado: revision.some(r => r.respondida),
      intentosLlevados,
      tieneOportunidades
    };
  };

  return (
    <div className={styles.progresoContainer}>
      <header className={styles.headerGlass}>
  <h1 className={styles.mainTitle}>
    {cursoIdFiltrado ? "Resultado de tu Evaluación" : "Historial Académico"}
  </h1>
  <div className={styles.redDivider} />
  <p className={styles.subtitle}>
    {cursoIdFiltrado 
      ? "Revisa tus aciertos antes de continuar con el siguiente módulo." 
      : "Consulta el rendimiento de todos tus cursos completados."}
  </p>
</header>

      <div className={styles.cursosList}>
        {cursosAVisualizar.map(curso => {
          const res = calcularResultado(curso);
          if (!res || !res.intentado) return null;
          const isOpen = cursoAbierto === curso.id;

          return (
            <div key={curso.id} className={`${styles.modernCard} ${res.aprobado ? styles.cardPass : styles.cardFail}`}>
              <div className={styles.cardHeader}>
                <div className={styles.infoSide}>
                  <span className={styles.moduleTag}>MÓDULO {curso.id}</span>
                  <h3>{curso.titulo}</h3>
                  <div className={res.aprobado ? styles.statusAprobado : styles.statusReprobado}>
                    {res.aprobado ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
                    {res.aprobado ? 'ACREDITADO' : 'NO ACREDITADO'}
                  </div>
                </div>

                <div className={styles.scoreSide}>
                  <div className={styles.chartWrapper}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                      <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={`${styles.circle} ${res.aprobado ? styles.circlePass : styles.circleFail}`}
                        strokeDasharray={`${res.porcentaje}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className={styles.percentageCenter}>
                      <span className={styles.number}>{res.porcentaje}</span>
                      <span className={styles.symbol}>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.btnToggle} onClick={() => setCursoAbierto(isOpen ? null : curso.id)}>
                  REVISAR DETALLES <ExpandMoreIcon className={isOpen ? styles.rotated : ''} />
                </button>

                {!res.aprobado && res.tieneOportunidades && (
                  <button className={styles.btnReintentar} onClick={() => onResetExamen(curso.id)}>
                    <ReplayIcon /> REINTENTAR ({3 - res.intentosLlevados})
                  </button>
                )}
                {res.aprobado && <span className={styles.successStamp}>COMPLETADO ✓</span>}
              </div>

              {isOpen && (
                <div className={styles.revisionBody}>
                  {res.revision.map((item, i) => (
                    <div key={i} className={styles.revisionItem}>
                      <div className={item.esCorrecta ? styles.linePass : styles.lineFail} />
                      <div className={styles.itemContent}>
                        <p className={styles.preguntaText}>{item.texto}</p>
                        <p className={styles.respuestaText}>
                          Tu respuesta: <span className={item.esCorrecta ? styles.correct : styles.wrong}>{item.tuRespuesta}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className={styles.footerAvance}>
        <button onClick={onContinuar} className={styles.btnHome}>
          <ArrowBackIcon /> {cursoIdFiltrado ? "FINALIZAR REVISIÓN" : "VOLVER AL INICIO"}
        </button>
      </footer>
    </div>
  );
};

export default Avance;