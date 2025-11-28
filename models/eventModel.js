// models/eventModel.js
import db from "../config/db.js";

export async function saveEventLog({ userId, eventType, eventTime, videoUrl }) {
  const timestamp =
    eventTime || new Date().toISOString().slice(0, 19).replace("T", " ");

  const [result] = await db.execute(
    `
    INSERT INTO events (user_id, video_url, event_time, event_type)
    VALUES (?, ?, ?, ?)
  `,
    [userId, videoUrl || null, timestamp, eventType]
  );

  return {
    eventId: result.insertId,
    eventTime: timestamp,
  };
}