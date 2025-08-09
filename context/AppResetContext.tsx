import React, { createContext, useContext, useState } from 'react';

const AppResetContext = createContext({ resetApp: () => {} });

export const useAppReset = () => useContext(AppResetContext);

export const AppResetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [appKey, setAppKey] = useState(0);

  const resetApp = () => setAppKey(prev => prev + 1);

  return (
    <AppResetContext.Provider value={{ resetApp }}>
      {React.cloneElement(children as React.ReactElement, { key: appKey })}
    </AppResetContext.Provider>
  );
};
