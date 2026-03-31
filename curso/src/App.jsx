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

  // --- 1. FUNCIÓN AUXILIAR DE CONTEO (Para reutilizar en stats y en el guardado) ---
  const calcularAciertosDeCurso = (curso, respuestas) => {
    const examen = curso.secciones?.find(s => s.tipo === 'examen');
    if (!examen) return 0;

    let aciertos = 0;
    examen.preguntas.forEach(p => {
      const respUser = respuestas[`${curso.id}_${p.id}`];
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
    return aciertos;
  };

  // --- 2. LÓGICA DE ESTADÍSTICAS ---
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
        const aciertos = calcularAciertosDeCurso(curso, userAnswers);
        sumaPorcentajes += (aciertos / examen.preguntas.length) * 100;
      }
    });

    return {
      totalIniciados: examenesRealizados,
      promedioGeneral: examenesRealizados > 0 ? Math.round(sumaPorcentajes / examenesRealizados) : 0
    };
  }, [userAnswers]);

  // --- 3. MANEJADORES DE ESTADO ---
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

  // --- CORRECCIÓN: FINALIZAR EXAMEN CON FILTRO DE MEJOR PUNTAJE ---
  const handleFinishExamen = (respuestasNuevas) => {
    setUserAnswers(prev => {
      // Extraemos el ID del curso de las nuevas respuestas (ej: "1_q1" -> "1")
      const primeraLlave = Object.keys(respuestasNuevas)[0];
      if (!primeraLlave) return prev;
      const cursoId = primeraLlave.split('_')[0];
      
      const cursoData = dataCursos.find(c => c.id.toString() === cursoId.toString());
      
      // Comparamos aciertos: Nuevo Intento vs Lo que ya teníamos guardado
      const nuevosAciertos = calcularAciertosDeCurso(cursoData, respuestasNuevas);
      const viejosAciertos = calcularAciertosDeCurso(cursoData, prev);

      if (nuevosAciertos >= viejosAciertos) {
        return { ...prev, ...respuestasNuevas };
      } else {
        // Si el puntaje es menor, ignoramos las nuevas respuestas y dejamos las viejas
        console.log("Se conservó el puntaje anterior por ser más alto.");
        return prev;
      }
    });
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
    // Al resetear, lo mandamos de vuelta al curso para que pueda iniciar de nuevo
    setViewMode('course');
  };

  if (!isLogged) return <Login onLogin={handleLogin} />;

  return (
    <div className={styles.appContainer}>
      {courseSelected && viewMode === 'course' && (
        <Sidebar 
          cursoActual={courseSelected} 
          cursos={dataCursos} 
          activeId={currentPage?.id} 
          onSelect={handleSelectPage} 
          onShowProgress={() => setViewMode('progress')}
          userAnswers={userAnswers} // <--- ¡No olvides esta línea!
        />
      )}
      
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.logoContainer}>
            <img src={logoChakray} alt="Logo" className={styles.logo} onClick={handleGoHome} />
          </div>
          <div className={styles.headerRight}>
            <button onClick={handleGoProfile} className={styles.btnNav}>MI PERFIL</button>
            <button onClick={handleLogout} className={styles.btnLogout}>CERRAR SESIÓN</button>
          </div>
        </header>

        <main className={styles.contentArea}>
          {viewMode === 'profile' ? (
            <Perfil usuario={userData} stats={statsGlobales} onBack={handleGoHome} />
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
              cursos={dataCursos}
              onSelect={handleSelectPage}
              onFinishExamen={handleFinishExamen}
              userAnswers={userAnswers}
            />
          ) : (
            <Welcome cursos={dataCursos} onSelectCurso={handleSelectCurso} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;