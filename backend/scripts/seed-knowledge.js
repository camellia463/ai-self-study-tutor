/**
 * 知识点目录 seed 脚本
 * 将高一/高二/高三数学知识点目录灌入 SQLite
 */
const { getDB } = require('../src/db/init');
const KNOWLEDGE_POINTS = require('../src/data/knowledge-points');

function seed() {
  const db = getDB();

  const insert = db.prepare(`
    INSERT OR REPLACE INTO knowledge_point
      (id, name, subject, grade, chapter, score_weight, prerequisite, has_content, sort_order)
    VALUES (?, ?, 'math', ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((points) => {
    points.forEach((p, idx) => {
      insert.run(
        p.id, p.name, p.grade, p.chapter,
        p.score_weight,
        JSON.stringify(p.prerequisite || []),
        p.has_content,
        idx
      );
    });
  });

  insertMany(KNOWLEDGE_POINTS);

  const count = db.prepare('SELECT COUNT(*) as cnt FROM knowledge_point').get();
  const contentCount = db.prepare('SELECT COUNT(*) as cnt FROM knowledge_point WHERE has_content = 1').get();

  console.log(`[Seed] 完成：共 ${count.cnt} 个知识点，其中 ${contentCount.cnt} 个有完整教学内容`);
  console.log('[Seed] 有内容的知识点：');
  const hasContent = db.prepare('SELECT id, name FROM knowledge_point WHERE has_content = 1').all();
  hasContent.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
}

seed();
