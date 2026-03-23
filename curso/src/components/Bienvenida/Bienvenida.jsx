// src/components/presentation/Welcome.jsx
import React from 'react';
import styles from './Bienvenido.module.sass';

const Bienvenido = ({ cursos, onSelectCurso }) => {
  return (
    <div className={styles.welcomeContainer}>
      <header className={styles.hero}>
        <h1>Bienvenido</h1>
        <p>Selecciona uno de tus cursos para continuar.</p>
      </header>

      <div className={styles.gridCursos}>
        {cursos.map((curso) => (
          <div key={curso.id} className={styles.cursoCard} onClick={() => onSelectCurso(curso)}>
            <div className={styles.icon}>📖</div>
            <h3>{curso.titulo}</h3>
            <p>{curso.secciones.length} lecciones disponibles</p>
            <button className={styles.btnEntrar}>Comenzar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bienvenido;