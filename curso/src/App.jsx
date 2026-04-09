import { useState, useMemo } from 'react';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  useMediaQuery, useTheme, AppBar, Toolbar, Box, Button, IconButton, CssBaseline 
} from '@mui/material';
import {
  Menu as MenuIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon,
  AccountCircle as ProfileIcon, Home as HomeIcon, Logout as LogoutIcon
} from '@mui/icons-material';

// Componentes
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import Avance from './components/examen/Avance'; 
import Perfil from './components/Perfil/Perfil';

// Estilos y Assets
import styles from './components/App.module.sass';
import dataCursos from './components/data/cursos.json';
import logoChakray from './assets/chakraylogo.png'; 
import logoChakraydark from './assets/logo.png'; 

function App() {
  const [mode, setMode] = useState('light'); 
  const [isLogged, setIsLogged] = useState(false);
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [viewMode, setViewMode] = useState('course'); 
  const [userAnswers, setUserAnswers] = useState({}); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const themeMUI = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');

  const [userData, setUserData] = useState({
    nombre: "Ingeniño 1",
    email: "ingeniero@chakray.mx"
  });

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      primary: { main: '#E11F26' },
      background: {
        default: mode === 'dark' ? '#111111' : '#FFFFFF',
        paper: mode === 'dark' ? '#49494A' : '#EDEDED',
      },
      text: { 
        primary: mode === 'dark' ? '#FFFFFF' : '#111111',
        secondary: '#878787',
      },
      divider: mode === 'dark' ? '#49494A' : '#CCCCCC',
    },
    typography: { fontFamily: '"Roboto", sans-serif' },
  }), [mode]);

  const currentLogo = mode === 'dark' ? logoChakraydark : logoChakray;

  // --- LÓGICA DE NAVEGACIÓN CORREGIDA ---

  // 1. Volver a la Bienvenida (Limpia el curso seleccionado)
  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
    setViewMode('course');
    if (isMobile) setSidebarOpen(false);
  };

  // 2. Finalizar Examen y Enviar (Guarda y cambia a vista de resultados)
  const handleSaveAnswers = (respuestasDelExamen) => {
    setUserAnswers(prev => ({
      ...prev,
      ...respuestasDelExamen 
    }));
    // Esta línea es la que te manda automáticamente al componente Avance
    setViewMode('progress'); 
  };

  const handleResetExamen = (cursoId) => {
    setUserAnswers(prev => {
      const nuevasRespuestas = { ...prev };
      Object.keys(nuevasRespuestas).forEach(key => {
        if (key.startsWith(`${cursoId}_`)) {
          delete nuevasRespuestas[key];
        }
      });
      return nuevasRespuestas;
    });
    setViewMode('course'); 
  };

  const handleLogout = () => {
    setIsLogged(false);
    handleGoHome();
  };

  const handleToggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

 if (!isLogged) return (
  <Login 
    onLogin={() => setIsLogged(true)} 
    mode={mode} // Pasamos el modo actual ('light' o 'dark')
  />
);

  const shouldShowSidebar = courseSelected && viewMode === 'course';

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          
          <AppBar position="static" sx={{ 
            backgroundImage: 'none', boxShadow: 'none', bgcolor: 'background.default',
            borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary', zIndex: 1201
          }}>
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {shouldShowSidebar && (
                  <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} color="inherit">
                    <MenuIcon />
                  </IconButton>
                )}
                <img src={currentLogo} alt="Logo" style={{ height: '35px', cursor: 'pointer' }} onClick={handleGoHome} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleTheme} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Button startIcon={<HomeIcon />} color="inherit" onClick={handleGoHome}>Inicio</Button>
                <Button startIcon={<ProfileIcon />} color="inherit" onClick={() => setViewMode('profile')}>Perfil</Button>
                <IconButton onClick={handleLogout} color="error"><LogoutIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            
            {shouldShowSidebar && (
              <Sidebar 
                cursoActual={courseSelected} 
                activeId={currentPage?.id} 
                onSelect={setCurrentPage} 
                onShowProgress={() => setViewMode('progress')}
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                userAnswers={userAnswers} 
              />
            )}
            
            <Box 
              component="main"
              sx={{ 
                flexGrow: 1, overflowY: 'auto', overflowX: 'hidden',
                display: 'flex', flexDirection: 'column', bgcolor: 'background.default',
              }}
            >
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                {viewMode === 'profile' ? (
                  <Perfil 
                    usuario={userData} 
                    cursos={dataCursos} 
                    userAnswers={userAnswers} 
                    onBack={handleGoHome} // Al volver del perfil, va a bienvenida
                  />
                ) : viewMode === 'progress' ? (
                  <Avance 
                    cursos={dataCursos} 
                    userAnswers={userAnswers} 
                    onContinuar={handleGoHome} // Al dar "Volver a cursos", va a bienvenida
                    onResetExamen={handleResetExamen} 
                  />
                ) : courseSelected ? (
                  <MainContent 
                    activePage={currentPage} 
                    cursos={dataCursos} 
                    onSelect={setCurrentPage}
                    userAnswers={userAnswers}
                    onSaveAnswers={handleSaveAnswers} // Esta función guarda y dispara la vista Avance
                    onResetExamen={handleResetExamen}
                    setViewMode={setViewMode}
                  />
                ) : (
                  <Welcome 
                    cursos={dataCursos} 
                    onSelectCurso={(c) => { 
                      setCourseSelected(c); 
                      setCurrentPage(c.secciones[0]); 
                      setViewMode('course'); 
                    }} 
                  />
                )}
              </Box>

              <footer className={styles.footer} style={{ width: '100%', marginTop: 'auto' }}>
                <p>© 2026 Chakray</p>
                <a href="#mapa">MAPA DEL SITIO</a>
              </footer>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;