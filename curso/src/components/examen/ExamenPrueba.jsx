import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import "survey-core/survey-core.css";
import styles from './ExamenPrueba.module.sass';

/**
 * Componente funcional encargado de renderizar evaluaciones interactivas.
 * Utiliza la librería SurveyJS para transformar esquemas de datos en formularios dinámicos.
 */
const ExamenPrueba = ({ data, cursoId, onFinish }) => {
  
  /**
   * Transforma la estructura de datos interna del curso al formato JSON requerido por SurveyJS.
   * Configura tipos de preguntas, títulos, barras de progreso y opciones de respuesta.
   */
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
            // Determina el tipo de entrada: 'checkbox' para selección múltiple y 'radiogroup' para única.
            type: p.esMultiple ? "checkbox" : "radiogroup", 
            name: `${p.id}`, 
            title: p.texto,
            isRequired: true, // Establece la obligatoriedad de la respuesta.
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

  // Instancia el modelo de la encuesta a partir del JSON generado por la función de transformación.
  const surveyJson = transformarExamenASurvey(data);
  const survey = new Model(surveyJson);

  /**
   * Manejador de eventos para la finalización de la encuesta.
   * Procesa las respuestas crudas para generar claves compuestas que faciliten el seguimiento por curso.
   */
  survey.onComplete.add((sender) => {
    const dataRaw = sender.data; 
    const respuestasFormateadas = {};

    // Define el prefijo del curso para la construcción de llaves únicas.
    const idParaLlave = cursoId || "1";

    /**
     * Itera sobre cada respuesta para crear una estructura de datos compatible con el estado global.
     * El formato resultante utiliza la nomenclatura: "{cursoId}_{preguntaId}".
     */
    Object.keys(dataRaw).forEach(preguntaId => {
      const llaveCompuesta = `${idParaLlave}_${preguntaId}`;
      respuestasFormateadas[llaveCompuesta] = dataRaw[preguntaId];
    });

    // Notifica al componente superior mediante la ejecución del callback proporcionado.
    if (onFinish) {
      onFinish(respuestasFormateadas);
    }
  });

  /**
   * Aplica la personalización visual del componente.
   * Ajusta variables de CSS para alinear la estética de la encuesta con la identidad visual de la aplicación.
   */
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
      {/* Renderiza el componente de interfaz de usuario de SurveyJS con el modelo configurado */}
      <Survey model={survey} />
    </div>
  );
};

export default ExamenPrueba;