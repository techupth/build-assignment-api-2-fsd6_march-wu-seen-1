import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignment", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };
  try {
    const result = await connectionPool.query(
      `
      insert into assignments (title, content, category, length, status, created_at, updated_at, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8) returning assignment_id`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
    return res.status(201).json({
      message: "added successfully",
    });
  } catch {
    return res.status(500).json({
      message: "fail",
    });
  }
});

app.get("/assignment", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`select * from assignments`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignment/:assignmentId", async (req, res) => {
  let result;
  let assignemntId = req.params.assignmentId;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignemntId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment",
      });
    }
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignment/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  const newAssignment = { ...req.body, updated_at: new Date() };
  try {
    const result = await connectionPool.query(
      `
      update assignments 
      set title = $1,
      content = $2,
      category = $3,
      length = $4,
      status = $5,
      updated_at = $6
      where assignment_id = $7
      returning *`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
        newAssignment.updated_at,
        assignmentId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    return res
      .status(200)
      .json({
        message: "Updated assignment sucessfully",
        data: result.rows[0],
      });
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});



app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
