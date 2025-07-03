import express from "express"
import "dotenv/config"
import cors from "cors"

// initialize express app
const app = express();

// middelware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> res.send("server is running"))

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))