import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ai = new GoogleGenAI({ apiKey: (process.env.GOOGLE_API_KEY ?? "") });
console.log(process.env.GOOGLE_API_KEY);
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}
// Envia o convite com o plano para o e-mail informado
async function sendInviteEmail(to: string, data: any, plan: string) {
  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: parseInt(process.env.SMTP_PORT ?? '587', 10), // Garante que a porta é um número inteiro
    secure: (process.env.SMTP_SECURE ?? 'false') === 'true', // Converte a string "true"/"false" para booleano
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS')
    },
    // Opcional: Para debug, descomente as linhas abaixo
    // logger: true,
    // debug: true,
  });
  const emailBody = `
    <h1>Convite para sairmos no sábado 💫</h1>
    <p>Com base no que você respondeu, pensei nisso pra gente:</p>
    <pre style="white-space:pre-wrap;font-family:inherit;background:#0b0b0b;padding:12px;border-radius:8px;">${plan}</pre>
    <p>Topa? 😄</p>
  `;

  const mailOptions = {
    from: requireEnv('EMAIL_USER'),
    to,
    subject: 'Sábado? Tenho um plano perfeito pra nós 💘',
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
async function sendOwnerSummaryEmail(to: string, data: any) {
  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: (process.env.SMTP_SECURE ?? 'false') === 'true',
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS')
    },
  });

  const emailBody = `
    <h1>Novas respostas recebidas 🎉</h1>
    <p><strong>Email informado:</strong> ${data.email ?? '-'}</p>
    <p><strong>Comidas:</strong> ${(data.foods || []).join(', ')}</p>
    <p><strong>Bebidas:</strong> ${(data.drinks || []).join(', ')}</p>
    <p><strong>Fins de semana:</strong> ${data.fds ?? '-'}</p>
    <p><strong>Tempo livre:</strong> ${data.tempoLivre ?? '-'}</p>
    <p><strong>Vista:</strong> ${data.vista ?? '-'}</p>
    <p><strong>Rolê:</strong> ${data.role ?? '-'}</p>
  `;

  const mailOptions = {
    from: requireEnv('EMAIL_USER'),
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
  try {
    const body = await request.json();

    // Validação básica
    if (!body.foods || body.foods.length === 0) {
        return NextResponse.json({ error: "A seleção de comidas é obrigatória." }, { status: 400 });
    }

    // Não enviar e-mail aqui; primeiro vamos gerar o plano

    // Prompt MUITO mais detalhado para a IA
    const prompt = `
      Você é um concierge de encontros ultra-criativo e romântico.
      Sua missão é criar um plano para um encontro inesquecível, totalmente baseado nas respostas de um formulário. O ORÇAMENTO NÃO É TAO ALTO, ENTÃO A IDEIA É CRIAR UM ENCONTRO BARATO E ROMÂNTICO.
      Seja charmoso, detalhista e fuja do óbvio. O tom deve ser pessoal e convidativo.
      USE O IDIOMA INGLES E LEVE
      o encontro é noturno e é o primeiro encontro.

      Aqui estão as informações da garota:
      - Comidas que ela adora: ${body.foods.join(', ')}.
      - Bebidas favoritas: ${body.drinks.join(', ')}.
      - O que ela faz nos fins de semana: "${body.fds}".
      - Seus hobbies no tempo livre: "${body.tempoLivre}".
      - Vista que a encanta: ${body.vista}.
      - O tipo de rolê que ela curte: "${body.role}".

      Crie um plano com um título criativo e dividido em três atos.
      Incorpore as preferências dela de forma inteligente em cada etapa.
      Por exemplo, se ela gosta de natureza e vinho, sugira um piquenique chique num parque.
      Se ela gosta de rolê agitado e comida de boteco, sugira um bar com música ao vivo.

      **Título do Encontro:** (Crie um nome criativo para o encontro aqui)

      **Ato 1: O Início da Conexão**
      (Descreva uma atividade inicial leve e divertida. Pense em como quebrar o gelo usando os hobbies ou o tipo de rolê que ela curte.)

      **Ato 2: O Sabor da Noite**
      (Sugira o lugar ou tipo de comida principal. Baseie-se DIRETAMENTE nas comidas e bebidas que ela escolheu. Dê uma sugestão específica, se possível.)

      **Ato 3: O Gran Finale**
      (Proponha uma atividade para fechar a noite de forma memorável. Pode ser algo mais calmo ou romântico, talvez relacionado à vista que ela prefere.)

      Finalize com uma frase convidativa, como se eu estivesse falando diretamente com ela.
      Formate a resposta apenas com texto simples, quebras de linha e usando os títulos que eu defini (Título, Ato 1, Ato 2, Ato 3).
    `;
    

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    console.log(response.text);
    const text = response.text ?? "";

    // Enviar convite para o e-mail informado, se presente
    if (typeof body.email === 'string' && body.email.trim().length > 0) {
      sendInviteEmail(body.email.trim(), body, text);
    }

    // Sempre enviar um resumo das respostas para você
    sendOwnerSummaryEmail('joao-victor_07@outlook.com', body);

    return NextResponse.json({ plan: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "A IA está um pouco tímida hoje. Falha ao gerar o plano." }, { status: 500 });
  }
}