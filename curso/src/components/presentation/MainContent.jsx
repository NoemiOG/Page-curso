import React, { useEffect, useState, useMemo } from 'react';
import ExamenViewer from '../examen/ExamenPrueba'; 
import styles from './MainContent.module.sass';
import { 
  Box, Typography, Button, Divider, LinearProgress, 
  Dialog, DialogContent, Zoom, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineTwoToneIcon from '@mui/icons-material/ErrorOutlineTwoTone';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';

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
  const [estaProcesando, setEstaProcesando] = useState(false); // Estado para el loader

  const secciones = cursoActual?.secciones || [];
  const indexActual = secciones.findIndex(s => s.id === activePage?.id);
  const anteriorSeccion = secciones[indexActual - 1];
  const siguienteSeccion = secciones[indexActual + 1];

  const sId = String(cursoActual?.id || "");
  const intentosRealizados = parseInt(localStorage.getItem(`intentos_${sId}_${userEmail}`) || "0");
  const calificacionGuardada = parseFloat(localStorage.getItem(`calificacion_${sId}_${userEmail}`) || "0");
  const yaAprobo = calificacionGuardada >= 80;

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
    setEstaProcesando(false);
    onExamStatusChange(false);

    if (activePage && activePage.tipo !== 'examen' && onLessonComplete) {
      onLessonComplete(activePage.id);
    }
  }, [activePage?.id]);

  if (!activePage) return null;

  // MANEJADOR DE FINALIZACIÓN CON LOADER
  const finalizarExamen = (resp, punt) => {
    if (resp) {
      setEstaProcesando(true); // Activamos el mensaje de "Cargando"
      
      // Simulamos un breve tiempo de procesamiento para que el usuario vea el feedback
      setTimeout(() => {
        setHaConfirmadoExamen(false);
        onExamStatusChange(false);
        onSaveAnswers(resp, punt);
        setEstaProcesando(false); // Quitamos el loader
      }, 2000);
    } else {
      // Si el usuario simplemente salió sin terminar
      setHaConfirmadoExamen(false);
      onExamStatusChange(false);
    }
  };

  if (haConfirmadoExamen && activePage.tipo === 'examen' && !yaAprobo) {
    return (
      <main className={styles.mainContainer}>
        <ExamenViewer 
          data={activePage} 
          cursoId={cursoActual?.id} 
          userEmail={userEmail} 
          onFinish={finalizarExamen} 
        />
      </main>
    );
  }

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
              PROGRESO: {progresoTeoria}%
            </Typography>
            <LinearProgress variant="determinate" value={progresoTeoria} sx={{ height: 10, borderRadius: 5, mt: 0.5, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#E11F26' } }} />
          </Box>
        </header>

        <section className={styles.viewerBlock}>
          <div className={styles.viewerFrame}>
            {activePage?.url ? (
              <iframe src={`${activePage.url.startsWith('/') ? activePage.url : `/${activePage.url}`}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`} className={styles.pdfElement} title="Material" key={activePage.id} />
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <Typography variant="h6" sx={{ color: '#E11F26', fontWeight: 700 }}>
                  {yaAprobo ? "EVALUACIÓN FINALIZADA" : "SECCIÓN DE EVALUACIÓN"}
                </Typography>
              </Box>
            )}
          </div>
          
          <div className={styles.navigationRow}>
            <button className={styles.btnRegresar} onClick={() => onSelect(anteriorSeccion)} disabled={!anteriorSeccion}>ANTERIOR</button>
            
            {siguienteSeccion && !(siguienteSeccion.tipo === 'examen' && yaAprobo) && (
              <button 
                className={(siguienteSeccion.tipo === 'examen' && !teoriaCompletada) ? styles.btnLocked : styles.btnSiguiente} 
                onClick={() => onSelect(siguienteSeccion)}
                disabled={siguienteSeccion.tipo === 'examen' && !teoriaCompletada}
              >
                {siguienteSeccion.tipo === 'examen' ? "IR AL EXAMEN" : "SIGUIENTE"}
              </button>
            )}
          </div>
        </section>

        {/* --- MODALES --- */}

        <Dialog open={estaProcesando} TransitionComponent={Zoom} PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#1a1a1a', color: 'white', minWidth: '300px' } }}>
          <DialogContent sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress size={60} sx={{ color: '#E11F26', mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>CALIFICANDO...</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>Guardando tus resultados, espera un momento.</Typography>
          </DialogContent>
        </Dialog>

        {/* MODAL DE YA APROBÓ */}
        <Dialog open={activePage.tipo === 'examen' && yaAprobo && !estaProcesando} TransitionComponent={Zoom}>
          <DialogContent sx={{ textAlign: 'center', p: 4, bgcolor: '#1a1a1a', color: 'white' }}>
            <CheckCircleTwoToneIcon sx={{ fontSize: 70, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>MÓDULO ACREDITADO</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>Calificación: {calificacionGuardada}%</Typography>
            <Button variant="contained" fullWidth onClick={() => navigate('/inicio')} sx={{ bgcolor: '#4caf50' }}>VOLVER AL PANEL</Button>
          </DialogContent>
        </Dialog>

        {/* MODAL DE INICIO DE EXAMEN */}
        <Dialog open={activePage.tipo === 'examen' && !haConfirmadoExamen && teoriaCompletada && !yaAprobo && intentosRealizados < 3 && !estaProcesando} TransitionComponent={Zoom}>
          <DialogContent sx={{ textAlign: 'center', p: 4, bgcolor: '#333', color: 'white' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#E11F26', mb: 2 }}>EVALUACIÓN FINAL</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • Necesitas 80% para acreditar.<br/>
              • Intento {intentosRealizados + 1} de 3 permitidos.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" fullWidth onClick={() => onSelect(anteriorSeccion)} sx={{ color: 'white', borderColor: '#777' }}>REPASAR</Button>
              <Button variant="contained" fullWidth onClick={() => { setHaConfirmadoExamen(true); onExamStatusChange(true); }} sx={{ bgcolor: '#E11F26' }}>COMENZAR</Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* MODAL INTENTOS AGOTADOS */}
        <Dialog open={activePage.tipo === 'examen' && intentosRealizados >= 3 && !yaAprobo && !estaProcesando} TransitionComponent={Zoom}>
          <DialogContent sx={{ textAlign: 'center', p: 4, bgcolor: '#1a1a1a', color: 'white' }}>
            <ErrorOutlineTwoToneIcon sx={{ fontSize: 70, color: '#E11F26', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>INTENTOS AGOTADOS</Typography>
            <Button variant="contained" fullWidth onClick={() => navigate('/inicio')} sx={{ bgcolor: '#E11F26', mt: 2 }}>SALIR</Button>
          </DialogContent>
        </Dialog>

        {/* MODAL TEORÍA INCOMPLETA */}
        <Dialog open={activePage.tipo === 'examen' && !teoriaCompletada} TransitionComponent={Zoom}>
          <DialogContent sx={{ textAlign: 'center', p: 4, bgcolor: '#1a1a1a', color: 'white' }}>
             <LockIcon sx={{ fontSize: 60, color: '#E11F26', mb: 2 }} />
             <Typography variant="h6">Termina primero la teoría.</Typography>
             <Button variant="contained" sx={{ mt: 3, bgcolor: '#E11F26' }} onClick={() => onSelect(secciones[0])}>ENTENDIDO</Button>
          </DialogContent>
        </Dialog>

        {activePage.tipo !== 'examen' && (
          <article className={styles.infoSection}>
            <Divider sx={{ mb: 3 }} />
            <h2 className={styles.subTitle}>Resumen del Tema</h2>
            <p className={styles.description}>{activePage.textoLargo || "Revisa el material arriba."}</p>
          </article>
        )}
      </div>
    </main>
  );
};

export default MainContent;