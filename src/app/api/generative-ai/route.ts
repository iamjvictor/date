import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
interface FormData {
  nome: string;
  email: string;
  data: string;
  hora: string;
  foods: string[];
  drinks: string[];
  fds: string;
  tempoLivre: string;
  vista: string;
  role: string;
}
const ai = new GoogleGenAI({ apiKey: (process.env.GOOGLE_API_KEY ?? "AIzaSyAKJkyO6otkE-0SFRzcqRbV7IN5A-LsHGs") });
console.log('Google API Key carregada:', process.env.GOOGLE_API_KEY ? 'Sim' : 'Não');
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}
// Envia o convite com o plano para o e-mail informado
async function sendInviteEmail(to: string, data:  FormData, plan: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? '587', 10), // Garante que a porta é um número inteiro
    secure: (process.env.SMTP_SECURE ?? 'false') === 'true', // Converte a string "true"/"false" para booleano
    auth: {
      user:"jvictor.asevedo@gmail.com",
      pass: "suid qqvt uvvv akrk"
    },
    // Opcional: Para debug, descomente as linhas abaixo
    // logger: true,
    // debug: true,
  });
  const emailBody = `
    <h1>Convite para sairmos no sábado 💫</h1>
    <p>Oi ${data.nome || 'linda'}! Com base no que você respondeu, pensei nisso pra gente:</p>
    <pre style="white-space:pre-wrap;font-family:inherit;background:#0b0b0b;padding:12px;border-radius:8px;">${plan}</pre>
    <p>Topa? 😄</p>
  `;

  const mailOptions = {
    from: "jvictor.asevedo@gmail.com",
    to,
    subject: 'Tenho um plano perfeito pra nós 💘',
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Convite enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
  }
}

// Envia um resumo das respostas para o seu e-mail
async function sendOwnerSummaryEmail(to: string, data: FormData) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? '587', 10), // Garante que a porta é um número inteiro
    secure: (process.env.SMTP_SECURE ?? 'false') === 'true', // Converte a string "true"/"false" para booleano
    auth: {
      user:"jvictor.asevedo@gmail.com",
      pass: "suid qqvt uvvv akrk"
    
    },
  });

  const emailBody = `
    <h1>Novas respostas recebidas 🎉</h1>
    <p><strong>Nome:</strong> ${data.nome || '-'}</p>
    <p><strong>Email informado:</strong> ${data.email ?? '-'}</p>
    <p><strong>Data preferida:</strong> ${data.data || '-'}</p>
    <p><strong>Horário preferido:</strong> ${data.hora || '-'}</p>
    <p><strong>Comidas:</strong> ${(data.foods || []).join(', ')}</p>
    <p><strong>Bebidas:</strong> ${(data.drinks || []).join(', ')}</p>
    <p><strong>Fins de semana:</strong> ${data.fds ?? '-'}</p>
    <p><strong>Tempo livre:</strong> ${data.tempoLivre ?? '-'}</p>
    <p><strong>Vista:</strong> ${data.vista ?? '-'}</p>
    <p><strong>Rolê:</strong> ${data.role ?? '-'}</p>
  `;

  const mailOptions = {
      from: "jvictor.asevedo@gmail.com",
      to,
      subject: 'Novas respostas do formulário - Date Planner',
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Resumo enviado ao proprietário com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar resumo ao proprietário:', error);
  }
}



export async function POST(request: Request) {
  console.log('=== NOVA REQUISIÇÃO RECEBIDA ===');
  try {
    const body = await request.json();
    console.log('Dados recebidos:', {
      nome: body.nome,
      email: body.email,
      data: body.data,
      hora: body.hora,
      foods: body.foods?.length || 0,
      drinks: body.drinks?.length || 0
    });

    // Validação básica
    if (!body.foods || body.foods.length === 0) {
        return NextResponse.json({ error: "A seleção de comidas é obrigatória." }, { status: 400 });
    }

    // Não enviar e-mail aqui; primeiro vamos gerar o plano
    console.log('Iniciando geração do plano com IA...');

    // Prompt MUITO mais detalhado para a IA
    const prompt = `
      Você é um concierge de encontros ultra-criativo e romântico.
      Sua missão é criar um plano para um encontro inesquecível, totalmente baseado nas respostas de um formulário. O ORÇAMENTO NÃO É TAO ALTO, ENTÃO A IDEIA É CRIAR UM ENCONTRO BARATO E ROMÂNTICO.
      Seja charmoso, detalhista e fuja do óbvio. O tom deve ser pessoal e convidativo.
            

      Aqui estão as informações da ${body.nome || 'pessoa'}:
      - Nome: ${body.nome || 'Não informado'}.
      - Data preferida: ${body.data || 'Não informado'}.
      - Horário preferido: ${body.hora || 'Não informado'}.
      - Comidas que ela adora: ${body.foods.join(', ')}.
      - Bebidas favoritas: ${body.drinks.join(', ')}.
      - O que ela faz nos fins de semana: "${body.fds}".
      - Seus hobbies no tempo livre: "${body.tempoLivre}".
      - Vista que a encanta: ${body.vista}.
      - O tipo de rolê que ela curte: "${body.role}".

      Crie um plano com um título criativo e dividido em três atos.
      Incorpore as preferências dela de forma inteligente em cada etapa.
      CONSIDERE A DATA E HORA ESCOLHIDAS para sugerir atividades apropriadas para o horário.
      Por exemplo, se ela escolheu manhã, sugira atividades matinais como café da manhã ou passeio no parque.
      Se escolheu noite, foque em jantares, bares ou atividades noturnas.

      **Título do Encontro:** (Crie um nome criativo para o encontro aqui)

      **Ato 1: O Início da Conexão**
      (Descreva uma atividade inicial leve e divertida. Pense em como quebrar o gelo usando os hobbies ou o tipo de rolê que ela curte.)

      **Ato 2: O Sabor da Noite**
      (Sugira o lugar ou tipo de comida principal. Baseie-se DIRETAMENTE nas comidas e bebidas que ela escolheu. Dê uma sugestão específica, se possível.)

      **Ato 3: O Gran Finale**
      (Proponha uma atividade para fechar a noite de forma memorável. Pode ser algo mais calmo ou romântico, talvez relacionado à vista que ela prefere.)

      Finalize com uma frase convidativa, como se eu estivesse falando diretamente com ${body.nome || 'ela'}, usando o nome dela de forma carinhosa.
      Formate a resposta apenas com texto simples, quebras de linha e usando os títulos que eu defini (Título, Ato 1, Ato 2, Ato 3).
    `;
    

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    console.log('Resposta da IA recebida:', response.text);
    const text = response.text ?? "";

    // Enviar convite para o e-mail informado, se presente
    if (typeof body.email === 'string' && body.email.trim().length > 0) {
      console.log('Enviando convite para:', body.email.trim());
      sendInviteEmail(body.email.trim(), body, text);
    }

    // Sempre enviar um resumo das respostas para você
    console.log('Enviando resumo para o proprietário...');
    sendOwnerSummaryEmail('joao-victor_07@outlook.com', body);

    console.log('=== REQUISIÇÃO FINALIZADA COM SUCESSO ===');
    return NextResponse.json({ plan: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "A IA está um pouco tímida hoje. Falha ao gerar o plano." }, { status: 500 });
  }
}