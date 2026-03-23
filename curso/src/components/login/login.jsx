import { useState } from 'react';
import styles from './login.module.sass';
import logoChakray from '../../assets/logo.jpeg';


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validarEmail = (e) => {
    const valor = e.target.value;
    setEmail(valor);
    
    //Validacion mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(regex.test(valor) || valor === '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && email !== '') {
      onLogin(email);
    }
  };

  return (
    
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
                  <img src={logoChakray} alt="Chakray Logo" className={styles.logo} />
                </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>✉️</span>
            <input 
              type="email"
              placeholder="mike@chakray.com" 
              value={email}
              onChange={validarEmail}
              // Detecta error
              className={!isValid ? styles.errorInput : ''}
              required 
            />
          </div>
          
          {!isValid && <p className={styles.errorText}>Email no válido</p>}

          <button type="submit" className={styles.btnAcceder}>
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;