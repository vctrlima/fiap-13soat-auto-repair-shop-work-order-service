import { PrismaClient } from '@prisma/client';
import { dbQueryDuration } from '@/infra/observability/metrics';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (e) => {
  dbQueryDuration.record(e.duration, {
    'db.operation': 'query',
    'db.model': extractModel(e.query),
  });
});

function extractModel(query: string): string {
  const match = query.match(/"public"\."(\w+)"/);
  return match ? match[1] : 'unknown';
}

export default prisma;
