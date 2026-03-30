import React from 'react';
import styles from './Bienvenido.module.sass';

const Bienvenido = ({ cursos = [], onSelectCurso }) => {
  // Manejo de estado vacío por si no hay cursos cargados
  if (!cursos || cursos.length === 0) {
    return (
      <div className={styles.welcomeContainer}>
        <p>No hay cursos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.welcomeContainer}>
      <header className={styles.hero}>
        <h1>Bienvenido</h1>
        <p>Selecciona uno de tus cursos para continuar.</p>
      </header>

      <div className={styles.gridCursos}>
        {cursos.map((curso) => (
          <article 
            key={curso.id} 
            className={styles.cursoCard} 
            onClick={() => onSelectCurso(curso)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectCurso(curso)}
          >
            <div className={styles.iconContainer}>
              {/* Si el JSON tiene un campo 'icono', lo usamos; si no, el default */}
              <span className={styles.icon}>{curso.icono || '📖'}</span>
            </div>
            <h3>{curso.titulo}</h3>
            <p>{curso.secciones?.length || 0} lecciones disponibles</p>
            <button className={styles.btnEntrar}>COMENZAR</button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Bienvenido;