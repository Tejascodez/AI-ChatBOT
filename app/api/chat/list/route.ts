import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
