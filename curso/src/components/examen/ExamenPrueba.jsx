import React, { useState, useMemo, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { Box, Typography, CircularProgress } from '@mui/material';

import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

const ExamenPrueba = ({ data, cursoId, onFinish, tiempoLimite = 900, userEmail }) => {
  const claveIntentos = `intentos_${cursoId}_${userEmail}`;
  
  const [intentosRealizados, setIntentosRealizados] = useState(() => {
    return parseInt(localStorage.getItem(claveIntentos)) || 0;
  });

  // 1. CREACIÓN DEL MODELO (Con protecciones contra undefined)
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
      pages: [{
        elements: data.preguntas.map((p) => ({
          type: p.esMultiple ? "checkbox" : "radiogroup",
          name: String(p.id),
          title: p.texto,
          isRequired: true,
          choices: p.opciones?.map((opt, i) => ({ value: i, text: opt })) || []
        }))
      }],
      completedHtml: "<h3>Estamos procesando tus resultados...</h3>"
    };

    try {
      const model = new Model(json);
      model.applyTheme({
        cssVariables: {
          "--sjs-primary-backcolor": "#E11F26",
          "--sjs-primary-backcolor-light": "rgba(225, 31, 38, 0.1)",
          "--sjs-primary-forecolor": "#ffffff",
          "--sjs-corner-radius": "12px",
        }
      });
      return model;
    } catch (err) {
      console.error("Error al inicializar SurveyJS:", err);
      return null;
    }
  }, [data, tiempoLimite]);

  // 2. LÓGICA DE ENVÍO Y COMUNICACIÓN
  useEffect(() => {
    if (!survey || !data?.preguntas) return;

    const handleComplete = (sender) => {
      // Incrementar intentos
      const nuevoConteo = intentosRealizados + 1;
      setIntentosRealizados(nuevoConteo);
      localStorage.setItem(claveIntentos, nuevoConteo);

      let aciertos = 0;
      const totalPreguntas = data.preguntas.length;

      // Calcular resultados
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

      const porcentajeFinal = Math.round((aciertos / totalPreguntas) * 100);

      const resultadosMapeados = {};
      Object.keys(sender.data).forEach(key => {
        resultadosMapeados[`${cursoId}_${key}`] = sender.data[key];
      });

      // Notificar a App.jsx
      if (onFinish) {
        setTimeout(() => onFinish(resultadosMapeados, porcentajeFinal), 1000);
      }
    };

    survey.onComplete.add(handleComplete);
    
    return () => {
      if (survey) survey.onComplete.remove(handleComplete);
    };
  }, [survey, data, cursoId, onFinish, userEmail, intentosRealizados, claveIntentos]);

  // 3. RENDERIZADO
  if (intentosRealizados >= 3) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, m: 4, border: '2px solid #E11F26' }}>
        <Typography variant="h4" sx={{ color: '#E11F26', fontWeight: 900, mb: 2 }}>
          LÍMITE DE INTENTOS ALCANZADO
        </Typography>
        <Typography variant="body1">
          Has agotado tus 3 oportunidades para este examen.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
          Por favor, contacta con el administrador para solicitar una nueva oportunidad.
        </Typography>
      </Box>
    );
  }

  return (
    <div className={styles.examenWrapper}>
      {survey ? (
        <Survey model={survey} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 10 }}>
          <CircularProgress sx={{ color: '#E11F26', mb: 2 }} />
          <Typography>Preparando tu evaluación...</Typography>
        </Box>
      )}
    </div>
  );
};

export default ExamenPrueba;