import { Request, Response } from "express";
import { Pool } from "mysql2/promise";

import { dbPool } from "./db";
import { clean } from "./utils";

export const availableQuests = async (req: Request, res: Response) => {
  const conn: Pool | null = dbPool();

  if (conn !== null) {
    const questItemIdsQuery = "SELECT id FROM quest_items";
    const questItemIds = (await conn.query(questItemIdsQuery))[0] as any[];
    
    const requirementsQuery = "SELECT * FROM requirements WHERE quest_item_id = ?";

    const requiredPerId = await Promise.all(questItemIds.map(async (questItem) => {
      const requirements = (await conn.query(requirementsQuery, [questItem.id]))[0] as any[];

      return {
        id: questItem.id,
        requirementIds: requirements.map((requirement) => requirement.required_quest_item_id)
      };
    }));

    const finishedIds = req?.body?.finished_quest_ids || [0];
    if (!finishedIds.includes(0)) {
      finishedIds.push(0);
    }

    const input = await clean(conn, finishedIds);
    const allowedRequirements = requiredPerId.filter((r) => r.requirementIds.every(id => input.includes(id))).map((r) => r.id);

    const questItemsQuery = "SELECT qi.id, qi.name, qt.id AS quest_type_id, qt.name AS quest_type_name, mt.id AS map_id, mt.name AS map_name, ma.id AS area_id, ma.name AS area_name, mp.id AS point_id, mp.name AS point_name, p.id AS provider_id, p.name AS provider_name, p.is_person AS provider_is_person, h.id AS house_id, h.name AS house_name, qi.required_level FROM quest_items qi LEFT JOIN providers p ON p.id = qi.provider_id LEFT JOIN map_points mp ON mp.id = qi.map_point_id LEFT JOIN map_areas ma ON ma.id = mp.map_area_id LEFT JOIN map_tabs mt ON mt.id = ma.map_tab_id LEFT JOIN houses h ON h.id = qi.required_house_id LEFT JOIN quest_types qt ON qt.id = qi.quest_type_id WHERE qi.id IN (?) OR qi.id IN (?)";
    const questItems = (await conn.query(questItemsQuery, [allowedRequirements, input]))[0] as any[];
    
    const requiredQuery = "SELECT qi.name FROM quest_items qi LEFT JOIN requirements r ON r.required_quest_item_id = qi.id WHERE r.quest_item_id = ?";

    const finalRes = await Promise.all(questItems.map(async (item) => {
      if (item.house_id && req.body?.current_house !== item.house_id) {
        return null;
      }

      const requiredQuestItems = (await conn.query(requiredQuery, [item.id]))[0] as any[];

      return {
        id: item.id,
        name: item.name,
        type: {
          id: item.quest_type_id,
          name: item.quest_type_name
        },
        map: {
          id: item.map_id,
          name: item.map_name
        },
        area: {
          id: item.area_id,
          name: item.area_name
        },
        point: {
          id: item.point_id,
          name: item.point_name
        },
        provider: {
          id: item.provider_id,
          name: item.provider_name,
          type: item.provider_name ? (item.provider_is_person ? "Person" : "Item or Place") : null
        },
        house: {
          id: item.house_id,
          name: item.house_name
        },
        recommendedLevel: item.required_level || null,
        isDone: input.includes(item.id),
        levelCleared: (req.body?.current_level || 1) >= (item.required_level || 1),
        openedBy: requiredQuestItems.map((item) => item.name)
      }
    }));

    res.json(finalRes.filter(item => item !== null));
  }
};
