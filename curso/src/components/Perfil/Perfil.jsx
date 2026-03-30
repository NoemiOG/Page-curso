import React from 'react';
import styles from './Perfil.module.sass';

const Perfil = ({ usuario, stats, onBack }) => {
  // Extraemos la inicial del nombre que viene de App.jsx ("Usuario Chakray" -> "U")
  const inicial = usuario?.nombre?.charAt(0) || "U";
  
  return (
    <div className={styles.perfilContainer}>
      <header className={styles.perfilHeader}>
        <div className={styles.avatar}>
          {/* Si no hay imagen de avatar, mostramos la inicial */}
          {usuario?.avatar ? <img src={usuario.avatar} alt="Avatar" /> : inicial}
        </div>
        <div className={styles.info}>
          <h2>{usuario?.nombre || "Estudiante"}</h2>
          <p>{usuario?.email || "Sin correo registrado"}</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Exámenes Realizados</span>
          <p className={styles.statValue}>{stats?.totalIniciados || 0}</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Promedio General</span>
          <p className={styles.statValue}>{stats?.promedioGeneral || 0}%</p>
        </div>
      </div>
      
      <div className={styles.footer}>
        <button onClick={onBack} className={styles.btnVolver}>
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
};

export default Perfil;