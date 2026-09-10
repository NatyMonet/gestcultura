import { createContext, useState, useEffect } from 'react';

export const ModoEmpaticContext = createContext();

export const ModoEmpaticProvider = ({ children }) => {
  const [modoEmpatico, setModoEmpatico] = useState(false);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoEmpatico');
    if (modoGuardado) setModoEmpatico(JSON.parse(modoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem('modoEmpatico', JSON.stringify(modoEmpatico));
  }, [modoEmpatico]);

  const toggleModo = () => setModoEmpatico(!modoEmpatico);

  return (
    <ModoEmpaticContext.Provider value={{ modoEmpatico, setModoEmpatico, toggleModo }}>
      {children}
    </ModoEmpaticContext.Provider>
  );
};