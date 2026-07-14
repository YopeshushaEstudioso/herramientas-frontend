const express = require("express")
require("dotenv").config()
const swaggerUi = require("swagger-ui-express")
const { errorHandler } = require("./middleware/error-handler")
const { sequelize } = require("./models")
const swaggerSpec = require("./config/swagger")

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get("/api-docs.json", (req, res) => res.json(swaggerSpec))
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Herramientas Node API - Docs",
    swaggerOptions: { persistAuthorization: true },
  })
)

app.get("/", (req, res) => {
  res.json({
    name: "Herramientas Node API",
    version: "1.0.0",
    docs: `${req.protocol}://${req.get("host")}/docs`,
    openapi: `${req.protocol}://${req.get("host")}/api-docs.json`,
  })
})

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/categorias", require("./routes/categoria.routes"))
app.use("/api/clientes", require("./routes/cliente.routes"))
app.use("/api/productos", require("./routes/producto.routes"))
app.use("/api/ventas", require("./routes/venta.routes"))

app.use(errorHandler)

const start = async () => {
  try {
    await sequelize.authenticate()
    console.log("Conexion a BD establecida")

    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === "true" })
    console.log("Modelos sincronizados")

    app.listen(PORT, () => {
      console.log("Servidor disponible en el puerto: " + PORT)
      console.log("Documentacion Swagger en: http://localhost:" + PORT + "/docs")
    })
  } catch (error) {
    console.error("Error al iniciar servidor:", error)
    process.exit(1)
  }
}

start()
