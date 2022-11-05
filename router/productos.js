import Express  from "express";
import { optionsMariaDB } from '../src/config/mysqlconfig.js';
import { ContenedorMysql } from '../src/components/contenedorMysql.js';
/* ------------------------ configuracion del routerProducts ------------------------ */
const routerProducts = Express.Router();
const ApiPedido= new ContenedorMysql(optionsMariaDB, 'products')

routerProducts.use(Express.json());
routerProducts.use(Express.urlencoded({extended: true}))
/* ------------------------------ GET: '/:id?' ------------------------------ */
// Me permite listar todos los productos disponibles ó un producto por su id 
/* -------------- (disponible para usuarios y administradores) -------------- */


routerProducts.get('/:id', async (req, res)=>{
    try{
        console.log("Metodo get ID");
        const {id} = req.params
        const existeProducto = await ApiPedido.getById(id)
        console.log(existeProducto);
        if(existeProducto.length){
            res.json(await ApiPedido.getById(parseInt(id)))
        } else return res.json({error: 'No existe el archivo solicitado'})
    }
    catch(error){
        res.status(500).send('Error en el servidor')
    }
})

/* -------------------------------- POST: '/' ------------------------------- */
/* ------------------ Para incorporar productos al listado ------------------ */
/* -------------------- (disponible para administradores) ------------------- */

const esAdmin = (req, res, next) =>{
    console.log(req.headers.authorization);
    if(req.headers.authorization != "true"){
        return res.json({ error : '-1', descripcion: `ruta ${req.headers.referer} método ${req.method} no autorizada`})
    }    
    else{next()}
}

routerProducts.post('/', esAdmin, async (req, res)=> {
    try{
        console.log("Se crea nuevo producto con POST / con verificacion de administrador");
        const loadProduct = req.body
        const nuevoId = await ApiPedido.save(loadProduct)
        res.json({
            id: nuevoId,
            nuevoProducto: loadProduct
        })
    }catch(error){
        res.status(500).send('Error en el servidor')
    }    
})

/* ------------------------------- PUT: '/:id' ------------------------------ */
/* --------------------- Actualiza un producto por su id -------------------- */
/* -------------------- (disponible para administradores) ------------------- */


routerProducts.put('/:id', esAdmin, async (req, res)=>{
    try{
        console.log("se modifica el producto con PUT /:id con verificacion de  Admin");
        const {id} = req.params
        const upDate = req.body
        console.log(upDate);
        const actualizacion = await ApiPedido.actualizaByID(parseInt(id), upDate)
        console.log(actualizacion);
        if(actualizacion){
            res.json(actualizacion)
        } else res.json({error: "No se pudo actualizar el producto solicitado"})
    }
    catch{
        res.status(500).send('Error en el servidor')
    }
})

/* ----------------------------- DELETE: '/:id' ----------------------------- */
/* ----------------------- Borra un producto por su id ---------------------- */
/* -------------------- (disponible para administradores) ------------------- */


routerProducts.delete('/:id', esAdmin, async (req, res)=>{
    try{
        console.log("se realiza un DELETE /:id con verificacion de admin");
        const {id} = req.params
        const productoID=await ApiPedido.getById(id)
        console.log(productoID);
        if(productoID.length){ //getById devuelve null en caso de que no exita el elemento con ID
            console.log("a borrar");
            await ApiPedido.deletedById(parseInt(id))
            res.json({error: "Producto eliminado"})
        } else {res.json({error: "El producto no existe"})}
    }
    catch{
        res.status(500).send('Error en el servidor')
    }
    
})

export default routerProducts;