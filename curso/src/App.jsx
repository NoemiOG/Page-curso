import { useState } from 'react';
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import styles from './components/App.module.sass';
import dataCursos from './components/data/cursos.json';
import logoChakray from './assets/logo.jpeg';

function App() {
  // --- ESTADOS ---
  const [isLogged, setIsLogged] = useState(false);
  const [courseSelected, setCourseSelected] = useState(null); // El curso actual (ej: Curso 1)
  const [currentPage, setCurrentPage] = useState(null);       // La sección/página actual
  const [viewMode, setViewMode] = useState('course');         // 'course' o 'progress'

  // --- MANEJADORES ---
  const handleLogin = (email) => {
    console.log("Sesión iniciada:", email);
    setIsLogged(true);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setCourseSelected(null);
    setCurrentPage(null);
  };

  // Cuando el usuario elige un curso en la pantalla de Bienvenida
  const handleSelectCurso = (curso) => {
    setCourseSelected(curso);
    // Por defecto, lo mandamos a la primera sección del curso
    if (curso.secciones && curso.secciones.length > 0) {
      setCurrentPage(curso.secciones[0]);
    }
    setViewMode('course');
  };

  // Cuando el usuario hace clic en el Sidebar para cambiar de tema
  const handleSelectPage = (page) => {
    setCurrentPage(page);
    setViewMode('course'); // Si estaba en progreso, lo regresa a la vista de contenido
  };

  // Volver a la pantalla de todos los cursos (Home)
  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
  };

  // --- RENDERIZADO CONDICIONAL ---
  if (!isLogged) {
    return <Login onLogin={handleLogin} />;
  }

  const goToNextSection = () => {
  // 1. Encontrar el curso actual y el índice de la sección activa
  const cursoActual = cursos.find(c => c.secciones.some(s => s.id === activePage.id));
  const indexActual = cursoActual.secciones.findIndex(s => s.id === activePage.id);
  
  // 2. Si hay una sección siguiente, la seleccionamos
  if (indexActual < cursoActual.secciones.length - 1) {
    const siguiente = cursoActual.secciones[indexActual + 1];
    onSelect(siguiente); // Esta es la función que cambia el activePage
  }
};

  return (
    <div className={styles.appContainer}>
      {/* 1. SIDEBAR: Solo se muestra si hay un curso seleccionado */}
      {courseSelected && (
        <Sidebar 
          cursos={dataCursos} 
          activeId={currentPage?.id} 
          onSelect={handleSelectPage} 
        />
      )}
      
      <div className={styles.mainWrapper}>
        {/* 2. HEADER: Siempre visible tras el login */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <img 
              src={logoChakray} 
              alt="Chakray Logo" 
              className={styles.logo} 
              onClick={handleGoHome} // Hacer clic en el logo vuelve al inicio
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className={styles.headerRight}>
            
            <button onClick={handleLogout} className={styles.btnLogout}>
              Cerrar Sesión
            </button>
          </div>
        </header>
        
        {/* 3. CONTENIDO DINÁMICO */}
        <main className={styles.contentArea}>
  {courseSelected ? (
    <MainContent 
      activePage={currentPage} 
      cursos={dataCursos}      // <--- FALTABA ESTO
      onSelect={handleSelectPage} // <--- FALTABA ESTO para que el botón funcione
      onFinishExamen={() => setViewMode('progress')} 
    />
  ) : (
    <Welcome 
      cursos={dataCursos} 
      onSelectCurso={handleSelectCurso} 
    />
  )}
</main>
      </div>
    </div>
  );
}

export default App;