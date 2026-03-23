import React, { useState, useEffect } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import ProgresoCursos from '../examen/Avance';
import styles from './MainContent.module.sass';

const MainContent = ({ activePage, cursos = [], onSelect, onFinishExamen }) => {
  const [mostrarProgreso, setMostrarProgreso] = useState(false);
  const [pos, setPos] = useState(0);

  // Reiniciar estado cada vez que cambie el tema
  useEffect(() => {
    setPos(0);
    setMostrarProgreso(false);
  }, [activePage?.id]);

  // --- 1. VALIDACIONES DE ESTADO (PANTALLAS COMPLETAS) ---
  if (!activePage) {
    return (
      <div className={styles.emptyState}>
        <p>Selecciona un tema para comenzar</p>
      </div>
    );
  }

  if (mostrarProgreso) {
    return (
      <div className={styles.fullView}>
        <ProgresoCursos 
          titulo={activePage.tituloTema}
          onContinuar={() => setMostrarProgreso(false)} 
        />
      </div>
    );
  }

  if (activePage.tipo === 'examen') {
    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          onFinish={() => {
            setMostrarProgreso(true);
            if (onFinishExamen) onFinishExamen();
          }} 
        />
      </div>
    );
  }

  // --- 2. LÓGICA DE DIAPOSITIVAS Y NAVEGACIÓN ---
  const slides = activePage?.slides || [
    { id: 'default', color: '#ccc', content: 'Contenido informativo' }
  ];
  const totalSlides = slides.length;
  const esUltimaSlide = pos === totalSlides - 1;

  // Buscamos el curso actual para saber qué sigue después de este tema
  const cursoActual = cursos.find(c => c.secciones.some(s => s.id === activePage.id));
  const seccionesContenido = cursoActual?.secciones.filter(s => s.tipo !== 'examen') || [];
  
  // ¿Es este el último tema antes del examen?
  const esUltimoTema = activePage.id === seccionesContenido[seccionesContenido.length - 1]?.id;

  const handleNavegacion = () => {
    if (esUltimoTema) {
      // Si ya no hay más temas, buscamos el examen del curso
      const examen = cursoActual.secciones.find(s => s.tipo === 'examen');
      if (examen) onSelect(examen);
    } else {
      // Si hay más temas, buscamos el índice del actual y saltamos al siguiente
      const indexActual = cursoActual.secciones.findIndex(s => s.id === activePage.id);
      if (indexActual !== -1 && cursoActual.secciones[indexActual + 1]) {
        onSelect(cursoActual.secciones[indexActual + 1]);
      }
    }
  };

  const slideRight = () => setPos((prev) => (prev + 1) % totalSlides);
  const slideLeft = () => setPos((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <main className={styles.container}>
      <section className={styles.screenWrapper}>
        <div className={styles.viewerFrame}>
          <div
            className={styles.slider}
            style={{ transform: `translateX(-${pos * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={styles.slide}
                style={{ background: slide.color }}
              >
                <h2>{slide.content}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLES: Solo si hay contenido para navegar */}
        {totalSlides > 1 && (
          <>
            <div className={styles.controlesFijos}>
              <button className={styles.prevFixed} onClick={slideLeft}>←</button>
              <button className={styles.nextFixed} onClick={slideRight}>→</button>
            </div>

            <div className={styles.paginationArea}>
              <div className={styles.paginationDots}>
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.dot} ${i === pos ? styles.active : ""}`}
                    onClick={() => setPos(i)}
                  />
                ))}
              </div>
              <div className={styles.counterFixed}>
                {pos + 1} / {totalSlides}
              </div>
            </div>
          </>
        )}
      </section>

      <div className={styles.actionRow}>
      {esUltimaSlide && (
        <button className={styles.btnAccionFinal} onClick={handleNavegacion}>
          {esUltimoTema ? "🏆 REALIZAR EXAMEN FINAL" : "SIGUIENTE LECCIÓN ➔"}
        </button>
      )}
    </div>

      <article className={styles.textContent}>
        <header className={styles.textHeader}>
          <span className={styles.badge}>{activePage.label}</span>
          <h2>{activePage.tituloTema}</h2>
        </header>
        <div className={styles.bodyText}>
          <p>{activePage.textoLargo}</p>
        </div>
      </article>
    </main>
  );
};

export default MainContent;