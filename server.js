const express = require("express")
const app = express()
const connectDB = require('./config/db.config');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3000
// const cors = require('cors');
// app.use(cors( {
//     origin:"http://localhost:4200"
// }))
const path = require('path');
const corsMiddlewate = require('./middleware/cors.mddleware');
app.use(corsMiddlewate);
require("./services/autoBackup.service")

app.use(express.json())
connectDB()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/auth", require("./router/authRouter"))
app.use("/api/users",  require("./router/userRouter"))
app.use("/api/products", require("./router/productRouter"))
app.use("/api/brand", require("./router/brandRouter"))
app.use("/api/subcategories", require("./router/subcategoryRouter"))
app.use("/api/cart", require("./router/cartRouter"))
app.use("/api/orders", require("./router/ordersRouter"))
// app.use("/api/reports/sales",require("./controllers/reports.controller"))




app.listen(PORT, () => { console.log("Start Server : " + PORT) })
