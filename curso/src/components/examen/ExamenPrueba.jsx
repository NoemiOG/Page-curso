import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

const ExamenPrueba = ({ data, onFinish }) => {
  
  // 1. Transformamos tu JSON de cursos al formato que entiende SurveyJS
  const transformarExamenASurvey = (seccionExamen) => {
    return {
      title: seccionExamen.tituloTema,
      description: seccionExamen.instrucciones,
      showProgressBar: "top",
      progressBarType: "questions",
      questionsOrder: "original",
      pages: [
        {
          name: "pagina_unica",
          elements: seccionExamen.preguntas.map((p) => ({
            type: "radiogroup",
            name: p.id.toString(), // El ID de la pregunta
            title: p.texto,
            isRequired: true,
            choices: p.opciones.map((opt, index) => ({
              value: index, // Guardamos el índice (0, 1, 2) para calificar después
              text: opt
            }))
          }))
        }
      ],
      completedHtml: "<h3>Enviando resultados...</h3>"
    };
  };

  // 2. Creamos el modelo de la encuesta
  const surveyJson = transformarExamenASurvey(data);
  const survey = new Model(surveyJson);

  // 3. Configuramos qué pasa al terminar
  survey.onComplete.add((sender) => {
    const respuestas = sender.data; 
    console.log("Respuestas capturadas:", respuestas);
    
    if (onFinish) {
      onFinish(respuestas);
    }
  });

  // 4. Aplicamos un tema sencillo (puedes personalizarlo más luego)
  survey.applyTheme({
    cssVariables: {
      "--sjs-general-backcolor": "rgba(255, 255, 255, 1)",
      "--sjs-primary-backcolor": "#69200d", // Ajusta al color de tu marca
    }
  });

  return (
    <div className={styles.examenWrapper}>
      <Survey model={survey} />
    </div>
  );
};

export default ExamenPrueba;