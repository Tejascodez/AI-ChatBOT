import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // 🔗 Create new chat
  const chat = await prisma.chat.create({
    data: {
      userId,
      messages: {
        create: [
          { sender: "user", content: prompt },
        ],
      },
    },
    include: { messages: true }
  });

  // 🧠 Get AI response from Ollama
  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      prompt: prompt,
      stream: false,
    }),
  });
  const data = await ollamaRes.json();
  const aiReply = data.response;

  // 💾 Save AI response as message
  await prisma.message.create({
    data: {
      chatId: chat.id,
      sender: "bot",
      content: aiReply,
    },
  });

  return NextResponse.json({ response: aiReply, chatId: chat.id });
}
