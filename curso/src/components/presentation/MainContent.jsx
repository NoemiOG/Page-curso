import React, { useState, useEffect } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import ProgresoCursos from '../examen/Avance';
import styles from './MainContent.module.sass';
import { FaArrowCircleLeft } from "react-icons/fa";

const MainContent = ({ activePage, cursos = [], onSelect, onFinishExamen, userAnswers }) => {
  const [mostrarProgreso, setMostrarProgreso] = useState(false);
  const [pos, setPos] = useState(0);

  // Reiniciar estado cada vez que cambie el tema
  useEffect(() => {
    setPos(0);
    setMostrarProgreso(false);
  }, [activePage?.id]);

  // --- VALIDACIONES DE ESTADO (VISTAS COMPLETAS) ---
  if (!activePage) {
    return (
      <div className={styles.emptyState}>
        <p>Selecciona un tema para comenzar</p>
      </div>
    );
  }

  // Vista de Progreso/Resultado después del examen
  if (mostrarProgreso) {
    return (
      <div className={styles.fullView}>
        <ProgresoCursos 
          cursos={cursos}
          userAnswers={userAnswers}
          onContinuar={() => setMostrarProgreso(false)} 
        />
      </div>
    );
  }

  // Vista de Examen (SurveyJS)
  if (activePage.tipo === 'examen') {
    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          onFinish={(respuestas) => {
            // Pasamos las respuestas reales hacia App.jsx
            if (onFinishExamen) onFinishExamen(respuestas);
            setMostrarProgreso(true);
          }} 
        />
      </div>
    );
  }

  // --- LÓGICA DE DIAPOSITIVAS ---
  const slides = activePage?.slides || [
    { id: 'default', color: '#f0f0f0', content: 'Contenido del tema' }
  ];
  const totalSlides = slides.length;
  const esUltimaSlide = pos === totalSlides - 1;

  // Navegación entre temas
  const cursoActual = cursos.find(c => c.secciones.some(s => s.id === activePage.id));
  
  const handleNavegacion = () => {
    const indexActual = cursoActual.secciones.findIndex(s => s.id === activePage.id);
    if (indexActual !== -1 && cursoActual.secciones[indexActual + 1]) {
      onSelect(cursoActual.secciones[indexActual + 1]);
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
                style={{ background: slide.color || '#fff' }}
              >
                <h2>{slide.content}</h2>
              </div>
            ))}
          </div>
        </div>

        {totalSlides > 1 && (
          <>
            <div className={styles.controlesFijos}>
              <button className={styles.prevFixed} onClick={slideLeft}><FaArrowCircleLeft /></button>
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
              
            </div>
          </>
        )}
      </section>

      <div className={styles.actionRow}>
        {esUltimaSlide && (
          <button className={styles.btnAccionFinal} onClick={handleNavegacion}>
            {activePage.tipo === 'contenido' && 
             cursoActual.secciones[cursoActual.secciones.findIndex(s => s.id === activePage.id) + 1]?.tipo === 'examen' 
             ? "IR AL EXAMEN ➔" 
             : "SIGUIENTE LECCIÓN ➔"}
          </button>
        )}
      </div>

      <article className={styles.textContent}>
        <header className={styles.textHeader}>
          <span className={styles.badge}>{activePage.label || 'Tema'}</span>
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