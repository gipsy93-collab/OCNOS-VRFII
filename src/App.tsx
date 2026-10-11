import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-white/10 p-8 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-3xl font-bold mb-4 font-fredoka">Ocnos Transmedia</h1>
        <p className="text-lg font-nunito">Plataforma interactiva de la Revista OCNOS.</p>
        <div className="mt-6">
          <p className="text-sm opacity-80">El frontend está listo para conectarse al backend refactorizado.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
