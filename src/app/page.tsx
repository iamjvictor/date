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
  const [showForm, setShowForm] = useState(false);

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-white text-gray-800">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-pink-200">
        
        {!showForm ? (
          // Tela inicial romântica
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-pink-500">💕</h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-pink-600">Oi, Lara!</h2>
            </div>
            
            <div className="space-y-6 mb-8">
              <p className="text-xl text-gray-700 leading-relaxed">
                Tenho uma proposta especial para você... 
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Que tal criarmos um encontro perfeito juntos? 
                Vou usar uma IA super inteligente para planejar algo único, 
                baseado nas suas preferências e no seu jeito especial de ser.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                É só você me contar um pouquinho sobre você, 
                e eu vou criar um plano incrível para nós dois! ✨
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setShowForm(true)}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Vamos criar nosso encontro! 💖
              </button>
              <p className="text-sm text-gray-500 italic">
                Prometo que vai ser divertido e surpreendente! 😉
              </p>
            </div>
          </div>
        ) : !submitted ? (
          // Formulário
          <>
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setShowForm(false)}
                className="text-pink-500 hover:text-pink-600 font-medium transition duration-200"
              >
                ← Voltar
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-pink-500">Decifrando Você...</h1>
            <p className="text-center text-gray-600 mb-8">Responda com o coração e a IA fará o resto!</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Nome */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Qual é o seu nome?</label>
                <input
                  required
                  type="text"
                  name="nome"
                  placeholder="Seu nome aqui"
                  className="input-style"
                />
              </div>
              
              {/* E-mail da crush */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Qual é o seu e-mail?</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  className="input-style"
                />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Qual o melhor dia para você?</label>
                  <input
                    required
                    type="date"
                    name="data"
                    className="input-style"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">E o melhor horário?</label>
                  <input
                    required
                    type="time"
                    name="hora"
                    className="input-style"
                  />
                </div>
              </div>
              {/* Comidas */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Quais comidas te dão água na boca? (Escolha até 3)</label>
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
                <label className="block text-lg font-medium text-gray-700 mb-3">O que você mais gosta de beber? (Escolha até 3)</label>
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
                  <label className="block text-lg font-medium text-gray-700 mb-2">Qual vista te encanta mais?</label>
                  <div className="flex gap-4">
                    <label className="radio-label"><input type="radio" name="vista" value="Mar" defaultChecked className="hidden"/> Mar</label>
                    <label className="radio-label"><input type="radio" name="vista" value="Lagoa" className="hidden"/> Lagoa</label>
                  </div>
                </div>
                 <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Qual tipo de rolê é mais a sua cara?</label>
                  <select name="role" className="input-style">
                      <option value="Calmo e intimista">Calmo e intimista</option>
                      <option value="Agitado e com música">Agitado e com música</option>
                      <option value="Em meio à natureza">Em meio à natureza</option>
                      <option value="Uma balada">Uma balada pra dançar</option>
                  </select>
                </div>
              </div>


              <button type="submit" disabled={isLoading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300 ease-in-out disabled:bg-gray-400">
                {isLoading ? 'Analisando o universo...' : 'Criar nosso encontro ideal!'}
              </button>
              {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-pink-500 mb-4">Minha Sugestão Para Nós:</h2>
            <div className="bg-pink-50 border border-pink-200 p-6 rounded-lg whitespace-pre-wrap text-left text-gray-700">{datePlan}</div>
            <p className="mt-6 text-gray-600">E aí, o que me diz? 😉</p>
          </div>
        )}

      </div>
    </main>
  );
}