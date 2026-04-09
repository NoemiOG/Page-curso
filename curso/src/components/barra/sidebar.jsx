import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, IconButton, Box, Typography, Divider, Button, 
  useMediaQuery, useTheme 
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  Book as BookIcon, 
  Description as FileIcon, 
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  BarChart as ProgressIcon 
} from '@mui/icons-material';

const Sidebar = ({ cursoActual, activeId, onSelect, onShowProgress, open, setOpen, userAnswers = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 280;

  if (!cursoActual) return null;

  // Lógica de estado y persistencia (Se mantienen igual)
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
        // ESTA PARTE ES CRÍTICA PARA EL POSICIONAMIENTO INTERNO
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper', 
          color: 'text.primary',
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: 'hidden', 
          display: 'flex',
          flexDirection: 'column',
          
          /* Ajustes para que no invada Header ni Footer */
          position: isMobile ? 'fixed' : 'relative', // En mobile sigue siendo fixed, en desktop es relativo
          height: '100%', // Ocupa el 100% del Box central del App.jsx
          zIndex: 1, // Por debajo del AppBar
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
          {cursoActual.titulo}
        </Typography>
      </Box>
      
      <Divider />

      <List sx={{ flexGrow: 1, px: 1, mt: 1, overflowY: 'auto' }}>
        {cursoActual.secciones.map((seccion) => {
          const esExamen = seccion.tipo === 'examen';
          if (esExamen && aprobado) return null;
          const bloqueado = esExamen && !todoRevisado;
          const yaVista = leccionesVistas.includes(seccion.id);

          return (
            <ListItem key={seccion.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                disabled={bloqueado}
                selected={activeId === seccion.id}
                onClick={() => onSelect(seccion)}
                sx={{ borderRadius: '8px' }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  {bloqueado ? <LockIcon fontSize="small" /> : 
                   esExamen ? <FileIcon fontSize="small" /> : 
                   yaVista ? <CheckIcon fontSize="small" color="success" /> : <BookIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText 
                  primary={seccion.label || seccion.tituloTema} 
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ProgressIcon />}
          onClick={onShowProgress}
          sx={{
            py: 1.5,
            fontWeight: 800,
            borderRadius: '10px',
            bgcolor: aprobado ? '#2ecc71' : '#E11F26',
            '&:hover': { bgcolor: aprobado ? '#27ae60' : '#b0181d' }
          }}
        >
          {aprobado ? "Curso Completado" : "Mi Progreso"}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;