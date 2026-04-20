import React, { useState } from 'react';
import { 
  Drawer, SwipeableDrawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Box, Typography, Divider, Button,
  useMediaQuery, useTheme, Tooltip, LinearProgress 
} from '@mui/material';
import { 
  MenuBookTwoTone as BookIcon, 
  AssignmentTwoTone as FileIcon, 
  HttpsTwoTone as LockIcon,
  CheckCircleTwoTone as CheckIcon,
  LeaderboardTwoTone as ProgressIcon,
  CancelTwoTone as BlockIcon 
} from '@mui/icons-material';

const Sidebar = ({ cursoActual, activeId, onSelect, onShowProgress, open, setOpen, userAnswers = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hovered, setHovered] = useState(false);

  const isDarkMode = theme.palette.mode === 'dark';
  const sidebarBg = isDarkMode ? '#141414' : '#F8F9FA';
  const activeRed = '#E11F26';
  const glassEffect = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(225, 31, 38, 0.04)';

  const miniWidth = 88;
  const expandedWidth = 280; 

  if (!cursoActual) return null;

  // --- LÓGICA DE PROGRESO Y BLOQUEO ---
  const guardado = localStorage.getItem(`completado_${cursoActual.id}`);
  const leccionesVistas = guardado ? JSON.parse(guardado) : [];
  
  const leccionesTeoricas = cursoActual.secciones.filter(s => s.tipo !== 'examen');
  const totalTeoria = leccionesTeoricas.length;
  const totalCompletadas = leccionesTeoricas.filter(s => leccionesVistas.includes(s.id)).length;
  
  // 1. ¿Completó toda la teoría?
  const cursoCompletado = totalCompletadas === totalTeoria;

  // 2. ¿Aprobó el examen? (Cálculo basado en tus respuestas guardadas)
  const examenSeccion = cursoActual.secciones.find(s => s.tipo === 'examen');
  
  const calcularAprobado = () => {
    if (!examenSeccion || !examenSeccion.preguntas) return false;
    let aciertos = 0;
    examenSeccion.preguntas.forEach(p => {
      const key = `${cursoActual.id}_${p.id}`;
      if (userAnswers[key] == p.respuestaCorrecta) aciertos++;
    });
    const promedio = (aciertos / examenSeccion.preguntas.length) * 100;
    return promedio >= 80;
  };

  const yaAproboExamen = calcularAprobado();
  const porcentajeBarra = totalTeoria > 0 ? (totalCompletadas / totalTeoria) * 100 : 0;

  const drawerContent = (isMenuExpanded) => (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', height: '100%',
      width: isMenuExpanded ? expandedWidth : miniWidth,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
      overflowX: 'hidden', bgcolor: sidebarBg, p: 2 
    }}>
      {/* HEADER DE PROGRESO */}
      <Box sx={{ 
        mb: 3, p: isMenuExpanded ? 2 : 1, borderRadius: '16px',
        bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        textAlign: 'center'
      }}>
        {isMenuExpanded ? (
          <>
            <Typography variant="overline" sx={{ fontWeight: 800, color: activeRed }}>Tu Progreso</Typography>
            <Box sx={{ mt: 1, mb: 1 }}>
              <LinearProgress 
                variant="determinate" value={porcentajeBarra} 
                sx={{ height: 8, borderRadius: 5, bgcolor: isDarkMode ? '#333' : '#eee', '& .MuiLinearProgress-bar': { bgcolor: activeRed } }} 
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{Math.round(porcentajeBarra)}%</Typography>
          </>
        ) : (
          <ProgressIcon sx={{ color: activeRed }} />
        )}
      </Box>
      
      <List sx={{ flexGrow: 1 }}>
        {cursoActual.secciones.map((seccion) => {
          const esExamen = seccion.tipo === 'examen';
          const yaVista = leccionesVistas.includes(seccion.id);
          const esActivo = activeId === seccion.id;

          // --- LÓGICA DE DESHABILITADO ---
          // Bloqueado si: es examen y no acabó la teoría O si es examen y ya aprobó.
          const estaBloqueado = esExamen && (!cursoCompletado || yaAproboExamen);

          return (
            <ListItem key={seccion.id} disablePadding sx={{ mb: 1 }}>
              <Tooltip 
                title={estaBloqueado && yaAproboExamen ? "Examen aprobado" : estaBloqueado ? "Completa los temas para desbloquear" : ""} 
                placement="right"
              >
                <span> {/* Span necesario para que el Tooltip funcione en elementos disabled */}
                  <ListItemButton 
                    disabled={estaBloqueado}
                    selected={esActivo}
                    onClick={() => {
                      onSelect(seccion);
                      if (isMobile) setOpen(false); 
                    }}
                    sx={{ 
                      borderRadius: '14px', minHeight: 54, 
                      px: isMenuExpanded ? 2 : 0,
                      justifyContent: isMenuExpanded ? 'initial' : 'center',
                      '&.Mui-selected': { 
                        backgroundColor: 'rgba(225, 31, 38, 0.1)', 
                        color: activeRed,
                        borderLeft: `4px solid ${activeRed}`,
                        '& .MuiListItemIcon-root': { color: activeRed },
                      },
                      '&.Mui-disabled': { opacity: 0.5 }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 0, mr: isMenuExpanded ? 2 : 0, justifyContent: 'center',
                      color: esActivo ? activeRed : (yaVista ? '#2ecc71' : 'text.secondary')
                    }}>
                      {/* ICONO DINÁMICO SEGÚN ESTADO */}
                      {esExamen ? (
                        yaAproboExamen ? <CheckIcon color="success" /> : 
                        estaBloqueado ? <LockIcon /> : <FileIcon />
                      ) : (
                        yaVista ? <CheckIcon /> : <BookIcon />
                      )}
                    </ListItemIcon>
                    
                    {isMenuExpanded && (
                      <ListItemText 
                        primary={seccion.label || seccion.tituloTema}
                        slotProps={{ primary: { sx: { 
                          fontSize: '0.85rem', 
                          fontWeight: esActivo ? 700 : 500,
                          color: estaBloqueado ? 'text.disabled' : 'inherit'
                        }}}}
                      />
                    )}                 
                  </ListItemButton>
                </span>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button
          fullWidth onClick={onShowProgress} variant="outlined"
          sx={{
            height: 56, borderRadius: '14px', borderColor: isDarkMode ? '#333' : '#e0e0e0',
            color: isDarkMode ? '#fff' : '#444', textTransform: 'none',
            '&:hover': { borderColor: activeRed, color: activeRed }
          }}
        >
          <ProgressIcon />
          {isMenuExpanded && <Typography sx={{ ml: 2, fontWeight: 800, fontSize: '0.8rem' }}>RESUMEN GENERAL</Typography>}
        </Button>
      </Box>
    </Box>
  );

  // ... Resto del código (Return de Mobile y Desktop) igual que el anterior
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left" open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)}
        sx={{ '& .MuiDrawer-paper': { bgcolor: sidebarBg, border: 'none', width: 280, backgroundImage: 'none', boxSizing: 'border-box' } }}
      >
        {drawerContent(true)}
      </SwipeableDrawer>
    );
  }

  const desktopWidth = open ? (hovered ? expandedWidth : miniWidth) : 0;

  return (
    <Drawer
      variant="persistent" open={open} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      sx={{
        width: desktopWidth, flexShrink: 0, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: desktopWidth, position: 'relative', height: '100%',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden', borderRight: `1px solid ${isDarkMode ? '#222' : '#e0e0e0'}`,
          bgcolor: sidebarBg, backgroundImage: 'none'
        },
      }}
    >
      {drawerContent(hovered)}
    </Drawer>
  );
};

export default Sidebar;