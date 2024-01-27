import * as dotenv from "dotenv";
import {initServer} from "./app";

dotenv.config()

async function init() {
    const app = await initServer()
    app.listen(8000, () => console.log("app listening on port 8000"))
}

init();
