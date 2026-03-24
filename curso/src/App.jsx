import { useState } from 'react';
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import Avance from './components/examen/Avance'; 
import styles from './components/App.module.sass';
import dataCursos from './components/data/cursos.json';
import logoChakray from './assets/logo.jpeg';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [viewMode, setViewMode] = useState('course'); 
  const [userAnswers, setUserAnswers] = useState({}); 

  const handleLogin = (email) => setIsLogged(true);

  const handleLogout = () => {
    setIsLogged(false);
    setCourseSelected(null);
    setCurrentPage(null);
    setUserAnswers({});
    setViewMode('course');
  };

  const handleSelectCurso = (curso) => {
    setCourseSelected(curso);
    if (curso.secciones && curso.secciones.length > 0) {
      setCurrentPage(curso.secciones[0]);
    }
    setViewMode('course');
  };

  const handleSelectPage = (page) => {
    setCurrentPage(page);
    setViewMode('course'); 
  };

  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
    setViewMode('course');
  };

  // Esta es la función clave que recibe las respuestas de SurveyJS
  const handleFinishExamen = (respuestasDelUsuario) => {
    setUserAnswers(prev => ({
      ...prev,
      ...respuestasDelUsuario
    }));
    setViewMode('progress'); 
  };

  if (!isLogged) return <Login onLogin={handleLogin} />;

  // Dentro de App.jsx
const handleResetExamen = (cursoId) => {
  const curso = dataCursos.find(c => c.id === cursoId);
  const examen = curso.secciones.find(s => s.tipo === 'examen');
  
  if (examen) {
    setUserAnswers(prev => {
      const nuevasRespuestas = { ...prev };
      // Borramos las respuestas de las preguntas de este examen
      examen.preguntas.forEach(p => delete nuevasRespuestas[p.id]);
      return nuevasRespuestas;
    });
    
    // Lo mandamos de vuelta a la página del examen
    setCurrentPage(examen);
    setViewMode('course');
  }
};

// Y lo pasas al componente:
<Avance 
  cursos={dataCursos} 
  userAnswers={userAnswers} 
  onContinuar={() => setViewMode('course')}
  onResetExamen={handleResetExamen} // <-- Nueva prop
/>

  return (
    <div className={styles.appContainer}>
      {courseSelected && viewMode === 'course' && (
        <Sidebar 
          cursos={dataCursos} 
          activeId={currentPage?.id} 
          onSelect={handleSelectPage} 
          onShowProgress={() => setViewMode('progress')} // <-- Agrega esta línea
        />
      )}
      
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <img 
              src={logoChakray} 
              alt="Chakray Logo" 
              className={styles.logo} 
              onClick={handleGoHome}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className={styles.headerRight}>
            <button onClick={handleLogout} className={styles.btnLogout}>
              Cerrar Sesión
            </button>
          </div>
        </header>
        
        <main className={styles.contentArea}>
          {viewMode === 'progress' ? (
            <Avance 
              cursos={dataCursos} 
              userAnswers={userAnswers}
              onContinuar={() => setViewMode('course')} 
            />
          ) : courseSelected ? (
            <MainContent 
              activePage={currentPage} 
              cursos={dataCursos}
              onSelect={handleSelectPage}
              onFinishExamen={handleFinishExamen}
              userAnswers={userAnswers} // Importante pasar esto para lógica interna
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