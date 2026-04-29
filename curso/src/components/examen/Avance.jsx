import React, { useState, useMemo, useEffect } from 'react';
import styles from './Avance.module.sass';

// Material UI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';

const Avance = ({ 
  cursos = [], 
  userAnswers = {}, 
  onContinuar, 
  onResetExamen, 
  cursoIdFiltrado = null, 
  userEmail 
}) => {
  const [cursoAbierto, setCursoAbierto] = useState(cursoIdFiltrado || null);

  useEffect(() => {
    if (cursoIdFiltrado) setCursoAbierto(cursoIdFiltrado);
  }, [cursoIdFiltrado]);

  const cursosAVisualizar = useMemo(() => {
    if (!cursos || cursos.length === 0) return [];

    const savedAnswers = JSON.parse(localStorage.getItem(`answers_${userEmail}`) || "{}");
    const mergedAnswers = { ...savedAnswers, ...userAnswers };

    let filtrados = [...cursos];
    
    if (cursoIdFiltrado) {
      filtrados = cursos.filter(c => String(c.id) === String(cursoIdFiltrado));
    }

    return filtrados.map(curso => {
      const examen = curso.secciones?.find(s => s.tipo === 'examen');
      if (!examen) return null;

      // LLAVE NORMALIZADA: Siempre string para evitar fallos de coincidencia
      const cursoIdStr = String(curso.id);
      const puntaje = mergedAnswers[`puntaje_${cursoIdStr}_${userEmail}`];
      const numIntentos = parseInt(localStorage.getItem(`intentos_${cursoIdStr}_${userEmail}`) || "0");
      
      const revision = examen.preguntas?.map(pregunta => {
        const respuestaUsuario = mergedAnswers[`${cursoIdStr}_${pregunta.id}`];
        const respuestaCorrecta = pregunta.respuestaCorrecta !== undefined 
          ? pregunta.respuestaCorrecta 
          : pregunta.respuesta;
        
        let esCorrecta = false;
        
        if (Array.isArray(respuestaCorrecta)) {
          esCorrecta = Array.isArray(respuestaUsuario) && 
                       respuestaUsuario.length === respuestaCorrecta.length && 
                       respuestaUsuario.every(v => respuestaCorrecta.map(String).includes(String(v)));
        } else {
          esCorrecta = respuestaUsuario !== undefined && String(respuestaUsuario) === String(respuestaCorrecta);
        }

        return {
          textoPregunta: pregunta.texto,
          opciones: pregunta.opciones || [],
          respuestaUsuario,
          esCorrecta,
          respondida: respuestaUsuario !== undefined
        };
      }) || [];

      return {
        ...curso,
        porcentaje: puntaje ?? 0,
        aprobado: (puntaje ?? 0) >= 80,
        revision,
        intentado: puntaje !== undefined,
        numIntentos: numIntentos
      };
    })
    .filter(c => c !== null && (cursoIdFiltrado || c.intentado));
  }, [cursos, userAnswers, cursoIdFiltrado, userEmail]);

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
        {cursosAVisualizar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
            <p>No se encontraron resultados registrados para este módulo.</p>
          </div>
        ) : (
          cursosAVisualizar.map(curso => {
            const isOpen = String(cursoAbierto) === String(curso.id);
            const bloqueado = !curso.aprobado && curso.numIntentos >= 3;

            return (
              <div key={curso.id} className={`${styles.modernCard} ${curso.aprobado ? styles.cardPass : styles.cardFail}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.infoSide}>
                    <span className={styles.moduleTag}>MÓDULO {curso.id}</span>
                    <h3>{curso.titulo}</h3>
                    <div className={curso.aprobado ? styles.statusAprobado : styles.statusReprobado}>
                      {curso.aprobado ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
                      {curso.aprobado ? 'APROBADOS' : 'NO APROBADOS'}
                    </div>
                  </div>

                  <div className={styles.scoreSide}>
                    <div className={styles.chartWrapper}>
                      <svg viewBox="0 0 36 36" className={styles.circularChart}>
                        <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={`${styles.circle} ${curso.aprobado ? styles.circlePass : styles.circleFail}`}
                          strokeDasharray={`${curso.porcentaje}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className={styles.percentageCenter}>
                        <span className={styles.number}>{curso.porcentaje}</span>
                        <span className={styles.symbol}>%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.btnToggle} onClick={() => setCursoAbierto(isOpen ? null : curso.id)}>
                    {isOpen ? 'OCULTAR DETALLES' : 'REVISAR DETALLES'} 
                    <ExpandMoreIcon className={isOpen ? styles.rotated : ''} />
                  </button>

                  {!curso.aprobado && (
                    <>
                      {bloqueado ? (
                        <div className={styles.badgeBloqueado}>
                          <LockIcon fontSize="small" /> EXAMEN BLOQUEADO (3 INTENTOS)
                        </div>
                      ) : (
                        <button className={styles.btnReintentar} onClick={() => onResetExamen(curso.id)}>
                          <ReplayIcon /> REINTENTAR ({3 - curso.numIntentos} restantes)
                        </button>
                      )}
                    </>
                  )}
                </div>

                {isOpen && (
                  <div className={styles.revisionBody}>
                    {curso.revision.map((item, i) => (
                      <div key={i} className={styles.revisionItem}>
                        <div className={item.esCorrecta ? styles.linePass : styles.lineFail} />
                        <div className={styles.itemContent}>
                          <p className={styles.preguntaText}><strong>{i + 1}.</strong> {item.textoPregunta}</p>
                          <p className={styles.respuestaText}>
                            Tu respuesta: <span className={item.esCorrecta ? styles.correct : styles.wrong}>
                              {item.respondida 
                                ? (Array.isArray(item.respuestaUsuario) 
                                    ? item.respuestaUsuario.map(idx => item.opciones[idx]).join(', ')
                                    : item.opciones[item.respuestaUsuario])
                                : "Sin responder"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <footer className={styles.footerAvance} style={{ position: 'relative', zIndex: 9999 }}>
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            onContinuar();
          }} 
          className={styles.btnHome}
          style={{ pointerEvents: 'auto' }} 
        >
          <ArrowBackIcon /> {cursoIdFiltrado ? "FINALIZAR REVISIÓN" : "VOLVER AL INICIO"}
        </button>
      </footer>
    </div>
  );
};

export default Avance;