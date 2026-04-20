import React, { useState, useEffect, useRef } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

const ExamenPrueba = ({ data, cursoId, onFinish, tiempoLimite = 900 }) => {
  const claveIntentos = `intentos_${cursoId}_${data?.id}`;
  
  const [intentosRealizados, setIntentosRealizados] = useState(() => {
    return parseInt(localStorage.getItem(claveIntentos)) || 0;
  });

  const surveyModel = useRef(null);

  // 1. CREACIÓN DEL MODELO (Solo si no existe)
  if (!surveyModel.current && data?.preguntas) {
    const json = {
      title: data.tituloTema || "Evaluación",
      showTimerPanel: "top",
      showTimerPanelMode: "survey",
      timerType: "remaining",
      maxTimeToFinish: tiempoLimite,
      showProgressBar: "top",
      
      // --- CAMBIO AQUÍ: Texto del botón final ---
      completeText: "ENTREGAR EXAMEN", 
      
      pages: [{
        elements: data.preguntas.map((p) => ({
          type: p.esMultiple ? "checkbox" : "radiogroup",
          name: `${p.id}`,
          title: p.texto,
          isRequired: true,
          choices: p.opciones.map((opt, i) => ({ value: i, text: opt }))
        }))
      }],
      completedHtml: "<h3>Enviando tus respuestas...</h3>"
    };
    
    surveyModel.current = new Model(json);
    
    surveyModel.current.applyTheme({
      cssVariables: {
        "--sjs-primary-backcolor": "#E11F26",
        "--sjs-general-backcolor": "rgba(255, 255, 255, 0.05)",
        "--sjs-general-forecolor": "#ffffff",
        "--sjs-article-font-main-color": "#ffffff",
      }
    });
  }

  // 2. CONEXIÓN DE EVENTOS
  useEffect(() => {
    const model = surveyModel.current;
    if (!model) return;

    const finalizar = (sender) => {
      const nuevoConteo = intentosRealizados + 1;
      setIntentosRealizados(nuevoConteo);
      localStorage.setItem(claveIntentos, nuevoConteo);

      const resultados = {};
      const idParaLlave = cursoId || "1";
      Object.keys(sender.data).forEach(key => {
        resultados[`${idParaLlave}_${key}`] = sender.data[key];
      });

      if (onFinish) onFinish(resultados);
    };

    const alAgotarTiempo = () => {
      alert("¡El tiempo se ha agotado!");
      model.completeLastPage();
    };

    if (model.onComplete) {
      model.onComplete.add(finalizar);
    }
    if (model.onTimerExpired) {
      model.onTimerExpired.add(alAgotarTiempo);
    }

    return () => {
      if (model.onComplete) model.onComplete.remove(finalizar);
      if (model.onTimerExpired) model.onTimerExpired.remove(alAgotarTiempo);
    };
  }, [cursoId, onFinish, intentosRealizados, claveIntentos]); 

  // 3. RENDER
  if (intentosRealizados >= 3) {
    return (
      <div className={styles.examenWrapper} style={{ textAlign: 'center', padding: '100px' }}>
        <h2 style={{ color: '#E11F26', fontWeight: 900 }}>INTENTOS AGOTADOS</h2>
        <p>Has alcanzado el límite de 3 oportunidades.</p>
      </div>
    );
  }

  return (
    <div className={styles.examenWrapper}>
      {surveyModel.current && <Survey model={surveyModel.current} />}
    </div>
  );
};

export default ExamenPrueba;