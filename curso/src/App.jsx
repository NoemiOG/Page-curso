import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; 
import { useState, useMemo, useEffect } from 'react';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  useMediaQuery, AppBar, Toolbar, Box, IconButton, CssBaseline,
  Menu, MenuItem, Divider, Typography 
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as ProfileIcon,
  KeyboardArrowDown as ArrowDownIcon 
} from '@mui/icons-material';

// Componentes
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import Avance from './components/examen/Avance'; 
import Perfil from './components/Perfil/Perfil';

// Data y Assets
import dataCursos from './components/data/cursos.json';
import logoChakray from './assets/chakraylogo.png'; 
import logoChakraydark from './assets/logo.png'; 

// 1. Base de Datos de Usuarios Autorizados (Actualizada)
const USUARIOS_AUTORIZADOS = [
  { nombre: "Ingeniño", email: "ingeniero@chakray.com" },
  { nombre: "El Inge", email: "elinge@chakray.com" },
  { nombre: "Admin", email: "admin@chakray.com" }
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- ESTADOS DE SESIÓN Y TEMA ---
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light'); 
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  // --- ESTADOS DE CONTENIDO CON PERSISTENCIA ---
  const [userAnswers, setUserAnswers] = useState(() => {
    const saved = localStorage.getItem('user_answers_backup');
    return saved ? JSON.parse(saved) : {};
  }); 
  
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [progresoUpdate, setProgresoUpdate] = useState(Date.now());
  const [examenEnCurso, setExamenEnCurso] = useState(false);
  const [filtroAvance, setFiltroAvance] = useState(null);

  const openMenu = Boolean(anchorEl);
  const isMobile = useMediaQuery('(max-width:900px)');

  // 2. Efecto para Tema y Persistencia de Respuestas
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('user_answers_backup', JSON.stringify(userAnswers));
  }, [userAnswers]);

  // 3. Configuración de MUI (Ajuste de botones y colores)
  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      primary: { main: '#E11F26' },
      background: {
        default: mode === 'dark' ? '#111111' : '#FFFFFF',
        paper: mode === 'dark' ? '#49494A' : '#EDEDED',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px', // Bordes sólidos, no ovalados
            textTransform: 'uppercase',
            fontWeight: 700,
          },
        },
      },
    },
  }), [mode]);

  const currentLogo = mode === 'dark' ? logoChakraydark : logoChakray;

  // --- MANEJADORES DE FLUJO ---

  const handleLogin = (emailIngresado) => {
    const usuario = USUARIOS_AUTORIZADOS.find(
      u => u.email.toLowerCase() === emailIngresado.toLowerCase()
    );

    if (usuario) {
      setUserData(usuario);
      setIsLogged(true);
      // Siempre mandamos a inicio al loguear
      navigate('/inicio');
    } else {
      alert("Acceso denegado: El correo no pertenece a la red de Chakray.");
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUserData(null);
    setCourseSelected(null);
    setCurrentPage(null);
    setAnchorEl(null);
    // Al cerrar sesión, forzamos el regreso a la raíz
    navigate('/'); 
  };

  const handleLessonComplete = (seccionId) => {
    if (!courseSelected) return;
    const key = `completado_${courseSelected.id}`;
    const completados = JSON.parse(localStorage.getItem(key) || "[]");
    if (!completados.includes(seccionId)) {
      localStorage.setItem(key, JSON.stringify([...completados, seccionId]));
      setProgresoUpdate(Date.now());
    }
  };

  const handleResetExamen = (cursoId) => {
    localStorage.removeItem(`intentos_${cursoId}`);
    setUserAnswers(prev => {
      const nuevas = { ...prev };
      Object.keys(nuevas).forEach(key => {
        if (key.startsWith(`${cursoId}_`)) delete nuevas[key];
      });
      return nuevas;
    });
    const curso = dataCursos.find(c => c.id === cursoId);
    const examenSeccion = curso?.secciones.find(s => s.tipo === 'examen');
    if (curso && examenSeccion) {
      setCourseSelected(curso);
      setCurrentPage(examenSeccion);
      setExamenEnCurso(false);
      setFiltroAvance(null);
      navigate('/curso-detalle');
    }
  };

  // --- NAVEGACIÓN ---

  const handleOpenUserMenu = (event) => !examenEnCurso && setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  const handleGoHome = () => {
    if (examenEnCurso) return;
    handleCloseUserMenu();
    setCourseSelected(null);
    setCurrentPage(null);
    setFiltroAvance(null);
    navigate('/inicio'); 
  };

  const handleVerAvanceGeneral = () => {
    setFiltroAvance(null);
    handleCloseUserMenu();
    navigate('/avance');
  };

  const esExamen = currentPage?.tipo === 'examen';
  const esRutaCurso = location.pathname === '/curso-detalle';
  const shouldShowSidebar = courseSelected && esRutaCurso && !esExamen && !examenEnCurso;

  if (!isLogged) return <Login onLogin={handleLogin} mode={mode} />;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
          
          <AppBar 
            position="static" 
            sx={{ 
              bgcolor: 'background.default', 
              color: 'text.primary', 
              boxShadow: 'none', 
              borderBottom: 1, 
              borderColor: 'divider',
              pointerEvents: examenEnCurso ? 'none' : 'auto',
              opacity: examenEnCurso ? 0.6 : 1
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {shouldShowSidebar && (
                  <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} color="inherit">
                    <MenuIcon />
                  </IconButton>
                )}
                <img 
                  src={currentLogo} 
                  alt="Logo" 
                  style={{ height: '35px', cursor: examenEnCurso ? 'default' : 'pointer' }} 
                  onClick={handleGoHome} 
                />
              </Box>

              <Box>
                <IconButton onClick={handleOpenUserMenu} color="inherit" sx={{ gap: 1 }}>
                  <ProfileIcon />
                  {!isMobile && <Typography variant="body2" sx={{ fontWeight: 700 }}>{userData?.nombre}</Typography>}
                  {!examenEnCurso && <ArrowDownIcon fontSize="small" />}
                </IconButton>
                <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseUserMenu}>
                  <MenuItem onClick={handleGoHome}>Inicio</MenuItem>
                  <MenuItem onClick={() => { navigate('/perfil'); handleCloseUserMenu(); }}>Perfil</MenuItem>
                  <MenuItem onClick={handleVerAvanceGeneral}>Resumen General</MenuItem>
                  <MenuItem onClick={() => { setMode(mode === 'dark' ? 'light' : 'dark'); handleCloseUserMenu(); }}>
                    Modo {mode === 'dark' ? 'Claro' : 'Oscuro'}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Cerrar Sesión</MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            {shouldShowSidebar && (
              <Sidebar 
                cursoActual={courseSelected} 
                activeId={currentPage?.id} 
                onSelect={setCurrentPage} 
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                progresoUpdate={progresoUpdate}
                userAnswers={userAnswers}
                onShowProgress={handleVerAvanceGeneral}
              />
            )}
            
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
              <Routes>
                <Route path="/inicio" element={
                  <Welcome 
                    cursos={dataCursos} 
                    userAnswers={userAnswers}
                    onSelectCurso={(c) => { 
                      setCourseSelected(c); 
                      setCurrentPage(c.secciones[0]); 
                      navigate('/curso-detalle'); 
                    }} 
                  />
                } />

                <Route path="/perfil" element={
                  <Perfil 
                    usuario={userData} 
                    cursos={dataCursos} 
                    userAnswers={userAnswers} 
                    onBack={handleGoHome} 
                  />
                } />

                <Route path="/avance" element={
                  <Avance 
                    cursos={dataCursos} 
                    userAnswers={userAnswers} 
                    onResetExamen={handleResetExamen}
                    onContinuar={handleGoHome}
                    cursoIdFiltrado={filtroAvance}
                  />
                } />

                <Route path="/curso-detalle" element={
                  courseSelected ? (
                    <MainContent 
                      activePage={currentPage} 
                      onSelect={setCurrentPage} 
                      cursos={dataCursos} 
                      userAnswers={userAnswers}
                      onLessonComplete={handleLessonComplete} 
                      onExamStatusChange={(status) => setExamenEnCurso(status)}
                      onSaveAnswers={(ans) => { 
                        setUserAnswers(prev => ({...prev, ...ans})); 
                        setExamenEnCurso(false);
                        setFiltroAvance(courseSelected.id);
                        navigate('/avance'); 
                      }} 
                    />
                  ) : <Navigate to="/inicio" />
                } />

                <Route path="*" element={<Navigate to="/inicio" />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;