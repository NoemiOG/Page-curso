import { useState } from 'react';
import styles from './login.module.sass';
import logoChakray from '../../assets/chakraylogo.png';

/**
 * Componente funcional encargado de la interfaz de acceso (Login).
 * Gestiona la captura del correo electrónico del usuario y su validación previa al ingreso.
 */
const Login = ({ onLogin }) => {
  // Define el estado para almacenar el valor textual del correo electrónico.
  const [email, setEmail] = useState('');
  
  // Define el estado booleano para determinar si el formato del correo es válido.
  const [isValid, setIsValid] = useState(true);

  /**
   * Procesa el cambio en el campo de entrada y ejecuta la lógica de validación.
   * Utiliza una expresión regular para verificar que el formato cumpla con los estándares de un email.
   */
  const validarEmail = (e) => {
    const valor = e.target.value;
    setEmail(valor);
    
    // Implementación de expresión regular para la validación de sintaxis de correo electrónico.
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    /**
     * Actualiza el estado de validez. 
     * Se considera válido si cumple con la expresión regular o si el campo se encuentra vacío.
     */
    setIsValid(regex.test(valor) || valor === '');
  };

  /**
   * Maneja el evento de envío del formulario.
   * Valida que el correo sea sintácticamente correcto y que el campo no esté vacío antes de proceder.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto de recarga de página.
    
    if (isValid && email !== '') {
      // Ejecuta la función de callback proporcionada por el componente padre para autenticar al usuario.
      onLogin(email);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Sección de identidad corporativa que muestra el logotipo de la organización */}
        <div className={styles.header}>
          <img src={logoChakray} alt="Chakray Logo" className={styles.logo} />
        </div>

        {/* Formulario de captura de credenciales */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>✉️</span>
            <input 
              type="email"
              placeholder="mike@chakray.com" 
              value={email}
              onChange={validarEmail}
              /**
               * Aplicación condicional de estilos de error.
               * Modifica la apariencia visual del campo si el estado de validez es negativo.
               */
              className={!isValid ? styles.errorInput : ''}
              required 
            />
          </div>
          
          {/* Renderizado condicional de mensajes de error basado en el estado de validación */}
          {!isValid && <p className={styles.errorText}>Email no válido</p>}

          {/* Botón de acción principal para procesar el acceso */}
          <button type="submit" className={styles.btnAcceder}>
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;