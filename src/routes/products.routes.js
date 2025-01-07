import express from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { addProduct, allProducts, deleteProduct, singleProduct, updateProduct } from '../controller/product.controller.js';

const productRouter = express.Router();

// Add authentication middleware to protect these routes
productRouter.post('/products', upload.single('image'), addProduct);
productRouter.get("/products/:id",  allProducts);
productRouter.get("/products/:id",  singleProduct);
productRouter.delete("/products/:id", deleteProduct);  // Route updated with postId
productRouter.put("/products/:id", upload.single("image"), updateProduct);

export default productRouter;

