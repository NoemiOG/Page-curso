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
    nombre: "Ingeniño 1",
    email: "estudiante@chakray.mx"
  });

  // --- 1. FUNCIÓN AUXILIAR DE CONTEO ---
  // Calcula la cantidad de aciertos para un curso específico comparando las respuestas proporcionadas contra el JSON de datos.
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
  // Memoriza el cálculo de estadísticas globales para evitar re-renderizados innecesarios, procesando el promedio general de los exámenes realizados.
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
  
  // Establece el estado de autenticación y actualiza la información del usuario tras un inicio de sesión exitoso.
  const handleLogin = (email) => {
    setUserData(prev => ({ ...prev, email }));
    setIsLogged(true);
  };

  // Restablece todos los estados globales a sus valores iniciales para finalizar la sesión del usuario.
  const handleLogout = () => {
    setIsLogged(false);
    setCourseSelected(null);
    setCurrentPage(null);
    setUserAnswers({});
    setViewMode('course');
  };

  // Cambia la vista activa hacia el perfil del usuario.
  const handleGoProfile = () => setViewMode('profile');
  
  // Restablece la navegación hacia la pantalla de bienvenida o menú principal.
  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
    setViewMode('course');
  };

  // Define el curso seleccionado y establece la primera sección del mismo como página activa.
  const handleSelectCurso = (curso) => {
    setCourseSelected(curso);
    if (curso.secciones?.length > 0) {
      setCurrentPage(curso.secciones[0]);
    }
    setViewMode('course');
  };

  // Actualiza la sección o tema específico que el usuario desea visualizar.
  const handleSelectPage = (page) => {
    setCurrentPage(page);
    setViewMode('course'); 
  };

  // --- 4. GESTIÓN DE EXÁMENES ---

  // Procesa la finalización de un examen, comparando el nuevo resultado con el anterior para conservar únicamente la calificación más alta.
  const handleFinishExamen = (respuestasNuevas) => {
    setUserAnswers(prev => {
      const primeraLlave = Object.keys(respuestasNuevas)[0];
      if (!primeraLlave) return prev;
      const cursoId = primeraLlave.split('_')[0];
      
      const cursoData = dataCursos.find(c => c.id.toString() === cursoId.toString());
      
      const nuevosAciertos = calcularAciertosDeCurso(cursoData, respuestasNuevas);
      const viejosAciertos = calcularAciertosDeCurso(cursoData, prev);

      if (nuevosAciertos >= viejosAciertos) {
        return { ...prev, ...respuestasNuevas };
      } else {
        console.log("Se conserva el puntaje anterior por ser más alto.");
        return prev;
      }
    });
    setViewMode('progress'); 
  };

  // Elimina las respuestas almacenadas de un curso específico y redirige al usuario a la vista de contenido.
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

  // Renderiza el componente de inicio de sesión si el usuario no está autenticado.
  if (!isLogged) return <Login onLogin={handleLogin} />;

  return (
    <div className={styles.appContainer}>
      {/* Muestra la barra lateral solo durante la navegación de cursos */}
      {courseSelected && viewMode === 'course' && (
        <Sidebar 
          cursoActual={courseSelected} 
          cursos={dataCursos} 
          activeId={currentPage?.id} 
          onSelect={handleSelectPage} 
          onShowProgress={() => setViewMode('progress')}
          userAnswers={userAnswers} 
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
          {/* Renderizado condicional de vistas según el modo activo */}
          {viewMode === 'profile' ? (
            <Perfil 
                usuario={userData} 
                stats={statsGlobales} 
                onBack={handleGoHome} 
                cursos={dataCursos}      // <--- Pasamos la lista de cursos
                userAnswers={userAnswers} // <--- Pasamos las respuestas para el cálculo
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