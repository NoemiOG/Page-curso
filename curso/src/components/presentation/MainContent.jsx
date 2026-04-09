import React, { useEffect } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import Avance from '../examen/Avance'; 
import styles from './MainContent.module.sass';

const MainContent = ({ 
  activePage, 
  cursos = [], 
  onSelect, 
  onSaveAnswers, // Viene de App.jsx (guarda resultados y cambia a viewMode: 'progress')
  userAnswers,   
  onResetExamen, 
  viewMode,      
  setViewMode,    
  onGoHome       // Nueva prop para resetear a la Bienvenida
}) => {

  const cursoActual = cursos.find(c => 
    c.secciones?.some(s => s.id === activePage?.id)
  );
  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  
  const siguienteSeccion = secciones[indexActual + 1];
  const anteriorSeccion = secciones[indexActual - 1];

  // Reset del scroll al cambiar de tema
  useEffect(() => {
    const container = document.getElementById('mainScrollContainer');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage?.id]);

  if (!activePage) return <div className={styles.emptyState}>Selecciona un tema para comenzar</div>;

  // --- 1. VISTA DE RESULTADOS (AVANCE) ---
  if (viewMode === 'progress') {
    return (
      <div className={styles.fullView}>
        <Avance 
          cursos={cursos} 
          userAnswers={userAnswers} 
          // Al dar clic en "Volver a mis cursos", ejecutamos la limpieza hacia la Bienvenida
          onContinuar={onGoHome} 
          onResetExamen={onResetExamen}
          cursoIdFiltrado={cursoActual?.id} 
        />
      </div>
    );
  }

  // --- 2. VISTA DE EXAMEN ---
  if (activePage.tipo === 'examen') {
    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          cursoId={cursoActual?.id} 
          onFinish={(respuestas) => { 
            // Esto guarda los datos y cambia el viewMode a 'progress' en App.jsx
            onSaveAnswers(respuestas); 
          }} 
        />
      </div>
    );
  }

  // --- 3. VISTA DE CONTENIDO (PDF/TEMAS) ---
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
            <iframe 
              src={`${activePage.url}#toolbar=0&navpanes=0`} 
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