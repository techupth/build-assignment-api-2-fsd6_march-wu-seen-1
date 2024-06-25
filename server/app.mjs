import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());
/* Get all */
app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(`select * from assignments`);
    return res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});
/* Create new */
app.post("/assignments", async (req, res) => {
  const newUpdate = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };
  try {
    await connectionPool.query(
      `insert into assignments (title,content,category,length,user_id,status,created_at,updated_at,published_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        newUpdate.title,
        newUpdate.content,
        newUpdate.category,
        newUpdate.length,
        1,
        newUpdate.status,
        newUpdate.created_at,
        newUpdate.updated_at,
        newUpdate.published_at,
      ]
    );
    return res.status(201).json({ message: "New assignment added." });
  } catch {
    return res.status(500).json({
      message:
        "Server could not create assignment because database connection.",
    });
  }
});

/* Get by ID */
app.get("/assignments/:assignmentId", async (req, res) => {
  const id = req.params.assignmentId;
  try {
    const result = await connectionPool.query(
      `select * from assignments
where assignment_id = $1`,
      [id]
    );
    return !result.rows[0]
      ? res
          .status(404)
          .json({ message: "Server could not find a requested assignment" })
      : res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

/* Update */
app.put("/assignments/:assignmentId", async (req, res) => {
  const id = req.params.assignmentId;
  const newUpdate = { ...req.body, updated_at: new Date() };
  try {
    await connectionPool.query(
      `
      update assignments 
      set title = $2,
          content = $3,
          category = $4,
          length = $5,
          status = $6,
          updated_at = $7
          where assignment_id = $1
      `,
      [
        id,
        newUpdate.title,
        newUpdate.content,
        newUpdate.category,
        newUpdate.length,
        newUpdate.status,
        newUpdate.updated_at,
      ]
    );
    return res.status(200).json({ message: "New assignment updated." });
  } catch {
    return res.status(500).json({
      message:
        "Server could not update assignment because database connection."
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const id = req.params.assignmentId;
  try {
    await connectionPool.query(
      `
      delete from assignments 
      where assignment_id = $1
      `,[id]
    );
    return res.status(200).json({ message: "Deleted post successfully" });
  } catch {
    return res.status(500).json({
      message:
        "Server could not create post because database connection"
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
