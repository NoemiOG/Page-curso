import React from 'react';
import styles from './Bienvenido.module.sass';

/**
 * Componente funcional que renderiza la interfaz de bienvenida.
 * Presenta al usuario una galería de cursos disponibles para su selección.
 */
const Bienvenido = ({ cursos = [], onSelectCurso }) => {
  
  /**
   * Validación de integridad de datos.
   * Si la colección de cursos se encuentra vacía o es inexistente, 
   * el componente retorna un mensaje informativo de estado vacío.
   */
  if (!cursos || cursos.length === 0) {
    return (
      <div className={styles.welcomeContainer}>
        <p>No hay cursos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.welcomeContainer}>
      {/* Sección de encabezado principal que orienta al usuario sobre la acción a realizar */}
      <header className={styles.hero}>
        <h1>Bienvenido</h1>
        <p>Selecciona uno de tus cursos para continuar.</p>
      </header>

      {/* Contenedor principal de la cuadrícula de cursos */}
      <div className={styles.gridCursos}>
        {/* Realiza el mapeo de la colección para generar una tarjeta por cada elemento */}
        {cursos.map((curso) => (
          <article 
            key={curso.id} // Clave única para la optimización del DOM virtual de React
            className={styles.cursoCard} 
            onClick={() => onSelectCurso(curso)} // Notifica al componente padre la selección del curso
            
            /* Atributos de accesibilidad para asegurar la compatibilidad con lectores de pantalla y navegación por teclado */
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectCurso(curso)}
          >
            {/* Representación visual del curso mediante un icono dinámico o predefinido */}
            <div className={styles.iconContainer}>
              <span className={styles.icon}>{curso.icono || '📖'}</span>
            </div>

            {/* Información descriptiva del curso y su volumen de contenido */}
            <h3>{curso.titulo}</h3>
            
            {/* Cálculo dinámico de la cantidad de lecciones basado en la estructura del objeto curso */}
            <p>{curso.secciones?.length || 0} lecciones disponibles</p>
            
            {/* Elemento de acción visual que refuerza la interactividad de la tarjeta */}
            <button className={styles.btnEntrar}>COMENZAR</button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Bienvenido;