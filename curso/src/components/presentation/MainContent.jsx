import React, { useEffect } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import Avance from '../examen/Avance'; 
import styles from './MainContent.module.sass';

const MainContent = ({ 
  activePage, 
  cursos = [], 
  onSelect, 
  onSaveAnswers, 
  userAnswers,   
  onResetExamen,
  // Eliminamos viewMode y setViewMode ya que usamos React Router ahora
}) => {

  const cursoActual = cursos.find(c => 
    c.secciones?.some(s => s.id === activePage?.id)
  );
  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  
  const siguienteSeccion = secciones[indexActual + 1];
  const anteriorSeccion = secciones[indexActual - 1];

  // Reset del scroll al cambiar de tema para que el usuario siempre empiece arriba
  useEffect(() => {
    const container = document.getElementById('mainScrollContainer');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage?.id]);

  if (!activePage) return <div className={styles.emptyState}>Selecciona un tema para comenzar</div>;

  // --- 1. VISTA DE EXAMEN ---
  if (activePage.tipo === 'examen') {
    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          cursoId={cursoActual?.id} 
          onFinish={(respuestas) => { 
            onSaveAnswers(respuestas); 
          }} 
        />
      </div>
    );
  }

  // --- 2. VISTA DE CONTENIDO (PDF/TEMAS) ---
  const esExamenSiguiente = siguienteSeccion?.tipo === 'examen';

  return (
    <main id="mainScrollContainer" className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.mainHeader}>
          <span className={styles.categoryTag}>{cursoActual?.titulo}</span>
          <h1 className={styles.topTitle}>{activePage.tituloTema}</h1>
        </header>

        <section className={styles.viewerBlock}>
          <div className={styles.viewerFrame}>
            {/* Agregamos #view=FitH para ajustar el ancho automáticamente */}
            <iframe 
              src={`${activePage.url}#toolbar=0&navpanes=0&view=FitH`} 
              className={styles.pdfElement} 
              title="Visor de Contenido"
            />
          </div>
          
          <div className={styles.navigationRow}>
            <button 
              className={styles.btnRegresar}
              onClick={() => onSelect(anteriorSeccion)}
              disabled={!anteriorSeccion}
            >
              REGRESAR
            </button>

            <button 
              className={esExamenSiguiente ? styles.btnExamen : styles.btnSiguiente} 
              onClick={() => onSelect(siguienteSeccion)}
              disabled={!siguienteSeccion}
            >
              {esExamenSiguiente ? "REALIZAR EXAMEN" : "SIGUIENTE TEMA"}
            </button>
          </div>
        </section>

        <article className={styles.infoSection}>
          <div className={styles.divider} />
          <h2 className={styles.subTitle}>Resumen del Tema</h2>
          <div className={styles.description}>
            <p>{activePage.textoLargo}</p>
          </div>
        </article>

      </div>
    </main>
  );
};

export default MainContent;