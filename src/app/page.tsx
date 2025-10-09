'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

// Listas de opções
const foodOptions = [
  "Pizza", "Hambúrguer", "Churrasco", "Italiana", 
  "Mexicana", "Pastel", "Açaí", "Frutos do Mar", "Comida de Boteco",
  "Indiana", "Árabe", "Vegana", "Sobremesa", "Fondue"
];

const drinkOptions = [
  "Vinho", "Cerveja", "Gin Tônica", "Caipirinha",
  "Refrigerante", "Suco Natural", "Água de Coco", "Café Especial", "Chá Gelado"
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [datePlan, setDatePlan] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Estados para controlar os checkboxes
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);

  // Funções para lidar com a seleção limitada de checkboxes
  const handleFoodChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      if (selectedFoods.length < 3) {
        setSelectedFoods([...selectedFoods, value]);
      }
    } else {
      setSelectedFoods(selectedFoods.filter((food) => food !== value));
    }
  };
  
  const handleDrinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      if (selectedDrinks.length < 3) {
        setSelectedDrinks([...selectedDrinks, value]);
      }
    } else {
      setSelectedDrinks(selectedDrinks.filter((drink) => drink !== value));
    }
  };


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedFoods.length === 0) {
      setError('Por favor, escolha pelo menos uma comida.');
      return;
    }

    setIsLoading(true);
    setError('');
    setDatePlan('');

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Adiciona as seleções dos checkboxes aos dados a serem enviados
    const finalData = {
        ...data,
        foods: selectedFoods,
        drinks: selectedDrinks,
    };

    try {
      const response = await fetch('/api/generative-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Ops! Algo deu errado. Tente de novo.');
      }

      const result = await response.json();
      setDatePlan(result.plan);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-slate-800 text-white">
      <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
        
        {!submitted ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-cyan-400">Decifrando Você...</h1>
            <p className="text-center text-gray-300 mb-8">Responda com o coração e a IA fará o resto!</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* E-mail da crush */}
              <div>
                <label className="block text-lg font-medium text-gray-200 mb-3">Qual é o seu e-mail?</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  className="input-style"
                />
              </div>
              {/* Comidas */}
              <div>
                <label className="block text-lg font-medium text-gray-200 mb-3">Quais comidas te dão água na boca? (Escolha até 3)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {foodOptions.map((food) => (
                    <label key={food} className={`checkbox-label ${selectedFoods.includes(food) ? 'checked' : ''}`}>
                      <input type="checkbox" value={food} checked={selectedFoods.includes(food)} onChange={handleFoodChange} className="hidden" disabled={selectedFoods.length >= 3 && !selectedFoods.includes(food)} />
                      {food}
                    </label>
                  ))}
                </div>
              </div>

              {/* Bebidas */}
              <div>
                <label className="block text-lg font-medium text-gray-200 mb-3">O que você mais gosta de beber? (Escolha até 3)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {drinkOptions.map((drink) => (
                    <label key={drink} className={`checkbox-label ${selectedDrinks.includes(drink) ? 'checked' : ''}`}>
                      <input type="checkbox" value={drink} checked={selectedDrinks.includes(drink)} onChange={handleDrinkChange} className="hidden" disabled={selectedDrinks.length >= 3 && !selectedDrinks.includes(drink)}/>
                      {drink}
                    </label>
                  ))}
                </div>
              </div>

              {/* Perguntas abertas */}
              <div className="space-y-4">
                 <textarea required name="fds" placeholder="O que você geralmente faz nos fins de semana?" className="input-style h-24 resize-none" />
                 <textarea required name="tempoLivre" placeholder="E o que gosta de fazer no tempo livre?" className="input-style h-24 resize-none" />
              </div>

              {/* Perguntas de múltipla escolha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-200 mb-2">Qual vista te encanta mais?</label>
                  <div className="flex gap-4">
                    <label className="radio-label"><input type="radio" name="vista" value="Mar" defaultChecked className="hidden"/> Mar</label>
                    <label className="radio-label"><input type="radio" name="vista" value="Lagoa" className="hidden"/> Lagoa</label>
                  </div>
                </div>
                 <div>
                  <label className="block text-lg font-medium text-gray-200 mb-2">Qual tipo de rolê é mais a sua cara?</label>
                  <select name="role" className="input-style">
                      <option value="Calmo e intimista">Calmo e intimista</option>
                      <option value="Agitado e com música">Agitado e com música</option>
                      <option value="Em meio à natureza">Em meio à natureza</option>
                      <option value="Uma balada">Uma balada pra dançar</option>
                  </select>
                </div>
              </div>


              <button type="submit" disabled={isLoading} className="w-full bg-cyan-400 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300 ease-in-out disabled:bg-gray-500">
                {isLoading ? 'Analisando o universo...' : 'Criar nosso encontro ideal!'}
              </button>
              {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">Minha Sugestão Para Nós:</h2>
            <div className="bg-gray-900 p-6 rounded-lg whitespace-pre-wrap text-left text-gray-200">{datePlan}</div>
            <p className="mt-6 text-gray-400">E aí, o que me diz? 😉</p>
          </div>
        )}

      </div>
    </main>
  );
}