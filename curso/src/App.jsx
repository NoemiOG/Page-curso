import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; 
import { useState, useMemo } from 'react';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  useMediaQuery, useTheme, AppBar, Toolbar, Box, Button, IconButton, CssBaseline, Tooltip 
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
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mode, setMode] = useState('light'); 
  const [isLogged, setIsLogged] = useState(false);
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [userAnswers, setUserAnswers] = useState({}); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isMobile = useMediaQuery('(max-width:900px)');

  const [userData, setUserData] = useState({
    nombre: "Ingeniño 1",
    email: "ingeniero@chakray.mx"
  });

  // LÓGICA DE VISIBILIDAD DE SIDEBAR: Solo se activa en la ruta del curso
  const shouldShowSidebar = courseSelected && location.pathname === '/curso-detalle';

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

  // --- HANDLERS ---

  const handleGoHome = () => {
    setCourseSelected(null);
    setCurrentPage(null);
    navigate('/inicio'); 
    if (isMobile) setSidebarOpen(false);
  };

  const handleSaveAnswers = (respuestasDelExamen) => {
    setUserAnswers(prev => ({ ...prev, ...respuestasDelExamen }));
    navigate('/avance'); 
  };

  const handleResetExamen = (cursoId) => {
    setUserAnswers(prev => {
      const nuevasRespuestas = { ...prev };
      Object.keys(nuevasRespuestas).forEach(key => {
        if (key.startsWith(`${cursoId}_`)) delete nuevasRespuestas[key];
      });
      return nuevasRespuestas;
    });
    navigate('/inicio'); 
  };

  const handleLogout = () => {
    setIsLogged(false);
    navigate('/'); 
  };

  const handleToggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  if (!isLogged) return <Login onLogin={() => setIsLogged(true)} mode={mode} />;

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
                <img 
                  src={currentLogo} 
                  alt="Logo" 
                  style={{ height: isMobile ? '28px' : '35px', cursor: 'pointer' }} 
                  onClick={handleGoHome} 
                />
              </Box>

              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                <Tooltip title="Cambiar Tema">
                  <IconButton onClick={handleToggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Inicio">
                  {isMobile ? (
                    <IconButton color="inherit" onClick={() => navigate('/inicio')}>
                      <HomeIcon />
                    </IconButton>
                  ) : (
                    <Button startIcon={<HomeIcon />} color="inherit" onClick={() => navigate('/inicio')}>Inicio</Button>
                  )}
                </Tooltip>

                <Tooltip title="Mi Perfil">
                  {isMobile ? (
                    <IconButton color="inherit" onClick={() => navigate('/perfil')}>
                      <ProfileIcon />
                    </IconButton>
                  ) : (
                    <Button startIcon={<ProfileIcon />} color="inherit" onClick={() => navigate('/perfil')}>Perfil</Button>
                  )}
                </Tooltip>

                <Tooltip title="Cerrar Sesión">
                  <IconButton onClick={handleLogout} color="error">
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            
            {shouldShowSidebar && (
              <Sidebar 
                cursoActual={courseSelected} 
                activeId={currentPage?.id} 
                onSelect={setCurrentPage} 
                onShowProgress={() => navigate('/avance')}
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                userAnswers={userAnswers} 
              />
            )}
            
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/inicio" />} />
                  
                  <Route path="/inicio" element={
                    <Welcome 
                      cursos={dataCursos} 
                      onSelectCurso={(c) => { 
                        setCourseSelected(c); 
                        setCurrentPage(c.secciones[0]); 
                        navigate('/curso-detalle'); 
                      }} 
                    />
                  } />

                  <Route path="/perfil" element={
                    <Perfil usuario={userData} cursos={dataCursos} userAnswers={userAnswers} onBack={handleGoHome} />
                  } />

                  <Route path="/avance" element={
                    <Avance 
                       cursos={dataCursos} 
                       userAnswers={userAnswers} 
                       onContinuar={handleGoHome} 
                       onResetExamen={handleResetExamen} 
                       cursoIdFiltrado={courseSelected?.id} 
                    />
                  } />

                  <Route path="/curso-detalle" element={
                    courseSelected ? (
                      <MainContent 
                        activePage={currentPage} 
                        cursos={dataCursos} 
                        onSelect={setCurrentPage}
                        userAnswers={userAnswers}
                        onSaveAnswers={handleSaveAnswers}
                        onResetExamen={handleResetExamen}
                      />
                    ) : <Navigate to="/inicio" />
                  } />
                </Routes>
              </Box>

              <footer className={styles.footer} style={{ width: '100%', marginTop: 'auto' }}>
                <p>© 2026 Chakray</p>
              </footer>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;