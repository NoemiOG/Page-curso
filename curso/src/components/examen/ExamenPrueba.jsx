import React, { useState, useMemo, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { 
  Box, Typography, CircularProgress, Dialog, 
  DialogContent, LinearProgress, Zoom, Button 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNewOutlined';

import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

const ExamenPrueba = ({ data, cursoId, onFinish, tiempoLimite = 900, userEmail }) => {
  const claveIntentos = `intentos_${cursoId}_${userEmail}`;
  const [procesando, setProcesando] = useState(false);
  const [openConfirmarSalida, setOpenConfirmarSalida] = useState(false);
  
  const [intentosRealizados, setIntentosRealizados] = useState(() => {
    return parseInt(localStorage.getItem(claveIntentos)) || 0;
  });

  const survey = useMemo(() => {
    if (!data?.preguntas || data.preguntas.length === 0) return null;

    const json = {
      title: data.tituloTema || "Evaluación de Módulo",
      showTimerPanel: "top",
      showTimerPanelMode: "survey",
      timerType: "remaining",
      maxTimeToFinish: tiempoLimite,
      showProgressBar: "top",
      completeText: "ENVIAR EVALUACIÓN",
      widthMode: "static",
      width: "100%",
      showCompletedPage: false, 
      pages: [{
        elements: data.preguntas.map((p) => ({
          type: p.esMultiple ? "checkbox" : "radiogroup",
          name: String(p.id),
          title: p.texto,
          isRequired: true,
          choices: p.opciones?.map((opt, i) => ({ value: i, text: opt })) || []
        }))
      }]
    };

    const model = new Model(json);
    model.applyTheme({
      cssVariables: {
        "--sjs-primary-backcolor": "#E11F26",
        "--sjs-primary-forecolor": "#ffffff",
        "--sjs-corner-radius": "12px",
      }
    });
    return model;
  }, [data, tiempoLimite]);

  useEffect(() => {
    if (!survey || !data?.preguntas) return;

    const handleComplete = (sender) => {
      // 1. ACTIVAMOS PROCESANDO DE INMEDIATO
      setProcesando(true);

      // 2. Registramos el intento
      const nuevoConteo = intentosRealizados + 1;
      setIntentosRealizados(nuevoConteo);
      localStorage.setItem(claveIntentos, nuevoConteo);

      let aciertos = 0;
      data.preguntas.forEach(p => {
        const respUsuario = sender.data[p.id];
        const correcta = p.respuestaCorrecta;
        if (p.esMultiple) {
          if (Array.isArray(respUsuario) && Array.isArray(correcta)) {
            const match = respUsuario.length === correcta.length && 
                          respUsuario.every(v => correcta.map(String).includes(String(v)));
            if (match) aciertos++;
          }
        } else {
          if (respUsuario !== undefined && String(respUsuario) === String(correcta)) {
            aciertos++;
          }
        }
      });

      const porcentajeFinal = Math.round((aciertos / data.preguntas.length) * 100);
      const resultadosMapeados = {};
      Object.keys(sender.data).forEach(key => {
        resultadosMapeados[`${cursoId}_${key}`] = sender.data[key];
      });

      // 3. Esperamos a que la animación de carga termine antes de avisar al padre
      setTimeout(() => {
        if (onFinish) onFinish(resultadosMapeados, porcentajeFinal);
      }, 2500); 
    };

    survey.onComplete.add(handleComplete);
    return () => survey.onComplete.remove(handleComplete);
  }, [survey, data, cursoId, onFinish, userEmail, intentosRealizados, claveIntentos]);

  const salirSinGuardar = () => {
    if (onFinish) onFinish(null, null); 
  };

  // ================================================================
  // GESTIÓN DE RENDERIZADO (EL ORDEN IMPORTA)
  // ================================================================

  // PRIORIDAD 1: Si se está procesando, mostramos el cargador sí o sí.
  if (procesando) {
    return (
      <Dialog 
        open={true} 
        TransitionComponent={Zoom} 
        PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#1a1a1a', color: 'white', minWidth: '350px' } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={80} sx={{ color: '#E11F26', mb: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>CALIFICANDO...</Typography>
          <LinearProgress 
            sx={{ 
              mt: 3, height: 6, borderRadius: 3, bgcolor: '#333', 
              '& .MuiLinearProgress-bar': { bgcolor: '#E11F26' } 
            }} 
          />
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
            Analizando tus respuestas, un momento...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // PRIORIDAD 2: Si ya no hay intentos y NO estamos procesando resultados
  if (intentosRealizados >= 3) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#1a1a1a', borderRadius: 4, m: 4, border: '2px solid #E11F26', color: 'white' }}>
        <Typography variant="h4" sx={{ color: '#E11F26', fontWeight: 900, mb: 2 }}>LÍMITE ALCANZADO</Typography>
        <Typography>Has agotado tus 3 oportunidades para este módulo.</Typography>
        <Button 
          variant="contained" 
          onClick={salirSinGuardar}
          sx={{ mt: 3, bgcolor: '#E11F26', '&:hover': { bgcolor: '#b3191e' } }}
        >
          Volver al Curso
        </Button>
      </Box>
    );
  }

  // PRIORIDAD 3: El examen normal
  return (
    <div className={styles.examenWrapper}>
      {/* Botón Flotante de Volver */}
      <Box sx={{ position: 'absolute', top: 100, left: 20, zIndex: 10 }}>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => setOpenConfirmarSalida(true)}
          sx={{ 
            bgcolor: '#333', 
            '&:hover': { bgcolor: '#444' },
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700
          }}
        >
          Volver al curso
        </Button>
      </Box>

      {survey && <Survey model={survey} />}

      {/* DIÁLOGO DE CONFIRMACIÓN PARA SALIR */}
      <Dialog 
        open={openConfirmarSalida} 
        TransitionComponent={Zoom} 
        PaperProps={{ sx: { borderRadius: '15px', p: 2, bgcolor: '#1a1a1a', color: 'white' } }}
      >
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>¿ESTÁS SEGURO DE SALIR?</Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
            Perderás el progreso actual de esta evaluación. No se contará como un intento.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setOpenConfirmarSalida(false)} 
              sx={{ color: 'white', borderColor: '#555' }}
            >
              CONTINUAR EXAMEN
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={salirSinGuardar} 
              sx={{ bgcolor: '#E11F26' }}
            >
              SALIR
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamenPrueba;