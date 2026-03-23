import { useState } from 'react';
import styles from './bar.module.sass';

const Sidebar = ({ cursos = [], onSelect, activeId }) => {
  const [openCourseId, setOpenCourseId] = useState(cursos[0]?.id);
  // Guardamos los IDs de las secciones que el usuario ya clickeó
  const [completedSections, setCompletedSections] = useState([]);

  const toggleCourse = (id) => {
    setOpenCourseId(openCourseId === id ? null : id);
  };

  const handleSelect = (sec) => {
    // Si no es un examen, lo marcamos como completado al hacer click
    if (sec.tipo !== 'examen' && !completedSections.includes(sec.id)) {
      setCompletedSections([...completedSections, sec.id]);
    }
    onSelect(sec);
  };

  return (
    <aside className={styles.bar}>
      <h2 className={styles.navTitle}>Contenido</h2>
      
      <nav className={styles.menu}>
        {cursos.map((curso) => {
          // 1. Filtrar secciones: Todas las de contenido + SOLO el primer examen
          const contenidos = curso.secciones.filter(s => s.tipo !== 'examen');
          const primerExamen = curso.secciones.find(s => s.tipo === 'examen');
          const seccionesAMostrar = [...contenidos, primerExamen].filter(Boolean);

          // 2. Verificar si el curso está completo (excluyendo el examen)
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
                          title={bloqueado ? "Termina el contenido para desbloquear" : ""}
                        >
                          {sec.label}
                          {bloqueado && <span className={styles.icon}>🔒</span>}
                          {!bloqueado && esExamen && <span className={styles.icon}>📝</span>}
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