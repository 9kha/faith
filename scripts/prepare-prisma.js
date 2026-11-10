const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = process.env.DATABASE_URL || "";
  const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");

  const currentProvider = schema.includes('provider = "postgresql"') ? "postgresql" : "sqlite";
  const targetProvider = isPostgres ? "postgresql" : "sqlite";

  if (currentProvider !== targetProvider) {
    console.log(`[prepare-prisma] Adjusting datasource provider from ${currentProvider} to ${targetProvider} based on DATABASE_URL...`);
    schema = schema.replace(
      /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"[^"]+"[\s\S]*?\}/,
      `datasource db {\n  provider = "${targetProvider}"\n  url      = env("DATABASE_URL")\n}`
    );
    fs.writeFileSync(schemaPath, schema, "utf8");
  }

  try {
    console.log("[prepare-prisma] Running prisma generate...");
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (err) {
    console.warn("[prepare-prisma] prisma generate warning:", err.message);
  }
}
