import { Request, Router } from "express";
import { authMiddleware } from "../lib/auth.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const uploadsRouter = Router();
uploadsRouter.use(authMiddleware);

// Criar diretórios de uploads se não existirem
const uploadsDir = join(process.cwd(), "uploads", "projects");
const avatarsDir = join(process.cwd(), "uploads", "users");
if (!existsSync(uploadsDir)) {
  mkdir(uploadsDir, { recursive: true }).catch(console.error);
}
if (!existsSync(avatarsDir)) {
  mkdir(avatarsDir, { recursive: true }).catch(console.error);
}

uploadsRouter.post("/project-attachment", async (req, res) => {
  const user = (req as Request & { user: { id: string; tenantId: string; role: string } }).user;
  if (user.role !== "ADMIN" && user.role !== "GESTOR_PROJETOS") {
    res.status(403).json({ error: "Apenas administradores e gestores podem fazer upload de arquivos." });
    return;
  }

  try {
    const { fileName, fileData, fileType, fileSize } = req.body;

    if (!fileName || !fileData) {
      res.status(400).json({ error: "Nome do arquivo e dados do arquivo são obrigatórios" });
      return;
    }

    // Validar tipo de arquivo (apenas PDF e DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".docx"];

    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(400).json({ error: "Apenas arquivos PDF e DOCX são permitidos" });
      return;
    }

    // Converter base64 para buffer
    const base64Data = String(fileData).replace(/^data:.*,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      res.status(400).json({ error: "Arquivo muito grande. Tamanho máximo: 10MB" });
      return;
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${timestamp}-${safeName}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Retornar URL/path do arquivo
    const fileUrl = `/uploads/projects/${uniqueFileName}`;

    res.json({
      fileName: fileName,
      fileUrl: fileUrl,
      fileType: fileType || (fileExtension === ".pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      fileSize: fileSize || buffer.length,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});

// Upload de avatar do usuário (imagem)
uploadsRouter.post("/user-avatar", async (req, res) => {
  const user = (req as Request & { user: { id: string } }).user;
  try {
    const { fileName, fileData, fileType, fileSize } = req.body;
    if (!fileName || !fileData) {
      res.status(400).json({ error: "Nome do arquivo e dados do arquivo são obrigatórios" });
      return;
    }

    const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
    const ext = String(fileName).toLowerCase().substring(String(fileName).lastIndexOf("."));
    if (!allowedExtensions.has(ext)) {
      res.status(400).json({ error: "Apenas imagens são permitidas para foto de perfil." });
      return;
    }

    const base64Data = String(fileData).replace(/^data:.*,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      res.status(400).json({ error: "Imagem muito grande. Tamanho máximo: 5MB" });
      return;
    }

    const timestamp = Date.now();
    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${user.id}-${timestamp}-${safeName}`;
    const filePath = join(avatarsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const mimeFromDataUrl =
      typeof fileData === "string"
        ? (fileData.match(/^data:([^;]+);base64,/)?.[1] ?? "")
        : "";

    const fileUrl = `/uploads/users/${uniqueFileName}`;
    res.json({
      fileName,
      fileUrl,
      fileType: fileType || mimeFromDataUrl || "image/png",
      fileSize: fileSize || buffer.length,
    });
  } catch (error) {
    console.error("Erro ao fazer upload de avatar:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});
