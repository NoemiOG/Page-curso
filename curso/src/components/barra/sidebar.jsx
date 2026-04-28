import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, SwipeableDrawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Box, Typography, Button,
  useMediaQuery, useTheme, Tooltip, LinearProgress 
} from '@mui/material';

// IMPORTACIONES DE ICONOS
import BookIcon from '@mui/icons-material/MenuBookTwoTone';
import FileIcon from '@mui/icons-material/AssignmentTwoTone';
import LockIcon from '@mui/icons-material/HttpsTwoTone';
import CheckIcon from '@mui/icons-material/CheckCircleTwoTone';
import ProgressIcon from '@mui/icons-material/LeaderboardTwoTone';

const Sidebar = ({ 
  cursoActual, 
  activeId, 
  onSelect, 
  open, 
  setOpen, 
  userAnswers = {}, 
  userEmail,       
  progresoUpdate   
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hovered, setHovered] = useState(false);

  const isDarkMode = theme.palette.mode === 'dark';
  const sidebarBg = isDarkMode ? '#141414' : '#F8F9FA';
  const activeRed = '#E11F26';

  const miniWidth = 88;
  const expandedWidth = 280; 

  // --- LÓGICA DE PROGRESO INTEGRADA ---
  const leccionesVistas = useMemo(() => {
    if (!cursoActual || !userEmail) return [];
    const storageKey = `completado_${cursoActual.id}_${userEmail}`;
    const guardado = localStorage.getItem(storageKey);
    return guardado ? JSON.parse(guardado) : [];
  }, [cursoActual?.id, userEmail, progresoUpdate]);

  const leccionesTeoricas = useMemo(() => 
    cursoActual?.secciones.filter(s => s.tipo !== 'examen') || [], 
  [cursoActual]);

  const totalTeoria = leccionesTeoricas.length;
  const totalCompletadas = leccionesTeoricas.filter(s => leccionesVistas.includes(s.id)).length;
  
  const porcentajeBarra = totalTeoria > 0 ? (totalCompletadas / totalTeoria) * 100 : 0;
  const cursoTeoricoCompletado = totalCompletadas === totalTeoria;

  // Verificar si ya aprobó el examen de este curso (80% o más)
  const yaAproboExamen = useMemo(() => {
    if (!cursoActual) return false;
    const puntaje = userAnswers[`puntaje_${cursoActual.id}_${userEmail}`];
    return puntaje >= 80;
  }, [cursoActual?.id, userAnswers, userEmail]);

  if (!cursoActual) return null;

  const drawerContent = (isMenuExpanded) => (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', height: '100%',
      width: isMenuExpanded ? expandedWidth : miniWidth,
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
      overflowX: 'hidden', bgcolor: sidebarBg, p: 2 
    }}>
      
      {/* HEADER DE PROGRESO */}
      <Box sx={{ 
        mb: 3, p: isMenuExpanded ? 2 : 1, borderRadius: '16px',
        bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        textAlign: 'center',
        minHeight: '90px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {isMenuExpanded ? (
          <>
            <Typography variant="overline" sx={{ fontWeight: 800, color: activeRed, lineHeight: 1.2, display: 'block', mb: 1 }}>
              PROGRESO MÓDULO
            </Typography>
            <LinearProgress 
              variant="determinate" value={porcentajeBarra} 
              sx={{ 
                height: 10, borderRadius: 5, mb: 1, 
                bgcolor: isDarkMode ? '#333' : '#eee', 
                '& .MuiLinearProgress-bar': { bgcolor: activeRed, borderRadius: 5 } 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{Math.round(porcentajeBarra)}%</Typography>
          </>
        ) : (
          <Tooltip title={`${Math.round(porcentajeBarra)}% completado`} placement="right">
            <Box>
                <ProgressIcon sx={{ color: activeRed, mx: 'auto', fontSize: '1.8rem' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mt: 0.5 }}>
                  {Math.round(porcentajeBarra)}%
                </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      
      <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', '&::-webkit-scrollbar': { width: '4px' } }}>
        {cursoActual.secciones.map((seccion) => {
          const esExamen = seccion.tipo === 'examen';
          const yaVista = leccionesVistas.includes(seccion.id);
          const esActivo = activeId === seccion.id;
          
          // REGLA: Bloqueado si falta teoría O si ya aprobó el examen
          const estaBloqueado = esExamen && (!cursoTeoricoCompletado || yaAproboExamen);

          // Tooltip dinámico según el estado
          const tooltipMensaje = estaBloqueado 
            ? (yaAproboExamen ? "Evaluación ya aprobado" : "Completa la teoría para desbloquear") 
            : (isMenuExpanded ? "" : seccion.tituloTema);

          return (
            <ListItem key={seccion.id} disablePadding sx={{ mb: 1, display: 'block' }}>
              <Tooltip 
                title={tooltipMensaje} 
                placement="right"
                disableHoverListener={isMenuExpanded && !estaBloqueado}
              >
                <ListItemButton 
                  disabled={estaBloqueado}
                  selected={esActivo}
                  onClick={() => {
                    onSelect(seccion);
                    if (isMobile) setOpen(false); 
                  }}
                  sx={{ 
                    borderRadius: '14px', minHeight: 54, 
                    px: isMenuExpanded ? 2 : 1,
                    justifyContent: isMenuExpanded ? 'initial' : 'center',
                    '&.Mui-selected': { 
                      backgroundColor: 'rgba(225, 31, 38, 0.12)', 
                      color: activeRed,
                      '& .MuiListItemIcon-root': { color: activeRed },
                    },
                    '&.Mui-disabled': { opacity: 0.5 }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0, mr: isMenuExpanded ? 2 : 0, justifyContent: 'center',
                    color: esActivo ? activeRed : (yaAproboExamen || yaVista ? '#2ecc71' : 'text.secondary')
                  }}>
                    {esExamen ? (
                      yaAproboExamen ? <CheckIcon /> : 
                      estaBloqueado ? <LockIcon sx={{ fontSize: '1.2rem' }} /> : <FileIcon />
                    ) : (
                      yaVista ? <CheckIcon /> : <BookIcon />
                    )}
                  </ListItemIcon>
                  
                  {isMenuExpanded && (
                    <ListItemText 
                      primary={seccion.tituloTema}
                      secondary={esExamen && yaAproboExamen ? "Aprobado" : null}
                      primaryTypographyProps={{
                        sx: { 
                          fontSize: '0.82rem', 
                          fontWeight: esActivo ? 800 : 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: esExamen && yaAproboExamen ? '#2ecc71' : 'inherit'
                        }
                      }}
                    />
                  )}                 
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* BOTÓN RESUMEN GENERAL */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Tooltip title={isMenuExpanded ? "" : "Ver mi rendimiento"} placement="right">
          <Button
            fullWidth 
            variant="outlined"
            onClick={() => navigate('/avance')}
            sx={{
              height: 56, borderRadius: '14px', 
              borderColor: isDarkMode ? '#444' : '#e0e0e0',
              color: isDarkMode ? '#fff' : '#444', 
              textTransform: 'none',
              minWidth: 0,
              px: isMenuExpanded ? 2 : 0,
              justifyContent: isMenuExpanded ? 'flex-start' : 'center',
              '&:hover': { 
                borderColor: activeRed, 
                color: activeRed,
                bgcolor: 'rgba(225, 31, 38, 0.05)'
              }
            }}
          >
            <ProgressIcon />
            {isMenuExpanded && (
              <Typography sx={{ ml: 2, fontWeight: 800, fontSize: '0.75rem' }}>
                RESUMEN GENERAL
              </Typography>
            )}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left" open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)}
        sx={{ '& .MuiDrawer-paper': { bgcolor: sidebarBg, width: expandedWidth, backgroundImage: 'none' } }}
      >
        {drawerContent(true)}
      </SwipeableDrawer>
    );
  }

  const currentWidth = open ? (hovered ? expandedWidth : miniWidth) : 0;

  return (
    <Drawer
      variant="persistent" 
      open={open} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
      sx={{
        width: currentWidth, 
        flexShrink: 0, 
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: currentWidth, 
          position: 'relative', 
          height: '100%',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
          overflowX: 'hidden',
          bgcolor: sidebarBg, 
          backgroundImage: 'none', 
          borderRight: `1px solid ${isDarkMode ? '#222' : '#e0e0e0'}`
        },
      }}
    >
      {drawerContent(hovered)}
    </Drawer>
  );
};

export default Sidebar;