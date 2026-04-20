import React, { useEffect, useState } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import styles from './MainContent.module.sass';
import { Box, Typography, Button, Divider } from '@mui/material';

const MainContent = ({ 
  activePage, 
  cursos = [], 
  onSelect, 
  onSaveAnswers, 
  userAnswers,
  onLessonComplete // <--- NUEVA PROP: Para avisar que se completó el tema
}) => {
  const [haConfirmadoExamen, setHaConfirmadoExamen] = useState(false);

  const cursoActual = cursos.find(c => 
    c.secciones?.some(s => s.id === activePage?.id)
  );
  
  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  
  const siguienteSeccion = secciones[indexActual + 1];
  const anteriorSeccion = secciones[indexActual - 1];

  // --- EFECTO CRÍTICO PARA EL PROGRESO ---
  useEffect(() => {
    const container = document.getElementById('mainScrollContainer');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    setHaConfirmadoExamen(false); 

    // Lógica de progreso: Si el tema es una lección (no examen), lo marcamos como visto
    if (activePage && activePage.tipo !== 'examen' && onLessonComplete) {
      onLessonComplete(activePage.id); 
    }
  }, [activePage?.id, onLessonComplete]); // Se dispara cada vez que cambias de tema

  if (!activePage) {
    return <div className={styles.emptyState}>Selecciona un tema para comenzar</div>;
  }

  // --- 1. VISTA DE EXAMEN ---
  if (activePage.tipo === 'examen') {
    if (!haConfirmadoExamen) {
      return (
        <Box 
          sx={{ 
            p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 10,
            bgcolor: 'background.paper', borderRadius: '16px', border: '1px solid',
            borderColor: 'divider', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', color: 'text.primary'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, color: 'primary.main' }}>
            EXAMEN DE CERTIFICACIÓN
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.8 }}>
            Módulo: {cursoActual?.titulo || "Cargando..."}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'left', mb: 4, px: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Tiempo:</strong> 15 minutos.</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Intentos:</strong> Máximo 3 intentos.</Typography>
            <Typography variant="body1" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
              • <strong>Nota:</strong> Al comenzar, no podrás navegar a otros temas.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => onSelect(anteriorSeccion)}>REGRESAR</Button>
            <Button variant="contained" color="primary" fullWidth onClick={() => setHaConfirmadoExamen(true)}>COMENZAR</Button>
          </Box>
        </Box>
      );
    }

    return (
      <div className={styles.fullView}>
        <ExamenViewer 
          data={activePage} 
          cursoId={cursoActual?.id} 
          tiempoLimite={900} 
          onFinish={(respuestas) => onSaveAnswers(respuestas)} 
        />
      </div>
    );
  }

  // --- 2. VISTA DE CONTENIDO ---
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
              src={`${activePage.url}#toolbar=0&navpanes=0&view=FitH`} 
              className={styles.pdfElement} 
              title="Visor"
              key={activePage.id} 
            />
          </div>
          
          <div className={styles.navigationRow}>
            <button className={styles.btnRegresar} onClick={() => onSelect(anteriorSeccion)} disabled={!anteriorSeccion}>
              ANTERIOR
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
            <p>{activePage.textoLargo || "Cargando descripción..."}</p>
          </div>
        </article>
      </div>
    </main>
  );
};

export default MainContent;