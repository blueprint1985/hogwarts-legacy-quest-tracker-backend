import { Pool } from "mysql2/promise";

export const clean = async (conn: Pool, list: number[]): Promise<number[]> => {
  const acceptable: number[] = [];

  for (let c = 0; c < list.length; c++) {
    const item = list[c];

    const checkQuery = "SELECT required_quest_item_id FROM requirements WHERE quest_item_id = ?";
    const requiredIds = ((await conn.query(checkQuery, [item]))[0] as any[]).map(r => r.required_quest_item_id);

    if (requiredIds.every(i => list.includes(i))) {
      acceptable.push(item);
    }
    
  }

  if (list.length === acceptable.length) {
    return acceptable;
  } else {
    return await clean(conn, acceptable);
  }
}