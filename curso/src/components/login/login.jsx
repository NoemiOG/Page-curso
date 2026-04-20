import { useState } from 'react';
import styles from './login.module.sass';
import logoChakrayLight from '../../assets/chakraylogo.png'; 
import logoChakrayDark from '../../assets/logo.png'; 

const Login = ({ onLogin, mode }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

const currentLogo = mode === 'dark' ? logoChakrayDark : logoChakrayLight;

  const validarEmail = (e) => {
    const valor = e.target.value;
    setEmail(valor);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(regex.test(valor) || valor === '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && email !== '') onLogin(email);
  };

  return (
    /* Agregamos data-theme aquí para que el fondo cambie a oscuro si mode es dark */
    <div className={styles.container} data-theme={mode}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={currentLogo} alt="Chakray Logo" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>✉️</span>
            <input 
              type="email"
              placeholder="mike@chakray.com" 
              value={email}
              onChange={validarEmail}
              className={!isValid ? styles.errorInput : ''}
              required 
            />
          </div>
          {!isValid && <p className={styles.errorText}>Email no válido</p>}
          <button type="submit" className={styles.btnAcceder}>INGRESAR</button>
        </form>
      </div>
    </div>
  );
};

export default Login;