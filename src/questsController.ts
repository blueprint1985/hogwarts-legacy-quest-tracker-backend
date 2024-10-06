import { Request, Response } from "express";

import { initResponse, finishResponse } from "./utils/connect";

export const availableQuests = async (req: Request, res: Response) => {
  const { httpCode, response, conn } = await initResponse();

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

    const input = req?.body?.finished_quest_ids ? [0].concat(req.body.finished_quest_ids) : [0];
    const allowedRequirements = requiredPerId.filter((r) => r.requirementIds.every(id => input.includes(id))).map((r) => r.id);

    const questItemsQuery = "SELECT qi.id, qi.name, qt.name AS quest_type, mt.name AS map_name, ma.name AS area_name, mp.name AS point_name, p.name AS provider_name, h.name AS house_name, qi.required_level FROM quest_items qi LEFT JOIN providers p ON p.id = qi.provider_id LEFT JOIN map_points mp ON mp.id = qi.map_point_id LEFT JOIN map_areas ma ON ma.id = mp.map_area_id LEFT JOIN map_tabs mt ON mt.id = ma.map_tab_id LEFT JOIN houses h ON h.id = qi.required_house_id LEFT JOIN quest_types qt ON qt.id = qi.quest_type_id WHERE qi.id IN (?) OR qi.id IN (?)";
    const questItems = (await conn.query(questItemsQuery, [allowedRequirements, input]))[0] as any[];
    
    const requiredQuery = "SELECT qi.name FROM quest_items qi LEFT JOIN requirements r ON r.required_quest_item_id = qi.id WHERE r.quest_item_id = ?";

    response.data = await Promise.all(questItems.map(async (item) => {
      const requiredQuestItems = (await conn.query(requiredQuery, [item.id]))[0] as any[];

      return {
        ...item,
        is_done: input.includes(item.id),
        level_cleared: (req.body?.current_level || 1) >= (item.required_level || 1),
        opened_by: requiredQuestItems.map((item) => item.name)
      }
    }));

  }

  finishResponse(res, httpCode, response);
};
