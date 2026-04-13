import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, IconButton, Box, Typography, Divider, Button, 
  useMediaQuery, useTheme, Tooltip 
} from '@mui/material';
import { 
  Book as BookIcon, 
  Description as FileIcon, 
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  BarChart as ProgressIcon 
} from '@mui/icons-material';

const Sidebar = ({ cursoActual, activeId, onSelect, onShowProgress, open, setOpen, userAnswers = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Definimos un ancho mucho más pequeño para que parezca una barra de herramientas
  const drawerWidth = 80; 

  if (!cursoActual) return null;

  // Lógica de validación de examen
  const calcularEstadoExamen = () => {
    const examen = cursoActual.secciones.find(s => s.tipo === 'examen');
    if (!examen) return { aprobado: false };
    let aciertos = 0;
    examen.preguntas.forEach(p => {
      const key = `${cursoActual.id}_${p.id}`;
      if (userAnswers[key] === p.respuestaCorrecta) aciertos++;
    });
    const porcentaje = (aciertos / examen.preguntas.length) * 100;
    return { aprobado: porcentaje >= 80 };
  };

  const { aprobado } = calcularEstadoExamen();

  // Lógica de persistencia de lecciones
  const checkLeccionesCompletadas = () => {
    const guardado = localStorage.getItem(`completado_${cursoActual.id}`);
    const completadas = guardado ? JSON.parse(guardado) : [];
    if (activeId && !completadas.includes(activeId)) {
      const examen = cursoActual.secciones.find(s => s.tipo === 'examen');
      if (activeId !== examen?.id) {
        const nuevoHistorial = [...completadas, activeId];
        localStorage.setItem(`completado_${cursoActual.id}`, JSON.stringify(nuevoHistorial));
        return nuevoHistorial;
      }
    }
    return completadas;
  };

  const leccionesVistas = checkLeccionesCompletadas();
  const leccionesTeoricas = cursoActual.secciones.filter(s => s.tipo !== 'examen');
  const todoRevisado = leccionesTeoricas.every(s => leccionesVistas.includes(s.id));

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"} 
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: open ? drawerWidth : 0, 
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper', 
          color: 'text.primary',
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: 'hidden', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Centramos los iconos
          position: isMobile ? 'fixed' : 'relative',
          height: '100%',
          zIndex: 1,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Título del curso (Opcional, podrías quitarlo para más limpieza) */}
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase' }}>
          Curso
        </Typography>
      </Box>
      
      <Divider sx={{ width: '80%' }} />

      <List sx={{ flexGrow: 1, px: 1, mt: 1, width: '100%' }}>
        {cursoActual.secciones.map((seccion) => {
          const esExamen = seccion.tipo === 'examen';
          if (esExamen && aprobado) return null;
          const bloqueado = esExamen && !todoRevisado;
          const yaVista = leccionesVistas.includes(seccion.id);

          return (
            <ListItem key={seccion.id} disablePadding sx={{ mb: 1.5, justifyContent: 'center' }}>
              <Tooltip title={seccion.label || seccion.tituloTema} placement="right" arrow>
                <ListItemButton 
                  disabled={bloqueado}
                  selected={activeId === seccion.id}
                  onClick={() => onSelect(seccion)}
                  sx={{ 
                    borderRadius: '12px', 
                    justifyContent: 'center',
                    minWidth: '50px',
                    height: '50px',
                    p: 0,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                    {bloqueado ? <LockIcon fontSize="small" /> : 
                     esExamen ? <FileIcon fontSize="small" /> : 
                     yaVista ? <CheckIcon fontSize="small" color={activeId === seccion.id ? "inherit" : "success"} /> : 
                     <BookIcon fontSize="small" />}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Botón de Progreso Flotante al final */}
      <Box sx={{ p: 1.5, pb: 3 }}>
        <Tooltip title={aprobado ? "Curso Completado" : "Mi Progreso"} placement="right" arrow>
          <IconButton
            onClick={onShowProgress}
            sx={{
              width: 50,
              height: 50,
              bgcolor: aprobado ? '#2ecc71' : '#E11F26',
              color: 'white',
              '&:hover': { bgcolor: aprobado ? '#27ae60' : '#b0181d' },
              boxShadow: 3
            }}
          >
            <ProgressIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;