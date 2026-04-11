import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// 将 sqlite 替换为 postgresql
schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');

// 检查是否已经包含 directUrl，如果没有则在 url 下方添加
if (!schema.includes('directUrl')) {
  schema = schema.replace(
    /url\s*=\s*env\("DATABASE_URL"\)/g,
    'url      = env("DATABASE_URL")\n  directUrl = env("DATABASE_URL_UNPOOLED")'
  );
}

fs.writeFileSync(schemaPath, schema);
console.log('Successfully updated prisma/schema.prisma for Vercel (PostgreSQL).');
