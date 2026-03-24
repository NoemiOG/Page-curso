import { useState } from 'react';
import styles from './bar.module.sass';

// Añadimos 'onShowProgress' como prop
const Sidebar = ({ cursos = [], onSelect, activeId, onShowProgress }) => {
  const [openCourseId, setOpenCourseId] = useState(cursos[0]?.id);
  const [completedSections, setCompletedSections] = useState([]);

  const toggleCourse = (id) => {
    setOpenCourseId(openCourseId === id ? null : id);
  };

  const handleSelect = (sec) => {
    if (sec.tipo !== 'examen' && !completedSections.includes(sec.id)) {
      setCompletedSections([...completedSections, sec.id]);
    }
    onSelect(sec);
  };

  return (
    <aside className={styles.bar}>
      <header className={styles.sidebarHeader}>
        <h2 className={styles.navTitle}>Contenido</h2>
      </header>
      
      {/* SECCIÓN DE PROGRESO: Un botón destacado arriba del menú */}
      <div className={styles.progressNav}>
        <button 
          className={`${styles.navBtn} ${styles.progressBtn}`} 
          onClick={onShowProgress}
        >
          <span className={styles.icon}>📊</span>
          Progreso
        </button>
      </div>

      <hr className={styles.separator} />

      <nav className={styles.menu}>
        {cursos.map((curso) => {
          const contenidos = curso.secciones.filter(s => s.tipo !== 'examen');
          const primerExamen = curso.secciones.find(s => s.tipo === 'examen');
          const seccionesAMostrar = [...contenidos, primerExamen].filter(Boolean);

          const idsContenido = contenidos.map(c => c.id);
          const cursoCompletado = idsContenido.every(id => completedSections.includes(id));

          return (
            <div key={curso.id} className={styles.courseGroup}>
              <button 
                className={styles.courseBanner} 
                onClick={() => toggleCourse(curso.id)}
              >
                {curso.titulo}
                <span className={`${styles.arrow} ${openCourseId === curso.id ? styles.open : ''}`}>
                  ▼ 
                </span>
              </button>
              
              {openCourseId === curso.id && (
                <ul className={styles.linksList}>
                  {seccionesAMostrar.map((sec) => {
                    const esExamen = sec.tipo === 'examen';
                    const bloqueado = esExamen && !cursoCompletado;

                    return (
                      <li key={sec.id}>
                        <button
                          onClick={() => !bloqueado && handleSelect(sec)}
                          className={`
                            ${styles.navBtn} 
                            ${activeId === sec.id ? styles.active : ''} 
                            ${bloqueado ? styles.locked : ''}
                          `}
                          disabled={bloqueado}
                        >
                          <span className={styles.labelWrapper}>
                            {sec.label}
                            {bloqueado && <span className={styles.icon}>🔒</span>}
                            {!bloqueado && esExamen && <span className={styles.icon}>📝</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;