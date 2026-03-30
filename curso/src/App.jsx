import { useState, useMemo } from 'react';
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import Avance from './components/examen/Avance'; 
import Perfil from './components/Perfil/Perfil';
import styles from './components/App.module.sass';
import dataCursos from './components/data/cursos.json';
import logoChakray from './assets/logo.png';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [viewMode, setViewMode] = useState('course'); 
  const [userAnswers, setUserAnswers] = useState({}); 

  const [userData, setUserData] = useState({
    nombre: "Michi",
    email: "estudiante@chakray.mx"
  });

  // --- 1. LÓGICA DE ESTADÍSTICAS ---
  const statsGlobales = useMemo(() => {
    let sumaPorcentajes = 0;
    let examenesRealizados = 0;

    dataCursos.forEach(curso => {
      const examen = curso.secciones?.find(s => s.tipo === 'examen');
      if (!examen) return;

      const tieneRespuestas = examen.preguntas.some(p => 
        userAnswers[`${curso.id}_${p.id}`] !== undefined
      );

      if (tieneRespuestas) {
        examenesRealizados++;
        let aciertos = 0;
        examen.preguntas.forEach(p => {
          const respUser = userAnswers[`${curso.id}_${p.id}`];
          const respCorrecta = p.respuestaCorrecta;
          if (p.esMultiple) {
            if (Array.isArray(respUser) && Array.isArray(respCorrecta)) {
              const esIgual = respUser.length === respCorrecta.length &&
                              respUser.every(val => respCorrecta.includes(val));
              if (esIgual) aciertos++;
            }
          } else {
            if (respUser == respCorrecta) aciertos++;
          }
        });
        sumaPorcentajes += (aciertos / examen.preguntas.length) * 100;
      }
    });

    return {
      totalIniciados: examenesRealizados,
      promedioGeneral: examenesRealizados > 0 ? Math.round(sumaPorcentajes / examenesRealizados) : 0
    };
  }, [userAnswers]);

  // --- 2. MANEJADORES DE ESTADO ---
  const handleLogin = (email) => {
    setUserData(prev => ({ ...prev, email }));
    setIsLogged(true);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setCourseSelected(null);
    setCurrentPage(null);
    setUserAnswers({});
    setViewMode('course');
  };

  const handleGoProfile = () => setViewMode('profile');
  
  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
    setViewMode('course');
  };

  const handleSelectCurso = (curso) => {
    setCourseSelected(curso);
    if (curso.secciones?.length > 0) {
      setCurrentPage(curso.secciones[0]);
    }
    setViewMode('course');
  };

  const handleSelectPage = (page) => {
    setCurrentPage(page);
    setViewMode('course'); 
  };

  const handleFinishExamen = (respuestasNuevas) => {
    setUserAnswers(prev => ({ ...prev, ...respuestasNuevas }));
    setViewMode('progress'); 
  };

  const handleResetExamen = (cursoId) => {
    setUserAnswers(prev => {
      const limpias = { ...prev };
      Object.keys(limpias).forEach(key => {
        if (key.startsWith(`${cursoId}_`)) delete limpias[key];
      });
      return limpias;
    });
    setViewMode('course');
  };

  if (!isLogged) return <Login onLogin={handleLogin} />;

  return (
    <div className={styles.appContainer}>
      {/* CORRECCIÓN: El Sidebar necesita saber cuál es el curso seleccionado 
          para mostrar las lecciones correctas */}
      {courseSelected && viewMode === 'course' && (
        <Sidebar 
          cursoActual={courseSelected} // <--- Asegúrate que tu Sidebar use esta prop
          cursos={dataCursos} 
          activeId={currentPage?.id} 
          onSelect={handleSelectPage} 
          onShowProgress={() => setViewMode('progress')}
        />
      )}
      
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.logoContainer}>
            <img 
              src={logoChakray} 
              alt="Logo" 
              className={styles.logo} 
              onClick={handleGoHome}
            />
          </div>
          <div className={styles.headerRight}>
            <button onClick={handleGoProfile} className={styles.btnNav}>MI PERFIL</button>
            <button onClick={handleLogout} className={styles.btnLogout}>CERRAR SESIÓN</button>
          </div>
        </header>

        <main className={styles.contentArea}>
          {viewMode === 'profile' ? (
            <Perfil 
              usuario={userData} 
              stats={statsGlobales} 
              onBack={handleGoHome} 
            />
          ) : viewMode === 'progress' ? (
            <Avance 
              cursos={dataCursos} 
              userAnswers={userAnswers}
              onContinuar={handleGoHome} 
              onResetExamen={handleResetExamen}
            />
          ) : courseSelected ? (
            <MainContent 
              activePage={currentPage} 
              cursos={dataCursos} // <--- CORRECCIÓN: Faltaba pasar los cursos para que funcione la navegación interna
              onSelect={handleSelectPage}
              onFinishExamen={handleFinishExamen}
              userAnswers={userAnswers}
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