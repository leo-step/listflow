import { Connection, Content, Email } from "../types/mailTypes";

export const handleMessage = (
  connection: Connection,
  data: Email,
  content: Content
) => {
  console.log(data);
  /* Do something useful with the parsed message here.
   * Use parsed message `data` directly or use raw message `content`. */
};
