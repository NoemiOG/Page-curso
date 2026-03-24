const transformarExamenASurvey = (seccionExamen) => {
  return {
    title: seccionExamen.tituloTema,
    description: seccionExamen.instrucciones,
    pages: [
      {
        name: "pagina1",
        elements: seccionExamen.preguntas.map((p) => ({
          type: "radiogroup", // opción múltiple
          name: p.id,
          title: p.texto,
          choices: p.opciones.map((opt, index) => ({
            value: index, // comparar con  "respuesta"
            text: opt
          })),
          correctAnswer: p.respuesta // Para que SurveyJS sepa la respuesta
        }))
      }
    ]
  };
};


function ProgressPage({ userAnswers, cursos }) {
  
  const calcularResultado = (curso) => {
    // 1. Buscamos la sección de tipo examen en el curso
    const examen = curso.secciones.find(s => s.tipo === 'examen');
    if (!examen) return null;

    let aciertos = 0;
    const totalPreguntas = examen.preguntas.length;

    // 2. Comparamos ID por ID
    examen.preguntas.forEach(pregunta => {
      const respuestaUsuario = userAnswers[pregunta.id];
      const respuestaCorrecta = pregunta.respuesta !== undefined ? pregunta.respuesta : pregunta.respuestaCorrecta;

      if (respuestaUsuario === respuestaCorrecta) {
        aciertos++;
      }
    });

    const porcentaje = (aciertos / totalPreguntas) * 100;
    
    return {
      aciertos,
      total: totalPreguntas,
      aprobado: porcentaje >= 70, // Por ejemplo, pasa con 70%
      porcentaje
    };
  };

  return (
    <div className={styles.progressContainer}>
      <h2>Tu Progreso Académico</h2>
      {cursos.map(curso => {
        const resultado = calcularResultado(curso);
        return (
          <div key={curso.id} className={styles.cursoCard}>
            <h3>{curso.titulo}</h3>
            {resultado ? (
              <p>
                Resultado: **{resultado.aciertos} / {resultado.total}** ({resultado.porcentaje}%) - 
                <span className={resultado.aprobado ? styles.pass : styles.fail}>
                  {resultado.aprobado ? " ¡Aprobado!" : " Inténtalo de nuevo"}
                </span>
              </p>
            ) : (
              <p>Examen no realizado aún.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

survey.onComplete.add((sender) => {
  const respuestas = sender.data; // Esto devuelve algo como { "q1": 1, "q2": 2 }
  onFinishExamen(respuestas); 
});