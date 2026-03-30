import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

// AGREGAMOS cursoId a los props (viene desde MainContent)
const ExamenPrueba = ({ data, cursoId, onFinish }) => {
  
  const transformarExamenASurvey = (seccionExamen) => {
    return {
      title: seccionExamen.tituloTema || "Evaluación",
      description: seccionExamen.instrucciones || "Selecciona las respuestas correctas.",
      showProgressBar: "top",
      progressBarType: "questions",
      completeText: "Finalizar y Enviar",
      pages: [
        {
          name: "pagina_unica",
          elements: seccionExamen.preguntas.map((p) => ({
            type: p.esMultiple ? "checkbox" : "radiogroup", 
            name: `${p.id}`, 
            title: p.texto,
            isRequired: true,
            choices: p.opciones.map((opt, index) => ({
              value: index, 
              text: opt    
            }))
          }))
        }
      ],
      completedHtml: "<h3>Procesando tus resultados...</h3>"
    };
  };

  const surveyJson = transformarExamenASurvey(data);
  const survey = new Model(surveyJson);

  // --- LÓGICA DE ENVÍO CORREGIDA ---
  survey.onComplete.add((sender) => {
    const dataRaw = sender.data; 
    const respuestasFormateadas = {};

    // IMPORTANTE: Usamos el cursoId que viene por props
    const idParaLlave = cursoId || "1"; // Fallback por si acaso

    Object.keys(dataRaw).forEach(preguntaId => {
      // Ahora sí: "1_q1", "2_q1", etc.
      const llaveCompuesta = `${idParaLlave}_${preguntaId}`;
      respuestasFormateadas[llaveCompuesta] = dataRaw[preguntaId];
    });

    console.log("Datos enviados al App:", respuestasFormateadas);

    if (onFinish) {
      onFinish(respuestasFormateadas);
    }
  });

  survey.applyTheme({
    cssVariables: {
      "--sjs-general-backcolor": "rgba(255, 255, 255, 0.05)",
      "--sjs-general-forecolor": "#222020",
      "--sjs-primary-backcolor": "#E11F26",
      "--sjs-primary-backcolor-light": "rgba(225, 31, 38, 0.1)",
      "--sjs-primary-backcolor-hover": "#ff3131",
      "--sjs-article-font-main-color": "#241111",
      "--sjs-question-title-color": "#554242"
    }
  });

  return (
    <div className={styles.examenWrapper}>
      <Survey model={survey} />
    </div>
  );
};

export default ExamenPrueba;