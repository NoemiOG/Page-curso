import React from 'react';
import styles from './Avance.module.sass';

const ProgresoCursos = ({ 
  titulo = "Mi Progreso", 
  porcentaje = 0, 
  pendientes = [], 
  completados = [], 
  onContinuar 
}) => {
  
  return (
    <div className={styles.progresoContainer}>
      <h1 className={styles.mainTitle}>{titulo}</h1>
      
      <div className={styles.cursoCard}>
        <div className={styles.headerCard}>
          <h3>CURSO ACTUAL</h3>
        </div>

        <div className={styles.statsLayout}>
          {/* Círculo de Progreso */}
          <div className={styles.progressWrapper}>
            <div 
              className={styles.circularProgress} 
              data-percent={porcentaje}
              style={{ '--p': porcentaje }} // Variable para usar en Sass
            >
              <span className={styles.percentText}>{porcentaje}%</span>
            </div>
          </div>

          {/* Listado de Temas */}
          <div className={styles.temasInfo}>
            <div className={styles.listaGrupo}>
              <h4>PENDIENTES</h4>
              <ul>
                {pendientes.length > 0 
                  ? pendientes.map((tema, i) => <li key={i} className={styles.itemPendiente}>{tema}</li>)
                  : <li>¡Todo al día! 🎉</li>
                }
              </ul>
            </div>

            <div className={styles.listaGrupo}>
              <h4>COMPLETADOS</h4>
              <ul>
                {completados.map((tema, i) => (
                  <li key={i} className={styles.itemCompletado}>✓ {tema}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio reservado para la Gráfica de Pastel (Pie Chart) */}
      <section className={styles.graficaSeccion}>
        <div className={styles.placeholderChart}>
          {/* Aquí integrarás tu componente de Chart.js o SVG */}
          <p>Gráfica de Avance General</p>
        </div>
      </section>
      
      <div className={styles.actions}>
        <button onClick={onContinuar} className={styles.btnContinuar}>
          CONTINUAR CON LAS PRUEBAS
        </button>
      </div>
    </div>
  );
};

export default ProgresoCursos;