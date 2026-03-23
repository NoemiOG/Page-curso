import React, { useState } from 'react';
import styles from './ExamenPrueba.module.sass';

const ExamenPrueba = ({ data, onFinish }) => {
  const [respuestas, setRespuestas] = useState({});

  // Verificación de seguridad por si data viene vacío al inicio
  if (!data || !data.preguntas) return <p>Cargando examen...</p>;

  const manejarCambio = (preguntaId, opcionSeleccionada) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcionSeleccionada
    }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    
    // Validar si contestó todo (Opcional pero recomendado)
    const totalPreguntas = data.preguntas.length;
    const respondidas = Object.keys(respuestas).length;

    if (respondidas < totalPreguntas) {
      if (!window.confirm('No has respondido todas las preguntas. ¿Deseas enviar de todos modos?')) {
        return;
      }
    }

    console.log('Respuestas finales:', respuestas);
    
    // Ejecutar callback de finalización si existe
    if (onFinish) onFinish(respuestas);
  };

  return (
    <div className={styles.examenContainer}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>{data.tituloTema}</h1>
        <p className={styles.instrucciones}>{data.instrucciones}</p>
      </header>

      <form onSubmit={manejarEnvio} className={styles.form}>
        {data.preguntas.map((pregunta, index) => (
          <fieldset key={pregunta.id} className={styles.preguntaGroup}>
            <legend className={styles.preguntaTexto}>
              <strong>{index + 1}.</strong> {pregunta.texto}
            </legend>
            
            <div className={styles.opcionesList}>
              {pregunta.opciones.map((opcion, i) => {
                const isSelected = respuestas[pregunta.id] === opcion;
                return (
                  <label 
                    key={`${pregunta.id}-${i}`} 
                    className={`${styles.opcionLabel} ${isSelected ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name={pregunta.id}
                      value={opcion}
                      checked={isSelected}
                      onChange={() => manejarCambio(pregunta.id, opcion)}
                      className={styles.radioInput}
                      required // Esto obliga a responder al menos una antes de enviar
                    />
                    <span className={styles.opcionTexto}>{opcion}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        
        <div className={styles.footer}>
          <button type="submit" className={styles.btnEnviar}>
            FINALIZAR EXAMEN
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamenPrueba;