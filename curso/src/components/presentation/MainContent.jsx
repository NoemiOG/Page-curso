import React, { useState, useEffect } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import Avance from '../examen/Avance'; 
import styles from './MainContent.module.sass';
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa"; // Importamos ambas flechas

const MainContent = ({ activePage, cursos = [], onSelect, onFinishExamen, userAnswers }) => {
  const [mostrarProgreso, setMostrarProgreso] = useState(false);
  const [pos, setPos] = useState(0);

  // Buscamos el curso actual para saber qué sigue
  const cursoActual = cursos.find(c => 
    c.secciones.some(s => s.id === activePage?.id)
  );

  useEffect(() => {
    setPos(0);
    setMostrarProgreso(false);
  }, [activePage?.id]);

  if (!activePage) return <div className={styles.container}>Selecciona un tema</div>;

  // --- VISTA DE RESULTADOS ---
  if (mostrarProgreso) {
    return (
      <div className={styles.fullView}>
        <Avance 
          cursos={cursos}
          userAnswers={userAnswers}
          onContinuar={() => setMostrarProgreso(false)} 
        />
      </div>
    );
  }

  // --- VISTA DE EXAMEN ---
  if (activePage.tipo === 'examen') {
    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          cursoId={cursoActual?.id} 
          onFinish={(respuestas) => {
            onFinishExamen(respuestas);
            setMostrarProgreso(true);
          }} 
        />
      </div>
    );
  }

  // --- LÓGICA DE NAVEGACIÓN ---
  const slides = activePage?.slides || [];
  const tieneSlides = slides.length > 0;
  const esUltimaSlide = !tieneSlides || pos === slides.length - 1;

  const slideRight = () => setPos((prev) => (prev + 1) % slides.length);
  const slideLeft = () => setPos((prev) => (prev - 1 + slides.length) % slides.length);

  const handleSiguienteLeccion = () => {
    if (!cursoActual) return;
    const secciones = cursoActual.secciones;
    const indexActual = secciones.findIndex(s => s.id === activePage.id);
    const siguienteSeccion = secciones[indexActual + 1];
    if (siguienteSeccion) onSelect(siguienteSeccion);
  };

  return (
    <main className={styles.container}>
      {/* SECCIÓN VISUAL (Siempre presente para mantener el espacio) */}
      <section className={styles.screenWrapper}>
        <div className={styles.viewerFrame}>
          {tieneSlides ? (
            <div
              className={styles.slider}
              style={{ transform: `translateX(-${pos * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className={styles.slide} style={{ background: slide.color || '#2c2c2c' }}>
                  <h2>{slide.content}</h2>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.slidePlaceholder}>
              <h2>{activePage.tituloTema}</h2>
              <p>Visualización de contenido</p>
            </div>
          )}
        </div>

        {/* BOTONES DE LAS DIAPOSITIVAS (Solo si hay más de una) */}
        {slides.length > 1 && (
          <div className={styles.controlesFijos}>
            <button className={styles.prevFixed} onClick={slideLeft}><FaArrowCircleLeft /></button>
            <button className={styles.nextFixed} onClick={slideRight}><FaArrowCircleRight /></button>
          </div>
        )}
      </section>

      {/* BOTÓN PARA CAMBIAR DE TEMA (Aparece cuando terminas de leer) */}
      <div className={styles.actionRow}>
        {esUltimaSlide && (
          <button className={styles.btnAccionFinal} onClick={handleSiguienteLeccion}>
            {cursoActual?.secciones[cursoActual.secciones.findIndex(s => s.id === activePage.id) + 1]?.tipo === 'examen' 
             ? "IR AL EXAMEN ➔" 
             : "SIGUIENTE LECCIÓN ➔"}
          </button>
        )}
      </div>

      {/* TEXTO DEBAJO (Tu Lorem Ipsum) */}
      <article className={styles.textContent}>
        <header className={styles.textHeader}>
          <span className={styles.badge}>{activePage.label || 'LECCIÓN'}</span>
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