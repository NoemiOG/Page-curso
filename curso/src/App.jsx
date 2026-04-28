import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; 
import { useState, useMemo, useEffect } from 'react';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  useMediaQuery, AppBar, Toolbar, Box, IconButton, CssBaseline,
  Menu, MenuItem, Divider, Typography, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';

// Componentes
import Login from './components/login/login'; 
import Sidebar from './components/barra/sidebar';
import MainContent from './components/presentation/MainContent';
import Welcome from './components/Bienvenida/Bienvenida'; 
import Avance from './components/examen/Avance'; 
import Perfil from './components/Perfil/Perfil';

// Assets
import logoChakray from './assets/chakraylogo.png'; 
import logoChakraydark from './assets/logo.png'; 

const USUARIOS_AUTORIZADOS = [
  { nombre: "Ingeniño", email: "ingeniero@chakray.com" },
  { nombre: "El Inge", email: "elinge@chakray.com" },
  { nombre: "Admin", email: "admin@chakray.com" },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dataCursos, setDataCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light'); 
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [courseSelected, setCourseSelected] = useState(null); 
  const [currentPage, setCurrentPage] = useState(null);       
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [progresoUpdate, setProgresoUpdate] = useState(Date.now());
  const [examenEnCurso, setExamenEnCurso] = useState(false);
  const [filtroAvance, setFiltroAvance] = useState(null);

  const isMobile = useMediaQuery('(max-width:900px)');

  // 1. CARGA DE DATOS
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const res = await fetch('/datos/cursos.json');
        const indice = await res.json();
        const detallesPromesas = indice.map(async (curso) => {
          const resDetalle = await fetch(`/datos/${curso.archivo}`);
          const detalle = await resDetalle.json();
          return { ...curso, ...detalle }; 
        });
        const cursosCompletos = await Promise.all(detallesPromesas);
        setDataCursos(cursosCompletos);
        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setIsLoading(false);
      }
    };
    cargarTodo();
  }, []);

  // 2. TEMA
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  // 3. PERSISTENCIA
  useEffect(() => {
    if (isLogged && userData) {
      const saved = localStorage.getItem(`answers_${userData.email}`);
      if (saved) setUserAnswers(JSON.parse(saved));
    }
  }, [isLogged, userData]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      primary: { main: '#E11F26' },
      background: {
        default: mode === 'dark' ? '#111111' : '#FFFFFF',
        paper: mode === 'dark' ? '#49494A' : '#EDEDED',
      },
    },
  }), [mode]);

  // --- MANEJADORES ---

  const handleLogin = (emailIngresado) => {
    const usuario = USUARIOS_AUTORIZADOS.find(u => u.email.toLowerCase() === emailIngresado.toLowerCase());
    if (usuario) {
      setUserData(usuario);
      setIsLogged(true);
      navigate('/inicio');
    }
  };

  const handleLogout = () => {
    setAnchorEl(null);
    setIsLogged(false);
    setUserData(null);
    setUserAnswers({});
    setCourseSelected(null); 
    setCurrentPage(null);    
    setExamenEnCurso(false); 
    setFiltroAvance(null);
    navigate('/'); 
  };

  const handleLessonComplete = (seccionId) => {
    if (!courseSelected || !userData) return;
    const key = `completado_${courseSelected.id}_${userData.email}`;
    const completados = JSON.parse(localStorage.getItem(key) || "[]");
    if (!completados.includes(seccionId)) {
      const nuevosCompletados = [...completados, seccionId];
      localStorage.setItem(key, JSON.stringify(nuevosCompletados));
      setProgresoUpdate(Date.now());
    }
  };

  const handleResetExamen = (cursoId) => {
    if (!userData) return;
    const sId = String(cursoId);
    const keyIntentos = `intentos_${sId}_${userData.email}`;
    const intentos = parseInt(localStorage.getItem(keyIntentos) || "0");
    if (intentos >= 3) return;

    setUserAnswers(prev => {
      const nuevas = { ...prev };
      Object.keys(nuevas).forEach(key => {
        if (key.startsWith(`${sId}_`)) delete nuevas[key];
      });
      delete nuevas[`puntaje_${sId}_${userData.email}`];
      localStorage.setItem(`answers_${userData.email}`, JSON.stringify(nuevas));
      return nuevas;
    });

    const curso = dataCursos.find(c => String(c.id) === sId);
    if (curso) {
      setCourseSelected(curso);
      const examSec = curso.secciones?.find(s => s.tipo === 'examen');
      setCurrentPage(examSec || curso.secciones[0]);
      setExamenEnCurso(false);
      navigate('/curso-detalle');
    }
  };

  const handleGoHome = () => {
    if (examenEnCurso) return;
    setAnchorEl(null);
    setCourseSelected(null);
    setCurrentPage(null);
    setFiltroAvance(null);
    navigate('/inicio'); 
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#111' }}>
      <CircularProgress sx={{ color: '#E11F26' }} />
    </Box>
  );

  if (!isLogged) return <Login onLogin={handleLogin} mode={mode} />;

  const shouldShowSidebar = courseSelected && location.pathname === '/curso-detalle' && !examenEnCurso;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          
          <AppBar position="static" sx={{ bgcolor: 'background.default', color: 'text.primary', boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {shouldShowSidebar && (
                  <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} color="inherit"><MenuIcon /></IconButton>
                )}
                <img 
                  src={mode === 'dark' ? logoChakraydark : logoChakray} 
                  alt="Logo" 
                  style={{ height: '35px', cursor: 'pointer' }} 
                  onClick={handleGoHome} 
                />
              </Box>

              <Box>
                <IconButton onClick={(e) => !examenEnCurso && setAnchorEl(e.currentTarget)} color="inherit"
                  sx={{ borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <ProfileIcon />
                  {!isMobile && <Typography variant="body2" sx={{ ml: 1, fontWeight: 700 }}>{userData?.nombre}</Typography>}
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={handleGoHome}>Inicio</MenuItem>
                  <MenuItem onClick={() => { navigate('/perfil'); setAnchorEl(null); }}>Perfil</MenuItem>
                  <MenuItem onClick={() => { setMode(mode === 'dark' ? 'light' : 'dark'); setAnchorEl(null); }}>
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
                userEmail={userData?.email}
              />
            )}
            
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Routes>
                <Route path="/inicio" element={
                  <Welcome 
                    cursos={dataCursos} 
                    userAnswers={userAnswers}
                    userEmail={userData?.email}
                    progresoUpdate={progresoUpdate}
                    onSelectCurso={(curso) => { 
                      setCourseSelected(curso); 
                      setCurrentPage(curso.secciones[0]); 
                      navigate('/curso-detalle'); 
                    }} 
                  />
                } />

                <Route path="/perfil" element={<Perfil usuario={userData} cursos={dataCursos} userAnswers={userAnswers} onBack={handleGoHome} />} />
                
                <Route path="/avance" element={
                  <Avance 
                    cursos={dataCursos} 
                    userAnswers={userAnswers} 
                    onResetExamen={handleResetExamen}
                    onContinuar={handleGoHome}
                    cursoIdFiltrado={filtroAvance}
                    userEmail={userData?.email}
                  />
                } />

                <Route path="/curso-detalle" element={
                  courseSelected ? (
                    <MainContent 
                      activePage={currentPage} 
                      onSelect={setCurrentPage} 
                      cursoActual={courseSelected} 
                      userAnswers={userAnswers}
                      userEmail={userData?.email}
                      onLessonComplete={handleLessonComplete} 
                      onExamStatusChange={(status) => setExamenEnCurso(status)}
                      progresoUpdate={progresoUpdate}
                      onSaveAnswers={(ans, puntaje) => { 
                        const cId = String(courseSelected.id);
                        const keyIntentos = `intentos_${cId}_${userData.email}`;
                        const intentosActuales = parseInt(localStorage.getItem(keyIntentos) || "0");
                        
                        if (puntaje < 80) {
                          localStorage.setItem(keyIntentos, (intentosActuales + 1).toString());
                        }

                        const nuevasRespuestas = {
                          ...userAnswers,
                          ...ans,
                          [`puntaje_${cId}_${userData.email}`]: puntaje
                        };
                        
                        setUserAnswers(nuevasRespuestas); 
                        localStorage.setItem(`answers_${userData.email}`, JSON.stringify(nuevasRespuestas));
                        
                        setExamenEnCurso(false);
                        setFiltroAvance(cId);
                        setProgresoUpdate(Date.now());
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