import React, { useEffect, useState, useMemo } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import styles from './MainContent.module.sass';
import { 
  Box, Typography, Button, Divider, LinearProgress, 
  Dialog, DialogContent, Zoom 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineTwoToneIcon from '@mui/icons-material/ErrorOutlineTwoTone';

const MainContent = ({ 
  activePage, 
  cursoActual, 
  onSelect, 
  onSaveAnswers, 
  userAnswers,
  userEmail,
  onLessonComplete,
  onExamStatusChange,
  progresoUpdate 
}) => {
  const navigate = useNavigate();
  const [haConfirmadoExamen, setHaConfirmadoExamen] = useState(false);

  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  const siguienteSeccion = secciones[indexActual + 1];
  const anteriorSeccion = secciones[indexActual - 1];

  // --- LÓGICA DE INTENTOS ---
  const sId = String(cursoActual?.id || "");
  const claveIntentos = `intentos_${sId}_${userEmail}`;
  const intentosRealizados = parseInt(localStorage.getItem(claveIntentos) || "0");

  // --- LÓGICA DE PROGRESO ---
  const progresoTeoria = useMemo(() => {
    if (!cursoActual || !userEmail) return 0;
    
    const storageKey = `completado_${cursoActual.id}_${userEmail}`;
    const completadas = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
    const leccionesTeoricas = secciones.filter(s => s.tipo !== 'examen');
    if (leccionesTeoricas.length === 0) return 0;

    const completadasCount = leccionesTeoricas.filter(s => completadas.includes(s.id)).length;
    return Math.round((completadasCount / leccionesTeoricas.length) * 100);
  }, [cursoActual, userEmail, activePage, progresoUpdate, secciones]); 

  const teoriaCompletada = progresoTeoria === 100;

  // --- EFECTOS DE NAVEGACIÓN ---
  useEffect(() => {
    const container = document.getElementById('mainScrollContainer');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    
    setHaConfirmadoExamen(false); 

    if (activePage && activePage.tipo !== 'examen' && onLessonComplete) {
      onLessonComplete(activePage.id); 
    }
  }, [activePage?.id]); 

  if (!activePage) return null;

  // --- RENDERIZADO PARA EL TIPO EXAMEN ---
  if (activePage.tipo === 'examen') {
    
    if (!teoriaCompletada) {
      return (
        <Box 
          sx={{ 
            p: 6, textAlign: 'center', mt: 8, bgcolor: 'background.paper', 
            borderRadius: '20px', border: '1px solid', borderColor: 'divider',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', mx: 'auto', maxWidth: 800
          }}
        >
          <Typography variant="h4" color="error" sx={{ fontWeight: 900, mb: 2 }}>
            MÓDULO BLOQUEADO 🔒
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Progreso actual: {progresoTeoria}%
          </Typography>
          <Typography sx={{ mb: 4, color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
            Debes completar todas las lecciones teóricas antes de realizar la evaluación final de este módulo.
          </Typography>
          <Button 
            variant="contained" size="large"
            sx={{ 
              bgcolor: '#E11F26', '&:hover': { bgcolor: '#b3191e' },
              px: 4, py: 1.5, borderRadius: '10px', fontWeight: 700
            }} 
            onClick={() => onSelect(secciones[0])}
          >
            VOLVER A LAS LECCIONES
          </Button>
        </Box>
      );
    }

    // 2. RENDERIZADO CON DIALOG 
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        
        {/* Si tiene intentos y confirmó, mostramos el visor */}
        {intentosRealizados < 3 ? (
          !haConfirmadoExamen ? (
            /* Pantalla de Inicio de Examen */
            <Box 
              sx={{ 
                p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 6, 
                bgcolor: 'background.paper', borderRadius: '20px', border: '1px solid', 
                borderColor: 'divider', color: 'text.primary', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, color: '#E11F26' }}>
                EVALUACIÓN FINAL
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                Módulo: {cursoActual?.titulo}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                Has completado toda la teoría con éxito. La prueba consiste en un compilado de preguntas de opción múltiple; algunas pueden tener más de una respuesta correcta. 
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" fullWidth onClick={() => onSelect(anteriorSeccion)}>
                  REPASAR
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ bgcolor: '#E11F26', '&:hover': { bgcolor: '#b3191e' } }} 
                  onClick={() => { setHaConfirmadoExamen(true); onExamStatusChange(true); }}
                >
                  INICIAR
                </Button>
              </Box>
            </Box>
          ) : (
            /* Examen en curso */
            <div className={styles.fullView}>
              <ExamenViewer 
                data={activePage} 
                cursoId={cursoActual?.id} 
                userEmail={userEmail} 
                onFinish={(respuestas, puntaje) => {
                  onSaveAnswers(respuestas, puntaje);
                  onExamStatusChange(false);
                }} 
              />
            </div>
          )
        ) : (
          /* Espacio vacío con desenfoque si está bloqueado por intentos */
          <Box sx={{ filter: 'blur(4px)', opacity: 0.3, pointerEvents: 'none', textAlign: 'center', mt: 10 }}>
            <Typography variant="h5">Cargando evaluación...</Typography>
          </Box>
        )}

        {/* NOTA FLOTANTE: Límite de intentos alcanzado */}
        <Dialog 
          open={intentosRealizados >= 3} 
          TransitionComponent={Zoom}
          disableEscapeKeyDown
          PaperProps={{
            sx: { borderRadius: '20px', p: 3, textAlign: 'center', minWidth: '380px', border: '2px solid #E11F26' }
          }}
        >
          <DialogContent>
            <ErrorOutlineTwoToneIcon sx={{ fontSize: 80, color: '#E11F26', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#E11F26', mb: 1 }}>
              ¡ALTO AHÍ!
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Límite de intentos alcanzado
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
              Ya realizaste tus 3 oportunidades permitidas para el curso: 
              <br />
              <strong>{cursoActual?.titulo}</strong>
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => navigate('/inicio')} 
              sx={{ 
                bgcolor: '#333', color: 'white', borderRadius: '10px', 
                fontWeight: 800, py: 1.5, '&:hover': { bgcolor: '#E11F26' }
              }}
            >
              VOLVER AL PANEL DE CURSOS
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  // --- RENDERIZADO DE LECCIONES TEÓRICAS ---
  return (
    <main id="mainScrollContainer" className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.mainHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.categoryTag}>{cursoActual?.titulo}</span>
            <h1 className={styles.topTitle}>{activePage.tituloTema}</h1>
          </div>
          
          <Box sx={{ minWidth: 200, textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#E11F26', display: 'block' }}>
              PROGRESO DEL MÓDULO: {progresoTeoria}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progresoTeoria} 
              sx={{ 
                height: 10, borderRadius: 5, mt: 0.5, bgcolor: 'divider', 
                '& .MuiLinearProgress-bar': { bgcolor: '#E11F26' } 
              }} 
            />
          </Box>
        </header>

        <section className={styles.viewerBlock}>
          <div className={styles.viewerFrame}>
            {activePage?.url ? (
              <iframe 
                src={`${activePage.url.startsWith('/') ? activePage.url : `/${activePage.url}`}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`} 
                className={styles.pdfElement} 
                title="Material de Estudio"
                key={activePage.id} 
                loading="lazy"
              />
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No hay previsualización disponible.</Typography>
              </Box>
            )}
          </div>
          
          <div className={styles.navigationRow}>
            <button 
              className={styles.btnRegresar} 
              onClick={() => onSelect(anteriorSeccion)} 
              disabled={!anteriorSeccion}
            >
              ANTERIOR
            </button>
            <button 
              className={siguienteSeccion?.tipo === 'examen' && !teoriaCompletada ? styles.btnLocked : styles.btnSiguiente} 
              onClick={() => onSelect(siguienteSeccion)}
              disabled={!siguienteSeccion}
            >
              {siguienteSeccion?.tipo === 'examen' 
                ? (teoriaCompletada ? "IR AL EXAMEN" : "EXAMEN BLOQUEADO") 
                : "SIGUIENTE"}
            </button>
          </div>
        </section>

        <article className={styles.infoSection}>
          <Divider sx={{ mb: 3 }} />
          <h2 className={styles.subTitle}>Resumen del Tema</h2>
          <p className={styles.description}>
            {activePage.textoLargo || "Revisa el material audiovisual o PDF adjunto para completar esta lección."}
          </p>
        </article>
      </div>
    </main>
  );
};

export default MainContent;