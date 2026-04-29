import React, { useEffect, useState, useMemo } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import styles from './MainContent.module.sass';
import { 
  Box, Typography, Button, Divider, LinearProgress, 
  Dialog, DialogContent, Zoom 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineTwoToneIcon from '@mui/icons-material/ErrorOutlineTwoTone';
import LockIcon from '@mui/icons-material/Lock';

const MainContent = ({ 
  activePage, 
  cursoActual, 
  onSelect, 
  onSaveAnswers, 
  userEmail,
  onLessonComplete,
  onExamStatusChange,
  progresoUpdate 
}) => {
  const navigate = useNavigate();
  const [haConfirmadoExamen, setHaConfirmadoExamen] = useState(false);

  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  const anteriorSeccion = secciones[indexActual - 1];
  const siguienteSeccion = secciones[indexActual + 1];

  // --- LÓGICA DE DATOS ---
  const sId = String(cursoActual?.id || "");
  // Obtenemos los intentos del localStorage
  const intentosRealizados = parseInt(localStorage.getItem(`intentos_${sId}_${userEmail}`) || "0");

  const progresoTeoria = useMemo(() => {
    if (!cursoActual || !userEmail) return 0;
    const leidos = JSON.parse(localStorage.getItem(`completado_${cursoActual.id}_${userEmail}`) || "[]");
    const teoria = secciones.filter(s => s.tipo !== 'examen');
    if (teoria.length === 0) return 0;
    return Math.round((teoria.filter(s => leidos.includes(s.id)).length / teoria.length) * 100);
  }, [cursoActual, userEmail, activePage, progresoUpdate, secciones]);

  const teoriaCompletada = progresoTeoria === 100;

  useEffect(() => {
    setHaConfirmadoExamen(false);
    if (activePage && activePage.tipo !== 'examen' && onLessonComplete) {
      onLessonComplete(activePage.id);
    }
  }, [activePage?.id]);

  if (!activePage) return null;

  // ==========================================================
  // BLOQUEO CRÍTICO: SI YA AGOTÓ INTENTOS Y ES TIPO EXAMEN
  // ==========================================================
  if (activePage.tipo === 'examen' && intentosRealizados >= 3) {
    return (
      <main className={styles.mainContainer}>
        <Box sx={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
           {/* Fondo vacío para que resalte el diálogo */}
        </Box>

        <Dialog 
          open={true} 
          TransitionComponent={Zoom} 
          disableEscapeKeyDown
          PaperProps={{ sx: { borderRadius: '20px', p: 3, textAlign: 'center', border: '2px solid #E11F26', bgcolor: '#1a1a1a', color: 'white' } }}
        >
          <DialogContent>
            <ErrorOutlineTwoToneIcon sx={{ fontSize: 80, color: '#E11F26', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>INTENTOS AGOTADOS</Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
              Ya has realizado tus 3 intentos permitidos para este módulo.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => { onExamStatusChange(false); navigate('/inicio'); }} 
              sx={{ bgcolor: '#E11F26', fontWeight: 800 }}
            >
              SALIR AL PANEL
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  // ==========================================================
  // VISTA A: EL EXAMEN YA INICIÓ (Solo tras confirmar)
  // ==========================================================
  if (haConfirmadoExamen && activePage.tipo === 'examen') {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.fullView} style={{ height: '100%', width: '100%' }}>
          <ExamenViewer 
            data={activePage} 
            cursoId={cursoActual?.id} 
            userEmail={userEmail} 
            onFinish={(respuestas, puntaje) => {
              onSaveAnswers(respuestas, puntaje);
              onExamStatusChange(false);
              setHaConfirmadoExamen(false);
            }} 
          />
        </div>
      </main>
    );
  }

  // ==========================================================
  // VISTA B: DISEÑO NORMAL (Lecciones o Diálogo de Inicio)
  // ==========================================================
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
            <LinearProgress variant="determinate" value={progresoTeoria} sx={{ height: 10, borderRadius: 5, mt: 0.5, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#E11F26' } }} />
          </Box>
        </header>

        <section className={styles.viewerBlock}>
          <div className={styles.viewerFrame}>
            {activePage?.url ? (
              <iframe 
                src={`${activePage.url.startsWith('/') ? activePage.url : `/${activePage.url}`}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`} 
                className={styles.pdfElement} 
                title="Material"
                key={activePage.id} 
              />
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <Typography>No hay material disponible para esta sección.</Typography>
              </Box>
            )}
          </div>
          
          <div className={styles.navigationRow}>
            <button className={styles.btnRegresar} onClick={() => onSelect(anteriorSeccion)} disabled={!anteriorSeccion}>ANTERIOR</button>
            <button 
              className={siguienteSeccion?.tipo === 'examen' && !teoriaCompletada ? styles.btnLocked : styles.btnSiguiente} 
              onClick={() => onSelect(siguienteSeccion)}
              disabled={!siguienteSeccion}
            >
              {siguienteSeccion?.tipo === 'examen' ? (teoriaCompletada ? "IR AL EXAMEN" : "EXAMEN BLOQUEADO") : "SIGUIENTE"}
            </button>
          </div>
        </section>

        {activePage.tipo !== 'examen' && (
          <article className={styles.infoSection}>
            <Divider sx={{ mb: 3 }} />
            <h2 className={styles.subTitle}>Resumen del Tema</h2>
            <p className={styles.description}>{activePage.textoLargo || "Revisa el material adjunto."}</p>
          </article>
        )}

        {/* --- MODAL DE INICIO (Solo si tiene intentos) --- */}
        <Dialog 
          open={activePage.tipo === 'examen' && !haConfirmadoExamen && teoriaCompletada && intentosRealizados < 3} 
          TransitionComponent={Zoom}
          PaperProps={{ sx: { borderRadius: '20px', p: 2, textAlign: 'center', maxWidth: '450px', bgcolor: '#333', color: 'white' } }}
        >
          <DialogContent>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#E11F26', mb: 2 }}>EVALUACIÓN FINAL</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Necesitas un <strong>80%</strong> para acreditar. ¡Éxito!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" fullWidth onClick={() => onSelect(anteriorSeccion)} sx={{ bgcolor: '#555' }}>REPASAR</Button>
              <Button variant="contained" fullWidth onClick={() => { setHaConfirmadoExamen(true); onExamStatusChange(true); }} sx={{ bgcolor: '#E11F26' }}>INICIAR</Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* MODAL DE BLOQUEO POR TEORÍA */}
        <Dialog open={activePage.tipo === 'examen' && !teoriaCompletada} TransitionComponent={Zoom}>
          <DialogContent sx={{ textAlign: 'center', p: 4, bgcolor: '#1a1a1a', color: 'white' }}>
             <LockIcon sx={{ fontSize: 60, color: '#E11F26', mb: 2 }} />
             <Typography variant="h6">Debes completar toda la teoría antes de evaluar.</Typography>
             <Button variant="contained" sx={{ mt: 3, bgcolor: '#E11F26' }} onClick={() => onSelect(secciones[0])}>VOLVER A LECCIONES</Button>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default MainContent;